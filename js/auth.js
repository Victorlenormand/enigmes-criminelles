/* ═══════════════════════════════════════════════════════════
   auth.js — Authentification Énigmes Criminelles (Supabase)
═══════════════════════════════════════════════════════════ */

/* ── Utilitaires ── */
function sanitize(str) {
  if (!str) return '';
  return String(str).trim().replace(/[<>"'`]/g, '').slice(0, 200);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.toLowerCase().trim());
}

function isValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

function isValidPseudo(pseudo) {
  return /^[a-zA-Z0-9\-_àâäéèêëîïôùûüç ]{3,20}$/.test(pseudo.trim());
}

/* ── SHA-256 pur JS (fallback HTTP) ── */
function sha256pure(str) {
  function rightRotate(v, a) { return (v >>> a) | (v << (32 - a)); }
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
           0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
           0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
           0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
           0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
           0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
           0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
           0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) { bytes.push(c); }
    else if (c < 0x800) { bytes.push(0xc0|(c>>6), 0x80|(c&0x3f)); }
    else { bytes.push(0xe0|(c>>12), 0x80|((c>>6)&0x3f), 0x80|(c&0x3f)); }
  }
  var len = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  var bits = len * 8;
  for (var s = 56; s >= 0; s -= 8) bytes.push((bits / Math.pow(2, s)) & 0xff);
  for (var blk = 0; blk < bytes.length; blk += 64) {
    var w = [];
    for (var j = 0; j < 16; j++) w[j] = (bytes[blk+j*4]<<24)|(bytes[blk+j*4+1]<<16)|(bytes[blk+j*4+2]<<8)|bytes[blk+j*4+3];
    for (var j = 16; j < 64; j++) {
      var s0 = rightRotate(w[j-15],7)^rightRotate(w[j-15],18)^(w[j-15]>>>3);
      var s1 = rightRotate(w[j-2],17)^rightRotate(w[j-2],19)^(w[j-2]>>>10);
      w[j] = (w[j-16]+s0+w[j-7]+s1)|0;
    }
    var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for (var j = 0; j < 64; j++) {
      var S1 = rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25);
      var ch = (e&f)^(~e&g);
      var temp1 = (h+S1+ch+K[j]+w[j])|0;
      var S0 = rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22);
      var maj = (a&b)^(a&c)^(b&c);
      var temp2 = (S0+maj)|0;
      h=g; g=f; f=e; e=(d+temp1)|0; d=c; c=b; b=a; a=(temp1+temp2)|0;
    }
    H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
    H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
  }
  return H.map(function(v) { return (v>>>0).toString(16).padStart(8,'0'); }).join('');
}

async function hashPassword(password) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      var encoder = new TextEncoder();
      var data = encoder.encode(password);
      var hashBuffer = await crypto.subtle.digest('SHA-256', data);
      var hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch(e) {
      console.warn('crypto.subtle indisponible, fallback SHA-256 JS');
    }
  }
  return sha256pure(password);
}

/* ── Anti-brute-force (localStorage) ── */
function checkLoginAttempts() {
  const key = 'ec_attempts';
  try {
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"blockedUntil":0}');
    const now = Date.now();
    if (data.blockedUntil > now) {
      const sec = Math.ceil((data.blockedUntil - now) / 1000);
      throw new Error('BLOCKED_' + sec);
    }
    return data;
  } catch(e) {
    if (e.message && e.message.startsWith('BLOCKED_')) throw e;
    return { count: 0, blockedUntil: 0 };
  }
}

function recordFailedAttempt() {
  const key = 'ec_attempts';
  const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"blockedUntil":0}');
  data.count += 1;
  if (data.count >= 3) {
    data.blockedUntil = Date.now() + 30000;
    data.count = 0;
  }
  localStorage.setItem(key, JSON.stringify(data));
}

function resetLoginAttempts() {
  localStorage.removeItem('ec_attempts');
}

/* ── Session (synchrone — localStorage uniquement) ── */
function getSession() {
  try {
    const raw = localStorage.getItem('ec_session');
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session || !session.userId) return null;

    if (session.expiry && Date.now() > session.expiry) {
      localStorage.removeItem('ec_session');
      return null;
    }

    if (!session.remember && !sessionStorage.getItem('ec_session_temp')) {
      localStorage.removeItem('ec_session');
      return null;
    }

    return session;
  } catch(e) {
    return null;
  }
}

function isLoggedIn() {
  return getSession() !== null;
}

