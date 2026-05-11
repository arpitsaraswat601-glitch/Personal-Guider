import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Stage } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/context/LanguageContext";

interface Props {
  streakStart: string | null;
  timerStarted: boolean;
  stage: Stage;
  onStart: () => void;
  onStop: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function getElapsed(startIso: string) {
  const totalSecs = Math.max(
    0,
    Math.floor((Date.now() - new Date(startIso).getTime()) / 1000)
  );
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { days, hours, minutes, seconds };
}

export function TimerCircle({ streakStart, timerStarted, stage, onStart, onStop }: Props) {
  const colors = useColors();
  const { t } = useLang();
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!timerStarted || !streakStart) return;
    setElapsed(getElapsed(streakStart));
    const interval = setInterval(() => {
      setElapsed(getElapsed(streakStart));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, streakStart]);

  return (
    <View style={styles.wrapper}>
      {/* Static circle — no animation */}
      <View style={[styles.circle, { borderColor: stage.color }]}>
        {timerStarted && streakStart ? (
          <View style={styles.timerContent}>
            {/* Main time digits */}
            <View style={styles.timeRow}>
              <Text style={styles.timeNum}>{pad(elapsed.hours)}</Text>
              <Text style={styles.timeUnit}>h</Text>
              <Text style={styles.timeSpacer}> </Text>
              <Text style={styles.timeNum}>{pad(elapsed.minutes)}</Text>
              <Text style={styles.timeUnit}>m</Text>
              <Text style={styles.timeSpacer}> </Text>
              <Text style={styles.timeNum}>{pad(elapsed.seconds)}</Text>
              <Text style={styles.timeUnit}>s</Text>
            </View>

            {/* Day badge */}
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>
                {t("timerDay")} {elapsed.days}
              </Text>
            </View>

            {/* Stage label */}
            <Text style={[styles.stageName, { color: stage.color }]}>
              {stage.name.toUpperCase()}
            </Text>

            {/* Stop */}
            <Pressable onPress={onStop} style={styles.stopBtn}>
              <Text style={styles.stopText}>{t("timerStop")}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onStart}
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.startText}>{t("timerStart")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 210;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    backgroundColor: "#0C0C0C",
    alignItems: "center",
    justifyContent: "center",
  },
  timerContent: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  timeNum: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  timeUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFFAA",
  },
  timeSpacer: {
    fontSize: 14,
    color: "transparent",
    width: 6,
  },
  dayBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#FFFFFF25",
    backgroundColor: "#FFFFFF0C",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#FFFFFF",
  },
  stageName: {
    fontSize: 9,
    letterSpacing: 2.5,
  },
  stopBtn: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#FF444430",
  },
  stopText: {
    color: "#FF6B6B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  startBtn: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 100,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 3,
  },
});
