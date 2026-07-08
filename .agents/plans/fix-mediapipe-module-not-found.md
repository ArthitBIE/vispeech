# Fix Plan: MediaPipe Module Not Found

## Root Cause

`@mediapipe/face_mesh` and `@mediapipe/camera_utils` are **not listed in `package.json`** and therefore not installed in `node_modules`. The `src/lib/mediapipe/index.ts` imports them via dynamic `import()` expressions. Even though these are client-side-only dynamic imports inside a browser-API function, Next.js/webpack still tries to resolve them at build time for code-splitting chunk generation. Because the packages aren't in `node_modules`, webpack throws "Cannot find module" and the import falls through to the demo-mode fallback.

## Proposed Fix

1. **Install the two missing MediaPipe npm packages.** The JS API wrappers from npm are needed only for the import to resolve at build time. The actual WASM/model files are already fetched from CDN via the existing `locateFile` callback.

2. **Add a `serverExternal` config to `next.config.ts`.** The MediaPipe packages use browser-only APIs (WebGL, WebAssembly, DOM canvas). Next.js must be told not to try to bundle them into the server bundle — mark them as external on the server side so they're never evaluated there.

## Files / Commands

### Install command:
```bash
npm install @mediapipe/face_mesh @mediapipe/camera_utils
```

### Edit `next.config.ts`:
Change from the current bare config to:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mediapipe/face_mesh",
    "@mediapipe/camera_utils",
  ],
};

export default nextConfig;
```

### No changes to:
- `src/lib/mediapipe/index.ts` — the import/fallback structure is correct
- Any other file

## Verification

After applying the fix, restart the dev server and check in the browser:

- [ ] No "Cannot find module '@mediapipe/face_mesh'" in the browser console
- [ ] No "MediaPipe failed to load, using demo mode" warning
- [ ] Camera stream is visible (browser asks for camera permission)
- [ ] `mouthOpen` value changes realistically (steady values tied to actual mouth movement, not the random 20–80 demo range)
- [ ] Page still renders without errors in a fresh incognito tab (no leftover state)

## Not Changing

- Camera UI component
- Speech recognition
- Fallback/demo mode code (it stays as a graceful degradation if CDN/model download fails)
- Any other file beyond the two listed above
