import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { Fit, listFits } from "../../src/lib/fits";
import { Screen, t } from "../../src/components/ui";
import { C } from "../../src/theme";

export default function Home() {
  const { session } = useAuth();
  const fullName =
    (session?.user.user_metadata?.full_name as string) || "teman";
  const [fits, setFits] = useState<Fit[]>([]);

  useFocusEffect(
    useCallback(() => {
      let on = true;
      listFits(6)
        .then((f) => on && setFits(f))
        .catch(() => {});
      return () => {
        on = false;
      };
    }, []),
  );

  return (
    <Screen>
      <Text style={t.h1}>Halo, {fullName.split(" ")[0]}</Text>
      <Text style={t.sub}>Mau coba padu padan apa hari ini?</Text>

      <Pressable style={s.cta} onPress={() => router.push("/combine")}>
        <View style={{ flex: 1 }}>
          <Text style={s.ctaT}>Mulai combine</Text>
          <Text style={s.ctaS}>Pilih pakaian, lihat hasilnya di model.</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={36} color="#fff" />
      </Pressable>

      <Text style={t.h2}>Terakhir disimpan</Text>
      {fits.length === 0 ? (
        <View style={s.empty}>
          <Text style={t.sub}>
            Belum ada outfit tersimpan. Buat yang pertama di tab Combine.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {fits.map((f) => (
            <Pressable key={f.id} onPress={() => router.push("/myfit")}>
              <Image
                source={{ uri: f.url }}
                style={s.thumb}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={s.tip}>
        <Text style={s.tipT}>Tips foto</Text>
        <Text style={t.sub}>
          Foto satu pakaian per gambar dengan latar polos. Hasilnya jauh lebih
          rapi.
        </Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.accent,
    borderRadius: 20,
    padding: 20,
    marginVertical: 4,
  },
  ctaT: { color: "#fff", fontSize: 20, fontWeight: "800" },
  ctaS: { color: "#DDE3FF", fontSize: 14, marginTop: 4 },
  empty: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  thumb: { width: 120, height: 160, borderRadius: 14, backgroundColor: C.card },
  tip: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: C.line,
  },
  tipT: { color: C.ink, fontWeight: "700", fontSize: 15 },
});
