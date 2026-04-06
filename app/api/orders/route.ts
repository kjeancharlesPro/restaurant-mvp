import { NextResponse } from "next/server";
import { addOrder, type OrderLine } from "@/lib/orders";

function isOrderLine(x: unknown): x is OrderLine {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    Number.isFinite(o.price) &&
    typeof o.qty === "number" &&
    Number.isInteger(o.qty) &&
    o.qty > 0
  );
}

export async function POST(request: Request) {
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
  const tableLabel =
    b.tableLabel === null
      ? null
      : typeof b.tableLabel === "string"
        ? b.tableLabel
        : null;
  const total = b.total;
  const linesRaw = b.lines;

  if (typeof total !== "number" || !Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Total invalide" }, { status: 400 });
  }

  if (!Array.isArray(linesRaw) || linesRaw.length === 0) {
    return NextResponse.json({ error: "Lignes invalides" }, { status: 400 });
  }

  const lines: OrderLine[] = [];
  for (const line of linesRaw) {
    if (!isOrderLine(line)) {
      return NextResponse.json({ error: "Ligne invalide" }, { status: 400 });
    }
    lines.push(line);
  }

  const computed = lines.reduce((s, l) => s + l.price * l.qty, 0);
  if (Math.abs(computed - total) > 0.02) {
    return NextResponse.json({ error: "Total incohérent" }, { status: 400 });
  }

  const order = await addOrder({ tableLabel, lines, total });
  return NextResponse.json({ id: order.id });
}
