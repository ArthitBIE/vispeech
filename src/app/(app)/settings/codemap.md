# src/app/(app)/settings/

## Responsibility

Client-side user preferences page: configure and test microphone input for speech practice. Owns the microphone enable/disable toggle, audio input device selection, and input sensitivity calibration. Settings are persisted to browser localStorage (`vispeech.settings` key) — no server/DB involvement.

## Design

- **Client Component** (`"use client"`): pure browser API usage (localStorage, `navigator.mediaDevices`, Web Audio API); no data fetching, no Supabase.
- **Local-state settings model**: single `Settings` interface (`micEnabled`, `deviceId`, `sensitivity`) held in one `useState`, updated via a `update(patch)` partial-merge helper (functional setState).
- **Lazy initialization + resilient hydration**: `useState(loadSettings)` reads localStorage once; `loadSettings` guards `typeof window === "undefined"`, falls back to defaults `{micEnabled: true, deviceId: "", sensitivity: 60}` on missing/corrupt storage.
- **Persistence side-effect**: `useEffect([settings])` writes JSON back to localStorage; writes wrapped in try/catch for unavailable storage.
- **Resource lifecycle management**: device enumeration and mic test streams cleaned up via effect cleanup (`cancelled` flag) and `stopTest` callback; `useEffect(() => stopTest, [stopTest])` guarantees stream/RAF teardown on unmount. Streams and `requestAnimationFrame` handles held in refs (`streamRef`, `rafRef`).
- **Controlled UI components**: shadcn/ui primitives (`Switch`, `Slider`, `Select`, `Card`, `Button`) bound to the settings state.
- **Level meter via Web Audio**: `AnalyserNode.getByteTimeDomainData` → RMS computation → normalized 0-100 level, driven by `requestAnimationFrame` loop.

## Flow

1. **Mount**: `loadSettings()` hydrates `settings` state from `localStorage["vispeech.settings"]` (defaults if absent). `useEffect` (empty deps) requests mic permission via `getUserMedia({audio: true})` so `enumerateDevices()` returns device labels, then populates `devices` with `audioinput` entries; on permission denial falls back to label-less list.
2. **User edits**: `Switch` → `update({micEnabled})`, `Slider` → `update({sensitivity})`, `Select` → `update({deviceId})`. Each `update` merges patch into `settings`; the persistence effect serializes the new state to localStorage on every change.
3. **Mic test (startTest)**: `getUserMedia` with `deviceId: {exact: settings.deviceId}` (if set) and `echoCancellation: false` → stream stored in `streamRef`, `testing=true`. `AudioContext` + `MediaStreamAudioSourceNode` → `AnalyserNode(fftSize=256)`; RAF `tick()` reads time-domain data, computes RMS, sets `level = min(100, rms*400)`. Button toggles to "Stop Test", calling `stopTest` which cancels RAF, stops stream tracks, resets `testing`/`level`. `getUserMedia` failure resets `testing`/`level` silently.
4. **Unmount**: cleanup cancels enumeration (`cancelled=true`) and invokes `stopTest`.

## Integration

- **Consumed by**: nothing yet — settings are only persisted to `localStorage["vispeech.settings"]`; no other module currently reads them (future consumption expected in practice session pages).
- **Depends on**: shadcn/ui components (`@/components/ui/button|c|switch|slider|select`), `lucide-react` `Mic` icon, browser APIs (localStorage, `navigator.mediaDevices`, Web Audio API). No server routes, Supabase, or TTS integration.
