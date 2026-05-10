import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { UserProfile, UserType, useGuider } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";

type Step = 0 | 1 | 2;

const USER_TYPES: { type: UserType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; sub: string }[] = [
  { type: "student", label: "Student", icon: "school", sub: "Study now. Success is yours." },
  { type: "worker", label: "Young Worker", icon: "briefcase", sub: "Work hard while others waste time." },
  { type: "child", label: "Child", icon: "sprout", sub: "Small discipline builds a strong future." },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useGuider();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);

  const handleNext = async () => {
    if (step === 0 && name.trim()) {
      setStep(1);
    } else if (step === 1 && age.trim()) {
      setStep(2);
    } else if (step === 2 && userType) {
      const profile: UserProfile = {
        name: name.trim(),
        age: age.trim(),
        userType,
      };
      await completeOnboarding(profile);
      router.replace("/(tabs)/");
    }
  };

  const canProceed =
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && age.trim().length > 0) ||
    (step === 2 && userType !== null);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={[styles.logoRing, { borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="shield-star" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Personal Guider</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Your silent recovery companion
          </Text>
        </Animated.View>

        <View style={styles.steps}>
          {[0, 1, 2].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                {
                  backgroundColor: s <= step ? colors.primary : colors.border,
                  width: s === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.form}>
          {step === 0 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.question, { color: colors.foreground }]}>
                What should I call you?
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
            </View>
          )}

          {step === 1 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.question, { color: colors.foreground }]}>
                How old are you, {name}?
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Your age"
                placeholderTextColor={colors.mutedForeground}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.question, { color: colors.foreground }]}>
                Who are you?
              </Text>
              <View style={styles.typeList}>
                {USER_TYPES.map((ut) => (
                  <Pressable
                    key={ut.type}
                    style={[
                      styles.typeCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: userType === ut.type ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setUserType(ut.type)}
                  >
                    <MaterialCommunityIcons
                      name={ut.icon}
                      size={28}
                      color={userType === ut.type ? colors.primary : colors.mutedForeground}
                    />
                    <View style={styles.typeText}>
                      <Text style={[styles.typeLabel, { color: colors.foreground }]}>{ut.label}</Text>
                      <Text style={[styles.typeSub, { color: colors.mutedForeground }]}>{ut.sub}</Text>
                    </View>
                    {userType === ut.type && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        <Pressable
          style={[
            styles.nextBtn,
            { backgroundColor: canProceed ? colors.primary : colors.muted, opacity: canProceed ? 1 : 0.5 },
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={[styles.nextText, { color: colors.primaryForeground }]}>
            {step < 2 ? "Continue" : "Begin My Journey"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 32,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  logoRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
  },
  steps: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  form: {
    gap: 16,
    flex: 1,
  },
  fieldGroup: {
    gap: 16,
  },
  question: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
  },
  typeList: {
    gap: 12,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  typeText: {
    flex: 1,
    gap: 2,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  typeSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 100,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
