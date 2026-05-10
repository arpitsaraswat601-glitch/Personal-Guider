import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { TriggerTask } from "@/data/triggers";

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
  "One moment of resistance builds a lifetime of control.",
  "Breathe. You are still in control.",
  "The urge is temporary. Your strength is permanent.",
];

export const HINDI_THOUGHTS = [
  "तुम हार नहीं रहे, तुम सीख रहे हो।",
  "हर दिन तुम्हें मजबूत बना रहा है।",
  "अपने आप से किया वादा मत तोड़ो।",
  "शांति में भी ताकत होती है।",
  "एक कदम भी आगे बढ़ना जीत है।",
  "मन को जीतना सबसे बड़ी जीत है।",
  "तुम्हारा संघर्ष तुम्हें बना रहा है।",
  "यह पल गुजर जाएगा — मजबूत रहो।",
];

export const OATHS = [
  "I choose control.",
  "I respect my future self.",
  "I will not quit today.",
  "I am stronger than this urge.",
  "I am rewriting my story.",
  "I am building the person I want to be.",
  "My discipline is my strength.",
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
  timerStarted: boolean;
  streakStart: string | null;
  isActive: boolean;
  streakHistory: StreakRecord[];
  unlockedEmblems: EmblemRecord[];
  powerScore: number;
  newlyUnlockedStage: Stage | null;
  // Trigger task system
  activeTriggerTask: TriggerTask | null;
  triggerTaskAccepted: boolean;
}

interface GuiderContextType extends GuiderState {
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  startTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  getCurrentStreak: () => number;
  getElapsedSeconds: () => number;
  getCurrentStage: () => Stage;
  handleRelapse: (continueFromPrevious: boolean) => Promise<void>;
  dismissEmblemUnlock: () => void;
  logout: () => Promise<void>;
  restoreAccount: () => void;
  acceptTriggerTask: (task: TriggerTask) => Promise<void>;
  completeTriggerTask: () => Promise<void>;
  dismissTriggerTask: () => Promise<void>;
  isLoading: boolean;
}

const GuiderContext = createContext<GuiderContextType | null>(null);

const STORAGE_KEY = "guider_state_v4";
// Legacy key — migrate if found
const LEGACY_KEY = "guider_state_v3";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getSecondsSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
}

function getStageForDays(days: number): Stage {
  let current = STAGES[0]!;
  for (const stage of STAGES) {
    if (days >= stage.days) current = stage;
  }
  return current;
}

const INITIAL_STATE: GuiderState = {
  profile: null,
  isOnboarded: false,
  timerStarted: false,
  streakStart: null,
  isActive: false,
  streakHistory: [],
  unlockedEmblems: [],
  powerScore: 0,
  newlyUnlockedStage: null,
  activeTriggerTask: null,
  triggerTaskAccepted: false,
};

