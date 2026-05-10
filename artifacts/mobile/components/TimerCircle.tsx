import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Stage } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  streakStart: string | null;
  timerStarted: boolean;
  stage: Stage;
  onStart: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function getElapsed(startIso: string): { days: number; hours: number; minutes: number; seconds: number } {
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

export function TimerCircle({ streakStart, timerStarted, stage, onStart }: Props) {
  const colors = useColors();
  const glowAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Live 1-second tick
  useEffect(() => {
    if (!timerStarted || !streakStart) return;
    setElapsed(getElapsed(streakStart));
    const interval = setInterval(() => {
      setElapsed(getElapsed(streakStart));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, streakStart]);

  // Glow pulse
  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [glowAnim]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.2, 0.7]),
    transform: [{ scale: interpolate(glowAnim.value, [0, 1], [0.98, 1.04]) }],
  }));

  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.08, 0.25]),
    transform: [{ scale: interpolate(glowAnim.value, [0, 1], [0.96, 1.08]) }],
  }));

  const handlePressIn = () => {
    scaleAnim.value = withTiming(0.94, { duration: 120 });
  };
  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 12 });
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Outer ambient glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          { backgroundColor: stage.color },
          outerGlowStyle,
        ]}
      />

      {/* Main circle ring */}
      <Animated.View
        style={[
          styles.circle,
          {
            borderColor: stage.color,
            shadowColor: stage.color,
          },
          glowStyle,
        ]}
      >
        {timerStarted && streakStart ? (
          // Timer display
          <View style={styles.timerContent}>
            <Text style={[styles.timeRow, { color: stage.color }]}>
              {pad(elapsed.hours)}
              <Text style={[styles.timeUnit, { color: stage.color + "AA" }]}>h </Text>
              {pad(elapsed.minutes)}
              <Text style={[styles.timeUnit, { color: stage.color + "AA" }]}>m </Text>
              {pad(elapsed.seconds)}
              <Text style={[styles.timeUnit, { color: stage.color + "AA" }]}>s</Text>
            </Text>
            <View style={[styles.dayBadge, { borderColor: stage.color + "40", backgroundColor: stage.color + "15" }]}>
              <Text style={[styles.dayText, { color: stage.color }]}>
                Day {elapsed.days}
              </Text>
            </View>
            <Text style={[styles.stageName, { color: colors.mutedForeground }]}>
              {stage.name.toUpperCase()}
            </Text>
          </View>
        ) : (
          // Start button
          <Animated.View style={btnStyle}>
            <Pressable
              onPress={onStart}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.startText}>START</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const CIRCLE_SIZE = 230;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: CIRCLE_SIZE + 40,
  },
  outerGlow: {
    position: "absolute",
    width: CIRCLE_SIZE + 60,
    height: CIRCLE_SIZE + 60,
    borderRadius: (CIRCLE_SIZE + 60) / 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 28,
    elevation: 14,
  },
  timerContent: {
    alignItems: "center",
    gap: 8,
  },
  timeRow: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 1,
    lineHeight: 40,
  },
  timeUnit: {
    fontSize: 18,
    fontWeight: "400",
  },
  dayBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  stageName: {
    fontSize: 10,
    letterSpacing: 2.5,
    marginTop: 2,
  },
  startBtn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 3,
  },
});
