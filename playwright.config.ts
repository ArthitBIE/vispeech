import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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
      testMatch: [
        "auth.spec.ts",
        "auth-signin.spec.ts",
        "oauth-redirect.spec.ts",
      ],
      dependencies: [],
    },
    {
      name: "authenticated",
      testMatch: [
        "dashboard.spec.ts",
        "practice.spec.ts",
        "navigation.spec.ts",
        "dashboard-progress.spec.ts",
        "dashboard-sidebar-race.spec.ts",
        "practice-session.spec.ts",
        "summary.spec.ts",
        "settings.spec.ts",
      ],
      dependencies: ["setup"],
      use: {
        storageState: "e2e/.auth/user.json",
      },
    },
    {
      // Capture-device lifecycle tests need a synthetic mic/camera so
      // getUserMedia resolves headlessly. These flags are scoped to this
      // project on purpose: a fake camera feeds a synthetic pattern with no
      // face in it, which would break the face-mesh assertions in the main
      // practice specs.
      name: "media",
      testMatch: [
        "settings-mic-lifecycle.spec.ts",
        "practice-mic-lifecycle.spec.ts",
      ],
      dependencies: ["setup"],
      use: {
        storageState: "e2e/.auth/user.json",
        launchOptions: {
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
          ],
        },
      },
    },
    {
      // Runs last: signOut() revokes the server session, so this project must
      // not run in parallel with tests that need the shared session.
      name: "logout",
      testMatch: ["logout.spec.ts"],
      dependencies: ["setup", "authenticated", "media"],
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
