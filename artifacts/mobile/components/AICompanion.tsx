import React, { useEffect, useRef, useState } from "react";
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

import { useColors } from "@/hooks/useColors";
import { COMPANION_MESSAGES, UserType } from "@/context/GuiderContext";

interface Props {
  userType: UserType;
  userName: string;
}

export function AICompanion({ userType, userName }: Props) {
  const colors = useColors();
  const glowAnim = useSharedValue(0);
  const floatAnim = useSharedValue(0);
  const eyeAnim = useSharedValue(1);

  const [messageIndex, setMessageIndex] = useState(0);
  const messages = COMPANION_MESSAGES[userType];

  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    eyeAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0.1, { duration: 120 }),
        withTiming(1, { duration: 120 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
  }, [glowAnim, floatAnim, eyeAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -6]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.3, 0.8]),
    transform: [
      { scale: interpolate(glowAnim.value, [0, 1], [0.95, 1.05]) },
    ],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeAnim.value }],
  }));

  const message = `${messages[messageIndex]?.replace("Arpit", userName) ?? ""}`;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowRing, glowStyle]} />
      <Animated.View style={[styles.body, bodyStyle]}>
        <View style={[styles.hood, { backgroundColor: "#1A1A2E" }]}>
          <View style={styles.faceArea}>
            <Animated.View style={[styles.eyeRow, eyeStyle]}>
              <View style={[styles.eye, { backgroundColor: colors.primary }]} />
              <View style={[styles.eye, { backgroundColor: colors.secondary }]} />
            </Animated.View>
          </View>
        </View>
        <View style={[styles.cloak, { backgroundColor: "#111120" }]} />
      </Animated.View>
      <View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.bubbleText, { color: colors.mutedForeground }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  glowRing: {
    position: "absolute",
    top: -8,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#FF6B3560",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  body: {
    alignItems: "center",
    width: 70,
  },
  hood: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#4A9EFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  faceArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  eyeRow: {
    flexDirection: "row",
    gap: 12,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  cloak: {
    width: 70,
    height: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -2,
    opacity: 0.8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 220,
  },
  bubbleText: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
