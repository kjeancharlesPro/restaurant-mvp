import type { MenuItem } from "@/lib/menu";
import { DEFAULT_MENU_ITEMS } from "@/lib/menu";
import { getMenuItemsFromSupabase } from "@/lib/menu-supabase";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

/** Carte affichée côté client (Supabase si configuré, sinon défauts du code). */
export async function getMenuItems(): Promise<MenuItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_MENU_ITEMS.map((m) => ({ ...m }));
  }
  try {
    return await getMenuItemsFromSupabase();
  } catch {
    return DEFAULT_MENU_ITEMS.map((m) => ({ ...m }));
  }
}
