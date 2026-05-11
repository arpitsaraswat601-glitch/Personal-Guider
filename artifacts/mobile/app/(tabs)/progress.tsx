import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useGuider, STAGES } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/context/LanguageContext";
import { ProgressGraph } from "@/components/ProgressGraph";
import { StageEmblem } from "@/components/StageEmblem";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const {
    streakHistory,
    getCurrentStreak,
    getCurrentStage,
    powerScore,
    focusMemoryPoints,
    healthDisciplinePoints,
    profile,
  } = useGuider();

  const streakDays = getCurrentStreak();
  const stage = getCurrentStage();

  // Total days = all finished streaks + current active streak
  const finishedDays = streakHistory
    .filter((r) => !!r.endDate)
    .reduce((acc, r) => acc + r.days, 0);
  const totalDays = finishedDays + streakDays;

  const nextStageIndex = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const nextStage = STAGES[nextStageIndex];
  const daysToNext = nextStage ? Math.max(0, nextStage.days - streakDays) : 0;

  const tabBarHeight = Platform.OS === "web" ? 84 : 62;
  const displayName = profile?.firstName || profile?.name.split(" ")[0] || profile?.name || "";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 14),
            paddingBottom: insets.bottom + tabBarHeight + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t("progress")}</Text>
          {profile && (
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {displayName}{t("journey")}
            </Text>
          )}
        </Animated.View>

        {/* Stage emblem */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.emblemSection}>
          <StageEmblem stage={stage} currentDays={streakDays} size="large" />
        </Animated.View>

        {/* Next stage banner */}
        {nextStage && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={[styles.nextCard, { backgroundColor: colors.card, borderColor: nextStage.color + "35" }]}
          >
            <MaterialCommunityIcons name="flag-checkered" size={14} color={nextStage.color} />
            <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>
              <Text style={{ color: nextStage.color, fontWeight: "700" }}>
                {daysToNext} {daysToNext === 1 ? t("moreDays") : t("moreDaysPlural")}{" "}
              </Text>
              {t("toReach")}{" "}
              <Text style={{ color: nextStage.color, fontWeight: "700" }}>
                {nextStage.name}
              </Text>
            </Text>
          </Animated.View>
        )}

        {/* Progress graph */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(140)}
          style={[styles.graphCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ProgressGraph streakHistory={streakHistory} currentDays={streakDays} />
        </Animated.View>

        {/* Core stats grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.statsGrid}>
          {[
            {
              label: t("currentStreak"),
              value: `${streakDays}d`,
              color: stage.color,
              icon: "timer-outline" as const,
            },
            {
              label: t("powerScore"),
              value: powerScore.toLocaleString(),
              color: colors.primary,
              icon: "lightning-bolt" as const,
            },
            {
              label: t("totalDays"),
              value: `${totalDays}d`,
              color: colors.secondary,
              icon: "calendar-check" as const,
            },
            {
              label: t("totalStreaks"),
              value: `${streakHistory.length}`,
              color: colors.mutedForeground,
              icon: "repeat" as const,
            },
          ].map((item) => (
            <View
              key={item.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Two Point Categories ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(220)} style={styles.pointsSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TASK POINTS</Text>

          <View style={styles.pointsRow}>
            {/* Focus & Memory */}
            <View
              style={[
                styles.pointCard,
                { backgroundColor: colors.card, borderColor: "#56A3A640" },
              ]}
            >
              <View style={[styles.pointIconWrap, { backgroundColor: "#56A3A618" }]}>
                <MaterialCommunityIcons name="brain" size={20} color="#56A3A6" />
              </View>
              <Text style={[styles.pointValue, { color: "#56A3A6" }]}>
                {focusMemoryPoints.toLocaleString()}
              </Text>
              <Text style={[styles.pointLabel, { color: colors.mutedForeground }]}>
                Focus &{"\n"}Memory
              </Text>
              <View style={styles.pointTasks}>
                <Text style={[styles.pointTaskItem, { color: "#56A3A680" }]}>Chess · Reading</Text>
                <Text style={[styles.pointTaskItem, { color: "#56A3A680" }]}>Memory · Puzzles</Text>
              </View>
            </View>

            {/* Health & Discipline */}
            <View
              style={[
                styles.pointCard,
                { backgroundColor: colors.card, borderColor: "#6BCB7740" },
              ]}
            >
              <View style={[styles.pointIconWrap, { backgroundColor: "#6BCB7718" }]}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#6BCB77" />
              </View>
              <Text style={[styles.pointValue, { color: "#6BCB77" }]}>
                {healthDisciplinePoints.toLocaleString()}
              </Text>
              <Text style={[styles.pointLabel, { color: colors.mutedForeground }]}>
                Health &{"\n"}Discipline
              </Text>
              <View style={styles.pointTasks}>
                <Text style={[styles.pointTaskItem, { color: "#6BCB7780" }]}>Walking · Pushups</Text>
                <Text style={[styles.pointTaskItem, { color: "#6BCB7780" }]}>Breathing · Stretch</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stage Roadmap */}
        <Animated.View entering={FadeInDown.duration(400).delay(260)} style={styles.roadmapSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            {t("stagRoadmap")}
          </Text>
          <View style={styles.stageList}>
            {STAGES.map((s, i) => {
              const isUnlocked = streakDays >= s.days;
              const isCurrent = s.id === stage.id;
              return (
                <View key={s.id} style={styles.stageRow}>
                  <View
                    style={[
                      styles.stageDot,
                      {
                        backgroundColor: isUnlocked ? s.color : colors.border,
                        elevation: isCurrent ? 4 : 0,
                      },
                    ]}
                  />
                  {i < STAGES.length - 1 && (
                    <View
                      style={[
                        styles.stageLine,
                        { backgroundColor: isUnlocked ? s.color + "40" : colors.border },
                      ]}
                    />
                  )}
                  <Text style={[styles.stageDays, { color: isUnlocked ? s.color : colors.border }]}>
                    {s.days}d
                  </Text>
                  <Text
                    style={[
                      styles.stageName,
                      {
                        color: isUnlocked ? colors.foreground : colors.mutedForeground,
                        fontWeight: isCurrent ? "700" : "400",
                      },
                    ]}
                  >
                    {s.name}
                    {isCurrent ? "  ←" : ""}
                  </Text>
                  {isCurrent && (
                    <View style={[styles.currentTag, { borderColor: s.color + "50", backgroundColor: s.color + "18" }]}>
                      <Text style={[styles.currentTagText, { color: s.color }]}>NOW</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 14,
    flexGrow: 1,
  },
  header: { gap: 2 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13 },
  emblemSection: { alignItems: "center", paddingVertical: 4 },
  nextCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  nextLabel: { fontSize: 13, flex: 1, lineHeight: 19 },
  graphCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 10, textAlign: "center", letterSpacing: 0.3 },
  // ── Point categories
  pointsSection: { gap: 10 },
  sectionLabel: { fontSize: 10, letterSpacing: 2 },
  pointsRow: { flexDirection: "row", gap: 10 },
  pointCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: "center",
  },
  pointIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pointValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  pointLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  pointTasks: { gap: 1, alignItems: "center" },
  pointTaskItem: { fontSize: 9, letterSpacing: 0.3 },
  // ── Stage roadmap
  roadmapSection: { gap: 12 },
  stageList: { gap: 0 },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
    position: "relative",
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stageLine: {
    position: "absolute",
    left: 3,
    top: 14,
    width: 2,
    height: 20,
    zIndex: -1,
  },
  stageDays: {
    width: 34,
    fontSize: 11,
    fontWeight: "600",
  },
  stageName: {
    fontSize: 13,
    flex: 1,
  },
  currentTag: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  currentTagText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