function _saveSession(user, remember) {
  const expiry = remember
    ? Date.now() + 30 * 24 * 60 * 60 * 1000
    : Date.now() + 2 * 60 * 60 * 1000;

  const session = {
    userId:          user.id,
    pseudo:          user.pseudo,
    email:           user.email,
    dateInscription: user.date_inscription || null,
    loginDate:       new Date().toISOString(),
    remember:        remember,
    expiry:          expiry
  };

  localStorage.setItem('ec_session', JSON.stringify(session));

  if (!remember) {
    sessionStorage.setItem('ec_session_temp', 'true');
  }

  return session;
}

function logout() {
  localStorage.removeItem('ec_session');
  localStorage.removeItem('ec_progression_cache');
  sessionStorage.removeItem('ec_session_temp');
  window.location.href = 'index.html';
}

/* ── Inscription ── */
async function register(pseudo, email, password) {
  const db = window._supabase;
  const cleanEmail  = sanitize(email).toLowerCase();
  const cleanPseudo = sanitize(pseudo);

  if (db) {
    const { data: existingEmail } = await db
      .from('ec_users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (existingEmail) throw new Error('EMAIL_EXISTS');

    const { data: existingPseudo } = await db
      .from('ec_users')
      .select('id')
      .ilike('pseudo', cleanPseudo)
      .maybeSingle();
    if (existingPseudo) throw new Error('PSEUDO_EXISTS');

    const hash = await hashPassword(password);

    const { data: newUser, error } = await db
      .from('ec_users')
      .insert({
        pseudo:           cleanPseudo,
        email:            cleanEmail,
        password_hash:    hash,
        consentement:     true,
        consentement_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error('REGISTER_ERROR');
    }

    await db.from('ec_progression').insert({ user_id: newUser.id });

    setTimeout(function() {
      if (typeof subscribeToMailerLite === 'function') {
        subscribeToMailerLite(newUser.email, newUser.pseudo)
          .catch(function(e) { console.warn('MailerLite:', e); });
      }
    }, 0);

    return newUser;
  }

  /* Fallback localStorage si Supabase non configuré */
  const users = _getLocalUsers();
  if (users.find(function(u) { return u && u.email === cleanEmail; }))
    throw new Error('EMAIL_EXISTS');
  if (users.find(function(u) { return u && u.pseudo && u.pseudo.toLowerCase() === cleanPseudo.toLowerCase(); }))
    throw new Error('PSEUDO_EXISTS');

  const hash = await hashPassword(password);
  const newUser = {
    id:               _genId(),
    pseudo:           cleanPseudo,
    email:            cleanEmail,
    password_hash:    hash,
    date_inscription: new Date().toISOString(),
    consentement:     true
  };
  users.push(newUser);
  localStorage.setItem('ec_users_local', JSON.stringify(users));

  setTimeout(function() {
    if (typeof subscribeToMailerLite === 'function') {
      subscribeToMailerLite(newUser.email, newUser.pseudo)
        .catch(function(e) { console.warn('MailerLite:', e); });
    }
  }, 0);

  return newUser;
}

/* ── Connexion ── */
async function login(email, password, remember) {
  checkLoginAttempts();

  const db = window._supabase;
  const cleanEmail = email.toLowerCase().trim();
  const hash = await hashPassword(password);

  if (db) {
    const { data: user, error } = await db
      .from('ec_users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !user || user.password_hash !== hash) {
      recordFailedAttempt();
      throw new Error('INVALID_CREDENTIALS');
    }

    resetLoginAttempts();
    return _saveSession(user, remember);
  }

  /* Fallback localStorage */
  const users = _getLocalUsers();
  const user = users.find(function(u) {
    return u && u.email === cleanEmail && u.password_hash === hash;
  });
  if (!user) {
    recordFailedAttempt();
    throw new Error('INVALID_CREDENTIALS');
  }
  resetLoginAttempts();
  return _saveSession(user, remember);
}

/* ── Suppression de compte ── */
async function deleteAccount() {
  const session = getSession();
  if (!session) return;
  const db = window._supabase;
  if (db) {
    await db.from('ec_users').delete().eq('id', session.userId);
  } else {
    const users = _getLocalUsers().filter(function(u) { return u.id !== session.userId; });
    localStorage.setItem('ec_users_local', JSON.stringify(users));
    localStorage.removeItem('ec_progression_' + session.userId);
  }
  logout();
}

/* ── Modifier pseudo ── */
async function updatePseudo(newPseudo) {
  const session = getSession();
  if (!session) throw new Error('NOT_LOGGED_IN');
  const clean = sanitize(newPseudo);
  const db = window._supabase;

  if (db) {
    const { data: existing } = await db
      .from('ec_users')
      .select('id')
      .ilike('pseudo', clean)
      .neq('id', session.userId)
      .maybeSingle();
    if (existing) throw new Error('PSEUDO_EXISTS');

    const { error } = await db
      .from('ec_users')
      .update({ pseudo: clean })
      .eq('id', session.userId);
    if (error) throw new Error('UPDATE_ERROR');
  } else {
    const users = _getLocalUsers();
    if (users.find(function(u) { return u.id !== session.userId && u.pseudo.toLowerCase() === clean.toLowerCase(); }))
      throw new Error('PSEUDO_EXISTS');
    const idx = users.findIndex(function(u) { return u.id === session.userId; });
    if (idx !== -1) { users[idx].pseudo = clean; localStorage.setItem('ec_users_local', JSON.stringify(users)); }
  }

  const sess = getSession();
  sess.pseudo = clean;
  localStorage.setItem('ec_session', JSON.stringify(sess));
}

/* ── Modifier mot de passe ── */
async function updatePassword(currentPassword, newPassword) {
  const session = getSession();
  if (!session) throw new Error('NOT_LOGGED_IN');

  const currHash = await hashPassword(currentPassword);
  const newHash  = await hashPassword(newPassword);
  const db = window._supabase;

  if (db) {
    const { data: user } = await db
      .from('ec_users')
      .select('password_hash')
      .eq('id', session.userId)
      .maybeSingle();
    if (!user || user.password_hash !== currHash) throw new Error('WRONG_PASSWORD');

    const { error } = await db
      .from('ec_users')
      .update({ password_hash: newHash })
      .eq('id', session.userId);
    if (error) throw new Error('UPDATE_ERROR');
  } else {
    const users = _getLocalUsers();
    const idx = users.findIndex(function(u) { return u.id === session.userId; });
    if (idx === -1 || users[idx].password_hash !== currHash) throw new Error('WRONG_PASSWORD');
    users[idx].password_hash = newHash;
    localStorage.setItem('ec_users_local', JSON.stringify(users));
  }
}

/* ── Progression ── */
const _CACHE_KEY = 'ec_progression_cache';

async function getProgression(forceRefresh) {
  const session = getSession();
  if (!session) return null;

  const CACHE_TTL = 5000;

  if (!forceRefresh) {
    try {
      const cached = JSON.parse(localStorage.getItem(_CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.userId === session.userId) {
        return cached.data;
      }
    } catch(e) {}
  }

  const db = window._supabase;

  if (db) {
    const { data, error } = await db
      .from('ec_progression')
      .select('*')
      .eq('user_id', session.userId)
      .maybeSingle();

    if (error) console.error('getProgression error:', error);

    if (!data && !error) {
      console.log('[getProgression] Aucune ligne — création automatique pour', session.userId);
      const def = _defaultProgression();
      await db.from('ec_progression').upsert({
        user_id:            session.userId,
        affaires_resolues:  def.affairesResolues,
        scores:             def.scores,
        grade:              def.grade,
        badges:             def.badges,
        streak:             def.streak,
        historique_jours:   def.historiqueJours,
        enquetes_speciales: def.enquetesSpeciales
      }, { onConflict: 'user_id' });
    }

    const prog = data ? {
      affairesResolues:  data.affaires_resolues  || [],
      scores:            data.scores             || {},
      grade:             data.grade              || 'Inspecteur Stagiaire',
      badges:            data.badges             || [],
      streak:            data.streak             || { actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false },
      historiqueJours:   data.historique_jours   || [],
      enquetesSpeciales: data.enquetes_speciales || {}
    } : _defaultProgression();

    localStorage.setItem(_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      userId:    session.userId,
      data:      prog
    }));

    return prog;
  }

  /* Fallback localStorage */
  try {
    const raw = localStorage.getItem('ec_progression_' + session.userId);
    const prog = raw ? JSON.parse(raw) : _defaultProgression();
    localStorage.setItem(_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      userId:    session.userId,
      data:      prog
    }));
    return prog;
  } catch(e) {
    return _defaultProgression();
  }
}

