# Features Research: vispeech

## Table Stakes (Must Have)

- User authentication (email/password)
- Word list with categories/groups
- Pronunciation practice with visual feedback
- Score tracking per word
- Practice history

## Differentiators

- Viseme-based word grouping (mouth shape categories)
- Camera-based facial landmark detection for mouth movement analysis
- Thai-specific speech recognition
- Combined visual + audio scoring
- Thai-only interface (language accessibility focus)

## Anti-Features (Intentionally NOT Building)

- Teacher dashboards (not MVP)
- Multi-language support (Thai focus)
- Complex gamification (simple progress tracking)
- Social features / leaderboards

## MVP Scope

For the Walking Skeleton MVP, ship:
1. Auth with Supabase email/password
2. Word list with 30 Thai words in 7 viseme groups
3. Practice page with camera + mic (with fallbacks)
4. Heuristic scoring (placeholder visual scores, basic transcript matching for audio)
5. Dashboard with accuracy table and history
6. Thai-language UI throughout
