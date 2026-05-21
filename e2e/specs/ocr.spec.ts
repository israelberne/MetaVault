import { test, expect } from "../fixtures/test-fixtures.js";
import { createAsset } from "../fixtures/seed.js";
import path from "path";
import fs from "fs";

test.describe("OCR 截图上传", () => {
  test("上传订阅截图", async ({ page }) => {
    const asset = await createAsset({
      name: "OCR测试订阅",
      type: "subscription",
      category: "subscription.saas",
      ext: { billing_cycle: "monthly", amount: 99 },
    });

    await page.goto(`/assets/${asset.id}`);
    await page.waitForLoadState("networkidle");

    // 创建一个简单的测试图片（1x1 PNG）
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    const imgPath = path.join(process.env.TEMP || "/tmp", "test-screenshot.png");
    fs.writeFileSync(imgPath, pngBuffer);

    // 查找截图上传 input
    const fileInput = page.locator("input[type='file']");
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fileInput.setInputFiles(imgPath);
      await page.waitForLoadState("networkidle");
    }

    // 清理
    fs.unlinkSync(imgPath);
  });
});
