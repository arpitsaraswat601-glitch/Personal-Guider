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
  firstName?: string;
  lastName?: string;
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
  { id: 1,  days: 0,   name: "Lost Mind",        color: "#666666" },
  { id: 2,  days: 10,  name: "Beginner",          color: "#7EC8E3" },
  { id: 3,  days: 15,  name: "Fighter",           color: "#5BA4CF" },
  { id: 4,  days: 25,  name: "Controlled",        color: "#4A9EFF" },
  { id: 5,  days: 30,  name: "Stable Mind",       color: "#56A3A6" },
  { id: 6,  days: 45,  name: "Strong Soul",       color: "#F4A261" },
  { id: 7,  days: 60,  name: "Iron Discipline",   color: "#FF6B35" },
  { id: 8,  days: 100, name: "Mental Warrior",    color: "#E76F51" },
  { id: 9,  days: 150, name: "Elite Control",     color: "#E63946" },
  { id: 10, days: 300, name: "Mastered Self",     color: "#FFD700" },
  { id: 11, days: 365, name: "Reborn Legend",     color: "#FFD700" },
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
  /** Base bonus points from completed tasks (time-based part computed live) */
  bonusPoints: number;
  /** legacy field — kept for migration, not used for display */
  powerScore: number;
  /** Points from Focus & Memory tasks */
  focusMemoryPoints: number;
  /** Points from Health & Discipline tasks */
  healthDisciplinePoints: number;
  newlyUnlockedStage: Stage | null;
  activeTriggerTask: TriggerTask | null;
  triggerTaskAccepted: boolean;
}

interface GuiderContextType extends GuiderState {
  /** Live power score = time-based + bonus points */
  powerScore: number;
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
const LEGACY_KEY  = "guider_state_v3";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function getDaysSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000));
}

function getSecondsSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
}

export function getStageForDays(days: number): Stage {
  let current = STAGES[0]!;
  for (const s of STAGES) {
    if (days >= s.days) current = s;
  }
  return current;
}

/** Compute the time-based part of power score from elapsed seconds + days */
function computeTimePower(streakStart: string | null, timerStarted: boolean): number {
  if (!streakStart || !timerStarted) return 0;
  const secs = getSecondsSince(streakStart);
  const days = getDaysSince(streakStart);
  return Math.floor(secs / 30) + days * 50;
}

const INITIAL_STATE: GuiderState = {
  profile: null,
  isOnboarded: false,
  timerStarted: false,
  streakStart: null,
  isActive: false,
  streakHistory: [],
  unlockedEmblems: [],
  bonusPoints: 0,
  powerScore: 0,
  focusMemoryPoints: 0,
  healthDisciplinePoints: 0,
  newlyUnlockedStage: null,
  activeTriggerTask: null,
  triggerTaskAccepted: false,
};

export function GuiderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<GuiderState>(INITIAL_STATE);
  const prevStageIdRef = useRef<number>(1);

  const saveState = useCallback(async (s: GuiderState) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
  }, []);

  // ── Load persisted state ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          raw = await AsyncStorage.getItem(LEGACY_KEY);
          if (raw) await AsyncStorage.removeItem(LEGACY_KEY);
        }
        if (raw) {
          const saved = JSON.parse(raw) as Partial<GuiderState> & { powerScore?: number };
          // Migrate legacy powerScore → bonusPoints if new fields absent
          const bonusPoints = saved.bonusPoints ?? saved.powerScore ?? 0;
          const merged: GuiderState = {
            ...INITIAL_STATE,
            ...saved,
            bonusPoints,
            focusMemoryPoints: saved.focusMemoryPoints ?? 0,
            healthDisciplinePoints: saved.healthDisciplinePoints ?? 0,
            newlyUnlockedStage: null,
            activeTriggerTask: saved.activeTriggerTask ?? null,
            triggerTaskAccepted: saved.triggerTaskAccepted ?? false,
          };
          setState(merged);
          const days = merged.streakStart ? getDaysSince(merged.streakStart) : 0;
          prevStageIdRef.current = getStageForDays(days).id;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  // ── Stage unlock checker — every 60s ───────────────────────────────────
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
            newEmblems = [...newEmblems, {
              stageId: currentStage.id,
              stageName: currentStage.name,
              unlockedAt: new Date().toISOString(),
              totalDays: days,
            }];
            newlyUnlockedStage = currentStage;
          }
          prevStageIdRef.current = currentStage.id;
        }
        const next: GuiderState = { ...prev, unlockedEmblems: newEmblems, newlyUnlockedStage };
        saveState(next);
        return next;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [state.isActive, state.streakStart, state.timerStarted, saveState]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const completeOnboarding = useCallback(async (profile: UserProfile) => {
    const next: GuiderState = { ...INITIAL_STATE, profile, isOnboarded: true };
    prevStageIdRef.current = 1;
    setState(next);
    await saveState(next);
  }, [saveState]);

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
        bonusPoints: keepExisting ? prev.bonusPoints : 0,
      };
      saveState(next);
      return next;
    });
    if (!state.streakStart) prevStageIdRef.current = 1;
  }, [saveState, state.streakStart]);

  const stopTimer = useCallback(async () => {
    setState((prev) => {
      const next = { ...prev, timerStarted: false };
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

  const handleRelapse = useCallback(async (continueFromPrevious: boolean) => {
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
  }, [getCurrentStreak, getCurrentStage, saveState]);

  const dismissEmblemUnlock = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, newlyUnlockedStage: null };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(LEGACY_KEY);
    } catch (_) {}
    prevStageIdRef.current = 1;
    setState(INITIAL_STATE);
  }, []);

  const restoreAccount = useCallback(() => {}, []);

  const acceptTriggerTask = useCallback(async (task: TriggerTask) => {
    setState((prev) => {
      const next = { ...prev, activeTriggerTask: task, triggerTaskAccepted: true };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const completeTriggerTask = useCallback(async () => {
    setState((prev) => {
      const task = prev.activeTriggerTask;
      const pts = task?.pointValue ?? 15;
      const cat = task?.pointCategory ?? "both";
      const next: GuiderState = {
        ...prev,
        activeTriggerTask: null,
        triggerTaskAccepted: false,
        bonusPoints: prev.bonusPoints + pts,
        focusMemoryPoints:
          cat === "focusMemory" || cat === "both"
            ? prev.focusMemoryPoints + pts
            : prev.focusMemoryPoints,
        healthDisciplinePoints:
          cat === "healthDiscipline" || cat === "both"
            ? prev.healthDisciplinePoints + pts
            : prev.healthDisciplinePoints,
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const dismissTriggerTask = useCallback(async () => {
    setState((prev) => {
      const next = { ...prev, activeTriggerTask: null, triggerTaskAccepted: false };
      saveState(next);
      return next;
    });
  }, [saveState]);

  // ── Live power score (recomputed each render — no staleness) ────────────
  const livePowerScore =
    computeTimePower(state.streakStart, state.timerStarted) + state.bonusPoints;

  return (
    <GuiderContext.Provider
      value={{
        ...state,
        powerScore: livePowerScore,
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
