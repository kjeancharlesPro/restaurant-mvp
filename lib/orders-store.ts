import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
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

const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "orders.json");

function loadOrders(): Order[] {
  try {
    if (!existsSync(DATA_FILE)) return [];
    const raw = readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Order[];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(orders), "utf8");
  renameSync(tmp, DATA_FILE);
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
