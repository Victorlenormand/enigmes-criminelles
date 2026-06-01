/* ═══════════════════════════════════════════════════════════
   stats.js — Statistiques détaillées du joueur
═══════════════════════════════════════════════════════════ */

/* ── Calcul ── */
async function calculerStatistiques() {
  var prog = typeof getProgression === 'function' ? await getProgression() : null;
  if (!prog) return null;

  var scores   = prog.scores || {};
  var resolues = prog.affairesResolues || [];
  var valeurs  = Object.keys(scores).map(function(k) { return scores[k]; });

  if (valeurs.length === 0) return { vide: true };

  var points  = valeurs.map(function(s) { return s.points || 0; });
  var temps   = valeurs.map(function(s) { return s.temps  || 0; }).filter(function(t) { return t > 0; });
  var erreurs = valeurs.map(function(s) { return s.erreurs || 0; });

  var scoreTotal    = points.reduce(function(a, b) { return a + b; }, 0);
  var erreurTotal   = erreurs.reduce(function(a, b) { return a + b; }, 0);

  var top5 = Object.keys(scores).map(function(k) {
    return {
      id: parseInt(k, 10),
      points:  scores[k].points  || 0,
      temps:   scores[k].temps   || 0,
      erreurs: scores[k].erreurs || 0,
      date:    scores[k].date    || ''
    };
  }).sort(function(a, b) { return b.points - a.points; }).slice(0, 5);

  var historique = Object.keys(scores).map(function(k) {
    return { affaire: parseInt(k, 10), points: scores[k].points || 0, date: scores[k].date || '' };
  }).sort(function(a, b) { return new Date(a.date) - new Date(b.date); });

  return {
    scoreTotal:        scoreTotal,
    scoreMoyen:        Math.round(scoreTotal / points.length),
    scoreMeilleur:     Math.max.apply(null, points),
    scorePire:         Math.min.apply(null, points),
    tempsMoyen:        temps.length ? Math.round(temps.reduce(function(a, b) { return a + b; }, 0) / temps.length) : 0,
    tempsMeilleur:     temps.length ? Math.min.apply(null, temps) : 0,
    totalErreurs:      erreurTotal,
    erreursMoyenne:    Math.round((erreurTotal / erreurs.length) * 10) / 10,
    affairesSansFaute: erreurs.filter(function(e) { return e === 0; }).length,
    parNiveau: {
      1: resolues.filter(function(n) { return n <= 7; }).length,
      2: resolues.filter(function(n) { return n >= 8 && n <= 14; }).length,
      3: resolues.filter(function(n) { return n >= 15; }).length
    },
    streak:        prog.streak || { actuel: 0, maximum: 0 },
    historique:    historique,
    top5:          top5,
    totalResolues: resolues.length
  };
}

