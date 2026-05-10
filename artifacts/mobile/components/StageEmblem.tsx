import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Stage, STAGES } from "@/context/GuiderContext";

const STAGE_ICONS: Record<number, keyof typeof MaterialCommunityIcons.glyphMap> = {
  1: "brain",
  2: "sprout",
  3: "lightning-bolt",
  4: "target",
  5: "meditation",
  6: "fire",
  7: "sword",
  8: "shield-star",
  9: "eye",
  10: "star-four-points",
  11: "crown",
};

interface Props {
  stage: Stage;
  currentDays: number;
  size?: "small" | "large";
}

export function StageEmblem({ stage, currentDays, size = "large" }: Props) {
  const glowAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);

  const isLarge = size === "large";
  const emblemSize = isLarge ? 70 : 48;
  const iconSize = isLarge ? 26 : 18;
  const ringSize = emblemSize + 20;

  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, [glowAnim, rotateAnim]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.35, 1]),
    shadowOpacity: interpolate(glowAnim.value, [0, 1], [0.3, 0.85]),
    transform: [{ scale: interpolate(glowAnim.value, [0, 1], [0.97, 1.03]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
    opacity: interpolate(glowAnim.value, [0, 1], [0.15, 0.4]),
  }));

  const nextStageIndex = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const nextStage = STAGES[nextStageIndex];
  const progressPercent = nextStage
    ? Math.min(((currentDays - stage.days) / (nextStage.days - stage.days)) * 100, 100)
    : 100;

  const iconName = STAGE_ICONS[stage.id] ?? "star";

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLarge : styles.wrapperSmall]}>
      {/* Rotating dashed ring — clipped to a fixed container */}
      {isLarge && (
        <View style={[styles.ringContainer, { width: ringSize, height: ringSize }]}>
          <Animated.View
            style={[
              styles.outerRing,
              {
                borderColor: stage.color,
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
              },
              ringStyle,
            ]}
          />
        </View>
      )}

      <Animated.View
        style={[
          styles.emblem,
          {
            width: emblemSize,
            height: emblemSize,
            borderRadius: emblemSize / 2,
            backgroundColor: "#111111",
            borderColor: stage.color,
            shadowColor: stage.color,
          },
          glowStyle,
        ]}
      >
        <MaterialCommunityIcons name={iconName} size={iconSize} color={stage.color} />
      </Animated.View>

      {isLarge && (
        <View style={styles.stageInfo}>
          <Text style={[styles.stageName, { color: stage.color }]}>{stage.name}</Text>
          {nextStage && (
            <View style={styles.progressRow}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%` as any, backgroundColor: stage.color },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                Next: {nextStage.name} ({nextStage.days}d)
              </Text>
            </View>
          )}
          {!nextStage && (
            <Text style={[styles.progressLabel, { color: stage.color }]}>Maximum Achieved</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 8,
  },
  wrapperLarge: {
    paddingVertical: 6,
  },
  wrapperSmall: {
    paddingVertical: 2,
  },
  ringContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    borderWidth: 1,
    borderStyle: "dashed",
    position: "absolute",
  },
  emblem: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
  },
  stageInfo: {
    alignItems: "center",
    gap: 6,
  },
  stageName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  progressRow: {
    alignItems: "center",
    gap: 4,
    width: 180,
  },
  progressBg: {
    width: "100%",
    height: 2,
    backgroundColor: "#222222",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1,
  },
  progressLabel: {
    fontSize: 10,
    color: "#666666",
    letterSpacing: 0.4,
  },
});
