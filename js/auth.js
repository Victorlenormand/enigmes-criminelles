/* ═══════════════════════════════════════════════════════════
   auth.js — Authentification Énigmes Criminelles (RGPD)
═══════════════════════════════════════════════════════════ */

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function register(pseudo, email, password) {
  const users = JSON.parse(localStorage.getItem('ec_users') || '[]');

  if (users.find(u => u.email === email.toLowerCase().trim())) {
    throw new Error('EMAIL_EXISTS');
  }
  if (users.find(u => u.pseudo.toLowerCase() === pseudo.toLowerCase().trim())) {
    throw new Error('PSEUDO_EXISTS');
  }

  const newUser = {
    id: crypto.randomUUID(),
    pseudo: pseudo.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: await hashPassword(password),
    dateInscription: new Date().toISOString(),
    consentement: true,
    consentementDate: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('ec_users', JSON.stringify(users));

  subscribeToMailerLite(newUser.email, newUser.pseudo);

  return newUser;
}

async function login(email, password, remember) {
  const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
  const hash = await hashPassword(password);
  const user = users.find(u =>
    u.email === email.toLowerCase().trim() &&
    u.passwordHash === hash
  );

  if (!user) throw new Error('INVALID_CREDENTIALS');

  const session = {
    userId: user.id,
    pseudo: user.pseudo,
    email: user.email,
    loginDate: new Date().toISOString(),
    remember: remember
  };

  if (remember) {
    localStorage.setItem('ec_session', JSON.stringify(session));
  } else {
    sessionStorage.setItem('ec_session', JSON.stringify(session));
  }

  return session;
}

function getSession() {
  try {
    const ls = localStorage.getItem('ec_session');
    const ss = sessionStorage.getItem('ec_session');
    return ls ? JSON.parse(ls) : ss ? JSON.parse(ss) : null;
  } catch(e) { return null; }
}

function isLoggedIn() {
  return getSession() !== null;
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

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'inscription.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

function initNav() {
  const session = getSession();
  const navCompte = document.getElementById('nav-compte');
  if (navCompte) {
    if (session) {
      navCompte.textContent = session.pseudo;
      navCompte.href = 'profil.html';
    } else {
      navCompte.textContent = 'Mon compte';
      navCompte.href = 'inscription.html';
    }
  }
  document.querySelectorAll('[data-locked]').forEach(function(link) {
    if (!session) {
      link.innerHTML = link.textContent + ' <span class="lock-icon">🔒</span>';
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'inscription.html?redirect=' + encodeURIComponent(link.getAttribute('href'));
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() { initNav(); });