/* ── Graphique progression canvas ── */
function dessinerGraphique(historique) {
  var canvas = document.getElementById('canvas-progression');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W   = canvas.width;
  var H   = canvas.height;

  ctx.fillStyle = '#0f0d0a';
  ctx.fillRect(0, 0, W, H);

  if (!historique || historique.length < 2) {
    ctx.fillStyle = '#555';
    ctx.font = '13px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Résolvez plus d\'affaires pour voir votre progression', W / 2, H / 2);
    return;
  }

  var ptValues = historique.map(function(item) { return item.points; });
  var maxPts   = Math.max.apply(null, ptValues) * 1.15;
  var pad      = { top: 20, right: 24, bottom: 36, left: 52 };
  var gW       = W - pad.left - pad.right;
  var gH       = H - pad.top  - pad.bottom;

  function xOf(i) {
    return pad.left + (historique.length > 1 ? (gW / (historique.length - 1)) * i : gW / 2);
  }
  function yOf(pts) {
    return pad.top + (maxPts > 0 ? (1 - pts / maxPts) * gH : gH);
  }

  /* Grille horizontale */
  var lignes = 4;
  for (var li = 0; li <= lignes; li++) {
    var gy = pad.top + (gH / lignes) * li;
    ctx.strokeStyle = '#2a2018';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.font = '10px "Courier Prime", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxPts * (1 - li / lignes)), pad.left - 6, gy + 4);
  }

  /* Axe X — numéros d'affaires */
  ctx.fillStyle = '#555';
  ctx.font = '10px "Courier Prime", monospace';
  ctx.textAlign = 'center';
  historique.forEach(function(item, i) {
    ctx.fillText('#' + item.affaire, xOf(i), H - pad.bottom + 16);
  });

  /* Remplissage sous courbe */
  ctx.beginPath();
  historique.forEach(function(item, i) {
    var x = xOf(i); var y = yOf(item.points);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(xOf(historique.length - 1), pad.top + gH);
  ctx.lineTo(xOf(0), pad.top + gH);
  ctx.closePath();
  var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gH);
  grad.addColorStop(0, 'rgba(201,168,76,0.2)');
  grad.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = grad;
  ctx.fill();

  /* Ligne */
  ctx.beginPath();
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  historique.forEach(function(item, i) {
    var x = xOf(i); var y = yOf(item.points);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  /* Points */
  historique.forEach(function(item, i) {
    var x = xOf(i); var y = yOf(item.points);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a84c';
    ctx.fill();
    ctx.strokeStyle = '#0f0d0a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

/* ── Barres de niveau animées ── */
function dessinerBarreNiveau(id, valeur, max) {
  var el  = document.getElementById(id);
  if (!el) return;
  var pct = max > 0 ? Math.min(100, Math.round((valeur / max) * 100)) : 0;
  setTimeout(function() { el.style.width = pct + '%'; }, 300);
}

/* ── Formatage ── */
function formatTemps(secondes) {
  if (!secondes) return '—';
  var m = Math.floor(secondes / 60);
  var s = secondes % 60;
  return m + 'min ' + s + 's';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async function() {
  var session = typeof getSession === 'function' ? getSession() : null;
  var prog    = typeof getProgression === 'function' ? await getProgression() : null;

  /* Sous-titre pseudo + grade */
  if (session) {
    var sous = document.getElementById('stats-sous-titre');
    if (sous) {
      var nb    = prog && prog.affairesResolues ? prog.affairesResolues.length : 0;
      var grade = typeof getGrade === 'function' ? getGrade(nb) : '';
      sous.textContent = session.pseudo + ' — ' + grade;
    }
  }

  var stats = await calculerStatistiques();

  /* État vide */
  if (!stats || stats.vide) {
    var empty = document.getElementById('stats-vide');
    var main  = document.getElementById('stats-contenu');
    if (empty) empty.classList.remove('hidden');
    if (main)  main.classList.add('hidden');
    return;
  }

  /* KPI */
  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  setText('kpi-score',      stats.scoreTotal.toLocaleString('fr-FR'));
  setText('kpi-affaires',   stats.totalResolues + ' / 20');
  setText('kpi-sans-faute', stats.affairesSansFaute);
  setText('kpi-streak',     stats.streak.maximum + ' j');

  /* Stats secondaires */
  setText('stat-score-moyen',   stats.scoreMoyen + ' pts');
  setText('stat-meilleur',      stats.scoreMeilleur + ' pts');
  setText('stat-temps-moyen',   formatTemps(stats.tempsMoyen));
  setText('stat-temps-meilleur',formatTemps(stats.tempsMeilleur));
  setText('stat-erreurs-total', stats.totalErreurs);
  setText('stat-erreurs-moy',   stats.erreursMoyenne);
  setText('stat-streak-actuel', stats.streak.actuel + ' j');

  /* Graphique */
  dessinerGraphique(stats.historique);

  /* Barres de niveau */
  dessinerBarreNiveau('barre-n1', stats.parNiveau[1], 7);
  dessinerBarreNiveau('barre-n2', stats.parNiveau[2], 7);
  dessinerBarreNiveau('barre-n3', stats.parNiveau[3], 6);
  setText('val-n1', stats.parNiveau[1] + ' / 7');
  setText('val-n2', stats.parNiveau[2] + ' / 7');
  setText('val-n3', stats.parNiveau[3] + ' / 6');

  /* Top 5 */
  var tbody = document.getElementById('tbody-top5');
  if (tbody) {
    tbody.innerHTML = '';
    stats.top5.forEach(function(s, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td style="color:var(--or)">' + (i + 1) + '</td>' +
        '<td>Affaire #' + String(s.id).padStart(2, '0') + '</td>' +
        '<td style="color:var(--or);font-weight:bold">' + s.points + ' pts</td>' +
        '<td>' + formatTemps(s.temps) + '</td>' +
        '<td>' + s.erreurs + '</td>';
      tbody.appendChild(tr);
    });
  }
});
