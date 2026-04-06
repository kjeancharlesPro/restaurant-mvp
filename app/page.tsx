import MenuView from "@/app/menu-view";
import { getMenuItems } from "@/lib/menu-service";

export default async function Home() {
  const menuItems = await getMenuItems();
  return <MenuView tableLabel={null} menuItems={menuItems} />;
}
