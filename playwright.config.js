// Browser tests. Setup once:  npm i -D @playwright/test @axe-core/playwright  &&  npx playwright install chromium
// Run:  npm run test:e2e   (starts the dev server automatically)
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 40000,
  retries: 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120000 },
  projects: [
    { name: "phone-320", use: { viewport: { width: 320, height: 640 }, hasTouch: true } },
    { name: "tablet-768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "wide-2000", use: { viewport: { width: 2000, height: 1100 } } },
  ],
});
