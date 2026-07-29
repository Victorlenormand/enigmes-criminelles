-- ═══════════════════════════════════════════════════════════
-- supabase-schema.sql
-- À exécuter UNE SEULE FOIS dans l'éditeur SQL Supabase
-- ═══════════════════════════════════════════════════════════

-- TABLE UTILISATEURS
create table if not exists ec_users (
  id                uuid primary key default gen_random_uuid(),
  pseudo            text not null unique,
  email             text not null unique,
  password_hash     text not null,
  date_inscription  timestamptz default now(),
  consentement      boolean default true,
  consentement_date timestamptz default now()
);

-- TABLE PROGRESSION
create table if not exists ec_progression (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references ec_users(id) on delete cascade,
  affaires_resolues  integer[] default '{}',
  scores             jsonb default '{}',
  grade              text default 'Inspecteur Stagiaire',
  badges             jsonb default '[]',
  streak             jsonb default '{"actuel":0,"maximum":0,"dernierJour":null,"joueAujourdhui":false}',
  historique_jours   text[] default '{}',
  enquetes_speciales jsonb default '{}',
  updated_at         timestamptz default now()
);

-- Index pour les performances
create index if not exists idx_progression_user on ec_progression(user_id);
create index if not exists idx_users_email      on ec_users(email);

-- Sécurité Row Level Security
alter table ec_users      enable row level security;
alter table ec_progression enable row level security;

-- Lecture publique (classement)
create policy "Classement public"
  on ec_users for select using (true);

create policy "Progression publique"
  on ec_progression for select using (true);

-- Insertion libre (inscription)
create policy "Insertion utilisateur"
  on ec_users for insert with check (true);

create policy "Insertion progression"
  on ec_progression for insert with check (true);

-- Modification via app.user_id (RLS personnalisée)
create policy "Modification utilisateur"
  on ec_users for update
  using (id::text = current_setting('app.user_id', true));

create policy "Modification progression"
  on ec_progression for update
  using (user_id::text = current_setting('app.user_id', true));

-- Suppression via app.user_id
create policy "Suppression utilisateur"
  on ec_users for delete
  using (id::text = current_setting('app.user_id', true));
