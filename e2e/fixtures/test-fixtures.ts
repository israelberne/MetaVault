import { test as base, expect } from "@playwright/test";
import { resetDb } from "./seed.js";

export const test = base.extend({
  page: async ({ page }, use) => {
    await resetDb();
    await use(page);
  },
});

export { expect };
