import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useGuider } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";

export default function RelapseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { handleRelapse, getCurrentStreak } = useGuider();
  const [loading, setLoading] = useState(false);

  const currentDays = getCurrentStreak();

  const onOption = async (continueFromPrevious: boolean) => {
    setLoading(true);
    await handleRelapse(continueFromPrevious);
    setLoading(false);
    router.replace("/(tabs)/");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40),
          },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.top}>
          <View style={[styles.iconRing, { borderColor: colors.primary + "40" }]}>
            <MaterialCommunityIcons name="hand-heart" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Stand up again.
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            This is not failure. This is part of the journey.{"\n"}
            Every reset is a new beginning.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.primary }]}>{currentDays}</Text>
            <Text style={[styles.statKey, { color: colors.mutedForeground }]}>Days built</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.secondary }]}>0</Text>
            <Text style={[styles.statKey, { color: colors.mutedForeground }]}>Shame</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.options}>
          <Text style={[styles.chooseText, { color: colors.mutedForeground }]}>HOW DO YOU WANT TO CONTINUE?</Text>

          <Pressable
            style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.secondary }]}
            onPress={() => onOption(true)}
            disabled={loading}
          >
            <MaterialCommunityIcons name="arrow-right-circle" size={28} color={colors.secondary} />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.foreground }]}>Continue from previous time</Text>
              <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                Keep your progress. Reset today's urge only.
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.primary }]}
            onPress={() => onOption(false)}
            disabled={loading}
          >
            <MaterialCommunityIcons name="refresh" size={28} color={colors.primary} />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.foreground }]}>Restart today</Text>
              <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                Start fresh. A new streak begins now.
              </Text>
            </View>
          </Pressable>

          {loading && <ActivityIndicator color={colors.primary} />}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(400)}>
          <Text style={[styles.quote, { color: colors.mutedForeground }]}>
            "You are not starting over. You are continuing."
          </Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.mutedForeground }]}>Go back</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 32,
    justifyContent: "center",
  },
  top: {
    alignItems: "center",
    gap: 16,
  },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statVal: {
    fontSize: 28,
    fontWeight: "800",
  },
  statKey: {
    fontSize: 12,
  },
  options: {
    gap: 14,
  },
  chooseText: {
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  optionSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  backBtn: {
    marginTop: 12,
    alignItems: "center",
    padding: 8,
  },
  backText: {
    fontSize: 14,
  },
});
