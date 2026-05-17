import Tesseract from "tesseract.js";

interface OcrResult {
  service_name?: string;
  amount?: number;
  currency?: string;
  billing_cycle?: string;
  next_billing_date?: string;
  raw_text?: string;
}

export async function recognizeSubscription(
  imagePath: string
): Promise<OcrResult> {
  const result = await Tesseract.recognize(imagePath, "chi_sim+eng", {
    logger: () => {},
  });

  const text = result.data.text;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const ocrResult: OcrResult = { raw_text: text };

  // 提取服务名：取第一个非空行
  if (lines.length > 0) {
    ocrResult.service_name = lines[0].substring(0, 50);
  }

  // 提取金额：匹配 ¥/$ 开头的数字
  const amountPattern = /[¥￥$]\s*(\d+[\.,]?\d*)/;
  for (const line of lines) {
    const match = line.match(amountPattern);
    if (match) {
      ocrResult.amount = parseFloat(match[1].replace(",", ""));
      ocrResult.currency = line.includes("$") ? "USD" : "CNY";
      break;
    }
  }

  // 提取日期：匹配 yyyy-mm-dd 或 yyyy/mm/dd
  const datePattern = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/;
  for (const line of lines) {
    const match = line.match(datePattern);
    if (match) {
      const [, y, m, d] = match;
      ocrResult.next_billing_date = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      break;
    }
  }

  // 提取计费周期
  if (/月|monthly/i.test(text)) {
    ocrResult.billing_cycle = "monthly";
  } else if (/年|yearly|annual/i.test(text)) {
    ocrResult.billing_cycle = "yearly";
  }

  return ocrResult;
}
