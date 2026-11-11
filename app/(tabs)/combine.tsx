import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Images, tryOn } from "../../src/lib/api";
import { saveFit } from "../../src/lib/fits";
import { notify } from "../../src/lib/notify";
import { Btn, Screen, t } from "../../src/components/ui";
import { C } from "../../src/theme";

const SLOTS: { key: keyof Images; title: string; hint: string }[] = [
  { key: "top", title: "Atasan", hint: "Kaos, kemeja" },
  { key: "bottom", title: "Bawahan", hint: "Celana, rok" },
  { key: "shoes", title: "Sepatu", hint: "Sneakers, boots" },
  { key: "jacket", title: "Jaket", hint: "Opsional" },
];

export default function Combine() {
  const [mode, setMode] = useState<"model" | "me">("model");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [images, setImages] = useState<Images>({});
  const [result, setResult] = useState<string>();
  const [left, setLeft] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const pick = async (key: keyof Images) => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
    });
    if (!r.canceled) setImages((p) => ({ ...p, [key]: r.assets[0].uri }));
  };
  const clear = (key: keyof Images) =>
    setImages((p) => ({ ...p, [key]: undefined }));
  const switchMode = (m: "model" | "me") => {
    setMode(m);
    if (m === "model") clear("person");
  };

  const count = Object.values(images).filter(Boolean).length;
  const garments = count - (images.person ? 1 : 0);
  const tooMany = count > 4;
  const ready =
    garments >= 2 && !tooMany && (mode === "model" || !!images.person);

  const run = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const r = await tryOn(images, gender);
      setResult(r.image);
      setLeft(r.left);
    } catch (e: any) {
      notify("Gagal membuat outfit", e.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveFit(result, gender);
      setSaved(true);
      notify("Tersimpan", "Outfit ini ada di My Fit.");
    } catch (e: any) {
      notify("Gagal menyimpan", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Layar hasil ----------
  if (result) {
    return (
      <Screen>
        <Image source={{ uri: result }} style={s.result} resizeMode="contain" />
        {left !== undefined && (
          <Text style={t.sub}>Sisa {left} percobaan hari ini</Text>
        )}
        <Btn
          title={saved ? "Tersimpan di My Fit" : "Simpan ke My Fit"}
          onPress={save}
          loading={saving}
          disabled={saved}
        />
        <Btn
          title="Buat ulang"
          variant="ghost"
          onPress={run}
          loading={loading}
        />
        <Btn
          title="Ganti outfit"
          variant="ghost"
          onPress={() => setResult(undefined)}
        />
      </Screen>
    );
  }

  // ---------- Layar pilih outfit ----------
  return (
    <Screen>
      <Text style={t.h1}>Combine</Text>
      <Text style={t.sub}>
        Tambahkan foto pakaianmu, lalu lihat hasilnya di model.
      </Text>

      <View style={s.seg}>
        {(["model", "me"] as const).map((m) => (
          <Pressable
            key={m}
            style={[s.segI, mode === m && s.segOn]}
            onPress={() => switchMode(m)}
          >
            <Text style={[s.segT, mode === m && s.segTOn]}>
              {m === "model" ? "Model AI" : "Foto saya"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "model" ? (
        <View style={s.seg}>
          {(["female", "male"] as const).map((g) => (
            <Pressable
              key={g}
              style={[s.segI, gender === g && s.segOn]}
              onPress={() => setGender(g)}
            >
              <Text style={[s.segT, gender === g && s.segTOn]}>
                {g === "female" ? "Wanita" : "Pria"}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Slot
          title="Foto seluruh badan"
          hint="Berdiri tegak, latar polos"
          uri={images.person}
          onPick={() => pick("person")}
          onClear={() => clear("person")}
          wide
        />
      )}

      <View style={s.grid}>
        {SLOTS.map((sl) => (
          <Slot
            key={sl.key}
            title={sl.title}
            hint={sl.hint}
            uri={images[sl.key]}
            onPick={() => pick(sl.key)}
            onClear={() => clear(sl.key)}
          />
        ))}
      </View>

      {tooMany && (
        <Text style={s.warn}>
          Maksimal 4 gambar sekaligus. Lepas jaket atau foto diri untuk lanjut.
        </Text>
      )}

      <Btn
        title="Lihat hasilnya"
        onPress={run}
        loading={loading}
        disabled={!ready}
      />
      {loading && (
        <Text style={t.sub}>Sedang memadukan outfit, sekitar 10 detik.</Text>
      )}
    </Screen>
  );
}

function Slot(p: {
  title: string;
  hint: string;
  uri?: string;
  wide?: boolean;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <Pressable
      style={[s.slot, p.wide && s.slotWide, !p.uri && s.slotEmpty]}
      onPress={p.onPick}
    >
      {p.uri ? (
        <>
          <Image source={{ uri: p.uri }} style={s.slotImg} resizeMode="cover" />
          <Pressable style={s.x} onPress={p.onClear} hitSlop={8}>
            <Text style={s.xT}>Hapus</Text>
          </Pressable>
        </>
      ) : (
        <View style={s.slotIn}>
          <Text style={s.slotT}>{p.title}</Text>
          <Text style={s.slotH}>{p.hint}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  seg: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: C.line,
  },
  segI: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  segOn: { backgroundColor: C.ink },
  segT: { color: C.sub, fontWeight: "600" },
  segTOn: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  slot: {
    width: "47.8%",
    aspectRatio: 0.85,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.card,
  },
  slotWide: { width: "100%", aspectRatio: 1.6 },
  slotEmpty: { borderWidth: 1.5, borderStyle: "dashed", borderColor: C.line },
  slotIn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  slotT: { color: C.ink, fontSize: 17, fontWeight: "700" },
  slotH: { color: C.sub, fontSize: 13, marginTop: 4 },
  slotImg: { width: "100%", height: "100%" },
  x: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: C.ink,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  xT: { color: "#fff", fontSize: 12, fontWeight: "600" },
  warn: { color: C.danger, fontSize: 14 },
  result: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 18,
    backgroundColor: C.card,
  },
});
