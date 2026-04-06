export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** URL publique (Supabase Storage ou autre). */
  imageUrl: string | null;
};

export const RESTAURANT_NAME = "Le Charentonneau";

export const RESTAURANT_TAGLINE = "Affaire familiale depuis 4 générations";

export const RESTAURANT_BADGE = "Sur place et à emporter";

/** Carte par défaut (fallback sans Supabase ou avant premier sync). */
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: "plateau-que-du-cuit",
    name: "Plateau « que du cuit »",
    description:
      "½ homard frais, 3 crevettes roses, crevettes grises 100 g, bulots 200 g, 2 langoustines.",
    price: 63,
    imageUrl: null,
  },
  {
    id: "huitres-normandes",
    name: "Huîtres normandes n°3 (la douzaine)",
    description: "Huîtres de Normandie servies sur glace.",
    price: 32,
    imageUrl: null,
  },
  {
    id: "bulots-aioli",
    name: "Bulots cuits maison, aïoli",
    description: "300 g, aïoli maison.",
    price: 16,
    imageUrl: null,
  },
  {
    id: "soupe-poisson",
    name: "Soupe de poisson",
    description: "Rouille, gruyère, croûtons à l’ail.",
    price: 14,
    imageUrl: null,
  },
  {
    id: "filet-bar",
    name: "Filet de bar, beurre blanc safrané",
    description: "Poisson frais, sauce beurre blanc safranée.",
    price: 24,
    imageUrl: null,
  },
  {
    id: "tartare-boeuf",
    name: "Tartare de bœuf",
    description: "Préparé à la commande.",
    price: 19,
    imageUrl: null,
  },
  {
    id: "creme-brulee",
    name: "Crème brûlée",
    description: "Dessert fait maison.",
    price: 10,
    imageUrl: null,
  },
];
