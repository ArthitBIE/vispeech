---
phase: 1
plan: 4
type: feature
wave: 4
depends_on: [2, 3]
files_modified:
  - src/app/dashboard/page.tsx
  - src/app/globals.css
autonomous: true
requirements: [DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, AUTH-03, UI-01, UI-02, UI-03, UI-04, UI-05]
---

<objective>
Build the dashboard page showing word list, per-word accuracy table, practice history, and user progress summary — all in Thai with friendly empty states.
</objective>

<tasks>
<task>
<type>create</type>
<action>Create dashboard page — server component shell</action>
<files>src/app/dashboard/page.tsx</files>
<read_first>src/lib/supabase/client.ts, src/app/auth/page.tsx</read_first>
<details>
Create src/app/dashboard/page.tsx as a client component.

Structure:
1. Top bar with app name "vispeech" and logout button ("ออกจากระบบ")
2. Thai explanation text from the spec:
   "ระบบนี้ช่วยให้ผู้ใช้เห็นคะแนนความแม่นยำของแต่ละคำ และติดตามพัฒนาการย้อนหลังได้"
3. Progress summary cards (3 cards in a row):
   - "คำที่ฝึกแล้ว" (Total practiced words) — count
   - "คะแนนเฉลี่ย" (Average score) — percentage
   - "จำนวนครั้งที่ฝึก" (Total attempts) — count
4. Per-word accuracy table section header: "ความแม่นยำแยกตามคำ"
5. Practice history section header: "ประวัติการฝึก"
6. Footer note in Thai:
   "สำหรับวรรณยุกต์ ระบบให้ความสำคัญกับเสียงพูด ส่วนพยัญชนะและรูปปากใช้การวิเคราะห์ภาพเป็นหลัก"
</details>
<verify>Page renders with Thai section headers</verify>
<acceptance_criteria>Dashboard shell rendered with Thai UI sections</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Add Supabase data fetching to dashboard</action>
<files>src/app/dashboard/page.tsx</files>
<read_first>src/app/dashboard/page.tsx, src/lib/supabase/client.ts</read_first>
<details>
In the dashboard component, add data fetching on mount (useEffect):

1. Fetch session: supabase.auth.getSession()
2. If no session → redirect to /auth
3. Fetch words list: supabase.from('words').select('*').order('difficulty')
4. Fetch word_accuracy for current user: supabase.from('word_accuracy').select('*').eq('user_id', userId)
5. Fetch practice_logs for current user: supabase.from('practice_logs').select('*, words(*)').eq('user_id', userId).order('created_at', { ascending: false })

Store in state, handle loading states.
</details>
<verify>Data fetches execute against Supabase</verify>
<acceptance_criteria>Dashboard fetches words, accuracy, and practice history from Supabase</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Render word accuracy table with practice buttons</action>
<files>src/app/dashboard/page.tsx</files>
<read_first>src/app/dashboard/page.tsx</read_first>
<details>
Add a table below the "ความแม่นยำแยกตามคำ" header:

Columns: คำ (word), กลุ่มรูปปาก (viseme group), คะแนนดีที่สุด (best score), คะแนนเฉลี่ย (average score), จำนวนครั้ง (attempts), ฝึกล่าสุด (last practiced), ฝึก (practice button)

For each word in the words list:
- Look up accuracy data from word_accuracy state
- If no practice data: show "-" for scores, show "-" for last practiced date
- Practice button links to /practice/{word}
- Each row is a clickable table row

Style as a clean Tailwind table, responsive for laptop.
</details>
<verify>Table renders with all columns and practice buttons</verify>
<acceptance_criteria>Word accuracy table renders with data or empty state</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Render practice history section</action>
<files>src/app/dashboard/page.tsx</files>
<read_first>src/app/dashboard/page.tsx</read_first>
<details>
Below the "ประวัติการฝึก" header:

List of practice log entries, newest first:
- Date/time in Thai format
- Word (with link to practice page)
- Visual score (คะแนนภาพ)
- Audio score (คะแนนเสียง)
- Total score (รวม)

If no practice logs exist, show Thai empty state:
"ยังไม่มีประวัติการฝึก เริ่มฝึกคำแรกของคุณเลย!"
</details>
<verify>History section renders with data or empty state</verify>
<acceptance_criteria>Practice history section with empty state renders</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Render progress summary cards</action>
<files>src/app/dashboard/page.tsx</files>
<read_first>src/app/dashboard/page.tsx</read_first>
<details>
Three cards at the top:
- "คำที่ฝึกแล้ว": count of distinct word_ids in word_accuracy
- "คะแนนเฉลี่ย": average of all best_scores across all words
- "จำนวนครั้งที่ฝึก": sum of all total_attempts

If no data: show "0" for counts, "-" for average score.
Style as Tailwind cards with icons (emoji or simple text).
</details>
<verify>Summary cards render with computed values</verify>
<acceptance_criteria>Progress summary with computed values renders correctly</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Add logout functionality</action>
<files>src/app/dashboard/page.tsx</files>
<read_first>src/app/dashboard/page.tsx</read_first>
<details>
Top right of the header bar: a logout button labeled "ออกจากระบบ"

On click:
1. Call supabase.auth.signOut()
2. Redirect to /auth
3. Handle any errors gracefully
</details>
<verify>Logout button signs out and redirects</verify>
<acceptance_criteria>Logout works and redirects to /auth</acceptance_criteria>
</task>
</tasks>

<verification>
- Dashboard renders with all Thai labels
- Word table loads from Supabase
- Accuracy data displays correctly (or shows "-" for unpracticed words)
- Practice history renders (or shows Thai empty state)
- Progress summary computes correct values
- Practice buttons link to correct /practice/{word} URL
- Logout works
</verification>

<success_criteria>
- Dashboard with progress summary, word accuracy table, practice history
- Thai UI throughout
- Empty states for users with no data
- Working logout
- Responsive layout for laptop demo
</success_criteria>
