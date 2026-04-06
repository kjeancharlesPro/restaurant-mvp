import type { Metadata } from "next";
import { RESTAURANT_NAME } from "@/lib/menu";

export const metadata: Metadata = {
  title: `Administration — ${RESTAURANT_NAME}`,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
