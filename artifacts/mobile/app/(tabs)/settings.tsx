import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  const { profile, logout } = useGuider();
  const [loading, setLoading] = useState(false);

  const tabBarHeight = Platform.OS === "web" ? 84 : 62;

  const handleLogout = () => {
    if (Platform.OS === "web") {
      performLogout();
      return;
    }
    Alert.alert(
      "Logout",
      "This will clear all your data and start over. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: performLogout },
      ]
    );
  };

  const performLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace("/onboarding");
  };

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
              Signed in as {profile.name}
            </Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <Pressable
            style={[
              styles.row,
              { backgroundColor: colors.card, borderColor: colors.destructive + "50" },
            ]}
            onPress={handleLogout}
            disabled={loading}
          >
            <MaterialCommunityIcons name="logout" size={18} color={colors.destructive} />
            <Text style={[styles.rowLabel, { color: colors.destructive }]}>
              {loading ? "Logging out..." : "Logout & Reset"}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={colors.destructive + "80"}
            />
          </Pressable>
          <Text style={[styles.rowHint, { color: colors.mutedForeground }]}>
            This will clear all your progress and streak data.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(160)}
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
    gap: 24,
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
