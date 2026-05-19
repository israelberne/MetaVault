import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset } from "../fixtures/seed.js";
import { testAsset } from "../fixtures/test-data.js";

test.describe("资产 CRUD", () => {
  test("查看物理资产详情", async ({ page }) => {
    const asset = await createAsset(testAsset.physical);

    await page.goto(`/assets/${asset.id}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("测试 MacBook Pro")).toBeVisible();
    await expect(page.getByText("MacBook Pro 14 M3 Pro")).toBeVisible();
    await expect(page.getByText("书房")).toBeVisible();
  });

  test("查看订阅资产详情", async ({ page }) => {
    const asset = await createAsset(testAsset.subscription);

    await page.goto(`/assets/${asset.id}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("测试 ChatGPT Plus")).toBeVisible();
    await expect(page.getByText("monthly")).toBeVisible();
  });

  test("删除资产", async ({ page }) => {
    const asset = await createAsset(testAsset.physical);

    await page.goto(`/assets/${asset.id}`);
    await page.waitForLoadState("networkidle");

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "删除" }).click();

    await page.waitForURL("**/assets");
    await expect(page.getByText("测试 MacBook Pro")).not.toBeVisible();
  });
});