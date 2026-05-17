# MetaVault 技术设计 v0.4

## 1. 数据库设计

### 1.1 设计原则

- 统一资产表 + 类型扩展字段用JSON存储，避免无限列扩展
- 关联关系独立表，支持双向查询
- 供应商独立表，与资产通过外键关联
- 提醒独立表，支持批量扫描

### 1.2 ER关系

```
assets ──< asset_relations >── assets
  │
  └──< suppliers (通过 supplier_id)
  │
  └──< notifications (通过 asset_id)
```

### 1.3 表结构

#### assets（资产主表）

```sql
CREATE TABLE assets (
  id            TEXT PRIMARY KEY,          -- UUID
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK(type IN ('physical','digital','subscription')),
  category      TEXT NOT NULL,             -- 如 'physical.laptop', 'digital.course'
  status        TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','idle','expired','disposed')),
  tags          TEXT DEFAULT '[]',         -- JSON数组
  purchase_date TEXT,                      -- ISO 8601日期
  purchase_price REAL,
  currency      TEXT DEFAULT 'CNY',
  supplier_id   TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  notes         TEXT,
  -- 类型扩展字段（JSON，结构由type+category决定）
  ext           TEXT DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_supplier ON assets(supplier_id);
```

**ext字段结构约定：**

physical:
```json
{
  "model": "MacBook Pro 14 M3 Pro",
  "quantity": 1,
  "unit": "台",
  "location": "书房",
  "usage": "日常办公",
  "owner": "LoganLink",
  "source": "purchase",
  "warranty_expiry": "2026-12-01",
  "warranty_info": "AppleCare+",
  "depreciation_rate": 0.2,
  "current_value": 8000,
  "serial_number": "XXX",
  "condition": "good"
}
```

digital:
```json
{
  "access_url": "https://...",
  "expiry_date": "2026-12-01",
  "platform": "Udemy",
  "usage_stats": { "progress": 0.6, "last_study": "2026-05-01", "total_hours": 12 },
  "file_size": null,
  "file_format": null
}
```

subscription:
```json
{
  "billing_cycle": "yearly",
  "next_billing_date": "2026-12-01",
  "amount": 99,
  "auto_renew": true,
  "usage_frequency": "weekly",
  "cancellation_url": "https://...",
  "trial_end": null,
  "screenshots": ["path/to/screenshot1.png"]
}
```

#### suppliers（供应商表）

```sql
CREATE TABLE suppliers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('physical','digital','subscription','mixed')),
  rating      INTEGER CHECK(rating BETWEEN 1 AND 5),
  tags        TEXT DEFAULT '[]',
  contact     TEXT,
  website     TEXT,
  notes       TEXT,
  is_favorite INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### asset_relations（资产关联表）

```sql
CREATE TABLE asset_relations (
  id          TEXT PRIMARY KEY,
  source_id   TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  relation    TEXT NOT NULL CHECK(relation IN ('depends_on','contains','bound_to','related_to')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_id, target_id, relation)
);

