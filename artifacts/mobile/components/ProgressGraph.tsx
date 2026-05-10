import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { StreakRecord, STAGES } from "@/context/GuiderContext";

interface Props {
  streakHistory: StreakRecord[];
  currentDays: number;
}

export function ProgressGraph({ streakHistory, currentDays }: Props) {
  const colors = useColors();
  const maxDays = Math.max(currentDays, ...streakHistory.map((r) => r.days), 10);

  const barAnim = useSharedValue(0);

  useEffect(() => {
    barAnim.value = 0;
    barAnim.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [barAnim, currentDays]);

  const currentBarStyle = useAnimatedStyle(() => ({
    height: `${barAnim.value * Math.min((currentDays / maxDays) * 100, 100)}%` as any,
  }));

  const displayHistory = streakHistory.slice(-5);

  const getStageColor = (days: number) => {
    let color = STAGES[0]!.color;
    for (const s of STAGES) {
      if (days >= s.days) color = s.color;
    }
    return color;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>STREAK JOURNEY</Text>
      <View style={styles.graphArea}>
        {displayHistory.map((record, i) => {
          const pct = Math.max((record.days / maxDays) * 100, 2);
          const color = getStageColor(record.days);
          const isLast = i === displayHistory.length - 1;
          return (
            <View key={record.id} style={styles.barColumn}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${pct}%` as any,
                      backgroundColor: isLast ? color : `${color}44`,
                      borderColor: color,
                      shadowColor: isLast ? color : "transparent",
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
                {record.days}d
              </Text>
            </View>
          );
        })}

        <View style={styles.barColumn}>
          <View style={styles.barContainer}>
            <Animated.View
              style={[
                styles.bar,
                styles.currentBar,
                {
                  backgroundColor: getStageColor(currentDays),
                  borderColor: getStageColor(currentDays),
                  shadowColor: getStageColor(currentDays),
                },
                currentBarStyle,
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.primary }]}>NOW</Text>
        </View>
      </View>

      <View style={[styles.baseline, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{currentDays}</Text>
          <Text style={[styles.statKey, { color: colors.mutedForeground }]}>Current</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {Math.max(...streakHistory.map((r) => r.days), currentDays)}
          </Text>
          <Text style={[styles.statKey, { color: colors.mutedForeground }]}>Best</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{streakHistory.length}</Text>
          <Text style={[styles.statKey, { color: colors.mutedForeground }]}>Streaks</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  graphArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 120,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    gap: 4,
  },
  barContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
    minHeight: 4,
  },
  currentBar: {
    shadowOpacity: 0.8,
  },
  baseline: {
    height: 1,
    marginTop: -4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statKey: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
