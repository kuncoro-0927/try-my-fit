import { Platform } from "react-native";
import { supabase } from "./supabase";

export type Images = {
  person?: string;
  top?: string;
  jacket?: string;
  bottom?: string;
  shoes?: string;
};

const API = process.env.EXPO_PUBLIC_API_URL!;

async function buildForm(images: Images, gender: "male" | "female") {
  const fd = new FormData();
  for (const [k, uri] of Object.entries(images) as [
    string,
    string | undefined,
  ][]) {
    if (!uri) continue;
    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob(); // browser: kirim sebagai Blob
      fd.append(k, blob, `${k}.jpg`);
    } else {
      fd.append(k, { uri, name: `${k}.jpg`, type: "image/jpeg" } as any); // HP
    }
  }
  fd.append("gender", gender);
  return fd;
}

export async function tryOn(
  images: Images,
  gender: "male" | "female",
): Promise<{ image: string; left: number }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sesi berakhir. Silakan masuk lagi.");

  const fd = await buildForm(images, gender);

  // XMLHttpRequest dipakai karena fetch di Expo terbaru menolak format file { uri, name, type }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/tryon`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`); // jangan set Content-Type manual
    xhr.timeout = 90000;

    xhr.onload = () => {
      let json: any = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else reject(new Error(json.error ?? "Terjadi kesalahan. Coba lagi."));
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Tidak bisa terhubung ke server. Cek koneksi dan alamat backend.",
        ),
      );
    xhr.ontimeout = () =>
      reject(new Error("Server terlalu lama merespons. Coba lagi."));

    xhr.send(fd);
  });
}
