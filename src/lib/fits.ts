import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

export type Fit = {
  id: string;
  image_path: string;
  created_at: string;
  url?: string;
};

export async function listFits(limit?: number): Promise<Fit[]> {
  let q = supabase
    .from("fits")
    .select("id,image_path,created_at")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as Fit[];
  if (!rows.length) return [];

  // Bucket privat, jadi tiap gambar butuh tautan bertanda tangan (berlaku 1 jam)
  const { data: signed } = await supabase.storage.from("fits").createSignedUrls(
    rows.map((r) => r.image_path),
    3600,
  );
  const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({
    ...r,
    url: byPath.get(r.image_path) ?? undefined,
  }));
}

export async function saveFit(dataUrl: string, gender: string) {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error("Sesi berakhir. Silakan masuk lagi.");

  const path = `${uid}/${Date.now()}.png`;
  const up = await supabase.storage
    .from("fits")
    .upload(path, decode(dataUrl.split(",")[1]), { contentType: "image/png" });
  if (up.error) throw up.error;

  const ins = await supabase.from("fits").insert({ image_path: path, gender });
  if (ins.error) {
    await supabase.storage.from("fits").remove([path]);
    throw ins.error;
  }
}

export async function deleteFit(fit: Fit) {
  await supabase.storage.from("fits").remove([fit.image_path]);
  const { error } = await supabase.from("fits").delete().eq("id", fit.id);
  if (error) throw error;
}

export async function countFits(): Promise<number> {
  const { count } = await supabase
    .from("fits")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}
