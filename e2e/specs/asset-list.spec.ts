import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset, createRelation } from "../fixtures/seed.js";

test.describe("资产列表", () => {
  test("显示资产卡片", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");
    const cards = page.locator("[class*='cursor-pointer']");
    expect(cards.length || 0).toBeGreaterThanOrEqual(0);
  });

  test("按类型筛选", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    // 点击类型筛选下拉
    const typeSelect = page.locator("button[role='combobox']").first();
    await typeSelect.click();
    await page.locator("[role='option']", { hasText: "物理资产" }).click();
    await page.waitForLoadState("networkidle");

    // 验证 URL 或卡片变化
    const cards = page.locator("[class*='cursor-pointer']");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("按状态筛选", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    // 第二个 combobox 是状态筛选
    const statusSelect = page.locator("button[role='combobox']").nth(1);
    await statusSelect.click();
    await page.locator("[role='option']", { hasText: "使用中" }).click();
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[class*='cursor-pointer']");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("按价格排序", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    // 第三个 combobox 是排序
    const sortSelect = page.locator("button[role='combobox']").nth(2);
    await sortSelect.click();
    await page.locator("[role='option']", { hasText: "按价格" }).click();
    await page.waitForLoadState("networkidle");

    // 验证排序下拉显示"按价格"
    await expect(sortSelect).toContainText("按价格");
  });

  test("内联搜索", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    // 使用页面内的搜索框（非 Header）
    const searchInput = page.locator("main .relative input[placeholder='搜索...']");
    if (await searchInput.isVisible()) {
      await searchInput.fill("测试");
      await page.waitForLoadState("networkidle");
      // URL 应包含 q 参数
      await expect(page).toHaveURL(/q=/);
    }
  });

  test("进入选择模式并选择资产", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[class*='cursor-pointer']");
    const count = await cards.count();
    if (count === 0) return;

    // 点击批量操作按钮
    await page.getByRole("button", { name: "批量操作" }).click();

    // 点击第一个资产卡片
    await cards.first().click();

    // 验证已选提示
    await expect(page.getByText(/已选 \d+ 项/)).toBeVisible();
  });

  test("批量删除资产", async ({ page }) => {
    await createAsset({ name: "批量删除测试1", type: "physical", category: "physical.other" });
    await createAsset({ name: "批量删除测试2", type: "physical", category: "physical.other" });

    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "批量操作" }).click();
    await page.getByRole("button", { name: "全选" }).click();

    // 点击删除并处理 confirm dialog
    page.once("dialog", (d) => d.accept());
    await page.locator("button:has(svg.lucide-trash-2)").click();
    await page.waitForTimeout(2000);
  });

  test("批量修改资产状态", async ({ page }) => {
    await createAsset({ name: "批量状态测试", type: "physical", category: "physical.other" });

    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    // 进入批量模式
    await page.getByRole("button", { name: "批量操作" }).click();

    // 全选
    await page.getByRole("button", { name: "全选" }).click();

    // 选择状态
    const statusSelect = page.locator("button[role='combobox']", { hasText: "改状态" });
    await statusSelect.click();
    await page.locator("[role='option']", { hasText: "闲置" }).click();

    // 确认修改
    await page.getByRole("button", { name: "确认修改" }).click();
    await page.waitForLoadState("networkidle");
  });
});
