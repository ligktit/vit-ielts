import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Admin Mock Test Collections Toggle - Refresh Check", () => {
  test("login, toggle homepage, refresh page, and check row height", async ({ page }) => {
    page.on("console", (msg) => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

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

    // Screenshot 1: Initial load
    const path1 = path.resolve(process.cwd(), "artifacts/check-1-initial.png");
    await page.screenshot({ path: path1 });
    console.log("Saved initial screenshot to:", path1);

    // 3. Toggle the switch
    const firstRow = page.locator(".ant-table-row").first();
    const switchBtn = firstRow.locator("button.ant-switch");
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/admin/home/practice-section") && response.status() === 200
    );
    await switchBtn.click();
    await responsePromise;
    console.log("Toggled switch.");

    // Wait for animation / toast
    await page.waitForTimeout(2000);

    // Screenshot 2: Immediately after toggle (where Fast Refresh might trigger)
    const path2 = path.resolve(process.cwd(), "artifacts/check-2-after-toggle.png");
    await page.screenshot({ path: path2 });
    console.log("Saved after-toggle screenshot to:", path2);

    // 4. Force a hard reload of the page
    console.log("Refreshing the page...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector(".ant-table-row");

    // Screenshot 3: After clean reload
    const path3 = path.resolve(process.cwd(), "artifacts/check-3-after-reload.png");
    await page.screenshot({ path: path3 });
    console.log("Saved after-reload screenshot to:", path3);
  });
});
