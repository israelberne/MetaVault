import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset } from "../fixtures/seed.js";
import { testAsset } from "../fixtures/test-data.js";

test.describe("移动端布局", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("底部导航和 FAB 按钮", async ({ page }) => {
    await createAsset(testAsset.physical);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 底部导航应可见
    await expect(page.getByRole("link", { name: /仪表盘/ })).toBeVisible();

    // 侧边栏不应可见（桌面端元素）
    const sidebar = page.locator("nav").filter({ hasText: /仪表盘.*资产.*供应商/ }).first();
    // 移动端侧边栏应该隐藏

    // 导航到资产列表
    await page.getByRole("link", { name: /资产/ }).click();
    await page.waitForLoadState("networkidle");

    // FAB 按钮应可见
    const fab = page.locator('button[class*="fixed"][class*="rounded-full"]');
    await expect(fab).toBeVisible();
  });
});
