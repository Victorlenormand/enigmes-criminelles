/* ═══════════════════════════════════════════════════════════
   scoring.js — Système de points, timer, classement
═══════════════════════════════════════════════════════════ */

var DUREES     = { 1: 300, 2: 240, 3: 180 };

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
var BASE_PTS   = { 1: 100, 2: 200, 3: 350 };

/* ── Calcul du score ── */
function calculerScore(opts) {
  var niveau           = opts.niveau;
  var tempsRestant     = opts.tempsRestant;
  var erreurs          = opts.erreurs;
  var premiereTentative = opts.premiereTentative;

  var base          = BASE_PTS[niveau] || 100;
  var bonusVitesse  = Math.max(0, Math.floor(tempsRestant * 0.5));
  var bonusPremiere = premiereTentative ? 50 : 0;
  var penalite      = erreurs * 20;
  var points        = Math.max(10, base + bonusVitesse + bonusPremiere - penalite);

  return { points: points, base: base, bonusVitesse: bonusVitesse,
           bonusPremiere: bonusPremiere, penalite: penalite };
}

/* ── Timer ── */
function AffaireTimer(dureeMax, onTick, onExpire) {
  this.dureeMax     = dureeMax;
  this.tempsRestant = dureeMax;
  this.onTick       = onTick;
  this.onExpire     = onExpire;
  this.interval     = null;
  this.actif        = false;
  this.tempsDepart  = null;
}

AffaireTimer.prototype.start = function() {
  if (this.actif) return;
  this.actif = true;
  this.tempsDepart = Date.now();
  var self = this;
  this.interval = setInterval(function() {
    self.tempsRestant = Math.max(
      0,
      self.dureeMax - Math.floor((Date.now() - self.tempsDepart) / 1000)
    );
    self.onTick(self.tempsRestant);
    if (self.tempsRestant === 0) {
      self.stop();
      self.onExpire();
    }
  }, 250);
};

AffaireTimer.prototype.stop = function() {
  if (this.interval) clearInterval(this.interval);
  this.interval = null;
  this.actif    = false;
};

AffaireTimer.prototype.getTempsRestant = function() {
  return this.tempsRestant;
};

/* ── UI du timer ── */
function updateTimerUI(tempsRestant, dureeMax) {
  var barre = document.getElementById('timer-barre');
  var texte = document.getElementById('timer-texte');
  if (!barre || !texte) return;

  var pct = dureeMax > 0 ? (tempsRestant / dureeMax) * 100 : 0;
  barre.style.width = pct + '%';

  if (pct > 50) {
    barre.style.background = '#c9a84c';
    barre.classList.remove('timer-urgent');
  } else if (pct > 25) {
    barre.style.background = '#c97a2a';
    barre.classList.remove('timer-urgent');
  } else {
    barre.style.background = '#8b1a1a';
    barre.classList.add('timer-urgent');
  }

  var min = Math.floor(tempsRestant / 60).toString().padStart(2, '0');
  var sec = (tempsRestant % 60).toString().padStart(2, '0');
  texte.textContent = min + ':' + sec;

  if (tempsRestant <= 30) {
    texte.classList.add('timer-critique');
  } else {
    texte.classList.remove('timer-critique');
  }
}

/* ── Notification toast ── */
function afficherNotification(msg, type, duree) {
  var notif = document.getElementById('notif-global');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notif-global';
    notif.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:600;' +
      'font-family:\'Courier Prime\',monospace;font-size:13px;padding:10px 20px;' +
      'border:1px solid #c9a84c;color:#f5f0e8;transition:opacity 0.4s;pointer-events:none;' +
      'max-width:90vw;text-align:center;opacity:0;';
    document.body.appendChild(notif);
  }
  notif.textContent = msg;
  notif.style.background = type === 'warning' ? 'rgba(139,90,26,0.96)' : 'rgba(26,21,16,0.96)';
  notif.style.opacity = '1';
  clearTimeout(notif._t);
  notif._t = setTimeout(function() { notif.style.opacity = '0'; }, duree || 3000);
}

