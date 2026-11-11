import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "../theme";

export function Screen({
  children,
  scroll = true,
  full = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  full?: boolean;
}) {
  return (
    <SafeAreaView style={u.root} edges={full ? ["top", "bottom"] : ["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={u.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={u.wrap}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[u.wrap, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

type BtnProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
};

export function Btn({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: BtnProps) {
  const off = !!disabled || !!loading;
  const color =
    variant === "primary" ? "#fff" : variant === "danger" ? C.danger : C.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={[
        u.btn,
        variant !== "primary" && u.btnPlain,
        off && variant === "primary" && u.btnOff,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[u.btnT, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...p }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={u.label}>{label}</Text>
      <TextInput {...p} placeholderTextColor={C.sub} style={u.input} />
    </View>
  );
}

export const t = StyleSheet.create({
  h1: {
    fontSize: 30,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.8,
    marginTop: 8,
  },
  h2: { fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 6 },
  sub: { color: C.sub, fontSize: 15, lineHeight: 21 },
});

const u = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1 },
  // maxWidth agar tampilan di browser desktop tetap seperti layar HP
  wrap: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 20,
    gap: 14,
  },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnPlain: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: C.line,
  },
  btnOff: { backgroundColor: C.line },
  btnT: { fontSize: 16, fontWeight: "700" },
  label: { color: C.ink, fontWeight: "600", fontSize: 14 },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: C.ink,
  },
});
