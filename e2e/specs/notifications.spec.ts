import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset, scanNotifications } from "../fixtures/seed.js";
import { testAsset } from "../fixtures/test-data.js";

test.describe("通知页面", () => {
  test("查看和操作通知", async ({ page }) => {
    // 创建一个即将续费的订阅（next_billing_date 设为 3 天后）
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const subData = {
      ...testAsset.subscription,
      ext: {
        ...testAsset.subscription.ext,
        next_billing_date: soon.toISOString().slice(0, 10),
        usage_frequency: "rarely",
      },
    };
    await createAsset(subData);

    // 触发扫描
    await scanNotifications();

    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    // 应有通知
    const notificationCards = page.locator('[class*="rounded-md border"]');
    await expect(notificationCards.first()).toBeVisible({ timeout: 5000 });

    // 标记已读
    const readBtn = page.getByRole("button", { name: "标记已读" }).first();
    if (await readBtn.isVisible()) {
      await readBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("忽略通知", async ({ page }) => {
    // 创建即将续费的订阅
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const subData = {
      ...testAsset.subscription,
      ext: {
        ...testAsset.subscription.ext,
        next_billing_date: soon.toISOString().slice(0, 10),
        usage_frequency: "rarely",
      },
    };
    await createAsset(subData);
    await scanNotifications();

    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    // 应有通知
    const dismissBtn = page.getByTitle("忽略").first();
    await expect(dismissBtn).toBeVisible({ timeout: 5000 });

    // 记录忽略前的通知数量
    const countBefore = await page.getByTitle("忽略").count();

    // 点击忽略
    await dismissBtn.click();
    // 等待 DOM 更新（React Query invalidate → refetch → 重新渲染）
    await page.waitForTimeout(1000);

    // 验证通知数量减少（忽略的通知不再显示）
    await expect(page.getByTitle("忽略")).toHaveCount(countBefore - 1, { timeout: 5000 });
  });
});