async function updateProgression(updates) {
  const session = getSession();
  if (!session) {
    console.error('[updateProgression] Pas de session');
    return false;
  }

  console.log('[updateProgression] Début mise à jour:', Object.keys(updates));

  localStorage.removeItem(_CACHE_KEY);

  const db = window._supabase;

  if (db) {
    /* Lire DIRECTEMENT depuis Supabase — pas via getProgression() pour éviter données périmées */
    const { data: current, error: errRead } = await db
      .from('ec_progression')
      .select('*')
      .eq('user_id', session.userId)
      .maybeSingle();

    if (errRead) {
      console.error('[updateProgression] Erreur lecture:', errRead.code, errRead.message, errRead.details);
    }

    console.log('[updateProgression] Progression actuelle en base:', current);

    const currentMapped = current ? {
      affairesResolues:  current.affaires_resolues  || [],
      scores:            current.scores             || {},
      grade:             current.grade              || 'Inspecteur Stagiaire',
      badges:            current.badges             || [],
      streak:            current.streak             || { actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false },
      historiqueJours:   current.historique_jours   || [],
      enquetesSpeciales: current.enquetes_speciales || {}
    } : _defaultProgression();

    const merged = Object.assign({}, currentMapped, updates);

    console.log('[updateProgression] affairesResolues après fusion:', merged.affairesResolues);
    console.log('[updateProgression] scores après fusion:', Object.keys(merged.scores || {}));
    console.log('[updateProgression] grade:', merged.grade);

    const supabaseData = {
      user_id:            session.userId,
      updated_at:         new Date().toISOString(),
      affaires_resolues:  merged.affairesResolues,
      scores:             merged.scores,
      grade:              merged.grade,
      badges:             merged.badges,
      streak:             merged.streak,
      historique_jours:   merged.historiqueJours,
      enquetes_speciales: merged.enquetesSpeciales
    };

    const { data: result, error } = await db
      .from('ec_progression')
      .upsert(supabaseData, { onConflict: 'user_id', ignoreDuplicates: false })
      .select();

    if (error) {
      console.error('[updateProgression] ERREUR UPSERT:', error.code, error.message, error.details, error.hint);
      return false;
    }

    console.log('[updateProgression] ✓ Sauvegarde confirmée:', result);
    return true;
  }

  /* Fallback localStorage */
  try {
    const key     = 'ec_progression_' + session.userId;
    const raw     = localStorage.getItem(key);
    const current = raw ? JSON.parse(raw) : _defaultProgression();
    const updated = Object.assign({}, current, updates);
    localStorage.setItem(key, JSON.stringify(updated));
    console.log('[updateProgression] ✓ Sauvegardé en localStorage');
    return true;
  } catch(e) {
    console.error('[updateProgression] Erreur localStorage:', e);
    return false;
  }
}

