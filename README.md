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

## v7 additions
- On phones and tablets the XP, streak and level strip is no longer shown on every page. It lives in the profile sheet (profile icon, "Stats" tab), together with the daily goal and a 7-day activity chart. On desktop the sidebar still shows them.
- Daily XP goal (20, 30, 50 or 100), saved phrases (tap ☆, see them in Speak > Saved), confetti and a toast when you finish a day, a lesson, a good quiz or the daily goal.
- Mistake notebook: an item leaves after two correct answers in a row.
- Settings: text size (A, A+, A++), install app button, daily goal.
- Production polish: friendly 404 and error pages, security headers (`next.config.js`).

## v8: free AI (all optional)
1. **On-device AI speech check** (no server, no key, no cost): a small Whisper model runs in the browser. It is used automatically in browsers without speech recognition (Firefox, many iPhones) and can be switched on in Settings. First use downloads about 40 MB, then it is cached. The model library is loaded from jsDelivr (version set in `lib/whisper.js`).
2. **AI Partner, AI coach and AI writing feedback** use any OpenAI-compatible provider. Many have free tiers without a credit card (for example Groq, OpenRouter, Google AI Studio). Set `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL` (see `.env.example`). With no key, these features simply say they are not switched on. Free tiers have rate limits and some providers may use free-tier data to improve their products, so do not use them for private content. `lib/ai.js` also limits each visitor to 20 AI requests per 10 minutes (best effort).
3. **Android app** (free): deploy the site, then use PWABuilder (pwabuilder.com) to package it for the Google Play Store.

## v9 additions
- PWA ready for install and the Play Store: PNG icons (192, 512, maskable, Apple touch), full manifest with app shortcuts (deep links such as `/?tab=speak:0`), offline page and a stronger service worker. Replace the simple generated icons in `public/icons` with your own logo any time.
- Play Store (free to prepare): deploy, open pwabuilder.com, enter your URL and download the Android package. A one-time Google Play developer registration fee applies when you publish.
- Shadowing mode, phrase search, share-my-progress button, skip-to-content link, optional feedback email, more content (24 words, 16 quiz questions, 4 reading passages, 4 writing tasks, 4 tongue twisters).

## v10: guest limits
When cloud login is set up, visitors who are not logged in get limited access (edit `lib/access.js`): they can start only the Quick Start roadmap, see only basic stats (XP, streak, level), and cannot use the daily goal, weekly chart, certificate or AI features (AI is also enforced on the server). Everything is unlocked if login is not set up. Their progress is kept and moves to their account when they log in. 17 more grammar lessons (63 in total). The theme switch now lives only in the profile Settings tab.

## v11: next features
- **Google login**: set `NEXT_PUBLIC_GOOGLE_LOGIN=1` after enabling Google in Supabase (Authentication > Providers > Google). In Google Cloud Console create an OAuth client (Web) and add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI, then paste the client ID and secret into Supabase.
- **Weekly leaderboard**: "This week" (Monday to Sunday, resets automatically) and "All time". Run the latest `supabase/schema.sql` (adds two columns).
- **Spaced repetition**: the mistake notebook now uses dates. A correct answer brings a question back after 1, 3 and 7 days; four correct reviews in a row and it is learned. Wrong answers come back soon.
- **Hindi mode** (Settings > Language): menus, headings and main buttons. Add more translations in `lib/i18n.js`.
- **Admin panel** now also adds dialogues, reading passages and grammar lessons. Run the latest `supabase/schema.sql` first (it allows the new content types).

## v12: setup help, full Hindi mode, accessibility, browser tests
- **`SETUP.md`**: one ordered checklist for Supabase, Vercel, Google login, AI, reminders and launch.
- **`npm run doctor`** checks your `.env.local` and tells you what is on, what is missing and what is wrong (for example a secret key pasted into a public variable).
- **Hindi mode** now translates the whole interface (menus, buttons, settings, messages, placeholders) with `lib/autotranslate.js` and the dictionary in `lib/i18n.js`. Learning content stays English. Anything not in the dictionary stays English; add entries to `HI`.
- **Accessibility**: Escape closes dialogs and focus moves into and back out of them, current page is announced in the navigation, toggle buttons announce their state, results are announced.
- **Browser tests** (`tests/app.spec.js`, `playwright.config.js`): sideways scrolling at 320, 768, 1440 and 2000 px, header, guest roadmap flow, profile sheet, Hindi mode, privacy and 404 pages, and an automated accessibility scan.
- Privacy and Terms are fuller templates.

## v13
- `npm run syntax` is a dependency-free syntax check for every JS/JSX file (unbalanced brackets, mismatched JSX tags). It is a safety net; `npm run build` remains the real test.
- Hindi mode covers more messages and numbers inside longer sentences.
- More content: 24 phrases, 4 dialogues, 8 phrasal verbs, 6 sound pairs and 8 quick grammar tips.
- Reading passages have a Listening mode (the text is hidden until you want it).
- Settings > Your data: export a JSON backup of your progress and import it later (also useful for learners who do not log in).

## Troubleshooting: email links open localhost:3000
1. Supabase > Authentication > URL Configuration: set **Site URL** to your live address and add it (with `/**`) to **Redirect URLs**.
2. The app now sends `emailRedirectTo` with the address the user signed up from, but Supabase only honours it if that address is in the Redirect URLs list.
3. Old emails keep the old link. In the app, sign in with the unconfirmed email and tap "Resend confirmation email".
4. Supabase's built-in email sender has a low hourly limit. If you see "email rate limit exceeded", wait, or set up your own SMTP (Authentication > SMTP Settings).
