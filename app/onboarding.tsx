import { useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { Btn, Screen, t } from "../src/components/ui";
import { C } from "../src/theme";

const SLIDES = [
  {
    icon: "shirt-outline",
    title: "Coba dulu, beli kemudian",
    text: "Lihat bagaimana pakaian terlihat di model sebelum kamu memutuskan membeli.",
  },
  {
    icon: "layers-outline",
    title: "Padukan satu set outfit",
    text: "Pilih atasan, bawahan, sepatu, dan jaket. Kami menyatukannya jadi satu tampilan.",
  },
  {
    icon: "bookmark-outline",
    title: "Simpan koleksimu",
    text: "Outfit favorit tersimpan di My Fit dan siap dibuka kapan saja.",
  },
] as const;

export default function Onboarding() {
  const { finishOnboarding } = useAuth();
  const [w, setW] = useState(0);
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  const last = i === SLIDES.length - 1;

  const next = () => {
    if (last) finishOnboarding();
    else ref.current?.scrollToIndex({ index: i + 1 });
  };

  return (
    <Screen scroll={false} full>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
      >
        {w > 0 && (
          <FlatList
            ref={ref}
            data={SLIDES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(s) => s.title}
            onMomentumScrollEnd={(e) =>
              setI(Math.round(e.nativeEvent.contentOffset.x / w))
            }
            renderItem={({ item }) => (
              <View style={[s.slide, { width: w }]}>
                <View style={s.art}>
                  <Ionicons name={item.icon} size={64} color={C.accent} />
                </View>
                <Text style={[t.h1, { textAlign: "center" }]}>
                  {item.title}
                </Text>
                <Text style={[t.sub, { textAlign: "center" }]}>
                  {item.text}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      <View style={s.dots}>
        {SLIDES.map((_, n) => (
          <View key={n} style={[s.dot, n === i && s.dotOn]} />
        ))}
      </View>

      <Btn title={last ? "Mulai" : "Lanjut"} onPress={next} />
      {!last && (
        <Btn title="Lewati" variant="ghost" onPress={finishOnboarding} />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 12,
  },
  art: {
    width: 160,
    height: 160,
    borderRadius: 28,
    backgroundColor: C.card,
    marginBottom: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.line },
  dotOn: { width: 24, backgroundColor: C.accent },
});