function _defaultProgression() {
  return {
    affairesResolues:  [],
    scores:            {},
    grade:             'Inspecteur Stagiaire',
    badges:            [],
    streak:            { actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false },
    historiqueJours:   [],
    enquetesSpeciales: {}
  };
}

function _getLocalUsers() {
  try { return JSON.parse(localStorage.getItem('ec_users_local') || '[]'); }
  catch(e) { return []; }
}

function _genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID();
  var bytes = new Uint8Array(16);
  (window.crypto || window.msCrypto).getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  var hex = Array.from(bytes).map(function(b) { return b.toString(16).padStart(2,'0'); });
  return hex[0]+hex[1]+hex[2]+hex[3]+'-'+hex[4]+hex[5]+'-'+hex[6]+hex[7]+'-'+hex[8]+hex[9]+'-'+hex[10]+hex[11]+hex[12]+hex[13]+hex[14]+hex[15];
}

function getGrade(n) {
  if (n >= 20) return 'Détective en Chef ★★★★★';
  if (n >= 15) return 'Commissaire Divisionnaire ★★★★';
  if (n >= 10) return 'Commissaire ★★★';
  if (n >= 5)  return 'Inspecteur ★★';
  return 'Inspecteur Stagiaire ★';
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'inscription.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

function initNav() {
  const session = getSession();
  const navCompte = document.getElementById('nav-compte');
  if (navCompte) {
    if (session && isLoggedIn()) {
      navCompte.textContent = session.pseudo;
      navCompte.href = 'profil.html';
    } else {
      navCompte.textContent = 'Mon compte';
      navCompte.href = 'inscription.html';
    }
  }

  const hamburger    = document.getElementById('nav-hamburger');
  const mobilePanel  = document.getElementById('nav-mobile-panel');
  const mobileCompte = document.getElementById('nav-mobile-compte');
  if (hamburger && mobilePanel) {
    hamburger.addEventListener('click', function() {
      const isOpen = mobilePanel.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.textContent = isOpen ? '✕' : '☰';
    });
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !mobilePanel.contains(e.target)) {
        mobilePanel.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
      }
    }, { capture: true });
  }
  if (mobileCompte && session && isLoggedIn()) {
    mobileCompte.textContent = session.pseudo;
    mobileCompte.href = 'profil.html';
  }

  if (!isLoggedIn()) {
    var linkTuto = document.querySelector('a[data-page="tutoriel"]');
    if (linkTuto) {
      var badgeGratuit = document.createElement('sup');
      badgeGratuit.className = 'nav-gratuit';
      badgeGratuit.textContent = 'GRATUIT';
      linkTuto.appendChild(badgeGratuit);
    }
  }
}

