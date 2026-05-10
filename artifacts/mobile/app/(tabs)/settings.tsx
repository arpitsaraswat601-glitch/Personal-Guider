import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useGuider } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, getCurrentStreak, getCurrentStage } = useGuider();

  const tabBarHeight = Platform.OS === "web" ? 84 : 62;
  const streak = getCurrentStreak();
  const stage = getCurrentStage();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 14),
            paddingBottom: insets.bottom + tabBarHeight + 16,
          },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
          {profile && (
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {profile.name}
            </Text>
          )}
        </Animated.View>

        {/* Profile card */}
        {profile && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(60)}
            style={[styles.profileCard, { backgroundColor: colors.card, borderColor: stage.color + "40" }]}
          >
            <View style={[styles.profileIcon, { backgroundColor: stage.color + "20" }]}>
              <MaterialCommunityIcons name="account" size={24} color={stage.color} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{profile.name}</Text>
              <Text style={[styles.profileMeta, { color: colors.mutedForeground }]}>
                {profile.age} yrs · {profile.userType} · {streak}d streak
              </Text>
              <Text style={[styles.profileStage, { color: stage.color }]}>{stage.name}</Text>
            </View>
          </Animated.View>
        )}

        {/* Account section */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>

          <Pressable
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/logout")}
          >
            <MaterialCommunityIcons name="account-key-outline" size={18} color={colors.foreground} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Account Options</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.rowHint, { color: colors.mutedForeground }]}>
            Switch accounts or start fresh. All data is stored locally on this device.
          </Text>
        </Animated.View>

        {/* App info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(180)}
          style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="shield-star" size={18} color={colors.primary} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Personal Guider</Text>
            <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
              Your silent recovery companion
            </Text>
          </View>
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
    paddingHorizontal: 18,
    gap: 20,
  },
  header: {
    gap: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  sub: {
    fontSize: 13,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
  },
  profileMeta: {
    fontSize: 12,
  },
  profileStage: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  rowHint: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 2,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    gap: 2,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoSub: {
    fontSize: 12,
  },
});
