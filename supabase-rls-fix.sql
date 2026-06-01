-- ═══════════════════════════════════════════════════════════
-- supabase-rls-fix.sql
-- À exécuter dans Supabase SQL Editor (Dashboard → SQL Editor)
-- Couvre les cas B, C, D selon le diagnostic du bouton TEST
-- ═══════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- CAS B — Erreur 42501 : RLS bloque les écritures
-- Désactiver le RLS complètement (sécurité gérée côté JS)
-- ────────────────────────────────────────────────────────────

alter table ec_users       disable row level security;
alter table ec_progression disable row level security;

-- Supprimer toutes les politiques existantes (boucle exhaustive)
do $$ declare
  r record;
begin
  for r in (
    select policyname, tablename
    from pg_policies
    where tablename in ('ec_users', 'ec_progression')
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────
-- CAS C — Erreur 23503 : violation de clé étrangère
-- La contrainte est trop stricte — la rendre différée
-- ────────────────────────────────────────────────────────────

alter table ec_progression
  drop constraint if exists ec_progression_user_id_fkey;

alter table ec_progression
  add constraint ec_progression_user_id_fkey
  foreign key (user_id)
  references ec_users(id)
  on delete cascade
  deferrable initially deferred;

-- ────────────────────────────────────────────────────────────
-- CAS D — Erreur 23505 : violation unique sur upsert
-- Recréer la contrainte UNIQUE proprement (requise pour upsert)
-- ────────────────────────────────────────────────────────────

alter table ec_progression
  drop constraint if exists ec_progression_user_id_key;

alter table ec_progression
  add constraint ec_progression_user_id_key
  unique (user_id);

-- ────────────────────────────────────────────────────────────
-- VÉRIFICATION — exécuter après les corrections ci-dessus
-- ────────────────────────────────────────────────────────────

-- RLS désactivé sur les deux tables ?
select tablename, rowsecurity
from pg_tables
where tablename in ('ec_users', 'ec_progression');
-- rowsecurity doit être "f" (false) pour les deux

-- Contraintes présentes sur ec_progression ?
select conname, contype
from pg_constraint
where conrelid = 'ec_progression'::regclass;
-- Doit voir : ec_progression_user_id_key (u) + ec_progression_user_id_fkey (f)

-- État des données
select
  (select count(*) from ec_users)       as nb_users,
  (select count(*) from ec_progression) as nb_progressions;

-- Progressions avec affaires résolues
select
  u.pseudo,
  p.affaires_resolues,
  p.scores,
  p.grade,
  p.updated_at
from ec_progression p
join ec_users u on u.id = p.user_id
order by p.updated_at desc;
