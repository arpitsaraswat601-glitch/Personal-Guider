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
import { ProgressGraph } from "@/components/ProgressGraph";
import { StageEmblem } from "@/components/StageEmblem";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { streakHistory, getCurrentStreak, getCurrentStage, powerScore, profile } = useGuider();

  const streakDays = getCurrentStreak();
  const stage = getCurrentStage();
  const totalDays = streakHistory.reduce((acc, r) => acc + r.days, 0) + streakDays;

  const nextStageIndex = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const nextStage = STAGES[nextStageIndex];
  const daysToNext = nextStage ? nextStage.days - streakDays : 0;

  const tabBarHeight = Platform.OS === "web" ? 84 : 62;

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
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
          {profile && (
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {profile.name}'s journey
            </Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(80)}
          style={styles.emblemSection}
        >
          <StageEmblem stage={stage} currentDays={streakDays} size="large" />
        </Animated.View>

        {nextStage && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(120)}
            style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="flag-checkered" size={14} color={colors.mutedForeground} />
            <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>
              {daysToNext} more day{daysToNext !== 1 ? "s" : ""} to{" "}
              <Text style={{ color: nextStage.color, fontWeight: "700" }}>
                {nextStage.name}
              </Text>
            </Text>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.duration(400).delay(160)}
          style={[styles.graphCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ProgressGraph streakHistory={streakHistory} currentDays={streakDays} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.statsGrid}
        >
          {[
            { label: "Current Streak", value: `${streakDays}d`, color: stage.color },
            { label: "Power Score", value: powerScore.toLocaleString(), color: colors.primary },
            { label: "Total Days", value: `${totalDays}d`, color: colors.secondary },
            { label: "Total Streaks", value: `${streakHistory.length}`, color: colors.mutedForeground },
          ].map((item) => (
            <View
              key={item.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.stageRoadmap}>
          <Text style={[styles.roadmapTitle, { color: colors.mutedForeground }]}>
            STAGE ROADMAP
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
                        shadowColor: isCurrent ? s.color : "transparent",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isCurrent ? 0.8 : 0,
                        shadowRadius: 6,
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
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 14,
    flexGrow: 1,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  sub: {
    fontSize: 13,
  },
  emblemSection: {
    alignItems: "center",
    paddingVertical: 4,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  nextLabel: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
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
    gap: 3,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  stageRoadmap: {
    gap: 12,
  },
  roadmapTitle: {
    fontSize: 10,
    letterSpacing: 2,
  },
  stageList: {
    gap: 0,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 3,
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
    top: 13,
    width: 2,
    height: 18,
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
});