CREATE INDEX idx_relations_source ON asset_relations(source_id);
CREATE INDEX idx_relations_target ON asset_relations(target_id);
```

#### notifications（提醒表）

```sql
CREATE TABLE notifications (
  id          TEXT PRIMARY KEY,
  asset_id    TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK(type IN ('warranty_expiry','subscription_renewal','digital_expiry','trial_expiry','usage_stagnation','deprecation')),
  message     TEXT NOT NULL,
  trigger_date TEXT NOT NULL,              -- 提醒触发日期
  is_read     INTEGER DEFAULT 0,
  is_dismissed INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_asset ON notifications(asset_id);
CREATE INDEX idx_notifications_trigger ON notifications(trigger_date);
CREATE INDEX idx_notifications_unread ON notifications(is_read, is_dismissed);
```

#### screenshots（截图表）— 未实现，预留设计

```sql
CREATE TABLE screenshots (
  id          TEXT PRIMARY KEY,
  asset_id    TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,               -- 本地存储路径
  ocr_text    TEXT,                        -- OCR识别结果
  ocr_parsed  TEXT DEFAULT '{}',           -- OCR结构化提取结果（JSON）
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_screenshots_asset ON screenshots(asset_id);
```

---

## 2. 前端架构

### 2.1 目录结构

```
client/src/
├── main.tsx                    # 入口（QueryClientProvider + BrowserRouter）
├── App.tsx                     # 路由定义
├── lib/
│   ├── api-client.ts           # fetch 基础封装
│   ├── api-assets.ts           # 资产 API
│   ├── api-suppliers.ts        # 供应商 API
│   ├── api-relations.ts        # 关联 API
│   ├── api-notifications.ts    # 提醒 API
│   ├── api-import.ts           # 导入 API
│   ├── api-export.ts           # 导出 API
│   ├── api-dashboard.ts        # 仪表盘 API
│   └── utils.ts                # shadcn/ui cn() 工具
├── hooks/
│   ├── useAssets.ts            # 资产 CRUD hooks
│   ├── useSuppliers.ts         # 供应商 CRUD hooks
│   ├── useRelations.ts         # 关联 CRUD hooks
│   ├── useNotifications.ts     # 提醒 hooks
│   └── useDashboard.ts         # 仪表盘统计 hooks
├── components/
│   ├── ui/                     # shadcn/ui 组件
│   ├── layout/
│   │   ├── Sidebar.tsx         # 侧边导航（>=768px 显示）
│   │   ├── BottomNav.tsx       # 底部 Tab 导航（<768px 显示）
│   │   ├── Header.tsx          # 顶部栏（搜索+通知面板）
│   │   └── AppLayout.tsx       # 布局容器
│   ├── asset/
│   │   ├── AssetList.tsx       # 资产列表（筛选+卡片网格）
│   │   ├── AssetDetail.tsx     # 资产详情
│   │   └── AssetForm.tsx       # 资产创建/编辑表单
│   ├── supplier/
│   │   ├── SupplierList.tsx    # 供应商列表
│   │   ├── SupplierDetail.tsx  # 供应商详情
│   │   └── SupplierForm.tsx    # 供应商表单
│   ├── dashboard/
│   │   └── Dashboard.tsx       # 仪表盘（统计卡片+分布+订阅+健康）
│   ├── import/
│   │   └── ImportWizard.tsx    # 导入向导（上传→预览→映射→导入）
│   ├── export/
│   │   └── ExportPage.tsx      # 数据导出（资产/供应商Excel导出）
├── types/
│   └── asset.ts                # 资产类型定义
└── index.css                   # Tailwind + shadcn/ui 主题
```

### 2.2 路由结构

```
/                     → DashboardPage        仪表盘
/assets               → AssetListPage        资产列表
/assets/:id           → AssetDetailPage      资产详情
/assets/new           → AssetForm（新建模式）
/assets/:id/edit      → AssetForm（编辑模式）
/suppliers            → SupplierListPage     供应商列表
/suppliers/:id        → SupplierDetailPage   供应商详情
/suppliers/new        → SupplierForm（新建）
/suppliers/:id/edit   → SupplierForm（编辑）
/import               → ImportPage           数据导入
/export               → ExportPage           数据导出
```

### 2.3 页面布局

**桌面端（>=768px）：**
```
┌──────────────────────────────────────────────┐
│  Header [搜索框]                    [通知铃铛]  │
├────────┬─────────────────────────────────────┤
│        │                                     │
│  侧边栏  │           主内容区                  │
│        │                                     │
│  仪表盘  │                                     │
│  资产   │                                     │
│  供应商  │                                     │
│  导入   │                                     │
│  导出   │                                     │
│        │                                     │
└────────┴─────────────────────────────────────┘
```

**移动端（<768px）：**
```
┌──────────────────────┐
│  Header [🔍] [🔔]    │
├──────────────────────┤
│                      │
│     主内容区          │
│                      │
├──────────────────────┤
│ 仪表盘│资产│供应商│导入 │  ← 底部 Tab
└──────────────────────┘
```

侧边栏桌面常驻，手机端隐藏。手机端搜索变为图标点击展开，底部 Tab 导航替代侧边栏。使用 `100dvh` 视口单位 + `safe-area-inset-bottom` 适配 iPhone。

---

## 3. 前后端交互架构

### 3.1 通信方式

```
前端 (React)  ←→  HTTP REST API  ←→  Express 后端  ←→  SQLite
```

- **数据操作：** 前端通过 `fetch()` 调用 `/api/*` REST 端点
- **文件上传：** 数据导入通过 `multipart/form-data` 上传
- **开发代理：** Vite dev server 将 `/api` 请求代理到 `localhost:3001`

### 3.2 REST API 设计

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/assets` | GET/POST | 列表（带筛选）/创建 |
| `/api/assets/:id` | GET/PUT/DELETE | 详情/更新/删除 |
| `/api/suppliers` | GET/POST | 列表/创建 |
| `/api/suppliers/:id` | GET/PUT/DELETE | 详情/更新/删除 |
| `/api/suppliers/:id/favorite` | PATCH | 切换收藏 |
| `/api/relations/:assetId` | GET | 获取关联 |
| `/api/relations` | POST | 添加关联 |
| `/api/relations/:id` | DELETE | 删除关联 |
| `/api/notifications` | GET | 列表 |
| `/api/notifications/:id/read` | PATCH | 标记已读 |
| `/api/notifications/:id/dismiss` | PATCH | 忽略 |
| `/api/notifications/scan` | POST | 触发扫描 |
| `/api/import/parse` | POST | 上传+解析预览 |
| `/api/import/execute` | POST | 确认导入 |
| `/api/export/assets` | GET | 导出资产Excel |
| `/api/export/suppliers` | GET | 导出供应商Excel |
| `/api/dashboard/overview` | GET | 总览统计 |
| `/api/dashboard/subscriptions` | GET | 订阅费用 |
| `/api/dashboard/health` | GET | 健康度 |

**安全：** 全部使用参数化查询防 SQL 注入。

### 3.3 数据流

```
用户操作 → React组件 → hook调用 → fetch(REST API) → SQL执行 → 返回JSON → hook更新状态 → 组件重渲染
```

不引入全局状态管理库（Redux/Zustand等），个人应用规模不需要。数据获取和缓存通过React Query处理：
- 自动缓存 + 后台刷新（staleTime 5分钟）
- 创建/编辑后 invalidateQueries 刷新列表
- 失败自动重试（retry 1）

---

## 4. 提醒系统设计

### 4.1 扫描策略

应用启动时 + 每小时定时扫描一次，检查以下条件：

| 提醒类型 | 扫描逻辑 |
|---------|---------|
| warranty_expiry | physical.ext → warranty_expiry - 30天 <= 今天 |
| subscription_renewal | subscription.ext → next_billing_date - 7天 <= 今天 |
| digital_expiry | digital.ext → expiry_date - 30天 <= 今天 |
| trial_expiry | subscription.ext → trial_end - 3天 <= 今天 |
| usage_stagnation | digital.ext → usage_stats.last_access + 30天 <= 今天 |
| deprecation | physical.ext → current_value <= purchase_price * 0.1 |

### 4.2 去重

同一资产 + 同一提醒类型 + 同一触发日期，只生成一条提醒。已dismiss的不重复生成。

---

## 5. 数据导入设计

### 5.1 通用流程

```
选择文件 → 解析 → 预览前10行 → 用户映射列 → 确认 → 批量插入 → 显示结果
```

### 5.2 Notion导入预设

Notion导出CSV的常见列名自动映射：
- Name → name
- Type → category
- Status → status
- Price → purchase_price
- Date → purchase_date
- URL → ext.access_url

用户可在此基础上调整映射。
