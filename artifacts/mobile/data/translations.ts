export type Language = "en" | "hi";

const T = {
  // ── Onboarding ──────────────────────────────────────
  appName: { en: "Personal Guider", hi: "पर्सनल गाइडर" },
  appTagline: { en: "Your silent recovery companion", hi: "आपका चुप साथी" },
  onboardFirstName: { en: "First Name", hi: "पहला नाम" },
  onboardLastName: { en: "Last Name", hi: "अंतिम नाम" },
  onboardNameQ: { en: "What should I call you?", hi: "मैं आपको क्या कहूं?" },
  onboardAgeQ: { en: "How old are you?", hi: "आपकी उम्र क्या है?" },
  onboardAgeInput: { en: "Your age", hi: "आपकी उम्र" },
  onboardTypeQ: { en: "Who are you?", hi: "आप कौन हैं?" },
  onboardContinue: { en: "Continue", hi: "आगे बढ़ें" },
  onboardBegin: { en: "Begin My Journey", hi: "यात्रा शुरू करें" },
  onboardStudent: { en: "Student", hi: "छात्र" },
  onboardWorker: { en: "Young Worker", hi: "युवा कार्यकर्ता" },
  onboardChild: { en: "Child", hi: "बच्चा" },

  // ── Home ────────────────────────────────────────────
  welcomeBack: { en: "WELCOME BACK", hi: "वापसी पर स्वागत" },
  motivation: { en: "MOTIVATION", hi: "प्रेरणा" },
  hindiThought: { en: "HINDI THOUGHT", hi: "हिंदी विचार" },
  yourOath: { en: "YOUR OATH", hi: "आपकी शपथ" },
  tapToChange: { en: "Tap to change", hi: "बदलने के लिए टैप करें" },
  needControl: { en: "Need Control?", hi: "नियंत्रण चाहिए?" },
  powerScore: { en: "Power Score", hi: "शक्ति स्कोर" },
  mentalStrength: { en: "Mental Strength", hi: "मानसिक शक्ति" },
  unfinishedTask: { en: "Unfinished task:", hi: "अधूरा काम:" },
  rising: { en: "Rising", hi: "उगता" },
  growing: { en: "Growing", hi: "बढ़ता" },
  strong: { en: "Strong", hi: "मजबूत" },
  elite: { en: "Elite", hi: "श्रेष्ठ" },

  // ── Timer ────────────────────────────────────────────
  timerStart: { en: "START", hi: "शुरू" },
  timerStop: { en: "STOP", hi: "रोकें" },
  timerDay: { en: "Day", hi: "दिन" },

  // ── Progress ─────────────────────────────────────────
  progress: { en: "Progress", hi: "प्रगति" },
  journey: { en: "'s journey", hi: "की यात्रा" },
  stagRoadmap: { en: "STAGE ROADMAP", hi: "चरण मार्ग" },
  currentStreak: { en: "Current Streak", hi: "वर्तमान स्ट्रीक" },
  totalDays: { en: "Total Days", hi: "कुल दिन" },
  totalStreaks: { en: "Total Streaks", hi: "कुल स्ट्रीक" },
  moreDays: { en: "more day", hi: "और दिन" },
  moreDaysPlural: { en: "more days", hi: "और दिन" },
  toReach: { en: "to reach", hi: "पहुंचने के लिए" },

  // ── History ──────────────────────────────────────────
  history: { en: "History", hi: "इतिहास" },
  fullJourney: { en: "Your full journey", hi: "आपकी पूरी यात्रा" },
  unlockedEmblems: { en: "UNLOCKED EMBLEMS", hi: "अनलॉक प्रतीक" },
  streakHistory: { en: "STREAK HISTORY", hi: "स्ट्रीक इतिहास" },
  reach10Days: { en: "Reach 10 days to unlock your first emblem", hi: "पहला प्रतीक पाने के लिए 10 दिन पूरे करें" },
  noStreaks: { en: "No streaks yet. Start your journey.", hi: "अभी कोई स्ट्रीक नहीं। यात्रा शुरू करें।" },
  active: { en: "Active", hi: "सक्रिय" },
  started: { en: "Started", hi: "शुरू" },
  ended: { en: "Ended", hi: "समाप्त" },
  days: { en: "days", hi: "दिन" },
  day: { en: "day", hi: "दिन" },

  // ── Settings ─────────────────────────────────────────
  settings: { en: "Settings", hi: "सेटिंग्स" },
  account: { en: "ACCOUNT", hi: "खाता" },
  accountOptions: { en: "Account Options", hi: "खाता विकल्प" },
  accountHint: { en: "Switch accounts or start fresh. All data is stored locally.", hi: "खाता बदलें या नए सिरे से शुरू करें। सभी डेटा स्थानीय रूप से संग्रहीत है।" },
  language: { en: "LANGUAGE", hi: "भाषा" },
  languageOption: { en: "Language", hi: "भाषा" },
  english: { en: "English", hi: "अंग्रेजी" },
  hindi: { en: "Hindi", hi: "हिन्दी" },
  yrs: { en: "yrs", hi: "वर्ष" },
  streak: { en: "streak", hi: "स्ट्रीक" },

  // ── Trigger / Mind Reset ─────────────────────────────
  mindReset: { en: "MIND RESET", hi: "मन रीसेट" },
  accept: { en: "ACCEPT", hi: "स्वीकार" },
  complete: { en: "COMPLETE", hi: "पूर्ण" },
  showAnother: { en: "Show Another", hi: "दूसरा दिखाएं" },
  backToHome: { en: "Back to Home", hi: "घर वापस" },
  saveGoBack: { en: "Save & Go Back", hi: "सहेजें और वापस जाएं" },
  inProgress: { en: "IN PROGRESS", hi: "जारी है" },
  taskSaved: { en: "This task is saved. Complete it when you're done.", hi: "यह काम सहेजा गया है। जब हो जाए तब पूरा करें।" },

  // ── Logout ───────────────────────────────────────────
  yourAccount: { en: "Your Account", hi: "आपका खाता" },
  whatWouldYouLike: { en: "What would you like to do?", hi: "आप क्या करना चाहते हैं?" },
  alreadyHaveAccount: { en: "Already Have Account", hi: "पहले से खाता है" },
  restoreProgress: { en: "Return to your saved progress", hi: "अपनी सहेजी प्रगति पर लौटें" },
  createNewAccount: { en: "Create New Account", hi: "नया खाता बनाएं" },
  createNewSub: { en: "Start fresh — clears all saved data", hi: "नए सिरे से शुरू करें — सभी डेटा मिटेगा" },
  savedProgress: { en: "Saved progress on this device", hi: "इस डिवाइस पर सहेजी प्रगति" },
  timerActive: { en: "Active", hi: "सक्रिय" },
  timerPaused: { en: "Paused", hi: "रुका" },
  noPasswordNote: { en: "No password required. All data is stored locally on this device.", hi: "कोई पासवर्ड नहीं। सभी डेटा इस डिवाइस पर स्थानीय रूप से संग्रहीत है।" },
} as const;

export type TranslationKey = keyof typeof T;

export function translate(key: TranslationKey, lang: Language): string {
  return T[key][lang] ?? T[key]["en"];
}

export { T };
