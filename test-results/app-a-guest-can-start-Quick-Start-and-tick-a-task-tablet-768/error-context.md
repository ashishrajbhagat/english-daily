# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.js >> a guest can start Quick Start and tick a task
- Location: tests\app.spec.js:30:1

# Error details

```
Test timeout of 40000ms exceeded.
```

```
Error: locator.click: Test timeout of 40000ms exceeded.
Call log:
  - waiting for locator('.tabs button:visible, .side .nv:visible').filter({ hasText: 'Roadmap' }).first()
    - locator resolved to <button class="">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="modal-bg">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="modal-bg">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    71 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="modal-bg">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main"
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e6] [cursor=pointer]: EnglishDaily
        - button "Account and settings" [ref=e8] [cursor=pointer]: 👤
      - main [ref=e9]:
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: 🦉
            - paragraph [ref=e14]: Hi! I'm Hoot. I will guide you step by step.
          - generic [ref=e15]: Get started
          - heading "Pick a roadmap and start speaking" [level=2] [ref=e16]
          - button "Choose a roadmap →" [ref=e17] [cursor=pointer]
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: 🎯 Daily goal
            - generic [ref=e21]: 🔒 Locked
          - generic [ref=e22]: Log in to turn on your daily goal and weekly chart. Your progress so far is kept and moves to your account.
          - button "Log in or sign up" [ref=e24] [cursor=pointer]
        - generic [ref=e25]:
          - generic [ref=e26]: How it works
          - generic [ref=e27]:
            - generic [ref=e28]: "1"
            - generic [ref=e29]:
              - text: Choose your level and a roadmap.
              - generic [ref=e30]: Each day has a few small tasks.
          - generic [ref=e31]:
            - generic [ref=e32]: "2"
            - generic [ref=e33]:
              - text: Finish tasks to earn XP ⭐ and grow your streak 🔥.
              - button "What are XP and streaks?" [ref=e35] [cursor=pointer]
          - generic [ref=e36]:
            - generic [ref=e37]: "3"
            - generic [ref=e38]:
              - text: Fix your mistakes in the notebook.
              - generic [ref=e39]: Wrong answers and words you want to review are saved there.
        - heading "Quick practice" [level=3] [ref=e40]
        - generic [ref=e41]:
          - button "🎤 Speak a phrase Practise out loud" [ref=e42] [cursor=pointer]:
            - generic [ref=e43]: 🎤
            - text: Speak a phrase
            - generic [ref=e44]: Practise out loud
          - button "🗣 Free talk 60 seconds" [ref=e45] [cursor=pointer]:
            - generic [ref=e46]: 🗣
            - text: Free talk
            - generic [ref=e47]: 60 seconds
          - button "🎧 Dictation Listen and type" [ref=e48] [cursor=pointer]:
            - generic [ref=e49]: 🎧
            - text: Dictation
            - generic [ref=e50]: Listen and type
          - button "✅ Quick quiz 8 questions" [ref=e51] [cursor=pointer]:
            - generic [ref=e52]: ✅
            - text: Quick quiz
            - generic [ref=e53]: 8 questions
        - heading "Word of the day" [level=3] [ref=e54]
        - generic [ref=e55]:
          - generic [ref=e56]: Choose
          - generic [ref=e57]: चुनना
          - generic [ref=e58]: Choose a colour you like.
          - button "🔊 Listen" [ref=e60] [cursor=pointer]
        - generic [ref=e61]:
          - text: ☁️ Want to save your progress? Log in to continue on any device.
          - button "Login / Sign up" [ref=e63] [cursor=pointer]
        - heading "Your badges · 0/10" [level=3] [ref=e64]
        - generic [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e67]: 🌱
            - text: 100 XP
          - generic [ref=e68]:
            - generic [ref=e69]: 🚀
            - text: 500 XP
          - generic [ref=e70]:
            - generic [ref=e71]: 💎
            - text: 1000 XP
          - generic [ref=e72]:
            - generic [ref=e73]: 🔥
            - text: 3-day streak
          - generic [ref=e74]:
            - generic [ref=e75]: 🏆
            - text: 7-day streak
          - generic [ref=e76]:
            - generic [ref=e77]: 📘
            - text: 5 lessons
          - generic [ref=e78]:
            - generic [ref=e79]: 🎓
            - text: 20 lessons
          - generic [ref=e80]:
            - generic [ref=e81]: ⭐
            - text: 25 tasks
          - generic [ref=e82]:
            - generic [ref=e83]: 🏅
            - text: 100 tasks
          - generic [ref=e84]:
            - generic [ref=e85]: 🎯
            - text: Roadmap finisher
      - contentinfo [ref=e86]:
        - generic [ref=e87] [cursor=pointer]: EnglishDaily
        - paragraph [ref=e88]: English speaking practice for Hindi speakers. A little every day, no fear.
        - paragraph [ref=e89]:
          - link "Privacy" [ref=e90] [cursor=pointer]:
            - /url: /privacy
          - text: ·
          - link "Terms" [ref=e91] [cursor=pointer]:
            - /url: /terms
          - text: ·
          - link "Feedback" [ref=e92] [cursor=pointer]:
            - /url: mailto:ashishrajbhagat@gmail.com
        - paragraph [ref=e93]: © 2026 English Daily · Progress saved on this device
    - navigation [ref=e94]:
      - button "🏠 Home" [ref=e95] [cursor=pointer]:
        - generic [ref=e96]: 🏠
        - text: Home
      - button "🗺 Roadmap" [ref=e97] [cursor=pointer]:
        - generic [ref=e98]: 🗺
        - text: Roadmap
      - button "🎤 Speak" [ref=e99] [cursor=pointer]:
        - generic [ref=e100]: 🎤
        - text: Speak
      - button "📚 Learn" [ref=e101] [cursor=pointer]:
        - generic [ref=e102]: 📚
        - text: Learn
      - button "📘 Grammar" [ref=e103] [cursor=pointer]:
        - generic [ref=e104]: 📘
        - text: Grammar
      - button "✅ Quiz" [ref=e105] [cursor=pointer]:
        - generic [ref=e106]: ✅
        - text: Quiz
    - generic [active] [ref=e108]:
      - generic [ref=e109]: 🎯 What is your English level?
      - paragraph [ref=e110]: This decides which phrases, words, grammar and quizzes you see. You can change it anytime.
      - button "🌱 Beginner I know basic words but find it hard to build sentences." [ref=e111] [cursor=pointer]:
        - generic [ref=e112]: 🌱
        - generic [ref=e113]:
          - text: Beginner
          - generic [ref=e114]: I know basic words but find it hard to build sentences.
      - button "🚀 Intermediate I can chat about simple topics but make mistakes." [ref=e115] [cursor=pointer]:
        - generic [ref=e116]: 🚀
        - generic [ref=e117]:
          - text: Intermediate
          - generic [ref=e118]: I can chat about simple topics but make mistakes.
      - button "🔥 Advanced I speak fairly well and want to sound more natural." [ref=e119] [cursor=pointer]:
        - generic [ref=e120]: 🔥
        - generic [ref=e121]:
          - text: Advanced
          - generic [ref=e122]: I speak fairly well and want to sound more natural.
      - button "👑 Expert I am fluent and want polish, nuance and formal English." [ref=e123] [cursor=pointer]:
        - generic [ref=e124]: 👑
        - generic [ref=e125]:
          - text: Expert
          - generic [ref=e126]: I am fluent and want polish, nuance and formal English.
      - generic [ref=e127]:
        - button "Not sure? Take a 2-minute test" [ref=e128] [cursor=pointer]
        - button "Skip for now" [ref=e129] [cursor=pointer]
  - alert [ref=e130]
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | const AxeBuilder = require("@axe-core/playwright").default;
  3  | 
  4  | const nav = (page, name) => page.locator(".tabs button:visible, .side .nv:visible").filter({ hasText: name }).first();
  5  | 
  6  | async function start(page) {
  7  |   await page.goto("/");
  8  |   const beginner = page.getByRole("button", { name: /Beginner/ }).first();
  9  |   if (await beginner.isVisible({ timeout: 4000 }).catch(() => false)) await beginner.click();
  10 |   await expect(page.locator("main")).toBeVisible();
  11 | }
  12 | 
  13 | test("the page never scrolls sideways on any tab", async ({ page }) => {
  14 |   await start(page);
  15 |   for (const tab of ["Roadmap", "Speak", "Learn", "Grammar", "Quiz", "Home"]) {
  16 |     await nav(page, tab).click();
  17 |     const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  18 |     expect(over, "horizontal overflow on " + tab).toBeLessThanOrEqual(1);
  19 |   }
  20 | });
  21 | 
  22 | test("header stays on one line and shows the profile icon", async ({ page }) => {
  23 |   await start(page);
  24 |   const prof = page.getByRole("button", { name: "Account and settings" });
  25 |   await expect(prof).toBeVisible();
  26 |   const box = await prof.boundingBox();
  27 |   expect(box.height).toBeLessThan(60);
  28 | });
  29 | 
  30 | test("a guest can start Quick Start and tick a task", async ({ page }) => {
  31 |   await start(page);
> 32 |   await nav(page, "Roadmap").click();
     |                              ^ Error: locator.click: Test timeout of 40000ms exceeded.
  33 |   await page.getByRole("button", { name: /Start this roadmap/ }).first().click();
  34 |   const skip = page.getByRole("button", { name: "Skip for now" });
  35 |   if (await skip.isVisible({ timeout: 1500 }).catch(() => false)) await skip.click();
  36 |   await expect(page.getByText(/Day 1 of 15/).first()).toBeVisible();
  37 |   const done = page.getByRole("button", { name: "Mark as done" }).first();
  38 |   await done.click();
  39 |   await expect(done).toHaveText("✓");
  40 | });
  41 | 
  42 | test("profile sheet opens, Escape closes it, and Hindi mode translates the menu", async ({ page }) => {
  43 |   await start(page);
  44 |   await page.getByRole("button", { name: "Account and settings" }).click();
  45 |   await expect(page.locator(".sheet")).toBeVisible();
  46 |   await page.locator(".tabs2 button").filter({ hasText: "Settings" }).click();
  47 |   await page.getByRole("button", { name: "हिन्दी" }).click();
  48 |   await page.keyboard.press("Escape");
  49 |   await expect(page.locator(".sheet")).toHaveCount(0);
  50 |   await expect(nav(page, "होम")).toBeVisible();
  51 | });
  52 | 
  53 | test("Speak, Learn and Grammar show content for the chosen level", async ({ page }) => {
  54 |   await start(page);
  55 |   await nav(page, "Speak").click();
  56 |   await expect(page.locator(".card").first()).toBeVisible();
  57 |   await nav(page, "Grammar").click();
  58 |   await expect(page.getByText(/lessons/).first()).toBeVisible();
  59 |   await nav(page, "Learn").click();
  60 |   await expect(page.locator(".flash")).toBeVisible();
  61 | });
  62 | 
  63 | test("privacy page and 404 page work", async ({ page }) => {
  64 |   await page.goto("/privacy");
  65 |   await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  66 |   await page.goto("/this-page-does-not-exist");
  67 |   await expect(page.getByText("Page not found")).toBeVisible();
  68 | });
  69 | 
  70 | test("no serious accessibility violations on Home", async ({ page }) => {
  71 |   await start(page);
  72 |   const r = await new AxeBuilder({ page }).analyze();
  73 |   const bad = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  74 |   expect(bad.map((v) => v.id + ": " + v.help)).toEqual([]);
  75 | });
  76 | 
```