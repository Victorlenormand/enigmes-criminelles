-- ═══════════════════════════════════════════════════════════
-- supabase-rls-fix.sql
-- À exécuter dans Supabase SQL Editor si la progression
-- ne se sauvegarde pas ou si le classement est vide.
-- ═══════════════════════════════════════════════════════════

-- 1. Supprimer les anciennes politiques RLS restrictives
drop policy if exists "Classement public"          on ec_users;
drop policy if exists "Progression publique"        on ec_progression;
drop policy if exists "Insertion utilisateur"       on ec_users;
drop policy if exists "Modification utilisateur"    on ec_users;
drop policy if exists "Insertion progression"       on ec_progression;
drop policy if exists "Modification progression"    on ec_progression;
drop policy if exists "Suppression utilisateur"     on ec_users;
drop policy if exists "Lecture publique users"      on ec_users;
drop policy if exists "Lecture publique progression" on ec_progression;
drop policy if exists "Ecriture users"              on ec_users;
drop policy if exists "Modification users"          on ec_users;
drop policy if exists "Suppression users"           on ec_users;
drop policy if exists "Ecriture progression"        on ec_progression;
drop policy if exists "Upsert progression"          on ec_progression;

-- 2. Ajouter une contrainte UNIQUE sur user_id (nécessaire pour upsert)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ec_progression_user_id_key'
  ) then
    alter table ec_progression add constraint ec_progression_user_id_key unique (user_id);
  end if;
end $$;

-- 3. Nouvelles politiques permissives (sécurité gérée côté JS)

-- Lecture publique pour le classement
create policy "Lecture publique users"
  on ec_users for select using (true);

create policy "Lecture publique progression"
  on ec_progression for select using (true);

-- Écriture complète via anon key
create policy "Ecriture users"
  on ec_users for insert with check (true);

create policy "Modification users"
  on ec_users for update using (true);

create policy "Suppression users"
  on ec_users for delete using (true);

-- Progression : toutes opérations permises
create policy "Toutes operations progression"
  on ec_progression for all
  using (true)
  with check (true);
