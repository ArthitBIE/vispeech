---
phase: 1
plan: 1
type: foundation
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - next.config.ts
  - tailwind.config.ts
  - postcss.config.mjs
  - src/app/layout.tsx
  - src/app/globals.css
  - .env.local.example
autonomous: true
requirements: [UI-01, UI-02, UI-03]
---

<objective>
Initialize the Next.js App Router + TypeScript project with all necessary dependencies for the vispeech MVP. Create the Thai-language layout and set up the project foundation.
</objective>

<tasks>
<task>
<type>init</type>
<action>Initialize Next.js project with TypeScript, App Router, and Tailwind</action>
<files>package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, src/app/globals.css, src/app/layout.tsx, src/app/page.tsx</files>
<read_first>none</read_first>
<details>
Run: npx create-next-app@latest . --typescript --app --src-dir --use-npm --tailwind --eslint --import-alias "@/*" --no-git

Accept all defaults. This creates the base Next.js 14+ project with:
- TypeScript
- App Router under src/app/
- Tailwind CSS
- ESLint configuration
- src/ directory structure
- @/ import alias
</details>
<verify>npm run dev starts without errors; page renders at localhost</verify>
<acceptance_criteria>Next.js dev server starts and serves a page</acceptance_criteria>
</task>

<task>
<type>deps</type>
<action>Install core dependencies</action>
<files>package.json</files>
<read_first>package.json</read_first>
<details>
npm install @supabase/supabase-js
npm install -D supabase @types/node

These provide:
- @supabase/supabase-js: Supabase client for auth and database
- supabase CLI: for running migrations
- @types/node: TypeScript types for Node.js
</details>
<verify>ls node_modules/@supabase/supabase-js/package.json</verify>
<acceptance_criteria>Supabase JS client and CLI installed</acceptance_criteria>
</task>

<task>
<type>deps</type>
<action>Install MediaPipe Face Mesh dependencies</action>
<files>package.json</files>
<read_first>package.json</read_first>
<details>
npm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils

These provide browser-based facial landmark detection:
- @mediapipe/face_mesh: 468-point face mesh model
- @mediapipe/camera_utils: WebCamera utility
- @mediapipe/drawing_utils: Drawing utilities for face mesh overlay
</details>
<verify>ls node_modules/@mediapipe/face_mesh/package.json</verify>
<acceptance_criteria>MediaPipe Face Mesh libraries installed</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create environment variable template and .gitignore entries</action>
<files>.env.local.example, .env.local, .gitignore</files>
<read_first>.gitignore</read_first>
<details>
Create .env.local.example:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Create .env.local (placeholder — user fills with actual values):
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key

Ensure .gitignore includes:
.env.local
.next
node_modules
</details>
<verify>Both .env files exist with correct variable names</verify>
<acceptance_criteria>Environment variable template created; .env.local gitignored</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Configure root layout with Thai language and metadata</action>
<files>src/app/layout.tsx</files>
<read_first>src/app/layout.tsx</read_first>
<details>
Update the root layout:
- Set html lang="th"
- Add Thai title: vispeech
- Add Thai description: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด"
- Keep minimal Tailwind-based styling
</details>
<verify>Layout renders with lang="th"</verify>
<acceptance_criteria>Root layout configured for Thai language</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Clear default boilerplate and set up redirect page</action>
<files>src/app/page.tsx</files>
<read_first>src/app/page.tsx</read_first>
<details>
Replace the default Next.js welcome page with a simple page that:
- Is a client component ("use client")
- Checks Supabase session on mount
- If authenticated → redirects to /dashboard
- If not authenticated → redirects to /auth
- Shows a brief loading state while checking
</details>
<verify>Page renders without Next.js boilerplate</verify>
<acceptance_criteria>Root page redirects based on auth state</acceptance_criteria>
</task>
</tasks>

<verification>
- npm run dev starts without errors
- Root page renders at localhost:3000 (redirects will 404 until auth/dashboard pages exist)
- Thai lang attribute on html element
- Text "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด" appears in meta description
</verification>

<success_criteria>
- Next.js project initialized with TypeScript + App Router + Tailwind
- All dependencies installed
- Root layout with Thai configuration
- Environment variable template created
- Development server starts without errors
</success_criteria>
