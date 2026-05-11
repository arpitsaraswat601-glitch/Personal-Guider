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
import { useLang } from "@/context/LanguageContext";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, getCurrentStreak, getCurrentStage } = useGuider();
  const { lang, setLang, t } = useLang();

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
          <Text style={[styles.title, { color: colors.foreground }]}>{t("settings")}</Text>
          {profile && (
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {profile.firstName || profile.name}
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
              <MaterialCommunityIcons name="account" size={22} color={stage.color} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {profile.firstName
                  ? `${profile.firstName}${profile.lastName ? " " + profile.lastName : ""}`
                  : profile.name}
              </Text>
              <Text style={[styles.profileMeta, { color: colors.mutedForeground }]}>
                {profile.age} {t("yrs")} · {profile.userType} · {streak}d {t("streak")}
              </Text>
              <Text style={[styles.profileStage, { color: stage.color }]}>{stage.name}</Text>
            </View>
          </Animated.View>
        )}

        {/* Language */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t("language")}</Text>
          <View style={[styles.langRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[
                styles.langBtn,
                lang === "en" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setLang("en")}
            >
              <Text
                style={[
                  styles.langText,
                  { color: lang === "en" ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {t("english")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.langBtn,
                lang === "hi" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setLang("hi")}
            >
              <Text
                style={[
                  styles.langText,
                  { color: lang === "hi" ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {t("hindi")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.duration(400).delay(140)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t("account")}</Text>
          <Pressable
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/logout")}
          >
            <MaterialCommunityIcons name="account-key-outline" size={18} color={colors.foreground} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("accountOptions")}</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.rowHint, { color: colors.mutedForeground }]}>{t("accountHint")}</Text>
        </Animated.View>

        {/* App info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(180)}
          style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="shield-star" size={16} color={colors.primary} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Personal Guider</Text>
            <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
              {t("appTagline")}
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    gap: 20,
  },
  header: { gap: 3 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 15, fontWeight: "700" },
  profileMeta: { fontSize: 12 },
  profileStage: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 10, letterSpacing: 2 },
  langRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  langBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  langText: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  rowHint: { fontSize: 12, lineHeight: 17, paddingHorizontal: 2 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { gap: 2 },
  infoTitle: { fontSize: 14, fontWeight: "700" },
  infoSub: { fontSize: 12 },
});
