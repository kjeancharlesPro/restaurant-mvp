import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/admin-auth";
import { getOrders } from "@/lib/orders";
import AdminLoginForm from "./admin-login-form";
import AdminOrdersPanel from "./admin-orders-panel";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = verifyAdminSessionCookie(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!authed) {
    return <AdminLoginForm />;
  }

  const orders = await getOrders();
  return <AdminOrdersPanel initialOrders={orders} />;
}
