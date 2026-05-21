import { test, expect } from "../fixtures/test-fixtures.js";

test.describe("通知页面", () => {
  test("显示通知列表", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");
    // 页面标题可见
    await expect(page.getByRole("heading", { name: "通知" })).toBeVisible();
  });

  test("单条忽略通知", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    const dismissBtns = page.locator("button[title='忽略']");
    const count = await dismissBtns.count();
    if (count > 0) {
      await dismissBtns.first().click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("批量标记全部已读", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    const markAllReadBtn = page.getByRole("button", { name: /全部已读/ });
    if (await markAllReadBtn.isVisible()) {
      await markAllReadBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("批量全部忽略", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    const dismissAllBtn = page.getByRole("button", { name: /全部忽略/ });
    if (await dismissAllBtn.isVisible()) {
      await dismissAllBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });
});
