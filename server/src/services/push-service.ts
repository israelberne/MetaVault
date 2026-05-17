import webpush from "web-push";
import { getDb } from "../db/init.js";

let initialized = false;

export function initPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.log("VAPID keys not configured, Web Push disabled");
    return false;
  }

  webpush.setVapidDetails(
    "mailto:metavault@localhost",
    publicKey,
    privateKey
  );
  initialized = true;
  console.log("Web Push initialized");
  return true;
}

export function getVapidPublicKey(): string | undefined {
  return process.env.VAPID_PUBLIC_KEY;
}

export async function sendPushNotification(payload: {
  title: string;
  body: string;
  icon?: string;
}) {
  if (!initialized) return;

  const db = await getDb();
  const subs = db.prepare("SELECT * FROM push_subscriptions").all() as Record<string, string>[];

  const data = JSON.stringify(payload);

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        data
      );
    } catch (err: any) {
      // 410 = subscription expired, remove it
      if (err.statusCode === 410) {
        db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(sub.endpoint);
      } else {
        console.error("Push send error:", err.message);
      }
    }
  }
}
