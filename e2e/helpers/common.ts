import type { Page } from "@playwright/test";

export async function navigateTo(page: Page, item: string) {
  await page.getByRole("link", { name: new RegExp(item) }).first().click();
  await page.waitForLoadState("networkidle");
}

export async function fillInput(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

export async function selectOption(page: Page, label: string, option: string) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option }).click();
}

export async function clickButton(page: Page, name: string) {
  await page.getByRole("button", { name }).click();
}
