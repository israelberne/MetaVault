import { test } from "@playwright/test";

test("debug dashboard screenshot", async ({ page }) => {
  await page.goto("http://localhost:5174");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "debug-dashboard.png", fullPage: true });

  // 获取提醒区域文本
  const bellCard = page.locator("text=未读提醒").locator("..");
  const exists = await bellCard.count();
  console.log("未读提醒 card exists:", exists);

  // 获取整个页面文本中包含"提醒"的行
  const body = await page.locator("body").textContent();
  const relevant = body.split("\n").filter(l => l.includes("提醒") || l.includes("未读") || l.includes("到期"));
  for (const l of relevant) console.log(l.trim());
});
