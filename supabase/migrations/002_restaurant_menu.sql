-- Coller dans Supabase SQL Editor (tout le bloc), puis Run.

create table if not exists public.restaurant_menu_items (
  id text primary key,
  name text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists restaurant_menu_items_sort_idx
  on public.restaurant_menu_items (sort_order);

comment on table public.restaurant_menu_items is 'Carte modifiable par l’admin (prix, photos)';

alter table public.restaurant_menu_items enable row level security;

-- Bucket images (lecture publique pour affichage menu)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu',
  'menu',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lecture publique des fichiers du bucket menu (URLs getPublicUrl)
drop policy if exists "menu_images_public_read" on storage.objects;
create policy "menu_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'menu');
