import type { Order, OrderLine } from "@/lib/order-types";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const TABLE = "restaurant_orders";

type OrderRow = {
  id: string;
  created_at: string;
  table_label: string | null;
  lines: OrderLine[] | unknown;
  total: string | number;
};

function parseTotal(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function rowToOrder(row: OrderRow): Order {
  const lines = Array.isArray(row.lines)
    ? (row.lines as OrderLine[]).map((l) => ({ ...l }))
    : [];
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    tableLabel: row.table_label,
    lines,
    total: parseTotal(row.total),
  };
}

export async function getOrdersFromSupabase(): Promise<Order[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, created_at, table_label, lines, total")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders-supabase] getOrders", error);
    throw new Error(error.message);
  }

  return (data as OrderRow[] | null)?.map(rowToOrder) ?? [];
}

export async function addOrderToSupabase(input: {
  tableLabel: string | null;
  lines: OrderLine[];
  total: number;
}): Promise<Order> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      table_label: input.tableLabel,
      lines: input.lines,
      total: input.total,
    })
    .select("id, created_at, table_label, lines, total")
    .single();

  if (error) {
    console.error("[orders-supabase] addOrder", error);
    throw new Error(error.message);
  }

  return rowToOrder(data as OrderRow);
}

export async function removeOrderFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[orders-supabase] removeOrder", error);
    throw new Error(error.message);
  }

  return (data?.length ?? 0) > 0;
}
