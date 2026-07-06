---
phase: 1
plan: 5
type: feature
wave: 6
depends_on: [2, 3, 4, 6]
files_modified:
  - src/app/practice/[word]/page.tsx
autonomous: true
requirements: [PRAC-01, PRAC-02, PRAC-03, PRAC-04, PRAC-05, PRAC-06, PRAC-07, UI-01, UI-02]
---

<objective>
Build the practice page where users practice a Thai word with camera and microphone, receive scores, and save results. Integrate MediaPipe Face Mesh and Web Speech API through their abstraction layers.
</objective>

<tasks>
<task>
<type>create</type>
<action>Create practice page directory and page component</action>
<files>src/app/practice/[word]/page.tsx</files>
<read_first>src/lib/supabase/client.ts, src/lib/mediapipe/index.ts, src/lib/viseme/index.ts</read_first>
<details>
Create src/app/practice/[word]/page.tsx as a client component.

The page layout:
1. Header with "← กลับไปหน้าแดชบอร์ด" (Back to dashboard) link
2. Word display: show the Thai word prominently (large text, centered)
3. Viseme group badge: show "กลุ่มรูปปาก: {viseme_group}" below the word
4. Practice goal explanation (in Thai): 
   "ลองออกเสียงคำนี้ แล้วระบบจะวิเคราะห์รูปปากและเสียงพูดของคุณ"
5. Camera preview area (placeholder div, connected to MediaPipe abstraction)
6. Speech recognition area (button + status, connected to Web Speech abstraction)
7. Button row: "เริ่มกล้อง" (Start camera), "เริ่มพูด" (Start speaking), "ส่งผล" (Submit), "ลองอีกครั้ง" (Try again)
8. Results area (hidden until submit): shows scores with Thai labels

Data loading on mount:
- Fetch word from Supabase: supabase.from('words').select('*').eq('word', params.word).single()
- If word not found: show "ไม่พบคำนี้" (Word not found)
- Get session to identify current user
</details>
<verify>Practice page renders with word, viseme group, and all buttons</verify>
<acceptance_criteria>Practice page loads word from Supabase and displays Thai UI</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Implement camera button and MediaPipe integration</action>
<files>src/app/practice/[word]/page.tsx</files>
<read_first>src/lib/mediapipe/index.ts</read_first>
<details>
Add the camera section:

1. "เริ่มกล้อง" button: calls initFaceMesh from the mediapipe abstraction
2. Video preview area: <video> element with ref, shown when camera is active
3. Canvas overlay for face mesh drawing (connected via MediaPipe results callback)
4. Status text: shows if camera is on or off, in Thai
5. "หยุดกล้อง" (Stop camera) button to turn off

Use the abstraction layer from Wave 6 — it handles success and fallback cases.
If MediaPipe fails: show a Thai demo notice and proceed with simulated scores.
</details>
<verify>Camera button activates preview area (or shows fallback)</verify>
<acceptance_criteria>Camera integration with fallback works</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Implement speech recognition button</action>
<files>src/app/practice/[word]/page.tsx</files>
<read_first>src/lib/viseme/index.ts</read_first>
<details>
Add the speech section:

1. "เริ่มพูด" button: calls startSpeechRecognition from the viseme abstraction
2. Status display: "กำลังฟัง..." (Listening...), "บันทึกแล้ว" (Recorded), or error
3. Show the transcript (what speech was recognized)
4. If Web Speech API unavailable: show Thai message
   "เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียงพูด สามารถกดส่งผลเพื่อทดสอบคะแนนได้"
   and auto-generate a random transcript for demo purposes.
</details>
<verify>Speech button triggers recognition (or shows fallback)</verify>
<acceptance_criteria>Speech recognition with fallback works</acceptance_criteria>
</task>

<task>
<type>edit</type>
<action>Implement submit and results display</action>
<files>src/app/practice/[word]/page.tsx</files>
<read_first>src/app/practice/[word]/page.tsx</read_first>
<details>
Add submit logic:

"ส่งผล" button:
1. Collect: word_id, target_word (the current word), transcript, visual_features (from MediaPipe or placeholder)
2. Send to POST /api/score
3. Receive: { visual_score, audio_score, total_score, feedback_th }
4. Display results section:

Results section (Thai labels):
- "คะแนนภาพ: {visual_score}/100" (Visual score)
- "คะแนนเสียง: {audio_score}/100" (Audio score)
- "คะแนนรวม: {total_score}/100" (Total score)
- Feedback in Thai: feedback_th string
- "ลองอีกครั้ง" (Try again) button to reset

On submit, also save to Supabase:
- INSERT into practice_logs
- UPSERT word_accuracy (update best_score, average_score, total_attempts, last_practiced_at)
- Handle errors gracefully (show Thai message if save fails)
</details>
<verify>Submit sends to /api/score and displays results</verify>
<acceptance_criteria>Submit flow works end-to-end: scores computed, displayed, saved</acceptance_criteria>
</task>
</tasks>

<verification>
- Practice page loads word correctly by URL slug
- Camera button activates preview (or shows fallback)
- Speech button activates recognition (or shows fallback)
- Submit sends to /api/score and displays results with Thai labels
- Results include visual, audio, and total scores
- Scores are saved to practice_logs and word_accuracy
- "Back to dashboard" link works
- "Try again" resets the practice state
- All text rendered in Thai
</verification>

<success_criteria>
- Practice page with word display, viseme group, and Thai instructions
- Camera integration with MediaPipe or fallback
- Speech recognition via Web Speech API or fallback
- Submit → score → display → save flow works end-to-end
- All UI text in Thai
</success_criteria>
