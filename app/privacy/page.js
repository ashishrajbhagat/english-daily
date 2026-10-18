export const metadata = { title: "Privacy Policy – English Daily" };

export default function Privacy() {
  return (
    <div className="legal">
      <a href="/" className="b">← Back to English Daily</a>
      <h1>Privacy Policy</h1>
      <p className="sm">Template: please review and edit before public launch. Last updated: {new Date().getFullYear()}.</p>
      <h2>What we store</h2>
      <p>Your learning progress (XP, streak, lessons, roadmaps, mistakes, level and settings) is saved in your browser on your device. If you create an account, the same progress is also saved in our database (Supabase) together with your email address, so you can use it on other devices.</p>
      <h2>Reminders (optional)</h2>
      <p>If you turn on the reminder for when the app is closed, we store your browser&apos;s push address, your reminder time and your time zone so we can send the notification. You can turn it off at any time.</p>
      <h2>Leaderboard (optional)</h2>
      <p>If you choose to join the leaderboard, your nickname and XP are visible to other signed-in learners. You can leave at any time from Account and settings.</p>
      <h2>Microphone and speech</h2>
      <p>Speaking practice uses your browser&apos;s speech recognition. Depending on your browser (for example Chrome or Edge), your audio may be sent to the browser provider&apos;s servers for processing. English Daily does not record or store your audio.</p>
      <h2>Pronunciation (IPA) lookups</h2>
      <p>When you tap the IPA button, the words of that phrase are sent to the free dictionary service dictionaryapi.dev to fetch their pronunciation. No account details are sent. Results are cached in your browser.</p>
      <h2>Cookies and analytics</h2>
      <p>We do not use advertising cookies. If analytics is enabled, we use a privacy-friendly tool that does not track you across websites.</p>
      <h2>Your choices</h2>
      <p>You can reset your progress or delete your account and cloud data from Account and settings. For any questions, contact: support@your-domain.example.</p>
    </div>
  );
}
