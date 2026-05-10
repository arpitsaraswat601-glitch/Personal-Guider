import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type UserType = "student" | "worker" | "child";

export interface UserProfile {
  name: string;
  age: string;
  userType: UserType;
}

export interface StreakRecord {
  id: string;
  startDate: string;
  endDate?: string;
  days: number;
  peakStageId: number;
}

export interface EmblemRecord {
  stageId: number;
  stageName: string;
  unlockedAt: string;
  totalDays: number;
}

export interface Stage {
  id: number;
  days: number;
  name: string;
  color: string;
}

export const STAGES: Stage[] = [
  { id: 1, days: 0, name: "Lost Mind", color: "#666666" },
  { id: 2, days: 10, name: "Beginner", color: "#7EC8E3" },
  { id: 3, days: 15, name: "Fighter", color: "#5BA4CF" },
  { id: 4, days: 25, name: "Controlled", color: "#4A9EFF" },
  { id: 5, days: 30, name: "Stable Mind", color: "#56A3A6" },
  { id: 6, days: 45, name: "Strong Soul", color: "#F4A261" },
  { id: 7, days: 60, name: "Iron Discipline", color: "#FF6B35" },
  { id: 8, days: 100, name: "Mental Warrior", color: "#E76F51" },
  { id: 9, days: 150, name: "Elite Control", color: "#E63946" },
  { id: 10, days: 300, name: "Mastered Self", color: "#FFD700" },
  { id: 11, days: 365, name: "Reborn Legend", color: "#FFD700" },
];

export const MOTIVATIONAL_QUOTES = [
  "Control is strength.",
  "You are healing.",
  "Keep climbing.",
  "One urge is not stronger than you.",
  "You promised yourself.",
  "Stay focused.",
  "Every day counts.",
  "You are getting stronger.",
  "Discipline is freedom.",
  "The hard path is the right path.",
  "Progress over perfection.",
  "Your future self is watching.",
];

export const HINDI_THOUGHTS = [
  "तुम हार नहीं रहे, तुम सीख रहे हो।",
  "हर दिन तुम्हें मजबूत बना रहा है।",
  "अपने आप से किया वादा मत तोड़ो।",
  "शांति में भी ताकत होती है।",
  "एक कदम भी आगे बढ़ना जीत है।",
];

export const OATHS = [
  "I choose control.",
  "I respect my future self.",
  "I will not quit today.",
  "I am stronger than this urge.",
  "I am rewriting my story.",
];

export const COMPANION_MESSAGES: Record<UserType, string[]> = {
  student: [
    "Study now. Your future is being built today.",
    "Stay focused. Your discipline is your grade.",
    "You are getting stronger every hour.",
    "Keep moving. Knowledge is your power.",
  ],
  worker: [
    "Work hard while others waste time.",
    "You are building something real.",
    "Stay focused. Results follow discipline.",
    "Every day you show up, you win.",
  ],
  child: [
    "Small discipline builds a strong future.",
    "You are learning something powerful today.",
    "Keep going. You are doing great.",
    "Every good choice makes you stronger.",
  ],
};

interface GuiderState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  streakStart: string | null;
  isActive: boolean;
  streakHistory: StreakRecord[];
  unlockedEmblems: EmblemRecord[];
  powerScore: number;
  newlyUnlockedStage: Stage | null;
}

interface GuiderContextType extends GuiderState {
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  getCurrentStreak: () => number;
  getCurrentStage: () => Stage;
  handleRelapse: (continueFromPrevious: boolean) => Promise<void>;
  dismissEmblemUnlock: () => void;
  isLoading: boolean;
}

const GuiderContext = createContext<GuiderContextType | null>(null);

const STORAGE_KEY = "guider_state_v2";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStageForDays(days: number): Stage {
  let current = STAGES[0]!;
  for (const stage of STAGES) {
    if (days >= stage.days) {
      current = stage;
    }
  }
  return current;
}

