import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../lib/supabase";
import { notify } from "../lib/notify";
import { C } from "../theme";
import { Btn, Field, Screen, t } from "./ui";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isReg = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password || (isReg && !name)) {
      return notify("Data belum lengkap", "Isi semua kolom terlebih dahulu.");
    }
    if (isReg && password.length < 6) {
      return notify("Kata sandi terlalu pendek", "Minimal 6 karakter.");
    }
    setLoading(true);
    try {
      if (isReg) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        // Tanpa sesi berarti project Supabase masih meminta konfirmasi email
        if (!data.session) {
          notify(
            "Cek email kamu",
            "Konfirmasi dulu lewat tautan di email, lalu masuk.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      // Berhasil: AuthContext otomatis memindahkan ke halaman utama
    } catch (e: any) {
      notify(isReg ? "Gagal mendaftar" : "Gagal masuk", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen full>
      <Text style={t.h1}>{isReg ? "Buat akun" : "Selamat datang kembali"}</Text>
      <Text style={t.sub}>
        {isReg
          ? "Daftar untuk menyimpan outfit favoritmu."
          : "Masuk untuk melanjutkan."}
      </Text>

      {isReg && (
        <Field
          label="Nama"
          value={name}
          onChangeText={setName}
          placeholder="Nama kamu"
        />
      )}
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
      <Field
        label="Kata sandi"
        value={password}
        onChangeText={setPassword}
        placeholder="Minimal 6 karakter"
        secureTextEntry
        autoCapitalize="none"
      />

      <Btn
        title={isReg ? "Daftar" : "Masuk"}
        onPress={submit}
        loading={loading}
      />

      <Link href={isReg ? "/login" : "/register"} replace style={s.link}>
        {isReg ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
      </Link>
    </Screen>
  );
}

const s = StyleSheet.create({
  link: {
    color: C.accent,
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 8,
  },
});
