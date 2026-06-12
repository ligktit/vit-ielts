import { test } from "@playwright/test";

test("verify table style stability after prefixing fix", async ({ page }) => {
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
  const getElementDetails = async (selector: string) => {
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

  const inspectAll = async (label: string) => {
    console.log(`=== ${label} ===`);
    console.log("Row:", JSON.stringify(await getElementDetails(".ant-table-row").catch(() => null), null, 2));
    console.log("Collection Data Cell:", JSON.stringify(await getElementDetails(".ant-table-row td:nth-child(3)").catch(() => null), null, 2));
  };

  await inspectAll("BEFORE TOGGLE");

  // 3. Click the toggle switch
  const firstRow = page.locator(".ant-table-row").first();
  const switchBtn = firstRow.locator("button.ant-switch");
  
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/admin/home/practice-section") && response.status() === 200
  );
  await switchBtn.click();
  await responsePromise;
  console.log("Toggled switch.");

  await page.waitForTimeout(2000);

  await inspectAll("AFTER TOGGLE");

  // 4. Reload the page
  console.log("Reloading...");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".ant-table-row");

  await inspectAll("AFTER RELOAD");
});
