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
import { StageEmblem } from "@/components/StageEmblem";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { streakHistory, unlockedEmblems, getCurrentStreak } = useGuider();

  const currentDays = getCurrentStreak();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStage = (days: number) => {
    let s = STAGES[0]!;
    for (const stage of STAGES) {
      if (days >= stage.days) s = stage;
    }
    return s;
  };

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
          <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Your full journey</Text>
        </Animated.View>

        {unlockedEmblems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>UNLOCKED EMBLEMS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emblemRow}>
              {unlockedEmblems.map((emblem) => {
                const stage = STAGES.find((s) => s.id === emblem.stageId) ?? STAGES[0]!;
                return (
                  <View key={emblem.stageId} style={[styles.emblemCard, { backgroundColor: colors.card, borderColor: stage.color + "40" }]}>
                    <StageEmblem stage={stage} currentDays={emblem.totalDays} size="small" />
                    <Text style={[styles.emblemName, { color: stage.color }]}>{stage.name}</Text>
                    <Text style={[styles.emblemDate, { color: colors.mutedForeground }]}>Day {emblem.totalDays}</Text>
                    <Text style={[styles.emblemDate, { color: colors.mutedForeground }]}>{formatDate(emblem.unlockedAt)}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {unlockedEmblems.length === 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="medal-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Reach 10 days to unlock your first emblem
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>STREAK HISTORY</Text>
          {streakHistory.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="clock-outline" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No streaks yet. Start your journey.</Text>
            </View>
          ) : (
            <View style={styles.streakList}>
              {[...streakHistory].reverse().map((record, i) => {
                const isActive = i === 0 && !record.endDate;
                const days = isActive ? currentDays : record.days;
                const stage = getStage(days);
                return (
                  <Animated.View
                    key={record.id}
                    entering={FadeInDown.duration(400).delay(i * 60)}
                    style={[styles.streakCard, { backgroundColor: colors.card, borderColor: isActive ? stage.color : colors.border }]}
                  >
                    <View style={[styles.streakIndicator, { backgroundColor: stage.color }]} />
                    <View style={styles.streakInfo}>
                      <Text style={[styles.streakDays, { color: isActive ? stage.color : colors.foreground }]}>
                        {days} {days === 1 ? "day" : "days"}
                        {isActive && <Text style={[styles.activeBadge, { color: stage.color }]}> • Active</Text>}
                      </Text>
                      <Text style={[styles.streakStage, { color: colors.mutedForeground }]}>{stage.name}</Text>
                      <Text style={[styles.streakDate, { color: colors.mutedForeground }]}>
                        Started {formatDate(record.startDate)}
                        {record.endDate ? ` • Ended ${formatDate(record.endDate)}` : ""}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={[styles.liveTag, { backgroundColor: stage.color + "20", borderColor: stage.color + "40" }]}>
                        <Text style={[styles.liveText, { color: stage.color }]}>NOW</Text>
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}
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
    gap: 24,
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
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
  },
  emblemRow: {
    gap: 12,
    paddingBottom: 4,
  },
  emblemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
    width: 120,
  },
  emblemName: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  emblemDate: {
    fontSize: 10,
    textAlign: "center",
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  streakList: {
    gap: 10,
  },
  streakCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  streakIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    minHeight: 40,
  },
  streakInfo: {
    flex: 1,
    gap: 3,
  },
  streakDays: {
    fontSize: 18,
    fontWeight: "700",
  },
  streakStage: {
    fontSize: 13,
  },
  streakDate: {
    fontSize: 11,
  },
  activeBadge: {
    fontWeight: "400",
    fontSize: 14,
  },
  liveTag: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
