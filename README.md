# MetaVault

统一管理物理资产、数字资产、产品订阅的 Web 应用。数据打通、关联追踪、智能提醒，移动端适配。

## 技术栈

- **后端：** Node.js + Express 5 + better-sqlite3
- **前端：** React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **数据获取：** React Query v5
- **路由：** React Router v7
- **包管理：** pnpm workspace monorepo

## 功能

- 资产 CRUD（物理/数字/订阅三类，扩展字段 JSON 存储）
- 资产批量操作（批量修改状态、批量删除）
- 优秀供应商管理（CRUD + 收藏 + 关联资产展示）
- 资产关联（depends_on / contains / bound_to / related_to）
- 提醒系统（6 种类型，启动时 + 每小时自动扫描）
- Web Push 通知（VAPID，浏览器推送）
- 统计仪表盘（总览 / 订阅费用 / 健康度 + Recharts 图表）
- 数据导入（CSV / Excel，字段映射 + 预览）
- 数据导出（Excel 格式导出资产和供应商数据）
- 全局搜索（Header 搜索栏驱动资产列表筛选）
- 通知页面（未读/全部筛选，批量已读/忽略）
- 订阅截图上传 + OCR 识别（tesseract.js）
- 移动端适配（<768px 底部 Tab，>=768px 侧边栏）

## 快速开始

```bash
# 安装依赖
pnpm install

# 同时启动前后端
pnpm dev

# 仅前端（localhost:5174）
pnpm dev:client

# 仅后端（localhost:3001）
pnpm dev:server

# 构建
pnpm build
```

## 项目结构

```
client/           React 前端
  src/
    components/   UI 组件（asset / supplier / dashboard / import / export / notification / layout）
    hooks/        React Query hooks
    lib/          API 封装（api-client + api-*）
    types/        TypeScript 类型
server/           Node.js 后端
  src/
    db/           数据库初始化（init.sql + init.ts）
    routes/       REST API 路由（assets / suppliers / relations / notifications / import / dashboard / export）
    services/     提醒扫描 + OCR识别 + Web Push服务
    middleware/    错误处理
docs/             产品文档（PRD / 技术设计）
```

## 生产部署

Express 同时提供前端静态文件和 API，单端口部署：

```bash
pnpm build
PORT=3001 node server/dist/index.js
```

数据库文件自动创建于 `./data/metavault.db`。

## License

MIT