export function GuiderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<GuiderState>({
    profile: null,
    isOnboarded: false,
    streakStart: null,
    isActive: false,
    streakHistory: [],
    unlockedEmblems: [],
    powerScore: 0,
    newlyUnlockedStage: null,
  });

  const prevStageIdRef = useRef<number>(1);

  const saveState = useCallback(async (newState: GuiderState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (_) {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as GuiderState;
          saved.newlyUnlockedStage = null;
          setState(saved);
          const days = saved.streakStart ? getDaysSince(saved.streakStart) : 0;
          prevStageIdRef.current = getStageForDays(days).id;
        }
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!state.isActive || !state.streakStart) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.isActive || !prev.streakStart) return prev;

        const days = getDaysSince(prev.streakStart);
        const currentStage = getStageForDays(days);

        let newlyUnlockedStage: Stage | null = prev.newlyUnlockedStage;
        let newEmblems = [...prev.unlockedEmblems];

        if (currentStage.id > prevStageIdRef.current) {
          const alreadyUnlocked = prev.unlockedEmblems.some(
            (e) => e.stageId === currentStage.id
          );
          if (!alreadyUnlocked) {
            newEmblems = [
              ...newEmblems,
              {
                stageId: currentStage.id,
                stageName: currentStage.name,
                unlockedAt: new Date().toISOString(),
                totalDays: days,
              },
            ];
            newlyUnlockedStage = currentStage;
          }
          prevStageIdRef.current = currentStage.id;
        }

        const minutesSinceStart = Math.floor(
          (Date.now() - new Date(prev.streakStart!).getTime()) / 60000
        );
        const newPowerScore = minutesSinceStart * 2 + days * 50;

        const next: GuiderState = {
          ...prev,
          powerScore: newPowerScore,
          unlockedEmblems: newEmblems,
          newlyUnlockedStage,
        };
        saveState(next);
        return next;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [state.isActive, state.streakStart, saveState]);

  const completeOnboarding = useCallback(
    async (profile: UserProfile) => {
      const now = new Date().toISOString();
      const startRecord: StreakRecord = {
        id: generateId(),
        startDate: now,
        days: 0,
        peakStageId: 1,
      };
      const next: GuiderState = {
        profile,
        isOnboarded: true,
        streakStart: now,
        isActive: true,
        streakHistory: [startRecord],
        unlockedEmblems: [],
        powerScore: 0,
        newlyUnlockedStage: null,
      };
      prevStageIdRef.current = 1;
      setState(next);
      await saveState(next);
    },
    [saveState]
  );

  const getCurrentStreak = useCallback((): number => {
    if (!state.streakStart || !state.isActive) return 0;
    return getDaysSince(state.streakStart);
  }, [state.streakStart, state.isActive]);

  const getCurrentStage = useCallback((): Stage => {
    const days = getCurrentStreak();
    return getStageForDays(days);
  }, [getCurrentStreak]);

  const handleRelapse = useCallback(
    async (continueFromPrevious: boolean) => {
      const now = new Date().toISOString();
      const currentDays = getCurrentStreak();
      const currentStage = getCurrentStage();

      setState((prev) => {
        const updatedHistory = prev.streakHistory.map((r, i) => {
          if (i === prev.streakHistory.length - 1 && !r.endDate) {
            return { ...r, endDate: now, days: currentDays, peakStageId: currentStage.id };
          }
          return r;
        });

        let newStart = now;
        if (continueFromPrevious && prev.streakStart) {
          newStart = prev.streakStart;
        }

        const newRecord: StreakRecord = {
          id: generateId(),
          startDate: now,
          days: 0,
          peakStageId: 1,
        };

        const next: GuiderState = {
          ...prev,
          streakStart: newStart,
          isActive: true,
          streakHistory: continueFromPrevious
            ? updatedHistory
            : [...updatedHistory, newRecord],
          newlyUnlockedStage: null,
        };
        saveState(next);
        return next;
      });

      prevStageIdRef.current = continueFromPrevious
        ? getStageForDays(currentDays).id
        : 1;
    },
    [getCurrentStreak, getCurrentStage, saveState]
  );

  const dismissEmblemUnlock = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, newlyUnlockedStage: null };
      saveState(next);
      return next;
    });
  }, [saveState]);

  return (
    <GuiderContext.Provider
      value={{
        ...state,
        completeOnboarding,
        getCurrentStreak,
        getCurrentStage,
        handleRelapse,
        dismissEmblemUnlock,
        isLoading,
      }}
    >
      {children}
    </GuiderContext.Provider>
  );
}

export function useGuider(): GuiderContextType {
  const ctx = useContext(GuiderContext);
  if (!ctx) throw new Error("useGuider must be used inside GuiderProvider");
  return ctx;
}
