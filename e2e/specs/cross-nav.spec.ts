import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset, createSupplier } from "../fixtures/seed.js";
import { testAsset, testSupplier } from "../fixtures/test-data.js";

test.describe("交叉导航", () => {
  test("资产详情→供应商→关联资产", async ({ page }) => {
    const supplier = await createSupplier(testSupplier);
    const assetData = { ...testAsset.physical, supplier_id: supplier.id };
    const asset = await createAsset(assetData);

    // 资产详情页点击供应商链接
    await page.goto(`/assets/${asset.id}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("测试 Apple Store")).toBeVisible();
    await page.getByText("测试 Apple Store").click();
    await page.waitForURL(/\/suppliers\/[\w-]+/);

    // 供应商详情页
    await expect(page.getByText("测试 Apple Store")).toBeVisible();
  });
});
