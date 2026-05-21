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

  test("通过表单创建物理资产", async ({ page }) => {
    await page.goto("/assets/new");
    await page.waitForLoadState("networkidle");

    // 填写名称（form input[0] 是搜索框，[1] 是名称输入框）
    const nameInput = page.locator("form input").nth(1);
    await nameInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "TestLaptop");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 分类改为手机
    const categorySelect = page.getByRole("combobox").nth(1);
    await categorySelect.click();
    await page.getByRole("option", { name: "手机" }).click();

    // 填写获取价格
    const priceInput = page.locator('form input[type="number"]').first();
    await priceInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "5999");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 提交表单
    await page.getByRole("button", { name: "保存" }).click();

    // 验证跳转到详情页
    await page.waitForURL("**/assets/*", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("TestLaptop")).toBeVisible();
  });

  test("通过表单创建订阅资产", async ({ page }) => {
    await page.goto("/assets/new");
    await page.waitForLoadState("networkidle");

    // 填写名称
    const nameInput = page.locator("form input").nth(1);
    await nameInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "TestSub");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 切换类型为订阅
    const typeSelect = page.getByRole("combobox").first();
    await typeSelect.click();
    await page.getByRole("option", { name: "订阅" }).click();

    // 填写每期费用
    const amountInput = page.locator('form input[type="number"]').first();
    await amountInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "99");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 提交表单
    await page.getByRole("button", { name: "保存" }).click();

    // 验证跳转到详情页
    await page.waitForURL("**/assets/*", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("TestSub")).toBeVisible();
  });

  test("编辑资产名称", async ({ page }) => {
    const asset = await createAsset(testAsset.physical);
    await page.goto(`/assets/${asset.id}`);
    await page.waitForLoadState("networkidle");

    // 点击编辑按钮
    await page.getByRole("button", { name: "编辑" }).click();
    await page.waitForLoadState("networkidle");

    // 修改名称（form input[0] 是搜索框，[1] 是名称输入框）
    const nameInput = page.locator("form input").nth(1);
    await nameInput.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set;
      setter?.call(el, "UpdatedLaptop");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 提交
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/assets\/[^/]+$/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // 验证名称已更新
    await expect(page.getByText("UpdatedLaptop")).toBeVisible({ timeout: 5000 });
  });
});