import { test, expect } from "../fixtures/test-fixtures.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("导入导出", () => {
  test("导出资产 Excel", async ({ page }) => {
    await page.goto("/export");
    await page.waitForLoadState("networkidle");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /导出资产/ }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });

  test("导出供应商 Excel", async ({ page }) => {
    await page.goto("/export");
    await page.waitForLoadState("networkidle");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /导出供应商/ }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });
});