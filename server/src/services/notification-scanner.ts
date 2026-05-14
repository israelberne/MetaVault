import { getDb } from "../db/init.js";

export async function scanNotifications(): Promise<number> {
  const db = await getDb();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const assets = db.prepare("SELECT id, name, type, ext, purchase_price FROM assets WHERE status = 'active'").all() as Record<string, unknown>[];

  let count = 0;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO notifications (id, asset_id, type, message, trigger_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction(() => {
    for (const asset of assets) {
      const ext = JSON.parse(asset.ext as string || "{}") as Record<string, unknown>;
      const checks: Array<{ type: string; message: string; triggerDate: string }> = [];

      if (asset.type === "physical") {
        if (ext.warranty_expiry) {
          const exp = new Date(ext.warranty_expiry as string);
          const warn = new Date(exp.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (warn <= now) {
            checks.push({ type: "warranty_expiry", message: `${asset.name} 保修即将到期`, triggerDate: ext.warranty_expiry as string });
          }
        }
        if (ext.current_value && asset.purchase_price) {
          if (Number(ext.current_value) <= Number(asset.purchase_price) * 0.1) {
            checks.push({ type: "deprecation", message: `${asset.name} 严重折旧`, triggerDate: today });
          }
        }
      }

      if (asset.type === "subscription") {
        if (ext.next_billing_date) {
          const exp = new Date(ext.next_billing_date as string);
          const warn = new Date(exp.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (warn <= now) {
            checks.push({ type: "subscription_renewal", message: `${asset.name} 即将续费`, triggerDate: ext.next_billing_date as string });
          }
        }
        if (ext.trial_end) {
          const exp = new Date(ext.trial_end as string);
          const warn = new Date(exp.getTime() - 3 * 24 * 60 * 60 * 1000);
          if (warn <= now) {
            checks.push({ type: "trial_expiry", message: `${asset.name} 试用即将到期`, triggerDate: ext.trial_end as string });
          }
        }
      }

      if (asset.type === "digital") {
        if (ext.expiry_date) {
          const exp = new Date(ext.expiry_date as string);
          const warn = new Date(exp.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (warn <= now) {
            checks.push({ type: "digital_expiry", message: `${asset.name} 即将到期`, triggerDate: ext.expiry_date as string });
          }
        }
        const usageStats = ext.usage_stats as Record<string, unknown> | undefined;
        if (usageStats?.last_access) {
          const lastAccess = new Date(usageStats.last_access as string);
          const stale = new Date(lastAccess.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (stale <= now) {
            checks.push({ type: "usage_stagnation", message: `${asset.name} 长期未使用`, triggerDate: today });
          }
        }
      }

      for (const check of checks) {
        // 去重：同资产+同类型+同触发日不重复
        const exists = db.prepare(
          "SELECT id FROM notifications WHERE asset_id = ? AND type = ? AND trigger_date = ? AND is_dismissed = 0"
        ).get(asset.id, check.type, check.triggerDate);

        if (!exists) {
          insert.run(crypto.randomUUID(), asset.id, check.type, check.message, check.triggerDate, new Date().toISOString());
          count++;
        }
      }
    }
  });

  transaction();
  return count;
}
