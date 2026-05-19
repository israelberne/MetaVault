import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset } from "../fixtures/seed.js";
import { testAsset } from "../fixtures/test-data.js";

test.describe("资产列表", () => {
  test("按类型筛选", async ({ page }) => {
    await createAsset(testAsset.physical);
    await createAsset(testAsset.digital);
    await createAsset(testAsset.subscription);

    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    // 默认显示全部 3 个
    const cards = page.locator('[class*="cursor-pointer"]');
    await expect(cards).toHaveCount(3);

    // 筛选物理资产 — shadcn Select 用 button trigger
    const typeTrigger = page.locator("button").filter({ hasText: /全部类型|物理资产|数字资产|订阅/ }).first();
    await typeTrigger.click();
    await page.getByRole("option", { name: "物理资产" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("测试 MacBook Pro")).toBeVisible();
  });

  test("搜索资产", async ({ page }) => {
    await createAsset(testAsset.physical);
    await createAsset(testAsset.digital);

    await page.goto("/assets?q=Mac");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("测试 MacBook Pro")).toBeVisible();
    await expect(page.getByText("测试 Udemy 课程")).not.toBeVisible();
  });
});