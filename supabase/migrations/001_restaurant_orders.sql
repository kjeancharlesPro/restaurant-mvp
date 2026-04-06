-- Coller TOUT ce fichier dans Supabase → SQL Editor → Run.
-- Ne pas taper le chemin du fichier (ex. supabase/migrations/...) : ce n’est pas du SQL.

-- Table des commandes (lignes en JSON pour coller au modèle MVP)
create table if not exists public.restaurant_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  table_label text,
  lines jsonb not null,
  total numeric(12, 2) not null
);

create index if not exists restaurant_orders_created_at_idx
  on public.restaurant_orders (created_at desc);

comment on table public.restaurant_orders is 'Commandes en ligne (démo restaurant MVP)';

-- La clé service (SUPABASE_SERVICE_ROLE_KEY) utilisée côté serveur contourne la RLS.
-- Si tu passes un jour à la clé anon côté client, ajoute des politiques RLS ici.

alter table public.restaurant_orders enable row level security;
