import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useGuider } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/context/LanguageContext";
import {
  TriggerTask,
  COMPLETION_MESSAGES,
  getCategoryColor,
  getRandomTriggerTask,
} from "@/data/triggers";

type ScreenState = "propose" | "accepted" | "completed";

const CATEGORY_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  mantra: "om",
  dialogue: "chat-processing-outline",
  brain: "brain",
  focus: "meditation",
  outdoor: "walk",
  game: "puzzle",
};

// ─── Pattern Recall Mini-Game ───────────────────────────────────────────────
type GamePhase = "study" | "recall" | "result";
const GRID_SIZE = 9; // 3×3
const HIGHLIGHT_COUNT = 4;

function PatternRecallGame({ onComplete }: { onComplete: () => void }) {
  const colors = useColors();
  const [phase, setPhase] = useState<GamePhase>("study");
  const [pattern, setPattern] = useState<number[]>([]);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate pattern on mount
  useEffect(() => {
    const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    setPattern(shuffled.slice(0, HIGHLIGHT_COUNT));
  }, []);

  // Countdown from 3 → 0 then switch to recall
  useEffect(() => {
    if (phase !== "study" || pattern.length === 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setPhase("recall");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, pattern]);

  const handleTap = (idx: number) => {
    if (phase !== "recall") return;
    setUserTaps((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      return next;
    });
  };

  const handleCheck = () => {
    setPhase("result");
  };

  const handleRetry = () => {
    const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    setPattern(shuffled.slice(0, HIGHLIGHT_COUNT));
    setUserTaps([]);
    setCountdown(3);
    setPhase("study");
  };

  const correct = pattern.filter((i) => userTaps.includes(i)).length;
  const score = Math.round((correct / HIGHLIGHT_COUNT) * 100);
  const categoryColor = "#FF6B35";

  return (
    <View style={game.container}>
      {/* Phase header */}
      <View style={game.phaseRow}>
        {phase === "study" && (
          <>
            <Text style={[game.phaseLabel, { color: categoryColor }]}>STUDY THE PATTERN</Text>
            <View style={[game.countdown, { borderColor: categoryColor + "40", backgroundColor: categoryColor + "15" }]}>
              <Text style={[game.countdownNum, { color: categoryColor }]}>{countdown}</Text>
            </View>
          </>
        )}
        {phase === "recall" && (
          <Text style={[game.phaseLabel, { color: "#4A9EFF" }]}>NOW RECALL IT</Text>
        )}
        {phase === "result" && (
          <Text style={[game.phaseLabel, { color: score >= 75 ? "#6BCB77" : "#F4A261" }]}>
            {score}% CORRECT
          </Text>
        )}
      </View>

      {/* Grid */}
      <View style={game.grid}>
        {Array.from({ length: GRID_SIZE }).map((_, idx) => {
          const isHighlighted = phase === "study" && pattern.includes(idx);
          const isTapped = userTaps.includes(idx);
          const isCorrect = phase === "result" && pattern.includes(idx);
          const isWrong = phase === "result" && isTapped && !pattern.includes(idx);
          const isMissed = phase === "result" && pattern.includes(idx) && !isTapped;

          return (
            <Pressable
              key={idx}
              style={[
                game.tile,
                { borderColor: "#2A2A2A", backgroundColor: "#111111" },
                isHighlighted && { backgroundColor: categoryColor + "CC", borderColor: categoryColor },
                isTapped && phase === "recall" && { backgroundColor: "#4A9EFF60", borderColor: "#4A9EFF" },
                isCorrect && isTapped && { backgroundColor: "#6BCB7760", borderColor: "#6BCB77" },
                isWrong && { backgroundColor: "#FF444440", borderColor: "#FF4444" },
                isMissed && { backgroundColor: categoryColor + "40", borderColor: categoryColor + "80" },
              ]}
              onPress={() => handleTap(idx)}
            >
              {isHighlighted && (
                <MaterialCommunityIcons name="circle" size={16} color="#FFFFFF" />
              )}
              {isCorrect && isTapped && (
                <MaterialCommunityIcons name="check" size={14} color="#6BCB77" />
              )}
              {isWrong && (
                <MaterialCommunityIcons name="close" size={14} color="#FF4444" />
              )}
              {isMissed && (
                <MaterialCommunityIcons name="circle-outline" size={14} color={categoryColor} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Actions */}
      {phase === "recall" && (
        <Pressable
          style={[game.btn, { backgroundColor: "#4A9EFF" }]}
          onPress={handleCheck}
        >
          <Text style={game.btnText}>CHECK ANSWER</Text>
        </Pressable>
      )}
      {phase === "result" && (
        <View style={game.resultActions}>
          <Text style={[game.resultMsg, { color: score >= 75 ? "#6BCB77" : "#F4A261" }]}>
            {score >= 100
              ? "Perfect recall!"
              : score >= 75
              ? "Strong memory."
              : score >= 50
              ? "Good effort. Keep training."
              : "Keep practicing. It gets easier."}
          </Text>
          <Pressable
            style={[game.btn, { backgroundColor: "#2A2A2A" }]}
            onPress={handleRetry}
          >
            <Text style={[game.btnText, { color: "#AAAAAA" }]}>PLAY AGAIN</Text>
          </Pressable>
          <Pressable
            style={[game.btn, { backgroundColor: "#6BCB77" }]}
            onPress={onComplete}
          >
            <Text style={game.btnText}>COMPLETE</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Main Trigger Screen ────────────────────────────────────────────────────
export default function TriggerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const {
    activeTriggerTask,
    triggerTaskAccepted,
    acceptTriggerTask,
    completeTriggerTask,
    dismissTriggerTask,
  } = useGuider();

  const [screenState, setScreenState] = useState<ScreenState>(
    activeTriggerTask && triggerTaskAccepted ? "accepted" : "propose"
  );
  const [task, setTask] = useState<TriggerTask>(
    activeTriggerTask ?? getRandomTriggerTask()
  );
  const [completionMsg, setCompletionMsg] = useState("");

  useEffect(() => {
    if (activeTriggerTask && triggerTaskAccepted) {
      setTask(activeTriggerTask);
      setScreenState("accepted");
    }
  }, [activeTriggerTask, triggerTaskAccepted]);

  const handleAccept = async () => {
    await acceptTriggerTask(task);
    setScreenState("accepted");
  };

  const handleComplete = async () => {
    const msg = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]!;
    setCompletionMsg(msg);
    await completeTriggerTask();
    setScreenState("completed");
  };

  const handleGetAnother = () => {
    setTask(getRandomTriggerTask(task.id));
    setScreenState("propose");
  };

  const handleDismiss = async () => {
    await dismissTriggerTask();
    router.back();
  };

  const categoryColor = getCategoryColor(task.category);
  const iconName = CATEGORY_ICONS[task.category] ?? "star-outline";
  const isPatternGame = task.id === "game-pattern";

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 50 : 14),
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleDismiss} hitSlop={12} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.mutedForeground }]}>{t("mindReset")}</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── COMPLETED ─────────────────── */}
        {screenState === "completed" && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.completedWrap}>
            <Animated.View entering={FadeInUp.duration(500)}>
              <MaterialCommunityIcons name="check-circle" size={70} color="#6BCB77" />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.completedText}>
              <Text style={[styles.completedMsg, { color: "#6BCB77" }]}>{completionMsg}</Text>
              <Text style={[styles.completedSub, { color: colors.mutedForeground }]}>
                +25 Power Score added.{"\n"}You handled the trigger.
              </Text>
            </Animated.View>
            <Pressable
              style={[styles.btn, styles.btnPrimary, { backgroundColor: "#6BCB77" }]}
              onPress={() => router.back()}
            >
              <Text style={styles.btnPrimaryText}>{t("backToHome")}</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── PROPOSE / ACCEPTED ────────── */}
        {screenState !== "completed" && (
          <>
            {/* Badge row */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: categoryColor + "18", borderColor: categoryColor + "40" }]}>
                <MaterialCommunityIcons name={iconName} size={13} color={categoryColor} />
                <Text style={[styles.badgeText, { color: categoryColor }]}>{task.categoryLabel}</Text>
              </View>
              {screenState === "accepted" && (
                <View style={[styles.badge, { backgroundColor: "#6BCB7718", borderColor: "#6BCB7740" }]}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#6BCB77" />
                  <Text style={[styles.badgeText, { color: "#6BCB77" }]}>{t("inProgress")}</Text>
                </View>
              )}
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.duration(400).delay(50)}>
              <Text style={[styles.taskTitle, { color: categoryColor }]}>{task.title}</Text>
            </Animated.View>

            {/* Duration / reps */}
            {(task.duration || task.reps) && (
              <Animated.View entering={FadeInDown.duration(400).delay(90)} style={styles.metaRow}>
                {task.duration && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="timer-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{task.duration}</Text>
                  </View>
                )}
                {task.reps && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="repeat" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{task.reps}</Text>
                  </View>
                )}
              </Animated.View>
            )}

            <Animated.View
              entering={FadeInDown.duration(400).delay(110)}
              style={[styles.divider, { backgroundColor: categoryColor + "25" }]}
            />

            {/* Description or Pattern Recall game */}
            <Animated.View entering={FadeInDown.duration(400).delay(130)}>
              {isPatternGame && screenState === "accepted" ? (
                <PatternRecallGame onComplete={handleComplete} />
              ) : (
                <Text style={[styles.description, { color: colors.foreground }]}>
                  {task.description}
                </Text>
              )}
            </Animated.View>

            {/* In-progress reminder */}
            {screenState === "accepted" && !isPatternGame && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(160)}
                style={[styles.reminderCard, { backgroundColor: "#6BCB7710", borderColor: "#6BCB7730" }]}
              >
                <MaterialCommunityIcons name="information-outline" size={14} color="#6BCB77" />
                <Text style={[styles.reminderText, { color: "#6BCB77" }]}>
                  {t("taskSaved")}
                </Text>
              </Animated.View>
            )}

            {/* Action buttons */}
            {(!isPatternGame || screenState === "propose") && (
              <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.actions}>
                {screenState === "propose" ? (
                  <>
                    <Pressable
                      style={[styles.btn, styles.btnPrimary, { backgroundColor: categoryColor }]}
                      onPress={handleAccept}
                    >
                      <MaterialCommunityIcons name="check" size={17} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>{t("accept")}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
                      onPress={handleGetAnother}
                    >
                      <MaterialCommunityIcons name="shuffle-variant" size={15} color={colors.mutedForeground} />
                      <Text style={[styles.btnSecondaryText, { color: colors.mutedForeground }]}>
                        {t("showAnother")}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      style={[styles.btn, styles.btnPrimary, { backgroundColor: "#6BCB77" }]}
                      onPress={handleComplete}
                    >
                      <MaterialCommunityIcons name="check-bold" size={17} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>{t("complete")}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
                      onPress={handleDismiss}
                    >
                      <Text style={[styles.btnSecondaryText, { color: colors.mutedForeground }]}>
                        {t("saveGoBack")}
                      </Text>
                    </Pressable>
                  </>
                )}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  topTitle: { fontSize: 11, letterSpacing: 2.5, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  taskTitle: { fontSize: 22, fontWeight: "800", lineHeight: 30, letterSpacing: 0.2 },
  metaRow: { flexDirection: "row", gap: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  divider: { height: 1 },
  description: { fontSize: 15, lineHeight: 25, fontWeight: "400" },
  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  reminderText: { fontSize: 12, flex: 1, lineHeight: 18 },
  actions: { gap: 10, marginTop: 4 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnPrimary: { elevation: 4 },
  btnPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 1 },
  btnSecondaryText: { fontSize: 13, fontWeight: "500" },
  completedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingTop: 40,
  },
  completedText: { alignItems: "center", gap: 10 },
  completedMsg: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  completedSub: { fontSize: 14, textAlign: "center", lineHeight: 21 },
});

// Pattern Recall Game styles
const game = StyleSheet.create({
  container: { gap: 16 },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phaseLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  countdown: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownNum: { fontSize: 16, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "center",
    width: 240,
  },
  tile: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  resultActions: { gap: 10 },
  resultMsg: { fontSize: 15, fontWeight: "600", textAlign: "center" },
});
