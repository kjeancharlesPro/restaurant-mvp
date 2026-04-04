"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order } from "@/lib/orders-store";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatTime(ts: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(ts));
}

export default function AdminOrdersPanel({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function markServed(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        window.alert("Impossible de retirer la commande.");
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="min-h-full bg-stone-100 px-4 py-8 text-stone-900">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-800">
              Commandes reçues
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Les commandes validées par les clients apparaissent ici.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
          >
            Déconnexion
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/80 py-12 text-center text-stone-500">
            Aucune commande pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-100 pb-3">
                  <p className="font-semibold text-amber-900">
                    {order.tableLabel ?? "Table non renseignée"}
                  </p>
                  <p className="text-xs text-stone-400">
                    {formatTime(order.createdAt)}
                  </p>
                </div>
                <ul className="mt-3 space-y-2">
                  {order.lines.map((line) => (
                    <li
                      key={`${order.id}-${line.id}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-stone-700">
                        <span className="font-medium text-stone-900">
                          {line.name}
                        </span>
                        <span className="text-stone-500">
                          {" "}
                          × {line.qty}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-stone-600">
                        {formatPrice(line.price * line.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className="text-sm font-medium text-stone-600">
                    Total
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-stone-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void markServed(order.id)}
                  disabled={removingId === order.id}
                  className="mt-4 w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingId === order.id
                    ? "Traitement…"
                    : "Marquer comme servi"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
