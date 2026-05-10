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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
          {profile && (
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {profile.name}'s journey
            </Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <StageEmblem stage={stage} currentDays={streakDays} size="large" />
        </Animated.View>

        {nextStage && (
          <Animated.View entering={FadeInDown.duration(500).delay(150)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="flag-checkered" size={16} color={colors.mutedForeground} />
            <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>
              {daysToNext} more day{daysToNext !== 1 ? "s" : ""} to reach{" "}
              <Text style={{ color: nextStage.color, fontWeight: "700" }}>
                {nextStage.name}
              </Text>
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={[styles.graphCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProgressGraph streakHistory={streakHistory} currentDays={streakDays} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.statsGrid}>
          {[
            { label: "Current Streak", value: `${streakDays}d`, color: stage.color },
            { label: "Power Score", value: powerScore.toLocaleString(), color: colors.primary },
            { label: "Total Days", value: `${totalDays}d`, color: colors.secondary },
            { label: "Total Streaks", value: `${streakHistory.length}`, color: colors.mutedForeground },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.stageRoadmap}>
          <Text style={[styles.roadmapTitle, { color: colors.mutedForeground }]}>STAGE ROADMAP</Text>
          <View style={styles.stageList}>
            {STAGES.map((s, i) => {
              const isUnlocked = streakDays >= s.days;
              const isCurrent = s.id === stage.id;
              return (
                <View key={s.id} style={styles.stageRow}>
                  <View style={[styles.stageDot, {
                    backgroundColor: isUnlocked ? s.color : colors.border,
                    shadowColor: isCurrent ? s.color : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: isCurrent ? 0.8 : 0,
                    shadowRadius: 8,
                    elevation: isCurrent ? 6 : 0,
                  }]} />
                  {i < STAGES.length - 1 && (
                    <View style={[styles.stageLine, { backgroundColor: isUnlocked ? s.color + "40" : colors.border }]} />
                  )}
                  <Text style={[styles.stageDays, { color: isUnlocked ? s.color : colors.border }]}>
                    {s.days}d
                  </Text>
                  <Text style={[styles.stageName, { color: isUnlocked ? colors.foreground : colors.mutedForeground, fontWeight: isCurrent ? "700" : "400" }]}>
                    {s.name}
                    {isCurrent ? " ←" : ""}
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
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  sub: {
    fontSize: 14,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  nextLabel: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  graphCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  stageRoadmap: {
    gap: 16,
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
    gap: 12,
    paddingVertical: 2,
    position: "relative",
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageLine: {
    position: "absolute",
    left: 4,
    top: 14,
    width: 2,
    height: 20,
    zIndex: -1,
  },
  stageDays: {
    width: 36,
    fontSize: 12,
    fontWeight: "600",
  },
  stageName: {
    fontSize: 14,
    flex: 1,
  },
});
