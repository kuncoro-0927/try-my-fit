import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { countFits } from "../../src/lib/fits";
import { notify } from "../../src/lib/notify";
import { Btn, Field, Screen, t } from "../../src/components/ui";
import { C } from "../../src/theme";

export default function Profile() {
  const { session } = useAuth();
  const user = session?.user;
  const savedName = (user?.user_metadata?.full_name as string) ?? "";
  const [name, setName] = useState(savedName);
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      countFits()
        .then(setCount)
        .catch(() => {});
    }, []),
  );

  const saveName = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    setSaving(false);
    if (error) notify("Gagal menyimpan", error.message);
    else notify("Nama diperbarui");
  };

  return (
    <Screen>
      <View style={s.head}>
        <View style={s.avatar}>
          <Text style={s.avatarT}>
            {(savedName || user?.email || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={t.h2}>{savedName || "Pengguna"}</Text>
        <Text style={t.sub}>{user?.email}</Text>
      </View>

      <View style={s.stat}>
        <Text style={s.statN}>{count}</Text>
        <Text style={t.sub}>outfit tersimpan</Text>
      </View>

      <Field
        label="Nama"
        value={name}
        onChangeText={setName}
        placeholder="Nama kamu"
      />
      <Btn
        title="Simpan nama"
        onPress={saveName}
        loading={saving}
        disabled={!name.trim() || name.trim() === savedName}
      />
      <Btn
        title="Keluar"
        variant="danger"
        onPress={() => supabase.auth.signOut()}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  head: { alignItems: "center", gap: 4, marginTop: 8 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarT: { color: "#fff", fontSize: 34, fontWeight: "800" },
  stat: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  statN: { color: C.ink, fontSize: 32, fontWeight: "800" },
});
