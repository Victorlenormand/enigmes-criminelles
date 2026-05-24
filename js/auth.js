/* ═══════════════════════════════════════════════════════════
   auth.js — Authentification Énigmes Criminelles (RGPD)
═══════════════════════════════════════════════════════════ */

/* ── Utilitaires ── */
function sanitize(str) {
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

/* ── Hachage SHA-256 ── */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ── Anti-brute-force (sessionStorage) ── */
function checkLoginAttempts() {
  const key = 'ec_attempts';
  const data = JSON.parse(sessionStorage.getItem(key) || '{"count":0,"lastAttempt":0,"blockedUntil":0}');
  const now = Date.now();
  if (data.blockedUntil > now) {
    const secondes = Math.ceil((data.blockedUntil - now) / 1000);
    throw new Error('BLOCKED_' + secondes);
  }
  return data;
}

function recordFailedAttempt() {
  const key = 'ec_attempts';
  const data = JSON.parse(sessionStorage.getItem(key) || '{"count":0,"lastAttempt":0,"blockedUntil":0}');
  data.count += 1;
  data.lastAttempt = Date.now();
  if (data.count >= 3) {
    data.blockedUntil = Date.now() + 30000;
    data.count = 0;
  }
  sessionStorage.setItem(key, JSON.stringify(data));
}

function resetLoginAttempts() {
  sessionStorage.removeItem('ec_attempts');
}

/* ── Inscription ── */
async function register(pseudo, email, password) {
  try {
    const cleanPseudo = sanitize(pseudo);
    const cleanEmail = sanitize(email).toLowerCase();

    const users = JSON.parse(localStorage.getItem('ec_users') || '[]');

    if (users.find(function(u) { return u.email === cleanEmail; })) {
      throw new Error('EMAIL_EXISTS');
    }
    if (users.find(function(u) { return u.pseudo.toLowerCase() === cleanPseudo.toLowerCase(); })) {
      throw new Error('PSEUDO_EXISTS');
    }

    const newUser = {
      id: crypto.randomUUID(),
      pseudo: cleanPseudo,
      email: cleanEmail,
      passwordHash: await hashPassword(password),
      dateInscription: new Date().toISOString(),
      consentement: true,
      consentementDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('ec_users', JSON.stringify(users));

    /* MailerLite fire-and-forget — ne bloque jamais l'inscription */
    if (typeof subscribeToMailerLite === 'function') {
      subscribeToMailerLite(newUser.email, newUser.pseudo).catch(function(err) {
        console.warn('MailerLite non bloquant:', err && err.message);
      });
    }

    return newUser;

  } catch (error) {
    if (error.message === 'EMAIL_EXISTS' || error.message === 'PSEUDO_EXISTS') {
      throw error;
    }
    console.error('Erreur register:', error);
    throw new Error('REGISTER_ERROR');
  }
}

/* ── Connexion ── */
async function login(email, password, remember) {
  checkLoginAttempts();

  const cleanEmail = sanitize(email).toLowerCase();
  const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
  const hash = await hashPassword(password);
  const user = users.find(u => u.email === cleanEmail && u.passwordHash === hash);

  if (!user) {
    recordFailedAttempt();
    throw new Error('INVALID_CREDENTIALS');
  }

  resetLoginAttempts();

  const now = Date.now();
  const session = {
    userId: user.id,
    pseudo: user.pseudo,
    email: user.email,
    loginDate: new Date().toISOString(),
    remember: remember,
    expiry: remember ? now + 30 * 24 * 60 * 60 * 1000 : now + 2 * 60 * 60 * 1000
  };

  if (remember) {
    localStorage.setItem('ec_session', JSON.stringify(session));
  } else {
    sessionStorage.setItem('ec_session', JSON.stringify(session));
  }

  return session;
}

/* ── Session ── */
function getSession() {
  try {
    const ls = localStorage.getItem('ec_session');
    const ss = sessionStorage.getItem('ec_session');
    return ls ? JSON.parse(ls) : ss ? JSON.parse(ss) : null;
  } catch(e) { return null; }
}

function isLoggedIn() {
  const session = getSession();
  if (!session) return false;
  if (session.expiry && Date.now() > session.expiry) {
    logout();
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('ec_session');
  sessionStorage.removeItem('ec_session');
  window.location.href = 'index.html';
}

function deleteAccount() {
  const session = getSession();
  if (!session) return;
  localStorage.removeItem('ec_progression_' + session.userId);
  const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
  localStorage.setItem('ec_users', JSON.stringify(users.filter(u => u.id !== session.userId)));
  logout();
}

/* ── Progression ── */
function getProgression() {
  const session = getSession();
  if (!session) return { affairesResolues: [], grade: 'Inspecteur Stagiaire' };
  const key = 'ec_progression_' + session.userId;
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify({
      affairesResolues: [],
      grade: 'Inspecteur Stagiaire',
      derniereConnexion: new Date().toISOString()
    }));
  } catch(e) {
    return { affairesResolues: [], grade: 'Inspecteur Stagiaire' };
  }
}

function updateProgression(data) {
  const session = getSession();
  if (!session) return;
  const key = 'ec_progression_' + session.userId;
  const current = getProgression();
  localStorage.setItem(key, JSON.stringify(Object.assign({}, current, data)));
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

  // Hamburger
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

  /* Badge GRATUIT sur "Comment jouer" pour les visiteurs non connectés */
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
