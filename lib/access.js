// What a visitor who is NOT logged in can use. Edit here to change the limits.
// When cloud login is not set up on the site (no Supabase keys), nothing is limited.
export const GUEST = {
  roadmaps: ["quick"], // roadmaps guests may start (others show "Log in to unlock")
  statsDetail: false,  // daily goal and weekly chart in the profile Stats tab
  dailyGoal: false,    // daily goal card on Home
  ai: false,           // AI Partner, AI coach, AI writing feedback (also enforced on the server)
  certificate: false,  // roadmap certificate download
};
