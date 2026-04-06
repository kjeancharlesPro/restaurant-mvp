"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MenuItem } from "@/lib/menu";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function AdminMenuEditor({
  initialItems,
  supabaseEnabled,
}: {
  initialItems: MenuItem[];
  supabaseEnabled: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function savePrice(id: string, price: number) {
    if (!supabaseEnabled) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        item?: MenuItem;
      };
      if (!res.ok) {
        window.alert(data.error ?? "Enregistrement impossible");
        return;
      }
      if (data.item) {
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...data.item! } : x)),
        );
      }
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  async function saveImageUrl(id: string, imageUrl: string | null) {
    if (!supabaseEnabled) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        item?: MenuItem;
      };
      if (!res.ok) {
        window.alert(data.error ?? "Enregistrement impossible");
        return;
      }
      if (data.item) {
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...data.item! } : x)),
        );
      }
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  async function uploadFile(id: string, file: File) {
    if (!supabaseEnabled) return;
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.set("itemId", id);
      fd.set("file", file);
      const res = await fetch("/api/admin/menu/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        item?: MenuItem;
      };
      if (!res.ok) {
        window.alert(data.error ?? "Envoi impossible");
        return;
      }
      if (data.item) {
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...data.item! } : x)),
        );
      }
      router.refresh();
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="min-h-full bg-stone-100 px-4 py-8 text-stone-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-800">
              Carte & prix
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Modifiez les prix, collez une URL d’image ou envoyez une photo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              Commandes
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {!supabaseEnabled && (
          <div
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            Supabase n’est pas configuré : la carte affichée aux clients vient du
            code. Ajoutez{" "}
            <code className="rounded bg-amber-100/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            et{" "}
            <code className="rounded bg-amber-100/80 px-1">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            dans <code className="rounded bg-amber-100/80 px-1">.env.local</code>, puis
            exécutez la migration SQL{" "}
            <code className="rounded bg-amber-100/80 px-1">
              002_restaurant_menu.sql
            </code>{" "}
            dans le SQL Editor Supabase.
          </div>
        )}

        <ul className="flex flex-col gap-5">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">
                      Pas d’image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <h2 className="font-semibold text-stone-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <label className="block text-xs font-medium text-stone-600">
                      Prix (€)
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={item.price}
                          key={`${item.id}-${item.price}`}
                          disabled={!supabaseEnabled || savingId === item.id}
                          className="w-28 rounded-lg border border-stone-200 px-2 py-2 text-sm tabular-nums disabled:opacity-50"
                          id={`price-${item.id}`}
                        />
                        <button
                          type="button"
                          disabled={!supabaseEnabled || savingId === item.id}
                          onClick={() => {
                            const el = document.getElementById(
                              `price-${item.id}`,
                            ) as HTMLInputElement | null;
                            const v = el ? Number.parseFloat(el.value) : NaN;
                            if (!Number.isFinite(v) || v < 0) {
                              window.alert("Prix invalide");
                              return;
                            }
                            void savePrice(item.id, v);
                          }}
                          className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingId === item.id ? "…" : "Enregistrer le prix"}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-stone-400">
                        Affiché : {formatPrice(item.price)}
                      </p>
                    </label>
                  </div>

                  <label className="block text-xs font-medium text-stone-600">
                    URL de l’image (optionnel)
                    <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="url"
                        placeholder="https://…"
                        defaultValue={item.imageUrl ?? ""}
                        key={`url-${item.id}-${item.imageUrl ?? ""}`}
                        disabled={!supabaseEnabled || savingId === item.id}
                        className="min-w-0 flex-1 rounded-lg border border-stone-200 px-2 py-2 text-sm disabled:opacity-50"
                        id={`url-${item.id}`}
                      />
                      <button
                        type="button"
                        disabled={!supabaseEnabled || savingId === item.id}
                        onClick={() => {
                          const el = document.getElementById(
                            `url-${item.id}`,
                          ) as HTMLInputElement | null;
                          const raw = el?.value?.trim() ?? "";
                          void saveImageUrl(item.id, raw || null);
                        }}
                        className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Enregistrer l’URL
                      </button>
                    </div>
                  </label>

                  <div>
                    <p className="text-xs font-medium text-stone-600">
                      Envoyer une photo
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={!supabaseEnabled || uploadingId === item.id}
                      className="mt-1 block w-full text-xs text-stone-600 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white disabled:opacity-50"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void uploadFile(item.id, f);
                      }}
                    />
                    {uploadingId === item.id && (
                      <p className="mt-1 text-xs text-stone-500">Envoi en cours…</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
