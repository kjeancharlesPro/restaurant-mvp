import MenuView from "@/app/menu-view";
import { tableLabelFromSearchParam } from "@/lib/table-label";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const sp = await searchParams;
  const tableLabel = tableLabelFromSearchParam(sp.table);

  return <MenuView tableLabel={tableLabel} />;
}
