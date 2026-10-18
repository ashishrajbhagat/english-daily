# English Daily – English Speaking Practice (Next.js)

Stack: Node.js + npm + Next.js 14 (App Router) + React 18, with HTML/CSS/JS front-end logic.

## Run
    npm install
    npm run dev          # http://localhost:3000
    npm run build && npm start     # production

Requires Node.js 18.17 or newer. Mic / speech recognition: Chrome or Edge (HTTPS or localhost).

## Deploy
Vercel: `npx vercel` (or import the repo). Any Node host works with `npm run build` + `npm start`.

## Structure (see also lib/plan.js, lib/supabase.js, components/Plan.js, Auth.js)
- app/ – Next.js App Router (layout.js, page.js with tabs, globals.css, api/health/route.js)
- components/ – React components: Home, Practice, Learn (vocab, phrasal verbs, tips), Grammar, Quiz, Talk, Dictation, Revision (mistake notebook), Badges, AuthModal, Plan, Line, Seg
- lib/app.js – progress state (XP, streak, lessons) saved in localStorage; lib/speech.js – speech helpers
- lib/content.js – all content (phrases, dialogues, twisters, words, phrasal verbs, quiz, grammar, topics). Edit/extend here.
- public/ – sw.js (offline), manifest, icons

## Setup: cloud login (optional)
Copy `.env.example` to `.env.local` and fill it in. Without it the app works fully; progress is just saved on the device.

1. Create a free Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Enable Email auth (Authentication section).
3. In Settings > API Keys copy the Project URL and the publishable key (`sb_publishable_...`, or the legacy `anon` key) into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never use the secret / service_role key.
4. On Vercel, add the same two variables in Project Settings > Environment Variables.

## 30-day plan
`lib/plan.js` builds each day from the content arrays (5 phrases, 3 words + 1 phrasal verb, 1-2 grammar lessons, dialogue practice, free talk or a review quiz every 5th day). Change `DAYS` or the task list there.

## After the 30-day plan
When all 30 days are complete, the Plan tab shows a completion card. "Start Round 2" restarts the plan from Day 1 with a different mix of phrases, words, phrasal verbs, dialogues and talk topics (grammar becomes revision). XP, lessons, badges and the mistake notebook are kept. Add more content in `lib/content.js` (or add a 60-day plan in `lib/plan.js`) to make later rounds more varied.

## Levels and roadmaps (v3)
- Four levels: Beginner, Intermediate, Advanced, Expert. The user picks one (or takes a 12-question placement test) on first launch; it can be changed anytime. Level tags live in `lib/levels.js`.
- Three roadmaps in `lib/roadmaps.js`: Quick Start (15 days), Daily Habit (30 days) and Deep Fluency (60 days). Progress is stored per roadmap.
- Tabs: Home, Roadmap, Speak, Words, Grammar (separate course, 4 levels), Quiz (quiz + mistake notebook).
- Mobile-first CSS in `app/globals.css`; on desktop the footer, level, XP and streak live in the left sidebar.

## v4 additions
- Skills: Reading, Writing, Translate (Learn tab); Sounds (minimal pairs with IPA) and Numbers (Speak tab); Hindi note in every grammar lesson.
- Account and settings: forgot/reset password, delete account (needs `SUPABASE_SERVICE_ROLE_KEY` on the server), reset progress, daily reminder (works while the app is open), optional leaderboard (run the new SQL in `supabase/schema.sql`).
- Streak freeze (every 7-day streak earns one, max 2), certificate download after a roadmap, Privacy and Terms pages (templates: edit before launch), SEO (metadata, sitemap, robots, share image), optional Plausible analytics.
- `npm test` checks content integrity and generates every roadmap day for every level.

## Deploy checklist
1. Push this folder to GitHub (repo name: english-daily).
2. Import it in Vercel and add the environment variables from `.env.example`.
3. In Supabase: run `supabase/schema.sql`, enable Email auth and add your site URL under Authentication > URL Configuration (needed for password reset links).
4. Edit the contact email and wording in `app/privacy/page.js` and `app/terms/page.js`.

## No AI subscription needed
Everything works without any paid AI. Pronunciation coaching is rule-based (`lib/pron.js`) plus free IPA lookups (`lib/ipa.js`, dictionaryapi.dev; cached in the browser). You can add AI later without changing the app structure.

## v6 additions
- **Admin panel** at `/admin`: add phrases, words, phrasal verbs and quiz questions (with a level) without touching code. Run the new SQL in `supabase/schema.sql`, then make yourself an admin: `insert into public.admins (email) values ('you@example.com');`. An "Admin panel" button then appears in Account and settings.
- **Background reminders** (work when the app is closed): generate VAPID keys (`npx web-push generate-vapid-keys`), set the VAPID, `CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` variables, and add GitHub secrets `SITE_URL` and `CRON_SECRET` so `.github/workflows/reminders.yml` can call `/api/push/send` every 15 minutes (free). Works on the deployed HTTPS site; iPhone needs the app added to the Home Screen.
- **Record and compare**: record your own voice (up to 12 seconds) on any phrase and play it back next to the model voice.
