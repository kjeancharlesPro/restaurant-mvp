export type OrderLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  tableLabel: string | null;
  lines: OrderLine[];
  total: number;
  createdAt: number;
};