document.addEventListener('DOMContentLoaded', function() { initNav(); });

/* ── Migration comptes localStorage → Supabase ── */
async function migrerCompteLocalVersSupabase() {
  const session = getSession();
  if (!session) return false;

  const db = window._supabase;
  if (!db) return false;

  /* Vérifier si l'utilisateur existe déjà dans Supabase */
  const { data: existing } = await db
    .from('ec_users')
    .select('id')
    .eq('id', session.userId)
    .maybeSingle();

  if (existing) return true;

  console.warn('Compte local non trouvé dans Supabase. Migration en cours...');

  /* Récupérer les données locales (ancien format ec_users) */
  const localUsers = JSON.parse(localStorage.getItem('ec_users') || '[]');
  const localUser  = localUsers.find(function(u) { return u && u.id === session.userId; });

  if (!localUser) {
    console.error('Données locales introuvables. Déconnexion nécessaire.');
    logout();
    return false;
  }

  /* Insérer dans ec_users avec l'ID existant */
  const { error: errUser } = await db
    .from('ec_users')
    .insert({
      id:               localUser.id,
      pseudo:           localUser.pseudo,
      email:            localUser.email,
      password_hash:    localUser.passwordHash,
      date_inscription: localUser.dateInscription || new Date().toISOString(),
      consentement:     true,
      consentement_date: localUser.dateInscription || new Date().toISOString()
    });

  if (errUser) {
    console.error('Erreur migration user:', errUser);
    return false;
  }

  /* Migrer la progression locale */
  const localProg = JSON.parse(
    localStorage.getItem('ec_progression_' + session.userId) || '{}'
  );

  const { error: errProg } = await db
    .from('ec_progression')
    .upsert({
      user_id:           localUser.id,
      affaires_resolues: localProg.affairesResolues  || [],
      scores:            localProg.scores            || {},
      grade:             localProg.grade             || 'Inspecteur Stagiaire',
      badges:            localProg.badges            || [],
      streak:            localProg.streak            || { actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false },
      historique_jours:  localProg.historiqueJours   || [],
      enquetes_speciales: localProg.enquetesSpeciales || {}
    }, { onConflict: 'user_id' });

  if (errProg) {
    console.error('Erreur migration progression:', errProg);
    return false;
  }

  localStorage.removeItem(_CACHE_KEY);
  console.log('✓ Migration réussie pour:', localUser.pseudo);
  return true;
}

/* ── Diagnostic Supabase (localhost uniquement) ── */
async function diagnosticSupabase() {
  if (window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !window.location.hostname.includes('github') &&
      window.location.hostname !== 'enigmes-criminelles.fr') {
    /* Actif aussi sur le domaine de prod pour déboguer */
  }

  const db = window._supabase;
  console.group('=== DIAGNOSTIC SUPABASE ===');

  console.log('SUPABASE_URL:',
    typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : 'NON DÉFINI');
  console.log('Client Supabase:', db ? 'OK' : 'NON CRÉÉ');

  const session = getSession();
  console.log('Session:', session);

  if (!session) {
    console.error('PAS DE SESSION — utilisateur non connecté');
    console.groupEnd();
    return;
  }

  if (!db) {
    console.error('Client Supabase non disponible');
    console.groupEnd();
    return;
  }

  const { data: user, error: errUser } = await db
    .from('ec_users').select('id, pseudo, email')
    .eq('id', session.userId).maybeSingle();
  console.log('User dans Supabase:', user);
  if (errUser) console.error('Erreur user:', errUser);
  if (!user) console.error('UTILISATEUR INTROUVABLE — compte créé avant migration.');

  const { data: prog, error: errProg } = await db
    .from('ec_progression').select('*')
    .eq('user_id', session.userId).maybeSingle();
  console.log('Progression dans Supabase:', prog);
  if (errProg) console.error('Erreur progression:', errProg);
  if (!prog) console.error('PROGRESSION INTROUVABLE — ligne ec_progression manquante.');

  if (prog) {
    const { error: errWrite } = await db
      .from('ec_progression')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', session.userId);
    if (errWrite) console.error('ÉCRITURE IMPOSSIBLE (RLS?):', errWrite);
    else console.log('✓ Écriture Supabase fonctionne');
  }

  const { data: allUsers, error: errAll } = await db
    .from('ec_users').select('id, pseudo');
  console.log('Tous les users Supabase:', allUsers);
  if (errAll) console.error('Erreur lecture users:', errAll);

  console.groupEnd();
}
