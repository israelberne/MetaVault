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

  test("通过表单创建供应商", async ({ page }) => {
    await page.goto("/suppliers/new");
    await page.waitForLoadState("networkidle");

    // 填写名称（排除 Header 搜索框，只匹配主内容区的 form input）
    const nameInput = page.locator("main form input").first();
    await nameInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set;
      setter?.call(el, "NewSupplier");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 选择类型
    await page.locator("main form").getByRole("combobox").first().click();
    await page.getByRole("option", { name: "数字" }).click();

    // 提交
    await page.locator("main form").getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/suppliers\//, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("NewSupplier")).toBeVisible({ timeout: 5000 });
  });

  test("编辑供应商名称", async ({ page }) => {
    const supplier = await createSupplier(testSupplier);
    await page.goto(`/suppliers/${supplier.id}`);
    await page.waitForLoadState("networkidle");

    // 点击编辑按钮
    await page.getByRole("button", { name: "编辑" }).click();
    await page.waitForLoadState("networkidle");

    // 修改名称（排除 Header 搜索框）
    const nameInput = page.locator("main form input").first();
    await nameInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set;
      setter?.call(el, "UpdatedStore");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 提交
    await page.locator("main form").getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/suppliers\//, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("UpdatedStore")).toBeVisible({ timeout: 5000 });
  });

  test("切换供应商收藏状态", async ({ page }) => {
    const supplier = await createSupplier(testSupplierDigital);
    await page.goto(`/suppliers/${supplier.id}`);
    await page.waitForLoadState("networkidle");

    // 点击标题行中的第一个按钮（Star 收藏按钮在标题旁边）
    // SupplierDetail: h2 + Star button 在同一行
    const headerRow = page.locator("h2").locator("..");
    const buttons = headerRow.locator("button");
    // Star 按钮在标题行最前面（ArrowLeft 后面就是 Star）
    // 点击第二个按钮（第一个是返回按钮）
    await buttons.nth(1).click();
    await page.waitForLoadState("networkidle");

    // 验证收藏状态变化：通过 API 查询确认
    const res = await fetch(`http://localhost:3001/api/suppliers/${supplier.id}`);
    const updated = await res.json();
    expect(updated.is_favorite).toBeTruthy();
  });
});