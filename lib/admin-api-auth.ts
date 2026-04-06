import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";

/** 401 si la session admin est absente ou invalide. */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}
