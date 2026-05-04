# AI Implementation Report

Date: 2026-04-08
Project: skill-map-journey-main

## What has been completed

### 1) Dynamic AI roadmap generation (replaced mock)

- Replaced local mock roadmap generation with real AI generation.
- Onboarding now sends:
  - User goal
  - User onboarding answers (`level`, `hours`, `pace`, `outcome`)
- AI returns structured roadmap JSON, then app normalizes and stores:
  - sections
  - milestones
  - goals
  - dependencies
  - final milestone marker

Changed files:

- `src/pages/OnboardingPage.tsx`
- `src/lib/ai.ts` (new)

### 2) Dynamic AI exam generation (replaced mock)

- Replaced local mock exam generator with AI-generated fresh questions.
- Exam generation now uses:
  - milestone topic/title
  - milestone description
  - roadmap goal summary
  - user's own prior milestone questions from chat history
- Generates 10 MCQs with 4 options each and varying correct answer indexes.

Changed files:

- `src/pages/ExamPage.tsx`
- `src/lib/ai.ts` (new)

### 3) Dynamic AI mentor chat (replaced hardcoded responses)

- Replaced static template chat response with AI response.
- Mentor context now includes:
  - roadmap goal
  - milestone topic + description
  - milestone goals
  - recent chat history
  - latest user message

Changed files:

- `src/pages/MilestonePage.tsx`
- `src/lib/ai.ts` (new)

### 4) Security hardening completed (server-side AI)

- Moved AI provider calls off the browser and into Supabase Edge Function.
- Frontend now calls only a secure backend function (`ai-career-mentor`).
- Provider keys are expected in function secrets, not in client state.
- Added action-based backend orchestration for:
  - `roadmap`
  - `exam`
  - `mentor`
- Added provider routing support in function:
  - Gemini (`AI_PROVIDER=gemini`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`)
  - OpenAI (`AI_PROVIDER=openai`, `OPENAI_API_KEY`, optional `OPENAI_MODEL`)

Changed / new files:

- `supabase/functions/ai-career-mentor/index.ts` (new)
- `src/lib/ai.ts` (refactored to invoke Edge Function)

### 5) Settings UX updated for secure mode

- Removed misleading client API-key input flow from settings UI.
- Added clear “server-side AI mode” messaging.

Changed files:

- `src/pages/SettingsPage.tsx`

### 6) AI service module status

- Added centralized AI service abstraction in frontend.
- Frontend now uses Supabase function invocation.
- JSON response parsing + normalization still enforced client-side.
- Validation/normalization and error handling.

New file:

- `src/lib/ai.ts`

### 7) Validation status

- Type/script checks for edited files show no current editor-reported errors.

### 8) Supabase persistence schema added and applied

- Added and pushed a new migration for AI learning persistence tables.
- New tables created with RLS policies:
  - `roadmaps`
  - `sections`
  - `milestones`
  - `goals`
  - `chat_messages`
  - `exam_attempts`
  - `exam_questions`
  - `certificates`
- Added indexes and `updated_at` trigger for roadmaps.

Migration file:

- `supabase/migrations/20260408183000_ai_learning_data_schema.sql`

Applied status:

- Local and remote migration history are now in sync, including `20260408183000`.

### 9) Frontend persistence wiring completed

- App context now hydrates learning data from Supabase on startup for authenticated users.
- Roadmap creation now persists to DB (`roadmaps`, `sections`, `milestones`, `goals`).
- Goal completion now updates DB (`goals` and milestone status).
- Chat messages now persist to DB (`chat_messages`).
- Exam submissions now persist attempts + question snapshots (`exam_attempts`, `exam_questions`).
- Certificate issuance now persists to DB (`certificates`).

Changed files:

- `src/lib/AppContext.tsx`
- `src/pages/ExamPage.tsx`

### 10) Supabase types regenerated

- Regenerated Supabase types from linked project.
- New DB tables are now fully typed in app client types.

Changed file:

- `src/integrations/supabase/types.ts`

### 11) Local storage persistence disabled

- `loadState` / `saveState` / `resetState` localStorage behavior disabled.
- Runtime state is now DB-backed through AppContext sync/hydration.

Changed file:

- `src/lib/store.ts`

### 12) Frontend env secret cleanup

- Removed non-`VITE_` AI provider keys from frontend `.env`.
- Provider secrets remain in Supabase function secrets only.

Changed file:

- `.env`

---

## What is still needed / recommended next

### A) Deploy function + set secrets (required for production runtime)

- Deploy edge function: `ai-career-mentor`.
- Set secrets in Supabase project for your chosen provider.

Gemini option:

- `AI_PROVIDER=gemini`
- `GEMINI_API_KEY`
- optional `GEMINI_MODEL` (default: `gemini-2.5-flash`)

OpenAI option:

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY`
- optional `OPENAI_MODEL` (default: `gpt-4o-mini`)

- Verify function permissions/auth configuration per environment.

### B) Add stronger auth/rate limiting (recommended)

- Enforce authenticated-only access in function (if not already enforced by project policy).
- Add per-user/IP rate limiting and abuse controls.
- Add request logging/monitoring and alerting.

### C) Security key rotation (required after exposure)

- Rotate Gemini API key in Google AI Studio because the previous key was exposed.
- Update Supabase secret `GEMINI_API_KEY` with the new value.

### D) Persistence for AI-generated assessments

Completed.

Recommended:

- Add sync-status UI indicators (optional).
- Add background retry queue for failed writes (optional).

### D) Retry/fallback UX polish

- Add richer retry states and partial recovery.
- Add clearer user-facing error mapping for provider quota/model errors.

### E) Quality control for AI output

- Add stricter schema validation (e.g., Zod runtime validation).
- Add rules to ensure dependency graph sanity and milestone progression quality.

### F) Automated tests

- Add tests for:
  - roadmap JSON normalization
  - exam response validation
  - mentor response flow and failure handling

---

## Notes

- The old `src/lib/mockRoadmap.ts` still exists in repository but is no longer used by onboarding/exam runtime flow.
- App no longer requires a user API key in Settings for normal AI flow.
- AI generation now depends on deployed Supabase edge function + server secrets.
