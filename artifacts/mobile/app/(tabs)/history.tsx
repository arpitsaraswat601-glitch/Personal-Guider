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
  const tabBarHeight = Platform.OS === "web" ? 84 : 62;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
          <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Your full journey</Text>
        </Animated.View>

        {/* Unlocked Emblems */}
        {unlockedEmblems.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              UNLOCKED EMBLEMS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.emblemRow}
            >
              {unlockedEmblems.map((emblem) => {
                const stage = STAGES.find((s) => s.id === emblem.stageId) ?? STAGES[0]!;
                return (
                  <View
                    key={emblem.stageId}
                    style={[
                      styles.emblemCard,
                      { backgroundColor: colors.card, borderColor: stage.color + "40" },
                    ]}
                  >
                    <StageEmblem stage={stage} currentDays={emblem.totalDays} size="small" />
                    <Text style={[styles.emblemName, { color: stage.color }]}>
                      {stage.name}
                    </Text>
                    <Text style={[styles.emblemMeta, { color: colors.mutedForeground }]}>
                      Day {emblem.totalDays}
                    </Text>
                    <Text style={[styles.emblemMeta, { color: colors.mutedForeground }]}>
                      {formatDate(emblem.unlockedAt)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(400).delay(80)}
            style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="medal-outline" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Reach 10 days to unlock your first emblem
            </Text>
          </Animated.View>
        )}

        {/* Streak History */}
        <Animated.View entering={FadeInDown.duration(400).delay(130)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            STREAK HISTORY
          </Text>
          {streakHistory.length === 0 ? (
            <View
              style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="clock-outline" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No streaks yet. Start your journey.
              </Text>
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
                    entering={FadeInDown.duration(350).delay(i * 50)}
                    style={[
                      styles.streakCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isActive ? stage.color : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.streakIndicator,
                        { backgroundColor: stage.color },
                      ]}
                    />
                    <View style={styles.streakInfo}>
                      <Text
                        style={[
                          styles.streakDays,
                          { color: isActive ? stage.color : colors.foreground },
                        ]}
                      >
                        {days} {days === 1 ? "day" : "days"}
                        {isActive && (
                          <Text style={{ color: stage.color, fontWeight: "400", fontSize: 13 }}>
                            {" "}• Active
                          </Text>
                        )}
                      </Text>
                      <Text style={[styles.streakStage, { color: colors.mutedForeground }]}>
                        {stage.name}
                      </Text>
                      <Text
                        style={[styles.streakDate, { color: colors.mutedForeground }]}
                        numberOfLines={2}
                      >
                        Started {formatDate(record.startDate)}
                        {record.endDate ? `\nEnded ${formatDate(record.endDate)}` : ""}
                      </Text>
                    </View>
                    {isActive && (
                      <View
                        style={[
                          styles.liveTag,
                          {
                            backgroundColor: stage.color + "20",
                            borderColor: stage.color + "40",
                          },
                        ]}
                      >
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
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 16,
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
  },
  emblemRow: {
    gap: 10,
    paddingBottom: 4,
  },
  emblemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
    width: 110,
  },
  emblemName: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  emblemMeta: {
    fontSize: 10,
    textAlign: "center",
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  streakList: {
    gap: 8,
  },
  streakCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  streakIndicator: {
    width: 3,
    minHeight: 44,
    borderRadius: 2,
    marginTop: 2,
  },
  streakInfo: {
    flex: 1,
    gap: 3,
  },
  streakDays: {
    fontSize: 16,
    fontWeight: "700",
  },
  streakStage: {
    fontSize: 12,
  },
  streakDate: {
    fontSize: 11,
    lineHeight: 16,
  },
  liveTag: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
