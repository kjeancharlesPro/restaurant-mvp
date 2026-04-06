import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { getOrders } from "@/lib/orders";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json({ orders });
}
