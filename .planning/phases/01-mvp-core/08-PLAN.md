---
phase: 1
plan: 8
type: polish
wave: 8
depends_on: [1, 2, 3, 4, 5, 6, 7]
files_modified:
  - src/app/layout.tsx
  - .env.local.example
  - README.md (new)
autonomous: true
requirements: [UI-01, UI-02]
---

<objective>
Verify that all plans integrate correctly, fix any TypeScript/build errors, add Thai meta tags, and produce a setup guide (README.md). Ensure `npm run build` passes (allowing for missing Supabase env vars).
</objective>

<tasks>
<task>
<type>verify</type>
<action>Fix TypeScript and build errors</action>
<files>All source files</files>
<read_first>All plan files</read_first>
<details>
Run: npx tsc --noEmit

Fix any TypeScript errors:
- Missing type annotations
- Incorrect imports
- Missing module declarations for MediaPipe (declare module 'mediainput types)
- Unused variables
- Ensure all functions have return types

Key areas to check:
- supabase client usage (type assertions where needed)
- mediapipe index.ts imports (declare module for @mediapipe/*)
- viseme index.ts (window.SpeechRecognition types)
- Practice page props type for params.word
- API route types for NextRequest/NextResponse

Create src/types/mediapipe.d.ts if needed for module declarations:
```typescript
declare module '@mediapipe/face_mesh' {
  export class FaceMesh {
    constructor(config: { locateFile: (file: string) => string })
    setOptions(options: Record<string, any>): void
    onResults(callback: (results: any) => void): void
    send(inputs: { image: HTMLVideoElement }): Promise<void>
    close(): void
  }
  export const FACEMESH_TESSELATION: any[]
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, config: { onFrame: () => Promise<void> })
    start(): Promise<void>
    stop(): void
  }
}

declare module '@mediapipe/drawing_utils' {
  export function drawConnectors(ctx: CanvasRenderingContext2D, landmarks: any[], connections: any[], config?: any): void
}
```

Then run: npm run build
If build fails due to missing env vars, verify that all Supabase calls are guarded.

For the build to pass without env vars:
- The Supabase client should have a fallback/guard
- API routes should check env var presence before calling Supabase
</details>
<verify>npx tsc --noEmit passes; npm run build passes</verify>
<acceptance_criteria>TypeScript compiles and production build succeeds</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Add comprehensive Thai meta tags</action>
<files>src/app/layout.tsx</files>
<read_first>src/app/layout.tsx</read_first>
<details>
Update the root layout metadata:

```typescript
export const metadata = {
  title: 'vispeech - ฝึกออกเสียงภาษาไทย',
  description: 'ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4F46E5',
  openGraph: {
    title: 'vispeech - ฝึกออกเสียงภาษาไทย',
    description: 'ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด',
    locale: 'th_TH',
  },
}
```

Set html lang="th" on the root html element.
</details>
<verify>Meta tags render with Thai content and lang="th"</verify>
<acceptance_criteria>Thai metadata configured in root layout</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create README.md with setup instructions</action>
<files>README.md</files>
<read_first>none</read_first>
<details>
Create a Thai and English README.md:

```markdown
# vispeech — ฝึกออกเสียงภาษาไทย

Thai speech training web app for hearing-impaired individuals.
Built with Next.js + TypeScript + Supabase + MediaPipe Face Mesh.

## Requirements

- Node.js 18+
- npm
- Supabase project (free tier)

## Setup

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database

Run migrations in your Supabase SQL editor:
1. `supabase/migrations/001_schema.sql` — creates tables and RLS policies
2. `supabase/seed.sql` — inserts 30 Thai practice words

### Run

```bash
npm run dev
```

Open http://localhost:3000

## Tech Stack

- Next.js App Router (TypeScript)
- Supabase (Auth + PostgreSQL with RLS)
- MediaPipe Face Mesh (browser-based facial landmark detection)
- Web Speech API (browser speech recognition, th-TH)
- Tailwind CSS

## Notes

- **Scoring is heuristic/demo only** — not clinically validated
- **Thai language only** — UI and speech recognition target Thai
- **Browser support**: Chrome recommended for best speech recognition support
- **Camera fallback**: If MediaPipe is unavailable, the app runs in demo mode

## Project Structure

```
src/
├── app/
│   ├── auth/page.tsx          # Login/signup (Thai)
│   ├── dashboard/page.tsx     # Word list + accuracy + history
│   ├── practice/[word]/       # Practice page
│   └── api/score/route.ts     # Scoring API
├── lib/
│   ├── supabase/              # Supabase client utilities
│   ├── mediapipe/             # Face Mesh abstraction + fallback
│   └── viseme/                # Speech recognition abstraction + fallback
├── middleware.ts              # Route protection
```

## License

Private — internal use
```
</details>
<verify>README.md renders properly</verify>
<acceptance_criteria>README.md created with setup instructions and project structure</acceptance_criteria>
</task>

<task>
<type>verify</type>
<action>Final end-to-end verification</action>
<files>All files</files>
<read_first>All PLAN.md files, all source files</read_first>
<details>
1. Verify all 8 waves produce correct files
2. Verify file count:
   - src/app/layout.tsx ✓
   - src/app/page.tsx ✓
   - src/app/auth/page.tsx ✓
   - src/app/dashboard/page.tsx ✓
   - src/app/practice/[word]/page.tsx ✓
   - src/app/api/score/route.ts ✓
   - src/lib/supabase/client.ts ✓
   - src/lib/supabase/server.ts ✓
   - src/lib/mediapipe/index.ts ✓
   - src/lib/viseme/index.ts ✓
   - src/middleware.ts ✓
   - supabase/migrations/001_schema.sql ✓
   - supabase/seed.sql ✓
3. Run: npm run build
4. Verify all Thai copy from requirements is present somewhere in the app
5. Confirm no teacher dashboard, no multi-language, no admin features
</details>
<verify>All checks pass</verify>
<acceptance_criteria>All Phase 1 deliverables verified end-to-end</acceptance_criteria>
</task>
</tasks>

<verification>
- npx tsc --noEmit passes
- npm run build passes (env var guards in place)
- All 13+ source files exist and have correct content
- Thai copy includes the 3 required phrases
- No out-of-scope features present
- README.md documents setup steps
</verification>

<success_criteria>
- Production build succeeds
- Thai meta tags configured
- All project files present
- Setup documented in README.md
- VERIFICATION.md confirms Phase 1 ready for execution
</success_criteria>
