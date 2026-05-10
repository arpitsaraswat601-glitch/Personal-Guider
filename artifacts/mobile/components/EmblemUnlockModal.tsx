import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Stage } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";

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
  stage: Stage | null;
  onDismiss: () => void;
}

export function EmblemUnlockModal({ stage, onDismiss }: Props) {
  const colors = useColors();
  const scaleAnim = useSharedValue(0.3);
  const opacityAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (stage) {
      scaleAnim.value = 0.3;
      opacityAnim.value = 0;
      glowAnim.value = 0;

      scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacityAnim.value = withTiming(1, { duration: 400 });
      glowAnim.value = withDelay(
        400,
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 600 }),
          withTiming(1, { duration: 600 }),
          withTiming(0.5, { duration: 600 })
        )
      );

      if (Platform.OS !== "web") {
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 300);
      }
    }
  }, [stage, scaleAnim, opacityAnim, glowAnim]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.2, 0.9]),
    shadowOpacity: glowAnim.value,
    transform: [{ scale: interpolate(glowAnim.value, [0, 1], [0.95, 1.1]) }],
  }));

  if (!stage) return null;

  const iconName = STAGE_ICONS[stage.id] ?? "star";

  return (
    <Modal transparent visible={!!stage} animationType="fade">
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: stage.color }, containerStyle]}>
          <Text style={[styles.unlocked, { color: colors.mutedForeground }]}>
            STAGE UNLOCKED
          </Text>
          <Animated.View
            style={[
              styles.emblem,
              {
                borderColor: stage.color,
                shadowColor: stage.color,
                backgroundColor: "#0D0D0D",
              },
              glowStyle,
            ]}
          >
            <MaterialCommunityIcons name={iconName} size={48} color={stage.color} />
          </Animated.View>
          <Text style={[styles.title, { color: stage.color }]}>
            {stage.name.toUpperCase()}
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            You have reached {stage.days} days.{"\n"}Keep going.
          </Text>
          <Pressable
            style={[styles.btn, { backgroundColor: stage.color }]}
            onPress={onDismiss}
          >
            <Text style={styles.btnText}>Continue</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 300,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  unlocked: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  emblem: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 100,
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
