/* ═══════════════════════════════════════════════════════════
   badges.js — Système de distinctions
═══════════════════════════════════════════════════════════ */

var BADGES = [
  {
    id: 'premier_sang',
    nom: 'Premier Sang',
    description: 'Résolvez votre première affaire',
    icone: '🔍',
    condition: function(prog) {
      return (prog.affairesResolues || []).length >= 1;
    }
  },
  {
    id: 'sans_faute',
    nom: 'Précision Absolue',
    description: 'Résolvez une affaire sans erreur',
    icone: '🎯',
    condition: function(prog) {
      return Object.keys(prog.scores || {}).some(function(k) {
        return (prog.scores[k].erreurs || 0) === 0;
      });
    }
  },
  {
    id: 'contre_la_montre',
    nom: 'Contre la Montre',
    description: 'Résolvez une affaire avec plus de 200 secondes restantes',
    icone: '⚡',
    condition: function(prog) {
      return Object.keys(prog.scores || {}).some(function(k) {
        return (prog.scores[k].tempsRestant || 0) >= 200;
      });
    }
  },
  {
    id: 'serie_noire',
    nom: 'Série Noire',
    description: 'Résolvez 5 affaires consécutives sans erreur',
    icone: '⭐',
    condition: function(prog) {
      var scores  = prog.scores || {};
      var resolues = prog.affairesResolues || [];
      if (resolues.length < 5) return false;
      var cinq = resolues.slice(-5);
      return cinq.every(function(n) {
        return scores[n] && (scores[n].erreurs || 0) === 0;
      });
    }
  },
  {
    id: 'nuit_blanche',
    nom: 'Nuit Blanche',
    description: 'Résolvez 3 affaires entre minuit et 5h du matin',
    icone: '🌙',
    condition: function(prog) {
      var scores = prog.scores || {};
      var nuit = Object.keys(scores).filter(function(k) {
        var d = scores[k].date;
        if (!d) return false;
        var h = new Date(d).getHours();
        return h >= 0 && h < 5;
      });
      return nuit.length >= 3;
    }
  },
  {
    id: 'inspecteur_complet',
    nom: 'Inspecteur Confirmé',
    description: 'Résolvez toutes les affaires de niveau 1',
    icone: '🏅',
    condition: function(prog) {
      var resolues = prog.affairesResolues || [];
      return [1,2,3,4,5,6,7].every(function(n) { return resolues.indexOf(n) !== -1; });
    }
  },
  {
    id: 'commissaire_complet',
    nom: 'Commissaire Émérite',
    description: 'Résolvez toutes les affaires de niveau 2',
    icone: '🏆',
    condition: function(prog) {
      var resolues = prog.affairesResolues || [];
      return [8,9,10,11,12,13,14].every(function(n) { return resolues.indexOf(n) !== -1; });
    }
  },
  {
    id: 'detective_complet',
    nom: 'Détective Légendaire',
    description: 'Résolvez toutes les affaires de niveau 3',
    icone: '💎',
    condition: function(prog) {
      var resolues = prog.affairesResolues || [];
      return [15,16,17,18,19,20].every(function(n) { return resolues.indexOf(n) !== -1; });
    }
  },
  {
    id: 'centurion',
    nom: 'Centurion',
    description: 'Atteignez 1000 points au total',
    icone: '💯',
    condition: function(prog) {
      var scores = prog.scores || {};
      var total = Object.keys(scores).reduce(function(s, k) {
        return s + (scores[k].points || 0);
      }, 0);
      return total >= 1000;
    }
  },
  {
    id: 'semaine',
    nom: 'Fidèle au Poste',
    description: '7 jours de streak consécutifs',
    icone: '🔥',
    condition: function(prog) {
      return ((prog.streak && prog.streak.maximum) || 0) >= 7;
    }
  }
];

/* ── Vérification et déblocage ── */
function verifierBadges() {
  var prog = typeof getProgression === 'function' ? getProgression() : null;
  if (!prog) return [];

  var badgesActuels = prog.badges || [];
  var nouveaux = [];

  BADGES.forEach(function(badge) {
    var dejaObtenu = badgesActuels.some(function(b) { return b.id === badge.id; });
    if (!dejaObtenu && badge.condition(prog)) {
      badgesActuels.push({ id: badge.id, dateObtention: new Date().toISOString() });
      nouveaux.push(badge);
    }
  });

  if (nouveaux.length > 0 && typeof updateProgression === 'function') {
    updateProgression({ badges: badgesActuels });
  }

  return nouveaux;
}

/* ── Notification toast badge ── */
function afficherToastBadge(badge) {
  var toast    = document.getElementById('toast-badge');
  var iconeEl  = document.getElementById('toast-badge-icone');
  var nomEl    = document.getElementById('toast-badge-nom');
  var descEl   = document.getElementById('toast-badge-desc');
  if (!toast || !iconeEl || !nomEl || !descEl) return;

  iconeEl.textContent = badge.icone;
  nomEl.textContent   = badge.nom;
  descEl.textContent  = badge.description;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { toast.classList.add('hidden'); }, 2000);
}

function notifierNouveauxBadges(nouveaux) {
  var i = 0;
  function suivant() {
    if (i >= nouveaux.length) return;
    afficherToastBadge(nouveaux[i]);
    i++;
    setTimeout(suivant, 2500);
  }
  suivant();
}

/* ── Rendu grille badges (profil) ── */
function renderBadges() {
  var prog = typeof getProgression === 'function' ? getProgression() : null;
  var badgesObtenus = prog && prog.badges ? prog.badges.map(function(b) { return b.id; }) : [];

  var container = document.getElementById('grille-badges');
  if (!container) return;
  container.innerHTML = '';

  BADGES.forEach(function(badge) {
    var obtenu = badgesObtenus.indexOf(badge.id) !== -1;
    var div = document.createElement('div');
    div.className = 'badge-item ' + (obtenu ? 'badge-obtenu' : 'badge-locked');
    div.title = obtenu ? badge.description : 'Badge non encore débloqué';
    div.innerHTML =
      '<div class="badge-icone">' + badge.icone + '</div>' +
      '<div class="badge-nom">' + badge.nom + '</div>' +
      '<div class="badge-desc">' + (obtenu ? badge.description : '???') + '</div>';
    container.appendChild(div);
  });

  /* Compteur */
  var compteur = document.getElementById('badges-compteur');
  if (compteur) compteur.textContent = badgesObtenus.length + ' / ' + BADGES.length + ' distinctions obtenues';
}
