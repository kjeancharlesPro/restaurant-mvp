import type { MenuItem } from "@/lib/menu";
import { DEFAULT_MENU_ITEMS } from "@/lib/menu";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const TABLE = "restaurant_menu_items";
const BUCKET = "menu";

type MenuRow = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  image_url: string | null;
  sort_order: number;
};

function parsePrice(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function rowToItem(row: MenuRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parsePrice(row.price),
    imageUrl: row.image_url,
  };
}

export async function seedMenuItemsIfEmpty(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error: countErr } = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.error("[menu-supabase] count", countErr);
    return;
  }

  if ((count ?? 0) > 0) return;

  const rows = DEFAULT_MENU_ITEMS.map((item, i) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.imageUrl,
    sort_order: i,
  }));

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("[menu-supabase] seed", error);
  }
}

export async function getMenuItemsFromSupabase(): Promise<MenuItem[]> {
  await seedMenuItemsIfEmpty();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, name, description, price, image_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[menu-supabase] getMenuItems", error);
    throw new Error(error.message);
  }

  const rows = (data as MenuRow[] | null) ?? [];
  if (rows.length === 0) {
    return DEFAULT_MENU_ITEMS.map((m) => ({ ...m }));
  }

  return rows.map(rowToItem);
}

export async function updateMenuItemInSupabase(
  id: string,
  patch: { price?: number; image_url?: string | null },
): Promise<MenuItem | null> {
  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.price !== undefined) updates.price = patch.price;
  if (patch.image_url !== undefined) updates.image_url = patch.image_url;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("id, name, description, price, image_url, sort_order")
    .single();

  if (error) {
    console.error("[menu-supabase] update", error);
    throw new Error(error.message);
  }
  if (!data) return null;
  return rowToItem(data as MenuRow);
}

export async function uploadMenuImage(
  itemId: string,
  bytes: Uint8Array,
  filename: string,
  contentType: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  const path = `${itemId}/${Date.now()}${ext || ".jpg"}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: contentType || "image/jpeg",
      upsert: true,
    });

  if (upErr) {
    console.error("[menu-supabase] upload", upErr);
    throw new Error(upErr.message);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}
