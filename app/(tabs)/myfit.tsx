import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Fit, deleteFit, listFits } from "../../src/lib/fits";
import { confirmAsync, notify } from "../../src/lib/notify";
import { Btn, Screen, t } from "../../src/components/ui";
import { C } from "../../src/theme";

export default function MyFit() {
  const [fits, setFits] = useState<Fit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Fit | null>(null);

  useFocusEffect(
    useCallback(() => {
      let on = true;
      listFits()
        .then((f) => on && setFits(f))
        .catch((e) => notify("Gagal memuat", e.message))
        .finally(() => on && setLoading(false));
      return () => {
        on = false;
      };
    }, []),
  );

  const remove = async () => {
    if (!sel) return;
    if (
      !(await confirmAsync(
        "Hapus outfit ini?",
        "Tindakan ini tidak bisa dibatalkan.",
      ))
    )
      return;
    try {
      await deleteFit(sel);
      setFits((p) => p.filter((f) => f.id !== sel.id));
      setSel(null);
    } catch (e: any) {
      notify("Gagal menghapus", e.message);
    }
  };

  return (
    <Screen>
      <Text style={t.h1}>My Fit</Text>
      <Text style={t.sub}>Outfit yang sudah kamu simpan.</Text>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
      ) : fits.length === 0 ? (
        <View style={s.empty}>
          <Text style={t.h2}>Belum ada outfit</Text>
          <Text style={t.sub}>
            Buat padu padan pertamamu, lalu simpan dari layar hasil.
          </Text>
          <Btn title="Buat outfit" onPress={() => router.push("/combine")} />
        </View>
      ) : (
        <View style={s.grid}>
          {fits.map((f) => (
            <Pressable key={f.id} style={s.item} onPress={() => setSel(f)}>
              <Image source={{ uri: f.url }} style={s.img} resizeMode="cover" />
            </Pressable>
          ))}
        </View>
      )}

      <Modal
        visible={!!sel}
        transparent
        animationType="fade"
        onRequestClose={() => setSel(null)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            {sel && (
              <Image
                source={{ uri: sel.url }}
                style={s.big}
                resizeMode="contain"
              />
            )}
            <Btn title="Hapus" variant="danger" onPress={remove} />
            <Btn title="Tutup" variant="ghost" onPress={() => setSel(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: {
    width: "47.8%",
    aspectRatio: 0.75,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.card,
  },
  img: { width: "100%", height: "100%" },
  empty: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(27,35,64,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  big: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 14,
    backgroundColor: C.card,
  },
});
