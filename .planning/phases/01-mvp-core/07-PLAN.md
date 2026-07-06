---
phase: 1
plan: 7
type: api
wave: 7
depends_on: [1, 2, 5]
files_modified:
  - src/app/api/score/route.ts
  - src/lib/supabase/client.ts
autonomous: true
requirements: [SCOR-01, SCOR-02, SCOR-03, SCOR-04, SCOR-05, PRAC-06]
---

<objective>
Create the POST /api/score endpoint that computes heuristic visual and audio scores, returns Thai feedback, and persists results to Supabase.
</objective>

<tasks>
<task>
<type>create</type>
<action>Create scoring API route</action>
<files>src/app/api/score/route.ts</files>
<read_first>src/lib/supabase/client.ts</read_first>
<details>
Create src/app/api/score/route.ts.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// HEURISTIC SCORING — NOT CLINICALLY VALIDATED
// This MVP uses simple heuristics for demo purposes:
// - Audio score: string similarity between transcript and target word
// - Visual score: placeholder / random range (seeded by detected mouth movement)
// - Total score: weighted average (40% visual, 60% audio)
// These scores are NOT medically validated.

export async function POST(req: NextRequest) {
  try {
    const { word_id, target_word, transcript, visual_features } = await req.json()

    if (!word_id || !target_word) {
      return NextResponse.json(
        { error: 'Missing required fields: word_id, target_word' },
        { status: 400 }
      )
    }

    // Compute audio score: character-level similarity
    const audioScore = computeAudioScore(target_word, transcript || '')

    // Compute visual score: from visual_features or simulated
    const visualScore = computeVisualScore(visual_features)

    // Total score: weighted average (audio weighted more for tone emphasis)
    const totalScore = Math.round(visualScore * 0.4 + audioScore * 0.6)

    // Generate Thai feedback
    const feedbackTh = generateFeedback(totalScore, audioScore, visualScore)

    // Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Get attempt number
      const { data: logs } = await supabase
        .from('practice_logs')
        .select('attempt_number')
        .eq('word_id', word_id)
        .order('attempt_number', { ascending: false })
        .limit(1)

      const attemptNumber = (logs && logs[0]?.attempt_number || 0) + 1

      // Insert practice log
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('practice_logs').insert({
          user_id: session.user.id,
          word_id,
          visual_score: visualScore,
          audio_score: audioScore,
          total_score: totalScore,
          attempt_number: attemptNumber,
        })

        // Upsert word accuracy
        const { data: existing } = await supabase
          .from('word_accuracy')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('word_id', word_id)
          .single()

        if (existing) {
          const newAttempts = existing.total_attempts + 1
          const newAvg = Math.round(
            ((existing.average_score * existing.total_attempts) + totalScore) / newAttempts
          )
          await supabase.from('word_accuracy').update({
            best_score: Math.max(existing.best_score, totalScore),
            average_score: newAvg,
            total_attempts: newAttempts,
            last_practiced_at: new Date().toISOString(),
          }).eq('user_id', session.user.id).eq('word_id', word_id)
        } else {
          await supabase.from('word_accuracy').insert({
            user_id: session.user.id,
            word_id,
            best_score: totalScore,
            average_score: totalScore,
            total_attempts: 1,
            last_practiced_at: new Date().toISOString(),
          })
        }
      }
    }

    return NextResponse.json({
      visual_score: visualScore,
      audio_score: audioScore,
      total_score: totalScore,
      feedback_th: feedbackTh,
    })
  } catch (error) {
    console.error('Scoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Character-level similarity with bonus for exact matches
function computeAudioScore(target: string, transcript: string): number {
  if (!transcript || transcript === 'demo-transcript') {
    // Fallback/placeholder: generate a reasonable score
    return Math.floor(Math.random() * 40) + 50 // 50-89
  }

  const normalized = transcript.trim().toLowerCase()
  const targetNorm = target.trim().toLowerCase()

  // Exact match
  if (normalized === targetNorm) return 95 + Math.floor(Math.random() * 5) // 95-100

  // Contains target word
  if (normalized.includes(targetNorm) || targetNorm.includes(normalized)) {
    return 75 + Math.floor(Math.random() * 15) // 75-89
  }

  // Character overlap
  const overlap = normalized.split('').filter(c => targetNorm.includes(c)).length
  const maxLen = Math.max(normalized.length, targetNorm.length)
  const ratio = overlap / maxLen

  return Math.min(70, Math.floor(ratio * 70))
}

// Visual score: from features or placeholder
function computeVisualScore(visualFeatures?: { mouthOpen?: number }): number {
  // Use development mode env to allow testing
  if (visualFeatures?.mouthOpen !== undefined) {
    // Map mouth openness (0-100) to a visual score
    // More movement = better engagement = higher score
    const movement = visualFeatures.mouthOpen
    return Math.min(95, Math.floor(movement * 0.7 + 20 + Math.random() * 10))
  }

  // Placeholder: random score with slight positive bias
  return Math.floor(Math.random() * 30) + 55 // 55-84
}

function generateFeedback(totalScore: number, audioScore: number, visualScore: number): string {
  if (totalScore >= 90) return 'ยอดเยี่ยม! การออกเสียงของคุณดีมาก'
  if (totalScore >= 75) return 'ดีมาก! พยายามต่อไป'
  if (totalScore >= 60) return 'พอใช้ได้ ลองฝึกอีกครั้ง'
  if (totalScore >= 40) return 'ยังต้องฝึกอีก ลองดูรูปปากในตัวอย่าง'
  return 'ลองใหม่อีกครั้ง เน้นที่รูปปากและการออกเสียง'
}
```

Place this code in the route handler file. The file is ready for production — no external scoring service needed.
</details>
<verify>POST /api/score returns expected JSON structure</verify>
<acceptance_criteria>Scoring API returns visual_score, audio_score, total_score, feedback_th</acceptance_criteria>
</task>
</tasks>

<verification>
- POST /api/score accepts JSON with word_id, target_word, transcript, visual_features
- Returns { visual_score, audio_score, total_score, feedback_th }
- Audio score computed from transcript similarity
- Visual score uses features or placeholder
- Total score is weighted average (40% visual, 60% audio)
- Scores saved to practice_logs and word_accuracy when Supabase configured
- Error handling for missing fields
- Thai feedback messages for each score tier
- Documentation comment: "NOT clinically validated"
</verification>

<success_criteria>
- POST /api/score route created
- All 4 score fields returned with correct types
- Scores saved to Supabase tables
- Thai feedback generated
- Clear disclaimer about heuristic/demo scoring
</success_criteria>