export function GuiderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<GuiderState>(INITIAL_STATE);
  const prevStageIdRef = useRef<number>(1);

  const saveState = useCallback(async (newState: GuiderState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (_) {}
  }, []);

  // Load state on mount, migrating from legacy key if needed
  useEffect(() => {
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        // Migrate from v3 if v4 not found
        if (!raw) {
          raw = await AsyncStorage.getItem(LEGACY_KEY);
          if (raw) await AsyncStorage.removeItem(LEGACY_KEY);
        }
        if (raw) {
          const saved = JSON.parse(raw) as Partial<GuiderState>;
          const merged: GuiderState = {
            ...INITIAL_STATE,
            ...saved,
            newlyUnlockedStage: null,
            activeTriggerTask: saved.activeTriggerTask ?? null,
            triggerTaskAccepted: saved.triggerTaskAccepted ?? false,
          };
          setState(merged);
          const days = merged.streakStart ? getDaysSince(merged.streakStart) : 0;
          prevStageIdRef.current = getStageForDays(days).id;
          // Re-persist under new key
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  // Stage unlock checker — every 60s
  useEffect(() => {
    if (!state.isActive || !state.streakStart || !state.timerStarted) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.isActive || !prev.streakStart) return prev;
        const days = getDaysSince(prev.streakStart);
        const currentStage = getStageForDays(days);
        let newlyUnlockedStage = prev.newlyUnlockedStage;
        let newEmblems = [...prev.unlockedEmblems];
        if (currentStage.id > prevStageIdRef.current) {
          const alreadyUnlocked = prev.unlockedEmblems.some((e) => e.stageId === currentStage.id);
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
        const secs = getSecondsSince(prev.streakStart!);
        const next: GuiderState = {
          ...prev,
          powerScore: Math.floor(secs / 30) + days * 50,
          unlockedEmblems: newEmblems,
          newlyUnlockedStage,
        };
        saveState(next);
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [state.isActive, state.streakStart, state.timerStarted, saveState]);

  const completeOnboarding = useCallback(
    async (profile: UserProfile) => {
      const next: GuiderState = { ...INITIAL_STATE, profile, isOnboarded: true };
      prevStageIdRef.current = 1;
      setState(next);
      await saveState(next);
    },
    [saveState]
  );

  const startTimer = useCallback(async () => {
    const now = new Date().toISOString();
    setState((prev) => {
      const keepExisting = !!prev.streakStart && prev.streakHistory.length > 0;
      const next: GuiderState = {
        ...prev,
        timerStarted: true,
        streakStart: keepExisting ? prev.streakStart : now,
        isActive: true,
        streakHistory: keepExisting
          ? prev.streakHistory
          : [{ id: generateId(), startDate: now, days: 0, peakStageId: 1 }],
        powerScore: keepExisting ? prev.powerScore : 0,
      };
      saveState(next);
      return next;
    });
    if (!state.streakStart) prevStageIdRef.current = 1;
  }, [saveState, state.streakStart]);

  const stopTimer = useCallback(async () => {
    setState((prev) => {
      const next: GuiderState = { ...prev, timerStarted: false };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const getElapsedSeconds = useCallback((): number => {
    if (!state.streakStart || !state.timerStarted) return 0;
    return getSecondsSince(state.streakStart);
  }, [state.streakStart, state.timerStarted]);

  const getCurrentStreak = useCallback((): number => {
    if (!state.streakStart || !state.isActive || !state.timerStarted) return 0;
    return getDaysSince(state.streakStart);
  }, [state.streakStart, state.isActive, state.timerStarted]);

  const getCurrentStage = useCallback((): Stage => {
    return getStageForDays(getCurrentStreak());
  }, [getCurrentStreak]);

  const handleRelapse = useCallback(
    async (continueFromPrevious: boolean) => {
      const now = new Date().toISOString();
      const currentDays = getCurrentStreak();
      const currentStage = getCurrentStage();
      setState((prev) => {
        const updatedHistory = prev.streakHistory.map((r, i) =>
          i === prev.streakHistory.length - 1 && !r.endDate
            ? { ...r, endDate: now, days: currentDays, peakStageId: currentStage.id }
            : r
        );
        const newStart = continueFromPrevious && prev.streakStart ? prev.streakStart : now;
        const next: GuiderState = {
          ...prev,
          timerStarted: true,
          streakStart: newStart,
          isActive: true,
          streakHistory: continueFromPrevious
            ? updatedHistory
            : [...updatedHistory, { id: generateId(), startDate: now, days: 0, peakStageId: 1 }],
          newlyUnlockedStage: null,
        };
        saveState(next);
        return next;
      });
      prevStageIdRef.current = continueFromPrevious ? getStageForDays(currentDays).id : 1;
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

  // Logout: clears ALL data → fresh start
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(LEGACY_KEY);
    } catch (_) {}
    prevStageIdRef.current = 1;
    setState(INITIAL_STATE);
  }, []);

  // Restore account: keeps existing state, just used for navigation decision
  const restoreAccount = useCallback(() => {
    // State is already loaded from storage — nothing to do
    // The calling screen will navigate back to tabs
  }, []);

  // Trigger task methods
  const acceptTriggerTask = useCallback(
    async (task: TriggerTask) => {
      setState((prev) => {
        const next: GuiderState = {
          ...prev,
          activeTriggerTask: task,
          triggerTaskAccepted: true,
        };
        saveState(next);
        return next;
      });
    },
    [saveState]
  );

  const completeTriggerTask = useCallback(async () => {
    setState((prev) => {
      const next: GuiderState = {
        ...prev,
        activeTriggerTask: null,
        triggerTaskAccepted: false,
        powerScore: prev.powerScore + 25,
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const dismissTriggerTask = useCallback(async () => {
    setState((prev) => {
      const next: GuiderState = {
        ...prev,
        activeTriggerTask: null,
        triggerTaskAccepted: false,
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  return (
    <GuiderContext.Provider
      value={{
        ...state,
        completeOnboarding,
        startTimer,
        stopTimer,
        getCurrentStreak,
        getElapsedSeconds,
        getCurrentStage,
        handleRelapse,
        dismissEmblemUnlock,
        logout,
        restoreAccount,
        acceptTriggerTask,
        completeTriggerTask,
        dismissTriggerTask,
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
