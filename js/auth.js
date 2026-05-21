/* ═══════════════════════════════════════════════════════════
   auth.js — Gestion de session Énigmes Criminelles
═══════════════════════════════════════════════════════════ */

var EC_USER_KEY = 'ec_user';

function isLoggedIn() {
  return !!localStorage.getItem(EC_USER_KEY);
}

function getUser() {
  try { return JSON.parse(localStorage.getItem(EC_USER_KEY)); } catch(e) { return null; }
}

function login(email, nom) {
  var user = {
    nom: nom || 'Enquêteur',
    email: email,
    dateInscription: new Date().toISOString(),
    affairesResolues: [],
    grade: 'Inspecteur Stagiaire'
  };
  localStorage.setItem(EC_USER_KEY, JSON.stringify(user));
  return user;
}

function logout() {
  localStorage.removeItem(EC_USER_KEY);
  window.location.href = 'index.html';
}

function getGrade(n) {
  if (n >= 20) return 'Détective en Chef ★★★★★';
  if (n >= 15) return 'Commissaire Divisionnaire ★★★★';
  if (n >= 10) return 'Commissaire ★★★';
  if (n >= 5)  return 'Inspecteur ★★';
  return 'Inspecteur Stagiaire ★';
}

function updateUser(data) {
  var user = getUser() || {};
  Object.assign(user, data);
  localStorage.setItem(EC_USER_KEY, JSON.stringify(user));
}

function requireLogin() {
  if (!isLoggedIn()) window.location.href = 'inscription.html';
}

function showProfilePanel() {
  var user = getUser();
  if (!user) return;
  var existing = document.getElementById('profile-panel');
  if (existing) { existing.remove(); return; }
  var panel = document.createElement('div');
  panel.id = 'profile-panel';
  panel.innerHTML =
    '<div class="pp-name">' + user.nom + '</div>' +
    '<div class="pp-email">' + user.email + '</div>' +
    '<div class="pp-grade">' + user.grade + '</div>' +
    '<div class="pp-affaires">Affaires résolues : ' + user.affairesResolues.length + '</div>' +
    '<button onclick="logout()">Se déconnecter</button>';
  document.body.appendChild(panel);

  // Fermer le panel en cliquant ailleurs
  setTimeout(function() {
    document.addEventListener('click', function closePanelOnClick(e) {
      var p = document.getElementById('profile-panel');
      if (p && !p.contains(e.target)) {
        p.remove();
        document.removeEventListener('click', closePanelOnClick);
      }
    });
  }, 50);
}

function initNav() {
  var user = getUser();
  var navCompte = document.getElementById('nav-compte');
  if (navCompte) {
    if (user) {
      navCompte.textContent = user.nom;
      navCompte.href = '#';
      navCompte.onclick = function(e) { e.preventDefault(); showProfilePanel(); };
    }
  }
  document.querySelectorAll('[data-locked]').forEach(function(link) {
    if (!user) {
      link.innerHTML = link.textContent + ' <span class="lock-icon">🔒</span>';
      link.onclick = function(e) {
        e.preventDefault();
        window.location.href = 'inscription.html?from=' + link.dataset.page;
      };
    }
  });
}

document.addEventListener('DOMContentLoaded', function() { initNav(); });
