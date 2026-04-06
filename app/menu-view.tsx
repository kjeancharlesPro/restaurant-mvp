"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BellRing,
  Check,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  RESTAURANT_BADGE,
  RESTAURANT_NAME,
  RESTAURANT_TAGLINE,
  type MenuItem,
} from "@/lib/menu";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function MenuView({
  tableLabel,
  menuItems,
}: {
  tableLabel: string | null;
  menuItems: MenuItem[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [orderValidated, setOrderValidated] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  const addOne = (id: string) => {
    setQuantities((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
    setOrderValidated(false);
  };

  const removeOne = (id: string) => {
    setQuantities((q) => {
      const next = { ...q };
      const n = (next[id] ?? 0) - 1;
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
    setOrderValidated(false);
  };

  const lines = useMemo(() => {
    return menuItems
      .map((item) => ({
        item,
        qty: quantities[item.id] ?? 0,
      }))
      .filter((l) => l.qty > 0);
  }, [quantities, menuItems]);

  const total = useMemo(() => {
    return lines.reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  }, [lines]);

  const itemCount = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities],
  );

  const simulatePayment = async () => {
    if (lines.length === 0) return;
    setOrderSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableLabel,
          lines: lines.map(({ item, qty }) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty,
          })),
          total,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(
          typeof data.error === "string"
            ? data.error
            : "Impossible d’enregistrer la commande.",
        );
        return;
      }
      setQuantities({});
      setOrderValidated(true);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const closeSheet = () => {
    setSheetOpen(false);
  };

  const callServer = () => {
    const ok = window.confirm(
      "Souhaitez-vous qu’un serveur vienne à votre table ?",
    );
    if (ok) {
      window.alert("Un serveur a été notifié (démo).");
    }
  };

  return (
    <div className="min-h-full bg-stone-100 pb-28 text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-stone-50/95 px-4 py-4 backdrop-blur-md">
        <h1 className="text-center font-serif text-2xl font-semibold tracking-tight text-stone-800">
          {RESTAURANT_NAME}
        </h1>
        <p className="mt-1 text-center text-sm text-stone-600">
          {RESTAURANT_TAGLINE}
        </p>
        <p className="mt-0.5 text-center text-xs text-stone-500">
          {RESTAURANT_BADGE} · Commande en ligne (démo)
        </p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={callServer}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-[0.98]"
          >
            <BellRing className="size-4 shrink-0 text-amber-600" aria-hidden />
            Appeler un serveur
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-5">
        <ul className="flex flex-col gap-3">
          {menuItems.map((dish) => (
            <MenuDishRow
              key={dish.id}
              dish={dish}
              onAdd={() => addOne(dish.id)}
            />
          ))}
        </ul>
      </main>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-5 left-4 right-4 z-40 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-4 text-base font-medium text-white shadow-lg shadow-stone-900/20 transition active:scale-[0.98] sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2"
        aria-label="Voir le panier"
      >
        <ShoppingBag className="size-5 shrink-0" aria-hidden />
        <span>Voir le panier</span>
        <span className="tabular-nums opacity-90">
          · {formatPrice(total)}
        </span>
        {itemCount > 0 && (
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
            {itemCount}
          </span>
        )}
      </button>

      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-stone-900/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
        >
          <button
            type="button"
            className="min-h-[20vh] flex-1 cursor-default"
            aria-label="Fermer"
            onClick={closeSheet}
          />
          <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3">
              <h2 id="cart-title" className="text-lg font-semibold text-stone-900">
                Panier
              </h2>
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
                aria-label="Fermer le panier"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="px-4 py-4">
              {tableLabel && (
                <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-center text-sm font-medium text-amber-950">
                  {tableLabel}
                </p>
              )}

              {lines.length === 0 ? (
                <p className="py-8 text-center text-stone-500">
                  {orderValidated
                    ? "Votre panier est vide. Ajoutez des plats pour une nouvelle commande."
                    : "Votre panier est vide. Ajoutez des plats avec le bouton +."}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {lines.map(({ item, qty }) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/80 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-900">{item.name}</p>
                        <p className="text-sm text-stone-500">
                          {formatPrice(item.price)} × {qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => removeOne(item.id)}
                          className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/80"
                          aria-label={`Retirer un ${item.name}`}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => addOne(item.id)}
                          className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/80"
                          aria-label={`Ajouter un ${item.name}`}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {lines.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                  <span className="text-stone-600">Total</span>
                  <span className="text-xl font-semibold tabular-nums text-stone-900">
                    {formatPrice(total)}
                  </span>
                </div>
              )}

              <section
                className="mt-8 rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-4"
                aria-labelledby="payment-heading"
              >
                <h3
                  id="payment-heading"
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-600"
                >
                  <CreditCard className="size-4" aria-hidden />
                  Paiement (simulation)
                </h3>
                <p className="mt-2 text-xs text-stone-500">
                  Aucune donnée réelle n’est envoyée. Ceci imite uniquement
                  l’étape de validation.
                </p>
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-medium text-stone-600">
                    Nom sur la carte
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      disabled
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-400"
                    />
                  </label>
                  <label className="block text-xs font-medium text-stone-600">
                    Numéro de carte
                    <input
                      type="text"
                      placeholder="•••• •••• •••• ••••"
                      disabled
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-400"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => void simulatePayment()}
                  disabled={lines.length === 0 || orderSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
                >
                  {orderSubmitting ? "Envoi…" : "Valider la commande"}
                </button>
                {orderValidated && (
                  <div
                    className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800"
                    role="status"
                  >
                    <Check className="size-5 shrink-0 text-emerald-600" />
                    Commande enregistrée (démo). Merci et bon appétit !
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuDishRow({ dish, onAdd }: { dish: MenuItem; onAdd: () => void }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      {dish.imageUrl ? (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-stone-900">{dish.name}</h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          {dish.description}
        </p>
        <p className="mt-2 text-base font-medium tabular-nums text-stone-800">
          {formatPrice(dish.price)}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex size-11 shrink-0 items-center justify-center self-start rounded-xl bg-stone-900 text-white shadow-md transition hover:bg-stone-800 active:scale-95"
        aria-label={`Ajouter ${dish.name} au panier`}
      >
        <Plus className="size-5" strokeWidth={2.5} />
      </button>
    </li>
  );
}
