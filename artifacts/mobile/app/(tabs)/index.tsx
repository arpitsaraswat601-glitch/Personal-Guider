import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useGuider, MOTIVATIONAL_QUOTES, HINDI_THOUGHTS, OATHS } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";
import { AICompanion } from "@/components/AICompanion";
import { StageEmblem } from "@/components/StageEmblem";
import { EmblemUnlockModal } from "@/components/EmblemUnlockModal";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, getCurrentStreak, getCurrentStage, powerScore, newlyUnlockedStage, dismissEmblemUnlock } = useGuider();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [hindiIndex, setHindiIndex] = useState(0);
  const [oathIndex, setOathIndex] = useState(0);
  const [tick, setTick] = useState(0);

  const pulseAnim = useSharedValue(1);
  const bgGlowAnim = useSharedValue(0);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    bgGlowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulseAnim, bgGlowAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    const quoteInterval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000);
    const hindiInterval = setInterval(() => {
      setHindiIndex((i) => (i + 1) % HINDI_THOUGHTS.length);
    }, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
      clearInterval(hindiInterval);
    };
  }, []);

  const dayPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const streakDays = getCurrentStreak();
  const stage = getCurrentStage();
  const displayScore = powerScore + (streakDays * 50);

  const quote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length]!;
  const hindi = HINDI_THOUGHTS[hindiIndex % HINDI_THOUGHTS.length]!;
  const oath = OATHS[oathIndex % OATHS.length]!;

  if (!profile) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EmblemUnlockModal stage={newlyUnlockedStage} onDismiss={dismissEmblemUnlock} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.topBar}>
          <View>
            <Text style={[styles.welcome, { color: colors.mutedForeground }]}>WELCOME BACK</Text>
            <Text style={[styles.userName, { color: colors.foreground }]}>{profile.name.toUpperCase()}</Text>
          </View>
          <Pressable onPress={() => router.push("/relapse")} style={styles.relapseBtn}>
            <Ionicons name="refresh" size={20} color={colors.mutedForeground} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.daySection}>
          <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>CURRENT STREAK</Text>
          <Animated.Text style={[styles.dayNumber, { color: stage.color }, dayPulseStyle]}>
            {streakDays}
          </Animated.Text>
          <Text style={[styles.daysText, { color: colors.mutedForeground }]}>
            {streakDays === 1 ? "day" : "days"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <StageEmblem stage={stage} currentDays={streakDays} size="large" />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.powerRow}>
            <View style={styles.powerItem}>
              <Text style={[styles.powerValue, { color: colors.primary }]}>{displayScore.toLocaleString()}</Text>
              <Text style={[styles.powerKey, { color: colors.mutedForeground }]}>Power Score</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.powerItem}>
              <Text style={[styles.powerValue, { color: colors.secondary }]}>
                {streakDays < 10 ? "Rising" : streakDays < 30 ? "Growing" : streakDays < 60 ? "Strong" : "Elite"}
              </Text>
              <Text style={[styles.powerKey, { color: colors.mutedForeground }]}>Mental Strength</Text>
            </View>
          </View>
          <Text style={[styles.powerEmojis, { color: colors.mutedForeground }]}>
            {Array(Math.min(streakDays + 1, 6)).fill("").map((_, i) => i % 2 === 0 ? "👍 " : "💪 ").join("")}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <AICompanion userType={profile.userType} userName={profile.name} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MOTIVATION</Text>
          <Text style={[styles.quote, { color: colors.foreground }]}>"{quote}"</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={[styles.card, { backgroundColor: "#0D0D0D", borderColor: "#FF6B3520" }]}>
          <Text style={[styles.sectionLabel, { color: "#FF6B3580" }]}>HINDI THOUGHT</Text>
          <Text style={[styles.hindiText, { color: "#DDDDDD" }]}>{hindi}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(700)} style={[styles.oathCard, { borderColor: colors.secondary + "40" }]}>
          <Pressable onPress={() => setOathIndex((i) => (i + 1) % OATHS.length)}>
            <Text style={[styles.oathLabel, { color: colors.mutedForeground }]}>YOUR OATH</Text>
            <Text style={[styles.oathText, { color: colors.secondary }]}>"{oath}"</Text>
            <Text style={[styles.oathHint, { color: colors.mutedForeground }]}>Tap to change</Text>
          </Pressable>
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
    paddingHorizontal: 20,
    gap: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    fontSize: 10,
    letterSpacing: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 2,
  },
  relapseBtn: {
    padding: 10,
  },
  daySection: {
    alignItems: "center",
    gap: 0,
  },
  dayLabel: {
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 64,
    fontWeight: "800",
    lineHeight: 72,
  },
  daysText: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: -4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  powerRow: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  powerItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  powerValue: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  powerKey: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 40,
  },
  powerEmojis: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
  },
  quote: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
    fontStyle: "italic",
  },
  hindiText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: "italic",
  },
  oathCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    backgroundColor: "transparent",
  },
  oathLabel: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  oathText: {
    fontSize: 18,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 26,
  },
  oathHint: {
    fontSize: 11,
    marginTop: 4,
  },
});
