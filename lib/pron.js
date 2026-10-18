// Rule-based pronunciation tips for Hindi speakers (no AI needed).
const RULES = [
  [/th/, "Put the tip of your tongue between your teeth for 'th' (not t or d). जीभ की नोक दाँतों के बीच रखें।"],
  [/^(sp|st|sc|sk|sl|sm|sn|sw)/, "Do not add a vowel before the start: say 'school', not 'iskool'. शुरू में 'इ' न जोड़ें।"],
  [/^kn|^wr|^gn|^ps/, "The first letter is silent: know = 'no', write = 'rite'."],
  [/mb$|bt$/, "The 'b' is silent here: climb, doubt."],
  [/(alk|alf|alm)/, "The 'l' is silent: walk, talk, half, calm."],
  [/ough/, "'ough' changes: though, through, enough, cough. Learn each word separately."],
  [/(tion|sion)$/, "'-tion' sounds like 'shun'."],
  [/ph/, "'ph' sounds like 'f'."],
  [/ed$/, "'-ed' sounds like /t/, /d/ or /ɪd/: worked = 'workt', played = 'playd', wanted = 'wantid'."],
  [/v/, "For 'v', touch your top teeth to your lower lip. (व नहीं: ऊपरी दाँत निचले होंठ पर।)"],
  [/w/, "For 'w', round your lips without touching your teeth. (व नहीं: सिर्फ़ होंठ गोल करें।)"],
  [/(ee|ea|ie)/, "Make this vowel long and tight: seat, not sit."],
  [/oo/, "Check the vowel length: 'food' is long, 'good' is short."],
  [/^h/, "Breathe out softly for 'h'. In 'hour' and 'honest' the h is silent."],
  [/r/, "Say 'r' softly with the tongue curled back; do not roll it."],
  [/s$/, "A final 's' can sound like /s/ or /z/: cats = 'cats', dogs = 'dogz'."],
  [/z/, "'z' is a buzzing sound (not 'j'). Feel your throat vibrate."],
];
export const tipFor = (w) => {
  const x = (w || "").toLowerCase();
  for (const [re, t] of RULES) if (re.test(x)) return t;
  return "Listen again and copy the stress: say the strong syllable louder and a little longer.";
};
