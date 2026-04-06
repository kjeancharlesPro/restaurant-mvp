import type { Order, OrderLine } from "@/lib/order-types";
import {
  addOrderToFile,
  getOrdersFromFile,
  removeOrderFromFile,
} from "@/lib/orders-file-store";
import {
  addOrderToSupabase,
  getOrdersFromSupabase,
  removeOrderFromSupabase,
} from "@/lib/orders-supabase";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export type { Order, OrderLine } from "@/lib/order-types";

/** Liste des commandes (Supabase si configuré, sinon fichier local). */
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    return getOrdersFromSupabase();
  }
  return getOrdersFromFile();
}

export async function addOrder(input: {
  tableLabel: string | null;
  lines: OrderLine[];
  total: number;
}): Promise<Order> {
  if (isSupabaseConfigured()) {
    return addOrderToSupabase(input);
  }
  return addOrderToFile(input);
}

export async function removeOrder(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return removeOrderFromSupabase(id);
  }
  return removeOrderFromFile(id);
}
