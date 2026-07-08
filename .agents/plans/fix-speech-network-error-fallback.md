# Fix Plan: Speech Recognition Network Error Fallback

## Root Cause

When the Web Speech API's `SpeechRecognition` returns a `network` error (browser cannot connect to the cloud speech service), the current code in `src/lib/viseme/index.ts` only shows an error message via the `onError` callback. It does **not** automatically switch to the fallback/demo recognizer (`createFallbackRecognizer`). The fallback is only used when `SpeechRecognition` is completely unavailable in the browser (line 21-24).

## Proposed Fix

Modify `createSpeechRecognizer` to automatically fall back to the demo recognizer when a `network` error (or other recoverable errors) occurs, instead of just reporting the error to the UI.

### Changes to `src/lib/viseme/index.ts`:

1. **Track fallback state**: Add a flag to track if we've fallen back to demo mode
2. **On `network` error (and similar recoverable errors)**: Stop the real recognizer, create the fallback recognizer, and seamlessly continue
3. **Expose `isAvailable()` correctly**: Return `false` when in fallback mode so UI can show appropriate messaging
4. **Preserve callback subscriptions**: Transfer `onResult` and `onError` callbacks to the fallback recognizer

### Error codes that should trigger fallback:
- `network` - Cannot connect to speech service
- `service-not-allowed` - Service blocked/unavailable
- `language-not-supported` - Thai not supported (though this is less recoverable)

## Files to Modify

- `src/lib/viseme/index.ts` — Core fix in `createSpeechRecognizer` function

## Verification

After applying the fix:

1. Open practice page in Chrome
2. Disconnect internet (or block speech recognition service)
3. Press "เริ่มพูด" (Start speaking)
4. Should see "กำลังฟัง..." (Listening...) and demo mode activates silently
5. No Thai error message "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เสียง..." should appear
6. Transcript should show demo transcript after stopping
7. Reconnect internet → next session should use real recognition again

## Not Changing

- UI components (`src/app/practice/[word]/page.tsx`)
- Fallback recognizer logic (`createFallbackRecognizer`) — stays as-is
- Other error messages (e.g., `not-allowed`, `no-speech`, `audio-capture`) — these are user-actionable and should still show to user
- MediaPipe/camera functionality
- Supabase/auth integration