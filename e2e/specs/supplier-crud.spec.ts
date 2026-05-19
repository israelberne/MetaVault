import { test, expect } from "../fixtures/test-fixtures.js";
import { createSupplier } from "../fixtures/seed.js";
import { testSupplier, testSupplierDigital } from "../fixtures/test-data.js";

test.describe("供应商 CRUD", () => {
  test("查看供应商详情", async ({ page }) => {
    const supplier = await createSupplier(testSupplier);

    await page.goto(`/suppliers/${supplier.id}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("测试 Apple Store")).toBeVisible();
    await expect(page.getByText("5")).toBeVisible();
  });

  test("删除供应商", async ({ page }) => {
    const supplier = await createSupplier(testSupplierDigital);

    await page.goto(`/suppliers/${supplier.id}`);
    await page.waitForLoadState("networkidle");

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "删除" }).click();

    await page.waitForURL("**/suppliers");
    await expect(page.getByText("测试 Steam")).not.toBeVisible();
  });
});