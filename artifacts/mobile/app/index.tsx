import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useGuider } from "@/context/GuiderContext";

export default function Index() {
  const { isOnboarded, isLoading } = useGuider();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  if (isOnboarded) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/onboarding" />;
}
