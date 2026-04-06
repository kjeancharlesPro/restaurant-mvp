import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { updateMenuItemInSupabase } from "@/lib/menu-supabase";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Configurez Supabase (.env.local) pour modifier la carte." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const patch: { price?: number; image_url?: string | null } = {};

  if ("price" in b) {
    if (typeof b.price !== "number" || !Number.isFinite(b.price) || b.price < 0) {
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
    }
    patch.price = b.price;
  }

  if ("image_url" in b) {
    if (b.image_url === null || b.image_url === "") {
      patch.image_url = null;
    } else if (typeof b.image_url === "string") {
      patch.image_url = b.image_url.trim() || null;
    } else {
      return NextResponse.json({ error: "URL image invalide" }, { status: 400 });
    }
  }

  if (patch.price === undefined && patch.image_url === undefined) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  try {
    const item = await updateMenuItemInSupabase(id, patch);
    if (!item) {
      return NextResponse.json({ error: "Plat introuvable" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
