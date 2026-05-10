import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  useGuider,
  MOTIVATIONAL_QUOTES,
  HINDI_THOUGHTS,
  OATHS,
} from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";
import { AICompanion } from "@/components/AICompanion";
import { StageEmblem } from "@/components/StageEmblem";
import { EmblemUnlockModal } from "@/components/EmblemUnlockModal";
import { TimerCircle } from "@/components/TimerCircle";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    profile,
    streakStart,
    timerStarted,
    getCurrentStreak,
    getCurrentStage,
    powerScore,
    newlyUnlockedStage,
    dismissEmblemUnlock,
    startTimer,
    stopTimer,
  } = useGuider();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [hindiIndex, setHindiIndex] = useState(0);
  const [oathIndex, setOathIndex] = useState(0);

  const bgGlowAnim = useSharedValue(0);

  useEffect(() => {
    bgGlowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [bgGlowAnim]);

  useEffect(() => {
    const quoteInterval = setInterval(
      () => setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length),
      10000
    );
    const hindiInterval = setInterval(
      () => setHindiIndex((i) => (i + 1) % HINDI_THOUGHTS.length),
      15000
    );
    return () => {
      clearInterval(quoteInterval);
      clearInterval(hindiInterval);
    };
  }, []);

  const streakDays = getCurrentStreak();
  const stage = getCurrentStage();
  const displayScore = powerScore + streakDays * 50;

  const quote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length]!;
  const hindi = HINDI_THOUGHTS[hindiIndex % HINDI_THOUGHTS.length]!;
  const oath = OATHS[oathIndex % OATHS.length]!;

  if (!profile) return null;

  const tabBarHeight = Platform.OS === "web" ? 84 : 62;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EmblemUnlockModal stage={newlyUnlockedStage} onDismiss={dismissEmblemUnlock} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 14),
            paddingBottom: insets.bottom + tabBarHeight + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Top bar */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={[styles.welcome, { color: colors.mutedForeground }]}>
              WELCOME BACK
            </Text>
            <Text
              style={[styles.userName, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {profile.name.toUpperCase()}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/relapse")} style={styles.relapseBtn} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={colors.mutedForeground} />
          </Pressable>
        </Animated.View>

        {/* Live timer circle */}
        <Animated.View entering={FadeInDown.duration(500).delay(60)} style={styles.timerSection}>
          <TimerCircle
            streakStart={streakStart}
            timerStarted={timerStarted}
            stage={stage}
            onStart={startTimer}
            onStop={stopTimer}
          />
        </Animated.View>

        {/* Stage emblem — compact row below circle */}
        {timerStarted && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={styles.emblemRow}
          >
            <StageEmblem stage={stage} currentDays={streakDays} size="large" />
          </Animated.View>
        )}

        {/* Power score */}
        {timerStarted && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(130)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.powerRow}>
              <View style={styles.powerItem}>
                <Text style={[styles.powerValue, { color: colors.primary }]}>
                  {displayScore.toLocaleString()}
                </Text>
                <Text style={[styles.powerKey, { color: colors.mutedForeground }]}>
                  Power Score
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.powerItem}>
                <Text style={[styles.powerValue, { color: colors.secondary }]}>
                  {streakDays < 10
                    ? "Rising"
                    : streakDays < 30
                    ? "Growing"
                    : streakDays < 60
                    ? "Strong"
                    : "Elite"}
                </Text>
                <Text style={[styles.powerKey, { color: colors.mutedForeground }]}>
                  Mental Strength
                </Text>
              </View>
            </View>
            <Text style={[styles.powerEmojis, { color: colors.mutedForeground }]}>
              {Array(Math.min(streakDays + 1, 5))
                .fill("")
                .map((_, i) => (i % 2 === 0 ? "👍 " : "💪 "))
                .join("")}
            </Text>
          </Animated.View>
        )}

        {/* AI companion */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <AICompanion userType={profile.userType} userName={profile.name} />
        </Animated.View>

        {/* Motivation */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(190)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            MOTIVATION
          </Text>
          <Text style={[styles.quote, { color: colors.foreground }]}>"{quote}"</Text>
        </Animated.View>

        {/* Hindi thought */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(220)}
          style={[styles.card, { backgroundColor: "#0D0D0D", borderColor: "#FF6B3520" }]}
        >
          <Text style={[styles.sectionLabel, { color: "#FF6B3580" }]}>HINDI THOUGHT</Text>
          <Text style={[styles.hindiText, { color: "#DDDDDD" }]}>{hindi}</Text>
        </Animated.View>

        {/* Oath */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(250)}
          style={[styles.oathCard, { borderColor: colors.secondary + "40" }]}
        >
          <Pressable onPress={() => setOathIndex((i) => (i + 1) % OATHS.length)}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 6 }]}>
              YOUR OATH
            </Text>
            <Text style={[styles.oathText, { color: colors.secondary }]}>"{oath}"</Text>
            <Text style={[styles.oathHint, { color: colors.mutedForeground }]}>
              Tap to change
            </Text>
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
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 14,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarLeft: {
    flex: 1,
    marginRight: 8,
  },
  welcome: {
    fontSize: 10,
    letterSpacing: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 1,
  },
  relapseBtn: {
    padding: 8,
  },
  timerSection: {
    alignItems: "center",
  },
  emblemRow: {
    alignItems: "center",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  powerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  powerItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  powerValue: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  powerKey: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  divider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
  },
  powerEmojis: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
  },
  quote: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 23,
    fontStyle: "italic",
  },
  hindiText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
  oathCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  oathText: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 24,
  },
  oathHint: {
    fontSize: 11,
    marginTop: 4,
  },
});