/* ── Overlay résultat ── */
async function afficherResultat(aff, scoreData) {
  var overlay = document.getElementById('overlay-resultat');
  if (!overlay) return;

  var titreEl = document.getElementById('resultat-titre');
  if (titreEl) titreEl.textContent = aff.titre;

  var solT = document.getElementById('sol-tueur');
  var solM = document.getElementById('sol-methode');
  var solL = document.getElementById('sol-lieu');
  if (solT) solT.textContent = aff.solution.tueur;
  if (solM) solM.textContent = aff.solution.methode;
  if (solL) solL.textContent = aff.solution.lieu;

  var scBase    = document.getElementById('sc-base');
  var scVitesse = document.getElementById('sc-vitesse');
  var scBonus   = document.getElementById('sc-bonus');
  var scPen     = document.getElementById('sc-penalite');
  var scTotal   = document.getElementById('sc-total');
  var lignePen  = document.getElementById('ligne-penalite');

  if (scBase)    scBase.textContent    = '+' + scoreData.base;
  if (scVitesse) scVitesse.textContent = '+' + scoreData.bonusVitesse;
  if (scBonus)   scBonus.textContent   = scoreData.bonusPremiere > 0 ? '+50' : '+0';
  if (scTotal)   scTotal.textContent   = scoreData.points + ' pts';

  if (scoreData.penalite > 0) {
    if (scPen)   scPen.textContent = '-' + scoreData.penalite;
    if (lignePen) lignePen.style.display = '';
  } else {
    if (lignePen) lignePen.style.display = 'none';
  }

  /* Rang = grade actuel */
  var prog = typeof getProgression === 'function' ? await getProgression() : {};
  prog = prog || {};
  var rangEl = document.getElementById('rang-valeur');
  if (rangEl) rangEl.textContent = prog.grade || 'Inspecteur Stagiaire';

  /* Mise à jour widget */
  var scores     = prog.scores || {};
  var scoreTotal = Object.values(scores).reduce(function(s, x) { return s + (x.points || 0); }, 0);
  var wsScore    = document.getElementById('ws-score');
  var wsRang     = document.getElementById('ws-rang');
  if (wsScore) wsScore.textContent = scoreTotal + ' pts';
  if (wsRang)  wsRang.textContent  = prog.grade || '';

  overlay.classList.remove('hidden');

  /* Badges */
  if (typeof verifierBadges === 'function') {
    var nouveauxBadges = await verifierBadges();
    if (nouveauxBadges.length > 0 && typeof notifierNouveauxBadges === 'function') {
      setTimeout(function() { notifierNouveauxBadges(nouveauxBadges); }, 1500);
    }
  }

  /* Bouton affaire suivante */
  var btnSuiv = document.getElementById('btn-affaire-suivante');
  if (btnSuiv) {
    if (aff.nextAffaire) {
      btnSuiv.style.display = '';
      btnSuiv.onclick = function() {
        overlay.classList.add('hidden');
        location.reload();
      };
    } else {
      btnSuiv.style.display = 'none';
    }
  }

  var btnClass = document.getElementById('btn-voir-classement');
  if (btnClass) {
    btnClass.onclick = function() { window.location.href = 'classement.html'; };
  }

  var btnReplay = document.getElementById('btn-rejouer');
  if (btnReplay) {
    btnReplay.onclick = function() {
      overlay.classList.add('hidden');
      location.reload();
    };
  }

  /* Section partage */
  if (typeof initPartage === 'function') {
    initPartage(aff, scoreData);
  }
}

