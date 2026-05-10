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
  const glowAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!timerStarted || !streakStart) return;
    setElapsed(getElapsed(streakStart));
    const interval = setInterval(() => {
      setElapsed(getElapsed(streakStart));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, streakStart]);

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
    opacity: interpolate(glowAnim.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(glowAnim.value, [0, 1], [0.98, 1.03]) }],
  }));

  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.06, 0.18]),
  }));

  const handlePressIn = () => { scaleAnim.value = withTiming(0.95, { duration: 100 }); };
  const handlePressOut = () => { scaleAnim.value = withSpring(1, { damping: 14 }); };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Outer ambient glow — contained within wrapper */}
      <Animated.View
        style={[styles.outerGlow, { backgroundColor: stage.color }, outerGlowStyle]}
      />

      {/* Main circle */}
      <Animated.View
        style={[
          styles.circle,
          { borderColor: stage.color, shadowColor: stage.color },
          glowStyle,
        ]}
      >
        {timerStarted && streakStart ? (
          <View style={styles.timerContent}>
            {/* h m s row */}
            <Text style={styles.timeRow}>
              <Text style={styles.timeNum}>{pad(elapsed.hours)}</Text>
              <Text style={styles.timeUnit}>h </Text>
              <Text style={styles.timeNum}>{pad(elapsed.minutes)}</Text>
              <Text style={styles.timeUnit}>m </Text>
              <Text style={styles.timeNum}>{pad(elapsed.seconds)}</Text>
              <Text style={styles.timeUnit}>s</Text>
            </Text>

            {/* Day badge */}
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>Day {elapsed.days}</Text>
            </View>

            {/* Stage name */}
            <Text style={[styles.stageName, { color: stage.color }]}>
              {stage.name.toUpperCase()}
            </Text>

            {/* Stop */}
            <Pressable onPress={onStop} style={styles.stopBtn}>
              <Text style={styles.stopText}>STOP</Text>
            </Pressable>
          </View>
        ) : (
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

const CIRCLE_SIZE = 200;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    alignSelf: "center",
  },
  outerGlow: {
    position: "absolute",
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    borderRadius: (CIRCLE_SIZE + 40) / 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    backgroundColor: "#0C0C0C",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    elevation: 12,
  },
  timerContent: {
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
  },
  timeRow: {
    lineHeight: 36,
  },
  timeNum: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(255,255,255,0.85)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  timeUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFFBB",
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  dayBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#FFFFFF30",
    backgroundColor: "#FFFFFF10",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#FFFFFF",
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  stageName: {
    fontSize: 9,
    letterSpacing: 2,
  },
  stopBtn: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#FF444440",
  },
  stopText: {
    color: "#FF6B6B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  startBtn: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 100,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 3,
  },
});
