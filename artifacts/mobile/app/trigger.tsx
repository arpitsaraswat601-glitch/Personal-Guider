import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
};

export default function TriggerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
    // If returning to app with an unfinished accepted task, show it directly
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
    const next = getRandomTriggerTask(task.id);
    setTask(next);
    setScreenState("propose");
  };

  const handleDismiss = async () => {
    await dismissTriggerTask();
    router.back();
  };

  const handleDone = () => {
    router.back();
  };

  const categoryColor = getCategoryColor(task.category);
  const iconName = CATEGORY_ICONS[task.category] ?? "star-outline";

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
        <Text style={[styles.topTitle, { color: colors.mutedForeground }]}>MIND RESET</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ─── COMPLETED ─────────────────────────────── */}
        {screenState === "completed" && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.completedWrap}>
            <Animated.View entering={FadeInUp.duration(500)} style={styles.completedIconWrap}>
              <MaterialCommunityIcons name="check-circle" size={72} color="#6BCB77" />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.completedText}>
              <Text style={[styles.completedMsg, { color: "#6BCB77" }]}>{completionMsg}</Text>
              <Text style={[styles.completedSub, { color: colors.mutedForeground }]}>
                +25 Power Score added.{"\n"}You handled the trigger.
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(400).delay(280)} style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.btnPrimary, { backgroundColor: "#6BCB77" }]}
                onPress={handleDone}
              >
                <Text style={styles.btnPrimaryText}>Back to Home</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* ─── PROPOSE / ACCEPTED ────────────────────── */}
        {screenState !== "completed" && (
          <>
            {/* Category badge */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: categoryColor + "20", borderColor: categoryColor + "40" }]}>
                <MaterialCommunityIcons name={iconName} size={14} color={categoryColor} />
                <Text style={[styles.badgeText, { color: categoryColor }]}>
                  {task.categoryLabel}
                </Text>
              </View>
              {screenState === "accepted" && (
                <View style={[styles.badge, { backgroundColor: "#6BCB7720", borderColor: "#6BCB7740" }]}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color="#6BCB77" />
                  <Text style={[styles.badgeText, { color: "#6BCB77" }]}>IN PROGRESS</Text>
                </View>
              )}
            </Animated.View>

            {/* Task title */}
            <Animated.View entering={FadeInDown.duration(400).delay(60)}>
              <Text style={[styles.taskTitle, { color: categoryColor }]}>{task.title}</Text>
            </Animated.View>

            {/* Duration / reps */}
            {(task.duration || task.reps) && (
              <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.metaRow}>
                {task.duration && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="timer-outline" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{task.duration}</Text>
                  </View>
                )}
                {task.reps && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="repeat" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{task.reps}</Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Divider */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(120)}
              style={[styles.divider, { backgroundColor: categoryColor + "30" }]}
            />

            {/* Description */}
            <Animated.View entering={FadeInDown.duration(400).delay(150)}>
              <Text style={[styles.description, { color: colors.foreground }]}>
                {task.description}
              </Text>
            </Animated.View>

            {/* Unfinished task reminder */}
            {screenState === "accepted" && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(180)}
                style={[styles.reminderCard, { backgroundColor: "#6BCB7712", borderColor: "#6BCB7730" }]}
              >
                <MaterialCommunityIcons name="information-outline" size={15} color="#6BCB77" />
                <Text style={[styles.reminderText, { color: "#6BCB77" }]}>
                  This task is saved. Complete it when you're done.
                </Text>
              </Animated.View>
            )}

            {/* Actions */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(200)}
              style={styles.actions}
            >
              {screenState === "propose" ? (
                <>
                  <Pressable
                    style={[styles.btn, styles.btnPrimary, { backgroundColor: categoryColor }]}
                    onPress={handleAccept}
                  >
                    <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                    <Text style={styles.btnPrimaryText}>ACCEPT</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
                    onPress={handleGetAnother}
                  >
                    <MaterialCommunityIcons name="shuffle-variant" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.btnSecondaryText, { color: colors.mutedForeground }]}>
                      Show Another
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={[styles.btn, styles.btnPrimary, { backgroundColor: "#6BCB77" }]}
                    onPress={handleComplete}
                  >
                    <MaterialCommunityIcons name="check-bold" size={18} color="#FFFFFF" />
                    <Text style={styles.btnPrimaryText}>COMPLETE</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
                    onPress={handleDismiss}
                  >
                    <Text style={[styles.btnSecondaryText, { color: colors.mutedForeground }]}>
                      Save & Go Back
                    </Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "400",
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  reminderText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  btnPrimary: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Completed state
  completedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingTop: 40,
  },
  completedIconWrap: {
    alignItems: "center",
  },
  completedText: {
    alignItems: "center",
    gap: 10,
  },
  completedMsg: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  completedSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
