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
  const emblemSize = isLarge ? 100 : 52;
  const iconSize = isLarge ? 40 : 20;

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
    opacity: interpolate(glowAnim.value, [0, 1], [0.3, 1]),
    shadowOpacity: interpolate(glowAnim.value, [0, 1], [0.3, 0.9]),
    transform: [{ scale: interpolate(glowAnim.value, [0, 1], [0.97, 1.03]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
    opacity: interpolate(glowAnim.value, [0, 1], [0.2, 0.5]),
  }));

  const nextStageIndex = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const nextStage = STAGES[nextStageIndex];
  const progressPercent =
    nextStage
      ? Math.min(
          ((currentDays - stage.days) / (nextStage.days - stage.days)) * 100,
          100
        )
      : 100;

  const iconName = STAGE_ICONS[stage.id] ?? "star";

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLarge : styles.wrapperSmall]}>
      {isLarge && (
        <Animated.View
          style={[
            styles.outerRing,
            { borderColor: stage.color, width: emblemSize + 30, height: emblemSize + 30, borderRadius: (emblemSize + 30) / 2 },
            ringStyle,
          ]}
        />
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
                <View style={[styles.progressFill, { width: `${progressPercent}%` as any, backgroundColor: stage.color }]} />
              </View>
              <Text style={styles.progressLabel}>Next: {nextStage.name} ({nextStage.days}d)</Text>
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
    gap: 12,
  },
  wrapperLarge: {
    paddingVertical: 16,
  },
  wrapperSmall: {
    paddingVertical: 4,
  },
  outerRing: {
    position: "absolute",
    top: 0,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emblem: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 12,
  },
  stageInfo: {
    alignItems: "center",
    gap: 8,
  },
  stageName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  progressRow: {
    alignItems: "center",
    gap: 4,
    width: 200,
  },
  progressBg: {
    width: "100%",
    height: 3,
    backgroundColor: "#222222",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: "#666666",
    letterSpacing: 0.5,
  },
});
