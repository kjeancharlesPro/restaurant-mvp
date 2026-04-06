import MenuView from "@/app/menu-view";
import { getMenuItems } from "@/lib/menu-service";
import { tableLabelFromSearchParam } from "@/lib/table-label";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const sp = await searchParams;
  const tableLabel = tableLabelFromSearchParam(sp.table);
  const menuItems = await getMenuItems();

  return <MenuView tableLabel={tableLabel} menuItems={menuItems} />;
}
