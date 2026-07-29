/* ═══════════════════════════════════════════════════════════
   partage.js — Génération et partage d'image de résultat
═══════════════════════════════════════════════════════════ */

var _partageAff   = null;
var _partageScore = null;

function genererTextePartage(aff, points) {
  return '🔍 Affaire N°' + (aff.id || '?') + ' résolue sur Énigmes Criminelles ! ' +
    points + ' points au compteur. Tente de faire mieux 👇 enigmes-criminelles.fr';
}

async function genererImagePartage(aff, scoreData, format) {
  var W = format === 'carre' ? 1080 : 1200;
  var H = format === 'carre' ? 1080 : 675;

  var canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  var ctx = canvas.getContext('2d');

  /* Fond dégradé */
  var gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(1, '#1a1208');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  /* Bordure or double */
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeStyle = 'rgba(201,168,76,0.27)';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  /* Logo / Titre */
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold ' + Math.round(W * 0.045) + 'px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ÉNIGMES CRIMINELLES', W / 2, Math.round(H * 0.12));

  /* Ligne séparatrice */
  ctx.strokeStyle = 'rgba(201,168,76,0.27)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, H * 0.16);
  ctx.lineTo(W * 0.8, H * 0.16);
  ctx.stroke();

  /* Tampon RÉSOLU */
  ctx.save();
  ctx.translate(W / 2, H * 0.32);
  ctx.rotate(-0.1);
  ctx.strokeStyle = '#2d5a27';
  ctx.lineWidth = 6;
  ctx.font = 'bold ' + Math.round(W * 0.08) + 'px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.strokeText('RÉSOLU', 0, 0);
  ctx.fillStyle = '#2d5a27';
  ctx.fillText('RÉSOLU', 0, 0);
  ctx.restore();

  /* Nom de l'affaire */
  ctx.fillStyle = '#f5f0e8';
  ctx.font = 'italic ' + Math.round(W * 0.035) + 'px Georgia, serif';
  ctx.textAlign = 'center';
  var titre = 'Affaire N°' + String(aff.id || '?').padStart(2, '0') + ' — ' + (aff.titre || '');
  ctx.fillText(titre, W / 2, H * 0.48);

  /* Score */
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold ' + Math.round(W * 0.07) + 'px "Courier New", monospace';
  ctx.fillText((scoreData.points || 0) + ' pts', W / 2, H * 0.6);

  /* Temps résolution */
  var duree     = (typeof DUREES !== 'undefined' ? DUREES[aff.niveau] : null) || 300;
  var prog      = typeof getProgression === 'function' ? await getProgression() : null;
  var sc        = prog && prog.scores && prog.scores[aff.id];
  var tempsPris = sc ? (sc.temps || 0) : 0;
  var min = Math.floor(tempsPris / 60).toString().padStart(2, '0');
  var sec = (tempsPris % 60).toString().padStart(2, '0');
  var session = typeof getSession === 'function' ? getSession() : null;
  var pseudo  = session ? session.pseudo : '';

  ctx.fillStyle = '#888888';
  ctx.font = Math.round(W * 0.025) + 'px "Courier New", monospace';
  ctx.fillText('Résolu en ' + min + ':' + sec + (pseudo ? '  —  ' + pseudo : ''), W / 2, H * 0.68);

  /* Grade */
  var grade = prog ? (prog.grade || 'Inspecteur Stagiaire') : 'Inspecteur Stagiaire';
  ctx.fillStyle = '#e8d5a3';
  ctx.font = Math.round(W * 0.025) + 'px Georgia, serif';
  ctx.fillText(grade, W / 2, H * 0.76);

  /* URL */
  ctx.fillStyle = 'rgba(201,168,76,0.4)';
  ctx.font = Math.round(W * 0.02) + 'px "Courier New", monospace';
  ctx.fillText('enigmes-criminelles.fr', W / 2, H * 0.9);

  return canvas;
}

/* ── Aperçu dans le DOM ── */
async function _majApercu(format) {
  if (!_partageAff || !_partageScore) return;
  var src    = await genererImagePartage(_partageAff, _partageScore, format);
  var apercu = document.getElementById('apercu-partage');
  if (!apercu) return;
  apercu.width  = src.width;
  apercu.height = src.height;
  apercu.getContext('2d').drawImage(src, 0, 0);
}

/* ── Init section partage (appelé depuis afficherResultat) ── */
function initPartage(aff, scoreData) {
  _partageAff   = aff;
  _partageScore = scoreData;

  /* Texte pré-rempli */
  var textarea = document.getElementById('texte-a-copier');
  if (textarea) textarea.value = genererTextePartage(aff, scoreData.points);

  /* Aperçu initial carré */
  _majApercu('carre');

  /* Boutons format */
  var btnsFormat = document.querySelectorAll('.btn-format');
  btnsFormat.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btnsFormat.forEach(function(b) { b.classList.remove('actif'); });
      btn.classList.add('actif');
      _majApercu(btn.dataset.format);
    });
  });

  /* Bouton télécharger */
  var btnDl = document.getElementById('btn-telecharger-image');
  if (btnDl) {
    btnDl.onclick = async function() {
      var actif  = document.querySelector('.btn-format.actif');
      var format = actif ? actif.dataset.format : 'carre';
      var src    = await genererImagePartage(_partageAff, _partageScore, format);
      var lien   = document.createElement('a');
      lien.download = 'enigmes-criminelles-affaire-' + (aff.id || 'x') + '.png';
      lien.href = src.toDataURL('image/png');
      lien.click();
    };
  }

  /* Bouton partage natif (mobile) */
  var btnNatif = document.getElementById('btn-partager-natif');
  if (btnNatif) {
    if (navigator.share) {
      btnNatif.classList.remove('hidden');
      btnNatif.onclick = async function() {
        var src = await genererImagePartage(_partageAff, _partageScore, 'carre');
        src.toBlob(function(blob) {
          var file = new File([blob], 'enigmes-criminelles.png', { type: 'image/png' });
          var texte = genererTextePartage(_partageAff, _partageScore.points);
          var data = { title: 'Énigmes Criminelles', text: texte };
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            data.files = [file];
          }
          navigator.share(data).catch(function() {});
        });
      };
    }
  }

  /* Bouton copier texte */
  var btnCopier = document.getElementById('btn-copier-texte');
  if (btnCopier) {
    btnCopier.onclick = function() {
      var ta = document.getElementById('texte-a-copier');
      if (!ta) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(ta.value).then(function() {
          btnCopier.textContent = '✓ Copié !';
          setTimeout(function() { btnCopier.textContent = 'Copier le texte'; }, 2000);
        });
      } else {
        ta.select();
        document.execCommand('copy');
        btnCopier.textContent = '✓ Copié !';
        setTimeout(function() { btnCopier.textContent = 'Copier le texte'; }, 2000);
      }
    };
  }
}
