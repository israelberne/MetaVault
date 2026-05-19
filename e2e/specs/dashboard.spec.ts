import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset, createSupplier } from "../fixtures/seed.js";
import { testAsset, testSupplier } from "../fixtures/test-data.js";

test.describe("仪表盘", () => {
  test("空状态显示零值", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("资产总数").first()).toBeVisible();
    await expect(page.getByText("0").first()).toBeVisible();
  });

  test("有数据时显示统计", async ({ page }) => {
    await createAsset(testAsset.physical);
    await createAsset(testAsset.digital);
    await createAsset(testAsset.subscription);
    await createSupplier(testSupplier);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("3").first()).toBeVisible();
  });
});
