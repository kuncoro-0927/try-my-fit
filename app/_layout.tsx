import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function Routes() {
  const { ready, session, onboarded } = useAuth();
  if (!ready) return null; // tunggu status login dan onboarding terbaca

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* "/" tidak dikunci, hanya mengarahkan */}
      <Stack.Screen name="index" />

      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded && !session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded && !!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Routes />
    </AuthProvider>
  );
}
