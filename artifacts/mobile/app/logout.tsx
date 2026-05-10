import { router } from "expo-router";
import React from "react";
import {
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

export default function LogoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logout, profile, getCurrentStreak, getCurrentStage, timerStarted } = useGuider();

  const streak = getCurrentStreak();
  const stage = getCurrentStage();
  const hasProgress = !!profile;

  const handleRestoreAccount = () => {
    // State is already in memory — just navigate back to the app
    router.replace("/(tabs)");
  };

  const handleCreateNew = async () => {
    await logout();
    router.replace("/onboarding");
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.mutedForeground} />
      </Pressable>

      <Animated.View entering={FadeInUp.duration(400)} style={styles.iconWrap}>
        <MaterialCommunityIcons name="shield-star" size={48} color={colors.primary} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          What would you like to do?
        </Text>
      </Animated.View>

      {/* Progress preview if there's a profile */}
      {hasProgress && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(150)}
          style={[styles.progressCard, { backgroundColor: colors.card, borderColor: stage.color + "50" }]}
        >
          <View style={styles.progressRow}>
            <MaterialCommunityIcons name="fire" size={16} color={stage.color} />
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              Saved progress on this device
            </Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: stage.color }]}>{streak}d</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Streak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {timerStarted ? "Active" : "Paused"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Timer</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{stage.name}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Stage</Text>
            </View>
          </View>
        </Animated.View>
      )}

      <View style={styles.options}>
        {/* Already Have Account */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Pressable
            style={[styles.optionBtn, styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleRestoreAccount}
          >
            <MaterialCommunityIcons name="restore" size={20} color="#FFFFFF" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Already Have Account</Text>
              <Text style={styles.optionSub}>Return to your saved progress</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#FFFFFF80" />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(270)}>
          <Text style={[styles.orText, { color: colors.mutedForeground }]}>— or —</Text>
        </Animated.View>

        {/* Create New Account */}
        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <Pressable
            style={[styles.optionBtn, styles.secondaryBtn, { borderColor: colors.destructive + "60" }]}
            onPress={handleCreateNew}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={20} color={colors.destructive} />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.destructive }]}>
                Create New Account
              </Text>
              <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                Start fresh — clears all saved data
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.destructive + "60"} />
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.note}>
        <MaterialCommunityIcons name="lock-outline" size={13} color={colors.mutedForeground} />
        <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
          No password required. All data is stored locally on this device.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  iconWrap: {
    alignItems: "center",
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 14,
    textAlign: "center",
  },
  progressCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  progressStats: {
    flexDirection: "row",
    gap: 0,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 10,
  },
  options: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  primaryBtn: {
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  optionSub: {
    fontSize: 12,
    color: "#FFFFFF99",
  },
  orText: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  noteText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});
