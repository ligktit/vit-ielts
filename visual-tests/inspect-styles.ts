import { test } from "@playwright/test";
import path from "path";

test("inspect style changes on toggle", async ({ page }) => {
  // 1. Log in
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#admin-email", "admin@vit.vn");
  await page.fill("#admin-password", "Admin@123456");
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  // 2. Go to collections
  await page.goto("/admin/mock-test-collections");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector(".ant-table-row");

  // Helper to get element details
  const getElementDetails = async (selector: string, name: string) => {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { name: sel, found: false };
      
      const computed = window.getComputedStyle(el);
      return {
        name: sel,
        found: true,
        className: el.className,
        tagName: el.tagName,
        styles: {
          height: computed.height,
          padding: computed.padding,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
          margin: computed.margin,
        }
      };
    }, selector);
  };

  console.log("=== BEFORE TOGGLE ===");
  const rowBefore = await getElementDetails(".ant-table-row", "Row");
  const inputBefore = await getElementDetails(".ant-input-number", "InputNumber");
  const switchBefore = await getElementDetails("button.ant-switch", "Switch");
  const cellBefore = await getElementDetails(".ant-table-cell", "Cell");
  console.log("Row:", JSON.stringify(rowBefore, null, 2));
  console.log("Input:", JSON.stringify(inputBefore, null, 2));
  console.log("Switch:", JSON.stringify(switchBefore, null, 2));
  console.log("Cell:", JSON.stringify(cellBefore, null, 2));

  // 3. Click the toggle switch
  const firstRow = page.locator(".ant-table-row").first();
  const switchBtn = firstRow.locator("button.ant-switch");
  
  // Wait for the API response
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/admin/home/practice-section") && response.status() === 200
  );
  await switchBtn.click();
  await responsePromise;
  console.log("Toggled switch API responded.");

  // Wait for any animations to finish (2 seconds)
  await page.waitForTimeout(2000);

  console.log("=== AFTER TOGGLE ===");
  const rowAfter = await getElementDetails(".ant-table-row", "Row");
  const inputAfter = await getElementDetails(".ant-input-number", "InputNumber");
  const switchAfter = await getElementDetails("button.ant-switch", "Switch");
  const cellAfter = await getElementDetails(".ant-table-cell", "Cell");
  console.log("Row:", JSON.stringify(rowAfter, null, 2));
  console.log("Input:", JSON.stringify(inputAfter, null, 2));
  console.log("Switch:", JSON.stringify(switchAfter, null, 2));
  console.log("Cell:", JSON.stringify(cellAfter, null, 2));
});
