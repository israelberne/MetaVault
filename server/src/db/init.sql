CREATE TABLE IF NOT EXISTS suppliers (
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

CREATE TABLE IF NOT EXISTS assets (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK(type IN ('physical','digital','subscription')),
  category      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','idle','expired','disposed')),
  tags          TEXT DEFAULT '[]',
  purchase_date TEXT,
  purchase_price REAL,
  currency      TEXT DEFAULT 'CNY',
  supplier_id   TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  notes         TEXT,
  ext           TEXT DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_supplier ON assets(supplier_id);

CREATE TABLE IF NOT EXISTS asset_relations (
  id          TEXT PRIMARY KEY,
  source_id   TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  relation    TEXT NOT NULL CHECK(relation IN ('depends_on','contains','bound_to','related_to')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_id, target_id, relation)
);

CREATE INDEX IF NOT EXISTS idx_relations_source ON asset_relations(source_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON asset_relations(target_id);

CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  asset_id    TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK(type IN ('warranty_expiry','subscription_renewal','digital_expiry','trial_expiry','usage_stagnation','deprecation','cancellation_suggestion','replacement_suggestion')),
  message     TEXT NOT NULL,
  trigger_date TEXT NOT NULL,
  is_read     INTEGER DEFAULT 0,
  is_dismissed INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_asset ON notifications(asset_id);
CREATE INDEX IF NOT EXISTS idx_notifications_trigger ON notifications(trigger_date);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read, is_dismissed);

CREATE TABLE IF NOT EXISTS screenshots (
  id          TEXT PRIMARY KEY,
  asset_id    TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,
  ocr_text    TEXT,
  ocr_parsed  TEXT DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_screenshots_asset ON screenshots(asset_id);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id        TEXT PRIMARY KEY,
  endpoint  TEXT NOT NULL UNIQUE,
  p256dh    TEXT NOT NULL,
  auth      TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
