import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { UserProfile, UserType, useGuider } from "@/context/GuiderContext";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/context/LanguageContext";

type Step = 0 | 1 | 2;

const USER_TYPES: {
  type: UserType;
  labelKey: "onboardStudent" | "onboardWorker" | "onboardChild";
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  sub: string;
}[] = [
  { type: "student", labelKey: "onboardStudent", icon: "school", sub: "Study now. Success is yours." },
  { type: "worker", labelKey: "onboardWorker", icon: "briefcase", sub: "Work hard while others waste time." },
  { type: "child", labelKey: "onboardChild", icon: "sprout", sub: "Small discipline builds a strong future." },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useGuider();
  const { t } = useLang();

  const [step, setStep] = useState<Step>(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);

  const lastNameRef = useRef<TextInput>(null);

  const displayName = firstName.trim();

  const handleNext = async () => {
    if (step === 0 && firstName.trim()) {
      setStep(1);
    } else if (step === 1 && age.trim()) {
      setStep(2);
    } else if (step === 2 && userType) {
      const fullName = lastName.trim()
        ? `${firstName.trim()} ${lastName.trim()}`
        : firstName.trim();
      const profile: UserProfile = {
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: age.trim(),
        userType,
      };
      await completeOnboarding(profile);
      router.replace("/(tabs)");
    }
  };

  const canProceed =
    (step === 0 && firstName.trim().length > 0) ||
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
        {/* Header / Logo */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={[styles.logoRing, { borderColor: colors.primary }]}>
            <Image
              source={require("../assets/images/logo.jpg")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>{t("appName")}</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>{t("appTagline")}</Text>
        </Animated.View>

        {/* Step dots */}
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

        {/* Form */}
        <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.form}>
          {/* Step 0 — Name */}
          {step === 0 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.question, { color: colors.foreground }]}>
                {t("onboardNameQ")}
              </Text>
              <View style={styles.nameRow}>
                {/* First Name */}
                <View style={styles.nameField}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                    {t("onboardFirstName")}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: firstName.trim() ? colors.primary : colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder={t("onboardFirstName")}
                    placeholderTextColor={colors.mutedForeground}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    autoCapitalize="words"
                  />
                </View>
                {/* Last Name */}
                <View style={styles.nameField}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                    {t("onboardLastName")}
                  </Text>
                  <TextInput
                    ref={lastNameRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: lastName.trim() ? colors.primary + "80" : colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder={t("onboardLastName")}
                    placeholderTextColor={colors.mutedForeground}
                    value={lastName}
                    onChangeText={setLastName}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              {firstName.trim().length > 0 && (
                <Animated.Text
                  entering={FadeInDown.duration(300)}
                  style={[styles.previewName, { color: colors.primary }]}
                >
                  {lastName.trim()
                    ? `${firstName.trim()} ${lastName.trim()}`
                    : firstName.trim()}
                </Animated.Text>
              )}
            </View>
          )}

          {/* Step 1 — Age */}
          {step === 1 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.question, { color: colors.foreground }]}>
                {t("onboardAgeQ")} {displayName}?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputLarge,
                  {
                    backgroundColor: colors.card,
                    borderColor: age.trim() ? colors.primary : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={t("onboardAgeInput")}
                placeholderTextColor={colors.mutedForeground}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleNext}
                maxLength={2}
              />
            </View>
          )}

          {/* Step 2 — User Type */}
          {step === 2 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.question, { color: colors.foreground }]}>
                {t("onboardTypeQ")}
              </Text>
              <View style={styles.typeList}>
                {USER_TYPES.map((ut) => (
                  <Pressable
                    key={ut.type}
                    style={[
                      styles.typeCard,
                      {
                        backgroundColor: colors.card,
                        borderColor:
                          userType === ut.type ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setUserType(ut.type)}
                  >
                    <MaterialCommunityIcons
                      name={ut.icon}
                      size={26}
                      color={
                        userType === ut.type ? colors.primary : colors.mutedForeground
                      }
                    />
                    <View style={styles.typeText}>
                      <Text style={[styles.typeLabel, { color: colors.foreground }]}>
                        {t(ut.labelKey)}
                      </Text>
                      <Text style={[styles.typeSub, { color: colors.mutedForeground }]}>
                        {ut.sub}
                      </Text>
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

        {/* CTA Button */}
        <Pressable
          style={[
            styles.nextBtn,
            {
              backgroundColor: canProceed ? colors.primary : colors.muted,
              opacity: canProceed ? 1 : 0.45,
            },
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={[styles.nextText, { color: colors.primaryForeground }]}>
            {step < 2 ? t("onboardContinue") : t("onboardBegin")}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 22,
    gap: 28,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 13,
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
    gap: 14,
  },
  question: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  nameRow: {
    flexDirection: "row",
    gap: 10,
  },
  nameField: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    paddingLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  inputLarge: {
    fontSize: 22,
    textAlign: "center",
    paddingVertical: 18,
    fontWeight: "700",
    letterSpacing: 2,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  typeList: {
    gap: 10,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeText: {
    flex: 1,
    gap: 2,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  typeSub: {
    fontSize: 11,
    lineHeight: 15,
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
