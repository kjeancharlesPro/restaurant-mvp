import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/admin-auth";
import { getMenuItems } from "@/lib/menu-service";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import AdminLoginForm from "../admin-login-form";
import AdminMenuEditor from "./admin-menu-editor";

export default async function AdminMenuPage() {
  const cookieStore = await cookies();
  const authed = verifyAdminSessionCookie(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!authed) {
    return <AdminLoginForm />;
  }

  const items = await getMenuItems();
  return (
    <AdminMenuEditor
      initialItems={items}
      supabaseEnabled={isSupabaseConfigured()}
    />
  );
}
