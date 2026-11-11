import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

// Pintu masuk "/": selalu bisa dibuka, lalu mengarahkan sesuai status user.
export default function Index() {
  const { session, onboarded } = useAuth();
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!session) return <Redirect href="/login" />;
  return <Redirect href="/home" />;
}
