/* ═══════════════════════════════════════════════════════════
   auth.js — Authentification Énigmes Criminelles (RGPD)
═══════════════════════════════════════════════════════════ */

/* ── Utilitaires ── */
function sanitize(str) {
  if (!str) return '';
  return String(str).trim().replace(/[<>"'`]/g, '').slice(0, 200);
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  var bytes = new Uint8Array(16);
  (window.crypto || window.msCrypto).getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  var hex = Array.from(bytes).map(function(b) { return b.toString(16).padStart(2, '0'); });
  return hex[0]+hex[1]+hex[2]+hex[3]+'-'+hex[4]+hex[5]+'-'+hex[6]+hex[7]+'-'+hex[8]+hex[9]+'-'+hex[10]+hex[11]+hex[12]+hex[13]+hex[14]+hex[15];
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

/* ── SHA-256 pur JS (fallback si crypto.subtle indisponible — HTTP) ── */
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

/* ── Hachage SHA-256 ── */
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

/* ── Gestion des utilisateurs ── */
function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem('ec_users') || '[]');
  } catch(e) {
    console.error('getAllUsers error:', e);
    return [];
  }
}

function saveAllUsers(users) {
  try {
    localStorage.setItem('ec_users', JSON.stringify(users));
    return true;
  } catch(e) {
    console.error('saveAllUsers error:', e);
    return false;
  }
}

/* ── Diagnostic (localhost uniquement) ── */
function diagnosticAuth() {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
  console.group('=== DIAGNOSTIC AUTH ===');
  var users = getAllUsers();
  console.log('Comptes enregistrés :', users.length);
  users.forEach(function(u) {
    console.log(' -', u.pseudo, '/', u.email, '/ inscrit le', u.dateInscription);
  });
  var sessionLS = localStorage.getItem('ec_session');
  var sessionSS = sessionStorage.getItem('ec_session');
  console.log('Session localStorage :', sessionLS ? JSON.parse(sessionLS) : 'vide');
  console.log('Session sessionStorage :', sessionSS ? JSON.parse(sessionSS) : 'vide');
  var session = getSession();
  console.log('getSession() retourne :', session);
  console.log('isLoggedIn() :', isLoggedIn());
  if (session) {
    var now = Date.now();
    var expiry = session.expiry;
    console.log('Expiry dans :', expiry ? Math.round((expiry - now) / 60000) + ' minutes' : 'pas défini');
    if (expiry && now > expiry) console.error('SESSION EXPIRÉE !');
  }
  var prog = getProgression();
  console.log('Progression :', prog);
  console.groupEnd();
}

/* ── Anti-brute-force (localStorage — résistant à la fermeture de fenêtre) ── */
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

/* ── Inscription ── */
async function register(pseudo, email, password) {
  const cleanEmail = sanitize(email).toLowerCase();
  const cleanPseudo = sanitize(pseudo);

  const users = getAllUsers();

  if (users.find(function(u) { return u && u.email === cleanEmail; })) {
    throw new Error('EMAIL_EXISTS');
  }
  if (users.find(function(u) { return u && u.pseudo && u.pseudo.toLowerCase() === cleanPseudo.toLowerCase(); })) {
    throw new Error('PSEUDO_EXISTS');
  }

  const hash = await hashPassword(password);

  const newUser = {
    id: generateId(),
    pseudo: cleanPseudo,
    email: cleanEmail,
    passwordHash: hash,
    dateInscription: new Date().toISOString(),
    consentement: true,
    consentementDate: new Date().toISOString()
  };

  users.push(newUser);
  const saved = saveAllUsers(users);
  if (!saved) throw new Error('STORAGE_ERROR');

  console.log('Compte créé et sauvegardé :', newUser.pseudo, newUser.email);

  setTimeout(function() {
    if (typeof subscribeToMailerLite === 'function') {
      subscribeToMailerLite(newUser.email, newUser.pseudo).catch(function(e) {
        console.warn('MailerLite silencieux:', e);
      });
    }
  }, 0);

  return newUser;
}

/* ── Connexion ── */
async function login(email, password, remember) {
  checkLoginAttempts();

  const cleanEmail = email.toLowerCase().trim();
  const users = getAllUsers();

  console.log('Tentative connexion pour:', cleanEmail, '| Comptes disponibles:', users.length);

  const hash = await hashPassword(password);
  const user = users.find(function(u) { return u && u.email === cleanEmail && u.passwordHash === hash; });

  if (!user) {
    recordFailedAttempt();
    console.warn('Connexion échouée pour:', cleanEmail);
    throw new Error('INVALID_CREDENTIALS');
  }

  resetLoginAttempts();

  const expiry = remember
    ? Date.now() + 30 * 24 * 60 * 60 * 1000
    : Date.now() + 2 * 60 * 60 * 1000;

  const session = {
    userId: user.id,
    pseudo: user.pseudo,
    email: user.email,
    loginDate: new Date().toISOString(),
    remember: remember,
    expiry: expiry
  };

  /* Toujours localStorage pour la persistance entre pages */
  localStorage.setItem('ec_session', JSON.stringify(session));

  /* Flag sessionStorage : si fenêtre fermée sans remember, la session est invalidée */
  if (!remember) {
    sessionStorage.setItem('ec_session_temp', 'true');
  }

  console.log('Session créée pour:', user.pseudo, '| Expire dans:', remember ? '30 jours' : '2 heures');

  return session;
}

/* ── Session ── */
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
    console.error('getSession error:', e);
    return null;
  }
}

function isLoggedIn() {
  return getSession() !== null;
}

function logout() {
  localStorage.removeItem('ec_session');
  sessionStorage.removeItem('ec_session_temp');
  window.location.href = 'index.html';
}

function deleteAccount() {
  const session = getSession();
  if (!session) return;
  const users = getAllUsers().filter(function(u) { return u.id !== session.userId; });
  saveAllUsers(users);
  localStorage.removeItem('ec_progression_' + session.userId);
  logout();
}

/* ── Progression ── */
function getProgression() {
  const session = getSession();
  if (!session) return null;

  const key = 'ec_progression_' + session.userId;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const defaut = {
        affairesResolues: [],
        scores: {},
        grade: 'Inspecteur Stagiaire',
        badges: [],
        streak: { actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false },
        historiqueJours: []
      };
      localStorage.setItem(key, JSON.stringify(defaut));
      return defaut;
    }
    return JSON.parse(raw);
  } catch(e) {
    console.error('getProgression error:', e);
    return null;
  }
}

function updateProgression(data) {
  const session = getSession();
  if (!session) return false;

  const key = 'ec_progression_' + session.userId;
  try {
    const current = getProgression() || {};
    const updated = Object.assign({}, current, data);
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch(e) {
    console.error('updateProgression error:', e);
    return false;
  }
}

function getGrade(n) {
  if (n >= 20) return 'Détective en Chef ★★★★★';
  if (n >= 15) return 'Commissaire Divisionnaire ★★★★';
  if (n >= 10) return 'Commissaire ★★★';
  if (n >= 5)  return 'Inspecteur ★★';
  return 'Inspecteur Stagiaire ★';
}

/* ── Protection des pages ── */
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'inscription.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

/* ── Navigation dynamique ── */
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

  const hamburger = document.getElementById('nav-hamburger');
  const mobilePanel = document.getElementById('nav-mobile-panel');
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
  if (mobileCompte) {
    if (session && isLoggedIn()) {
      mobileCompte.textContent = session.pseudo;
      mobileCompte.href = 'profil.html';
    }
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
