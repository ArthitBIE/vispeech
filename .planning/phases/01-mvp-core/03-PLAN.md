---
phase: 1
plan: 3
type: feature
wave: 3
depends_on: [1, 2]
files_modified:
  - src/app/auth/page.tsx
  - src/middleware.ts
  - src/app/page.tsx
autonomous: true
requirements: [AUTH-01, AUTH-02, AUTH-04]
---

<objective>
Implement Supabase email/password authentication with Thai UI, route protection middleware, and root redirect logic. Users can sign up, log in, and log out — all in Thai.
</objective>

<tasks>
<task>
<type>create</type>
<action>Create auth page with login/signup in Thai</action>
<files>src/app/auth/page.tsx</files>
<read_first>src/lib/supabase/client.ts</read_first>
<details>
Create a client component at /auth with the following features:

- Header: "เข้าสู่ระบบ" (Login) / "สมัครสมาชิก" (Sign Up) — togglable
- Email input with Thai label "อีเมล"
- Password input with Thai label "รหัสผ่าน"
- Login button: "เข้าสู่ระบบ"
- Sign Up button: "สมัครสมาชิก"
- Toggle link: "ยังไม่มีบัญชี? สมัครสมาชิก" / "มีบัญชีแล้ว? เข้าสู่ระบบ"
- Error display in Thai (e.g., "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
- On success: redirect to /dashboard using router.push
- Use Tailwind for centered card layout
- Responsive for laptop demo

Supabase calls:
- Login: supabase.auth.signInWithPassword({ email, password })
- Signup: supabase.auth.signUp({ email, password })
- Session check: supabase.auth.getSession()
</details>
<verify>Page renders with Thai UI; login/signup toggle works</verify>
<acceptance_criteria>Auth page with Thai UI, login/signup modes, Supabase integration</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create middleware for route protection</action>
<files>src/middleware.ts</files>
<read_first>src/lib/supabase/server.ts, src/app/auth/page.tsx</read_first>
<details>
Create middleware.ts at the project root:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware for MVP
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow auth, API, static files, and _next
  if (
    pathname === '/' ||
    pathname === '/auth' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // For protected routes, the client component handles redirect
  // (full middleware session check requires cookie handling via @supabase/ssr)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

Note: For MVP, the actual auth gate is handled client-side. The middleware provides a basic matcher. Full server-side session checking via @supabase/ssr can be added post-MVP.
</details>
<verify>Middleware matcher configured correctly</verify>
<acceptance_criteria>Route protection middleware created with proper matcher</acceptance_criteria>
</task>
</tasks>

<verification>
- Auth page renders with Thai labels and buttons
- Login and signup both connect to Supabase Auth
- Successful auth redirects to /dashboard
- Auth page is accessible without authentication
- Middleware allows /auth and /api routes
</verification>

<success_criteria>
- Auth page with email/password login and signup in Thai
- Route protection middleware with correct matcher
- Successful auth redirects to /dashboard
</success_criteria>
