# Setup checklist (do these in order)

Tick each step. Everything marked (optional) can wait.

## 1. Run it on your computer
1. Install Node.js 18.17 or newer.
2. In this folder: `npm install`
3. Copy `.env.example` to `.env.local`
4. `npm run doctor`   (tells you what is set up and what is missing)
5. `npm test`         (checks the content and the learning logic)
6. `npm run dev`      then open http://localhost:3000

## 2. Supabase (login and cloud progress) (optional but recommended)
1. Create a free project at supabase.com.
2. SQL Editor: paste all of `supabase/schema.sql` and Run. It is safe to run again later.
3. Authentication > Providers: keep Email on. For testing you may turn off "Confirm email".
4. Authentication > URL Configuration: set Site URL to your live address and add `http://localhost:3000` and your live address to the redirect URLs (password reset needs this).
5. Settings > API Keys: copy the Project URL and the PUBLISHABLE key into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put the secret key in these.
6. Make yourself admin (run once, your own email): `insert into public.admins (email) values ('you@example.com');`

## 3. Deploy to Vercel
1. Push this folder to GitHub (repo name `english-daily`; keep it public if you will use free reminders).
2. Vercel > Add New Project > import the repo.
3. Settings > Environment Variables. Use type **Config** for values that start with `NEXT_PUBLIC_` and for `VAPID_SUBJECT`, `AI_BASE_URL`, `AI_MODEL`. Use type **Secret** for `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `AI_API_KEY`.
4. Deploy, then set `NEXT_PUBLIC_SITE_URL` to your live address and Redeploy.

## 4. Google login (optional)
Google Cloud Console > create an OAuth client (Web) with the redirect URI `https://YOUR-PROJECT.supabase.co/auth/v1/callback`. Paste its client ID and secret in Supabase > Authentication > Providers > Google. Then set `NEXT_PUBLIC_GOOGLE_LOGIN=1`.

## 5. AI features (optional, can be free)
Pick a provider with a free tier (OpenRouter, Groq or Google AI Studio). Create an API key, then set `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL` (see `.env.example`). Open `/api/ai/status` on your site: it should say `{"enabled":true}`.

## 6. Reminders when the app is closed (optional)
1. `npx web-push generate-vapid-keys`, then set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:you@example.com).
2. Make a long random `CRON_SECRET` and set `SUPABASE_SERVICE_ROLE_KEY`.
3. GitHub repo > Settings > Secrets and variables > Actions > Secrets: add `SITE_URL` and `CRON_SECRET`.
4. Actions tab > "Send reminders" > Run workflow to test.

## 7. Before you tell people about it
- Edit `app/privacy/page.js` and `app/terms/page.js` (contact email, your country, anything that does not match what you do). They are templates, not legal advice.
- Set `NEXT_PUBLIC_CONTACT_EMAIL`.
- Replace the generated icons in `public/icons` with your own logo (optional).
- Test on a real phone, in Chrome and in Safari.
- Browser tests (optional): `npm i -D @playwright/test @axe-core/playwright`, `npx playwright install chromium`, then `npm run test:e2e`. They check there is no sideways scrolling at 320 px, the main flows, Hindi mode and basic accessibility.

## 8. Play Store (optional)
Deploy first, then use pwabuilder.com with your live address to create the Android package. Publishing needs a Google Play developer account (one-time fee).
