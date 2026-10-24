export const metadata = { title: "Privacy Policy – English Daily" };

const Contact = () => process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@your-domain.example";

export default function Privacy() {
  return (
    <div className="legal">
      <a href="/" className="b">← Back to English Daily</a>
      <h1>Privacy Policy</h1>
      <p className="sm">Template. Please review it, fill in your details and check it with a legal adviser before launch. Last updated: October 2026.</p>

      <h2>Who we are</h2>
      <p>English Daily is a free app for practising spoken English. Questions about privacy: <Contact />.</p>

      <h2>What is stored on your device</h2>
      <p>Your progress (XP, streak, level, lessons, roadmaps, mistakes, saved phrases, settings and a cache of pronunciation lookups) is saved in your browser storage. You can clear it any time with Reset my progress, or by clearing your browser data.</p>

      <h2>If you create an account</h2>
      <p>We store your email address and a copy of your progress on our database provider (Supabase) so you can use it on other devices. Passwords are handled by the provider and are not visible to us. Deleting your account from Account and settings removes your cloud data.</p>

      <h2>Optional features</h2>
      <p><b>Leaderboard:</b> if you join, your nickname, total XP and this week&apos;s XP are visible to other signed-in learners. You can leave at any time.</p>
      <p><b>Reminders:</b> if you turn on the reminder for when the app is closed, we store your browser&apos;s push address, your reminder time and your time zone.</p>
      <p><b>AI features:</b> if the site owner switched them on, the text you type, or what the speech recognizer heard, is sent to the AI provider chosen by the site owner to produce a reply. Do not enter private information.</p>

      <h2>Microphone and speech</h2>
      <p>Speaking practice uses your browser&apos;s speech recognition. Depending on your browser (for example Chrome or Edge), your audio may be sent to the browser provider for processing. If you use the on-device AI speech check, a small model (about 40 MB) is downloaded once from public servers (Hugging Face and jsDelivr) and your voice stays on your device. Recordings you make with the Record button stay in your browser and are not uploaded.</p>

      <h2>Other services we use</h2>
      <p>Hosting (Vercel), database and login (Supabase), a free dictionary service (dictionaryapi.dev) when you tap IPA, and, if enabled, a privacy-friendly analytics tool. These providers may process technical data such as your IP address and browser type to deliver the service.</p>

      <h2>Cookies</h2>
      <p>We do not use advertising or tracking cookies. Login may use browser storage to keep you signed in.</p>

      <h2>Children</h2>
      <p>English Daily is meant for learners aged 13 and over. Younger learners should use it together with a parent or guardian.</p>

      <h2>Your choices</h2>
      <p>You can reset your progress, leave the leaderboard, turn off reminders and delete your account from Account and settings. To ask about your data, contact <Contact />.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The date above shows the latest version.</p>
    </div>
  );
}