/* ── Classement ── */
async function construireClassement(tri) {
  var tbody  = document.getElementById('tbody-classement');
  var podium = document.getElementById('podium');

  if (tbody) tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;color:#888;padding:40px 0">Chargement du classement…</td></tr>';
  if (podium) podium.style.display = 'none';

  try {
    var db      = window._supabase;
    var session = typeof getSession === 'function' ? getSession() : null;
    var joueurs = [];

    if (db) {
      var usersRes = await db.from('ec_users').select('id, pseudo');
      var progsRes = await db.from('ec_progression').select('user_id, affaires_resolues, scores, grade');

      if (usersRes.error || !usersRes.data) {
        console.error('[classement] Erreur lecture ec_users:', usersRes.error);
        if (tbody) tbody.innerHTML =
          '<tr><td colspan="6" style="text-align:center;color:#888;padding:40px 0">Impossible de charger le classement.</td></tr>';
        return;
      }

      if (progsRes.error) {
        console.warn('[classement] Erreur lecture ec_progression:', progsRes.error);
      }
      var progsData = (!progsRes.error && progsRes.data) ? progsRes.data : [];

      joueurs = usersRes.data.map(function(user) {
        var prog   = progsData.find(function(p) { return p.user_id === user.id; }) || {};
        var scores = (prog.scores && typeof prog.scores === 'object') ? prog.scores : {};
        var total  = Object.values(scores).reduce(function(s, v) { return s + ((v && v.points) || 0); }, 0);
        var resolus = (prog.affaires_resolues || []).length;
        var tempsListe = Object.values(scores).map(function(v) { return (v && v.temps) || 0; }).filter(function(t) { return t > 0; });
        var meilleureVitesse = tempsListe.length ? Math.min.apply(null, tempsListe) : 0;
        return {
          id: user.id, pseudo: user.pseudo || '—',
          grade: prog.grade || 'Inspecteur Stagiaire',
          scoreTotal: total, affairesResolues: resolus,
          meilleureVitesse: meilleureVitesse,
          estMoi: !!(session && session.userId === user.id)
        };
      });
    } else {
      /* Fallback localStorage */
      var users = JSON.parse(localStorage.getItem('ec_users_local') || '[]');
      joueurs = users.map(function(user) {
        var prog   = JSON.parse(localStorage.getItem('ec_progression_' + user.id) || '{}');
        var scores = (prog.scores && typeof prog.scores === 'object') ? prog.scores : {};
        var total  = Object.values(scores).reduce(function(s, x) { return s + ((x && x.points) || 0); }, 0);
        var resolus = (prog.affairesResolues || []).length;
        var tempsListe = Object.values(scores).map(function(v) { return (v && v.temps) || 0; }).filter(function(t) { return t > 0; });
        var meilleureVitesse = tempsListe.length ? Math.min.apply(null, tempsListe) : 0;
        return {
          id: user.id, pseudo: user.pseudo || '—',
          grade: prog.grade || 'Inspecteur Stagiaire',
          scoreTotal: total, affairesResolues: resolus,
          meilleureVitesse: meilleureVitesse,
          estMoi: !!(session && session.userId === user.id)
        };
      });
    }

    if (joueurs.length === 0) {
      if (tbody) tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:#c9a84c;opacity:0.5;padding:40px 0;">' +
        'Aucun enquêteur inscrit pour l\'instant.<br>' +
        '<span style="font-size:11px;opacity:0.6">Créez un compte pour apparaître au classement.</span></td></tr>';
      return;
    }
    if (podium) podium.style.display = '';

    var tries = {
      score:    function(a, b) { return b.scoreTotal - a.scoreTotal; },
      affaires: function(a, b) { return b.affairesResolues - a.affairesResolues; },
      vitesse:  function(a, b) {
        if (!a.meilleureVitesse && !b.meilleureVitesse) return 0;
        if (!a.meilleureVitesse) return 1;
        if (!b.meilleureVitesse) return -1;
        return a.meilleureVitesse - b.meilleureVitesse;
      }
    };
    joueurs.sort(tries[tri] || tries.score);

    if (tbody) {
      tbody.innerHTML = '';
      joueurs.forEach(function(j, i) {
        var rang     = i + 1;
        var medaille = rang === 1 ? '♛' : rang === 2 ? '◈' : rang === 3 ? '◇' : rang;
        var temps    = j.meilleureVitesse > 0 ?
          Math.floor(j.meilleureVitesse / 60) + 'min ' + (j.meilleureVitesse % 60) + 's' : '—';
        var tr = document.createElement('tr');
        tr.className = (rang <= 3 ? 'rang-' + rang : '') + (j.estMoi ? ' ligne-actuel' : '');
        tr.innerHTML =
          '<td>' + medaille + '</td>' +
          '<td>' + (j.estMoi ? '▶ ' : '') + escapeHtml(j.pseudo) +
            (j.estMoi ? ' <span style="color:#c9a84c;font-size:10px">(vous)</span>' : '') + '</td>' +
          '<td style="font-size:11px;color:#888">' + escapeHtml(j.grade) + '</td>' +
          '<td>' + j.affairesResolues + ' / 20</td>' +
          '<td style="color:#c9a84c;font-weight:bold">' + j.scoreTotal + ' pts</td>' +
          '<td>' + escapeHtml(temps) + '</td>';
        tbody.appendChild(tr);
      });
    }

    mettreAJourPodium(joueurs.slice(0, 3));

  } catch(e) {
    console.error('[construireClassement] Exception:', e);
    if (tbody) tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:#888;padding:40px 0">' +
      'Erreur lors du chargement. ' +
      '<button onclick="construireClassement(\'' + (tri || 'score') + '\')" ' +
      'style="background:transparent;border:1px solid #c9a84c;color:#c9a84c;padding:6px 14px;font-family:monospace;cursor:pointer;margin-left:12px">Réessayer</button>' +
      '</td></tr>';
    if (podium) podium.style.display = 'none';
  }
}

