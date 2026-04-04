"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? "Connexion refusée");
        return;
      }
      setPassword("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-full bg-stone-100 px-4 py-16 text-stone-900">
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-center font-serif text-xl font-semibold text-stone-800">
          Administration
        </h1>
        <p className="mt-2 text-center text-sm text-stone-500">
          Accès réservé au restaurateur
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            Mot de passe
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
              required
            />
          </label>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
