import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45000,
  workers: 1,
  use: {
    channel: "chrome",
    baseURL: "http://127.0.0.1:8176",
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ["--use-angle=swiftshader"] },
  },
  webServer: {
    command: "python3 -m http.server 8176 --bind 127.0.0.1",
    url: "http://127.0.0.1:8176",
    reuseExistingServer: false,
  },
  reporter: "list",
});
