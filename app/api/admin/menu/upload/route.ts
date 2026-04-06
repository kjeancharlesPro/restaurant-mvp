import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { updateMenuItemInSupabase, uploadMenuImage } from "@/lib/menu-supabase";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Configurez Supabase pour envoyer des photos." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }

  const itemId = formData.get("itemId");
  const file = formData.get("file");

  if (typeof itemId !== "string" || !itemId.trim()) {
    return NextResponse.json({ error: "itemId requis" }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
  }

  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    return NextResponse.json(
      { error: "Format non pris en charge (JPEG, PNG, WebP, GIF)" },
      { status: 400 },
    );
  }

  const buf = new Uint8Array(await file.arrayBuffer());

  try {
    const url = await uploadMenuImage(itemId.trim(), buf, file.name, type);
    const item = await updateMenuItemInSupabase(itemId.trim(), { image_url: url });
    return NextResponse.json({ url, item });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Échec de l’envoi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
