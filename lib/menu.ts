export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export const RESTAURANT_NAME = "La Tavola";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "margherita",
    name: "Pizza Margherita",
    description: "Tomate San Marzano, mozzarella fior di latte, basilic frais, huile d’olive.",
    price: 12.5,
  },
  {
    id: "carbonara",
    name: "Pasta Carbonara",
    description: "Spaghetti, guanciale, pecorino romano, jaune d’œuf, poivre noir.",
    price: 14.0,
  },
  {
    id: "caprese",
    name: "Insalata Caprese",
    description: "Tomates cerises, mozzarella di bufala, pesto maison, roquette.",
    price: 9.5,
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    description: "Mascarpone, café espresso, cacao amer, biscuits à la cuillère.",
    price: 7.0,
  },
  {
    id: "bruschetta",
    name: "Bruschetta trio",
    description: "Trois tartines : tomate-basilic, champignons, stracciatella.",
    price: 8.5,
  },
];
