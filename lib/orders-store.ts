import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type OrderLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  tableLabel: string | null;
  lines: OrderLine[];
  total: number;
  createdAt: number;
};

/** Vercel serverless : seul le répertoire temporaire est inscriptible (pas `process.cwd()`). */
function getOrdersFilePath(): string {
  if (process.env.VERCEL) {
    return join(tmpdir(), "restaurant-mvp-orders.json");
  }
  return join(process.cwd(), ".data", "orders.json");
}

function loadOrders(): Order[] {
  const file = getOrdersFilePath();
  try {
    if (!existsSync(file)) return [];
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Order[];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  const file = getOrdersFilePath();
  if (!process.env.VERCEL) {
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
  }
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(orders), "utf8");
  renameSync(tmp, file);
}

export function addOrder(input: {
  tableLabel: string | null;
  lines: OrderLine[];
  total: number;
}): Order {
  const orders = loadOrders();
  const order: Order = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    tableLabel: input.tableLabel,
    lines: input.lines.map((l) => ({ ...l })),
    total: input.total,
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function getOrders(): Order[] {
  return loadOrders().map((o) => ({
    ...o,
    lines: o.lines.map((l) => ({ ...l })),
  }));
}

export function removeOrder(id: string): boolean {
  const orders = loadOrders();
  const i = orders.findIndex((o) => o.id === id);
  if (i === -1) return false;
  orders.splice(i, 1);
  saveOrders(orders);
  return true;
}
