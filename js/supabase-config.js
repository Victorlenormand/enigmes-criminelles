/* ═══════════════════════════════════════════════════════════
   supabase-config.js — Client Supabase

   CONFIGURATION SUPABASE — À faire une seule fois

   1. Aller sur https://supabase.com
      Créer un compte gratuit

   2. Créer un nouveau projet :
      Nom : enigmes-criminelles
      Région : West EU (Ireland)

   3. Attendre 2 minutes que le projet démarre

   4. Dans le dashboard Supabase :
      Settings → API → copier :
        Project URL → remplacer SUPABASE_URL_ICI
        anon public key → remplacer SUPABASE_ANON_KEY_ICI

   5. Dans SQL Editor :
      Coller tout le contenu de supabase-schema.sql
      Cliquer Run

   6. Vérifier dans Table Editor que les tables
      ec_users et ec_progression existent bien

   7. Pousser le code sur GitHub

   Le plan gratuit Supabase inclut :
     50 000 lignes
     500 MB de stockage
     2 GB de transfert/mois
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://acmazynakkmhbbkymfjv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mY2chf8gDjPag_hgDs5z1A_Bv2HMF6O';

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* Export global utilisé par auth.js et les scripts inline */
window._supabase = supabaseClient;
