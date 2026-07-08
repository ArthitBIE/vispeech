import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    {
      name: "setup",
      testMatch: "global.setup.ts",
    },
    {
      name: "unauthenticated",
      testMatch: "auth.spec.ts",
      dependencies: [],
    },
    {
      name: "authenticated",
      testMatch: ["dashboard.spec.ts", "practice.spec.ts"],
      dependencies: ["setup"],
      use: {
        storageState: "e2e/.auth/user.json",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