/* ── Streak quotidien ── */
function getDateJour() {
  return new Date().toISOString().split('T')[0];
}

async function updateStreak() {
  var prog = typeof getProgression === 'function' ? await getProgression() : null;
  if (!prog) return null;

  var streak = prog.streak || {
    actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false
  };

  var aujourdhui = getDateJour();

  if (streak.dernierJour === aujourdhui) {
    return streak;
  }

  if (streak.dernierJour === null) {
    streak.actuel = 1;
  } else {
    var hier = new Date();
    hier.setDate(hier.getDate() - 1);
    var hierStr = hier.toISOString().split('T')[0];

    if (streak.dernierJour === hierStr) {
      streak.actuel += 1;
    } else {
      streak.actuel = 1;
    }
  }

  streak.maximum        = Math.max(streak.actuel, streak.maximum);
  streak.dernierJour    = aujourdhui;
  streak.joueAujourdhui = true;

  var historique = prog.historiqueJours || [];
  if (historique.indexOf(aujourdhui) === -1) {
    historique.push(aujourdhui);
    if (historique.length > 30) historique.shift();
  }

  if (typeof updateProgression === 'function') {
    await updateProgression({ streak: streak, historiqueJours: historique });
  }
  return streak;
}

async function getStreak() {
  var prog = typeof getProgression === 'function' ? await getProgression() : null;
  if (!prog || !prog.streak) {
    return { actuel: 0, maximum: 0, dernierJour: null, joueAujourdhui: false };
  }

  var streak     = prog.streak;
  var aujourdhui = getDateJour();

  if (streak.dernierJour === null) return streak;

  var hier = new Date();
  hier.setDate(hier.getDate() - 1);
  var hierStr = hier.toISOString().split('T')[0];

  if (streak.dernierJour !== aujourdhui && streak.dernierJour !== hierStr) {
    streak.actuel         = 0;
    streak.joueAujourdhui = false;
    if (typeof updateProgression === 'function') {
      await updateProgression({ streak: streak });
    }
  }

  return streak;
}

function afficherToastStreak(streak) {
  var toast   = document.getElementById('toast-streak');
  var texteEl = document.getElementById('toast-streak-texte');
  if (!toast || !texteEl) return;

  var message;
  if (streak.actuel === streak.maximum && streak.actuel > 1) {
    message = '🔥 Nouveau record : ' + streak.actuel + ' jours de suite !';
  } else if (streak.actuel > 1) {
    message = '🔥 ' + streak.actuel + ' jours de suite ! Continuez demain.';
  } else {
    message = '🔥 Vous avez démarré votre série !';
  }

  texteEl.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { toast.classList.add('hidden'); }, 4000);
}

function mettreAJourPodium(top3) {
  /* Ordre d'affichage podium : 2ème, 1er, 3ème */
  var config = [
    { dataIdx: 1, sel: '.place-2' },
    { dataIdx: 0, sel: '.place-1' },
    { dataIdx: 2, sel: '.place-3' }
  ];
  config.forEach(function(c) {
    var place = document.querySelector(c.sel);
    if (!place) return;
    var j = top3[c.dataIdx];
    if (!j) { place.style.visibility = 'hidden'; return; }
    place.style.visibility = '';
    var pe = place.querySelector('.podium-pseudo');
    var se = place.querySelector('.podium-score');
    var ge = place.querySelector('.podium-grade');
    if (pe) pe.textContent = j.pseudo;
    if (se) se.textContent = j.scoreTotal + ' pts';
    if (ge) ge.textContent = j.grade;
  });
}
