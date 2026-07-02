/* ═══════════════════════════════════════════════════════════
   enquetes-speciales.js — Enquêtes Spéciales
═══════════════════════════════════════════════════════════ */

const SOLUTION_ETE = {
  coupable: 'LEON',
  methode:  'NOYADE',
  lieu:     'CALANQUE'
};

const CHAMPS_ETE = {
  coupable: 4,
  methode:  6,
  lieu:     8
};

const SOLUTION_VACANCES = {
  coupable: 'HENRI',
  methode:  'DAGUE',
  lieu:     'PRESQUILE'
};

const CHAMPS_VACANCES = {
  coupable: 5,
  methode:  5,
  lieu:     9
};

function normaliser(str) {
  return str.toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s/g, '')
    .trim();
}

/* ── Cases lettre par lettre ── */
function genererCases(containerId, nbCases) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < nbCases; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'case-lettre';
    input.dataset.index = i;
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (e.target.value.length === 1) {
        const next = container.querySelector(`[data-index="${i + 1}"]`);
        if (next) next.focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value) {
        const prev = container.querySelector(`[data-index="${i - 1}"]`);
        if (prev) { prev.focus(); prev.value = ''; }
      }
    });
    container.appendChild(input);
  }
}

function lireCases(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return '';
  return Array.from(container.querySelectorAll('.case-lettre'))
    .map(i => i.value).join('');
}

function marquerCasesErreur(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.case-lettre').forEach(i => i.classList.add('case-erreur'));
  setTimeout(() => {
    container.querySelectorAll('.case-lettre').forEach(i => {
      i.classList.remove('case-erreur');
      i.value = '';
    });
    const first = container.querySelector('.case-lettre');
    if (first) first.focus();
  }, 800);
}

function marquerCasesSucces(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.case-lettre').forEach(i => i.classList.add('case-succes'));
}

/* ── Badge ── */
async function debloquerBadgeEte() {
  const prog = await getProgression();
  if (!prog) return;
  const badges = prog.badges || [];
  if (badges.some(b => b.id === 'affaire_ete')) return;
  badges.push({ id: 'affaire_ete', dateObtention: new Date().toISOString() });
  await updateProgression({ badges });
}

/* ── Persistance ── */
async function sauvegarderResolutionEte() {
  const prog = await getProgression();
  if (!prog) return;
  const enquetesSpeciales = prog.enquetesSpeciales || {};
  enquetesSpeciales['affaire-ete'] = { resolue: true, date: new Date().toISOString() };
  await updateProgression({ enquetesSpeciales });
  await debloquerBadgeEte();
}

async function estDejaResolue() {
  const prog = await getProgression();
  if (!prog) return false;
  return prog.enquetesSpeciales?.['affaire-ete']?.resolue === true;
}

/* ── Image canvas ── */
function genererImagePartageEte() {
  const canvas = document.getElementById('canvas-partage-ete');
  if (!canvas) return;
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1080;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0a0805');
  grad.addColorStop(0.5, '#1a1005');
  grad.addColorStop(1, '#0a0a05');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeStyle = 'rgba(201,168,76,0.3)'; ctx.lineWidth = 1;
  ctx.strokeRect(34, 34, W - 68, H - 68);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9a84c';
  ctx.font = '80px serif';
  ctx.fillText('☀', W / 2, 160);

  ctx.fillStyle = '#888';
  ctx.font = '24px monospace';
  ctx.fillText('ENQUÊTE SPÉCIALE N°001', W / 2, 220);

  ctx.fillStyle = '#f5f0e8';
  ctx.font = 'bold 72px serif';
  ctx.fillText("L'Affaire de l'Été", W / 2, 320);

  ctx.fillStyle = '#c9a84c';
  ctx.font = 'italic 28px serif';
  ctx.fillText('Édition Vacances — Énigmes Criminelles', W / 2, 375);

  ctx.strokeStyle = 'rgba(201,168,76,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.2, 410); ctx.lineTo(W * 0.8, 410); ctx.stroke();

  ctx.save();
  ctx.translate(W / 2, 530);
  ctx.rotate(-0.08);
  ctx.font = 'bold 96px monospace';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#2d5a27'; ctx.lineWidth = 8;
  ctx.strokeText('RÉSOLU', 0, 0);
  ctx.fillStyle = '#2d5a27';
  ctx.fillText('RÉSOLU', 0, 0);
  ctx.restore();

  const solutions = [
    { label: 'COUPABLE', valeur: 'LÉON' },
    { label: 'MÉTHODE',  valeur: 'NOYADE' },
    { label: 'LIEU',     valeur: 'CALANQUE' }
  ];
  let yBase = 640;
  solutions.forEach(s => {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a84c';
    ctx.font = '20px monospace';
    ctx.fillText(s.label, W / 2, yBase);
    ctx.fillStyle = '#f5f0e8';
    ctx.font = 'bold 36px serif';
    ctx.fillText(s.valeur, W / 2, yBase + 42);
    yBase += 100;
  });

  const session = getSession ? getSession() : null;
  if (session) {
    ctx.fillStyle = 'rgba(201,168,76,0.6)';
    ctx.font = '22px serif';
    ctx.fillText('Résolu par ' + session.pseudo, W / 2, 980);
  }
  ctx.fillStyle = 'rgba(201,168,76,0.35)';
  ctx.font = '18px monospace';
  ctx.fillText('enigmes-criminelles.fr', W / 2, 1020);

  const texte = session
    ? `☀️ J'ai résolu l'Affaire de l'Été sur Énigmes Criminelles ! 100 affaires. 100 indices. Un seul crime. À toi de jouer 👇 enigmes-criminelles.fr`
    : `☀️ L'Affaire de l'Été est résolue ! enigmes-criminelles.fr`;
  const ta = document.getElementById('texte-partage-ete');
  if (ta) ta.value = texte;
}

/* ── Overlay succès ── */
function afficherSuccesEte() {
  const overlay = document.getElementById('overlay-succes-ete');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  setTimeout(genererImagePartageEte, 300);

  const statut = document.getElementById('statut-ete');
  if (statut) statut.innerHTML = '<span class="statut-resolu">✓ Dossier refermé</span>';
  const btn = document.getElementById('btn-ouvrir-ete');
  if (btn) { btn.textContent = 'Voir mon résultat →'; btn.style.background = '#2d5a27'; }

  const fermer = document.getElementById('btn-fermer-succes-ete');
  if (fermer) fermer.onclick = () => overlay.classList.add('hidden');
}

/* ── Badge Vacances ── */
async function debloquerBadgeVacances() {
  const prog = await getProgression();
  if (!prog) return;
  const badges = prog.badges || [];
  if (badges.some(b => b.id === 'affaire_vacances')) return;
  badges.push({ id: 'affaire_vacances', dateObtention: new Date().toISOString() });
  await updateProgression({ badges });
}

/* ── Persistance Vacances ── */
async function sauvegarderResolutionVacances() {
  const prog = await getProgression();
  if (!prog) return;
  const enquetesSpeciales = prog.enquetesSpeciales || {};
  enquetesSpeciales['affaire-vacances'] = { resolue: true, date: new Date().toISOString() };
  await updateProgression({ enquetesSpeciales });
  await debloquerBadgeVacances();
}

async function estDejaResolueVacances() {
  const prog = await getProgression();
  if (!prog) return false;
  return prog.enquetesSpeciales?.['affaire-vacances']?.resolue === true;
}

/* ── Image canvas Vacances ── */
function genererImagePartageVacances() {
  const canvas = document.getElementById('canvas-partage-vacances');
  if (!canvas) return;
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1080;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0a0805');
  grad.addColorStop(0.5, '#05101a');
  grad.addColorStop(1, '#0a0a05');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeStyle = 'rgba(201,168,76,0.3)'; ctx.lineWidth = 1;
  ctx.strokeRect(34, 34, W - 68, H - 68);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9a84c';
  ctx.font = '80px serif';
  ctx.fillText('🌊', W / 2, 160);

  ctx.fillStyle = '#888';
  ctx.font = '24px monospace';
  ctx.fillText('ENQUÊTE SPÉCIALE N°002', W / 2, 220);

  ctx.fillStyle = '#f5f0e8';
  ctx.font = 'bold 72px serif';
  ctx.fillText("L'Affaire des Vacances", W / 2, 320);

  ctx.fillStyle = '#c9a84c';
  ctx.font = 'italic 28px serif';
  ctx.fillText('Édition Vacances II — Énigmes Criminelles', W / 2, 375);

  ctx.strokeStyle = 'rgba(201,168,76,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.2, 410); ctx.lineTo(W * 0.8, 410); ctx.stroke();

  ctx.save();
  ctx.translate(W / 2, 530);
  ctx.rotate(-0.08);
  ctx.font = 'bold 96px monospace';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#2d5a27'; ctx.lineWidth = 8;
  ctx.strokeText('RÉSOLU', 0, 0);
  ctx.fillStyle = '#2d5a27';
  ctx.fillText('RÉSOLU', 0, 0);
  ctx.restore();

  const solutions = [
    { label: 'COUPABLE', valeur: 'HENRI' },
    { label: 'MÉTHODE',  valeur: 'DAGUE' },
    { label: 'LIEU',     valeur: "PRESQU'ÎLE" }
  ];
  let yBase = 640;
  solutions.forEach(s => {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a84c';
    ctx.font = '20px monospace';
    ctx.fillText(s.label, W / 2, yBase);
    ctx.fillStyle = '#f5f0e8';
    ctx.font = 'bold 36px serif';
    ctx.fillText(s.valeur, W / 2, yBase + 42);
    yBase += 100;
  });

  const session = getSession ? getSession() : null;
  if (session) {
    ctx.fillStyle = 'rgba(201,168,76,0.6)';
    ctx.font = '22px serif';
    ctx.fillText('Résolu par ' + session.pseudo, W / 2, 980);
  }
  ctx.fillStyle = 'rgba(201,168,76,0.35)';
  ctx.font = '18px monospace';
  ctx.fillText('enigmes-criminelles.fr', W / 2, 1020);

  const texte = session
    ? `🌊 J'ai résolu l'Affaire des Vacances sur Énigmes Criminelles ! 100 affaires. 100 indices. Un seul crime. À toi de jouer 👇 enigmes-criminelles.fr`
    : `🌊 L'Affaire des Vacances est résolue ! enigmes-criminelles.fr`;
  const ta = document.getElementById('texte-partage-vacances');
  if (ta) ta.value = texte;
}

/* ── Overlay succès Vacances ── */
function afficherSuccesVacances() {
  const overlay = document.getElementById('overlay-succes-vacances');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  setTimeout(genererImagePartageVacances, 300);

  const statut = document.getElementById('statut-vacances');
  if (statut) statut.innerHTML = '<span class="statut-resolu">✓ Dossier refermé</span>';
  const btn = document.getElementById('btn-ouvrir-vacances');
  if (btn) { btn.textContent = 'Voir mon résultat →'; btn.style.background = '#2d5a27'; }

  const fermer = document.getElementById('btn-fermer-succes-vacances');
  if (fermer) fermer.onclick = () => overlay.classList.add('hidden');
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async () => {

  /* Statut carte */
  const statut = document.getElementById('statut-ete');
  const btnOuvrir = document.getElementById('btn-ouvrir-ete');

  if (isLoggedIn() && await estDejaResolue()) {
    if (statut) statut.innerHTML = '<span class="statut-resolu">✓ Dossier refermé</span>';
    if (btnOuvrir) { btnOuvrir.textContent = 'Voir mon résultat →'; btnOuvrir.style.background = '#2d5a27'; }
  } else if (isLoggedIn()) {
    if (statut) statut.innerHTML = '<span class="statut-en-cours">● Dossier ouvert</span>';
  } else {
    if (statut) statut.innerHTML = '<span style="color:#888;font-size:12px">🔒 Connexion requise pour valider</span>';
  }

  /* Générer les cases */
  genererCases('cases-coupable', CHAMPS_ETE.coupable);
  genererCases('cases-methode', CHAMPS_ETE.methode);
  genererCases('cases-lieu', CHAMPS_ETE.lieu);

  /* Bouton ouvrir */
  if (btnOuvrir) {
    btnOuvrir.addEventListener('click', async () => {
      if (!isLoggedIn()) {
        document.getElementById('modal-connexion').classList.remove('hidden');
        return;
      }
      if (await estDejaResolue()) {
        afficherSuccesEte();
        return;
      }
      document.getElementById('modal-ete').classList.remove('hidden');
      setTimeout(() => {
        const first = document.querySelector('#cases-coupable .case-lettre');
        if (first) first.focus();
      }, 100);
    });
  }

  /* Fermer modal principale */
  const btnFermerModal = document.getElementById('modal-ete-fermer');
  if (btnFermerModal) {
    btnFermerModal.addEventListener('click', () => {
      document.getElementById('modal-ete').classList.add('hidden');
    });
  }
  const modalOverlay = document.getElementById('modal-ete');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });
  }

  /* Fermer modal connexion */
  const btnFermerConnexion = document.getElementById('modal-connexion-fermer');
  if (btnFermerConnexion) {
    btnFermerConnexion.addEventListener('click', () => {
      document.getElementById('modal-connexion').classList.add('hidden');
    });
  }

  /* Validation */
  const btnValider = document.getElementById('btn-valider-ete');
  if (btnValider) {
    btnValider.addEventListener('click', async () => {
      document.querySelectorAll('.champ-erreur').forEach(e => e.classList.add('hidden'));

      const repCoupable = normaliser(lireCases('cases-coupable'));
      const repMethode  = normaliser(lireCases('cases-methode'));
      const repLieu     = normaliser(lireCases('cases-lieu'));
      let erreurs = 0;

      if (repCoupable !== SOLUTION_ETE.coupable) {
        document.getElementById('erreur-coupable').classList.remove('hidden');
        marquerCasesErreur('cases-coupable');
        erreurs++;
      }
      if (repMethode !== SOLUTION_ETE.methode) {
        document.getElementById('erreur-methode').classList.remove('hidden');
        marquerCasesErreur('cases-methode');
        erreurs++;
      }
      if (repLieu !== SOLUTION_ETE.lieu) {
        document.getElementById('erreur-lieu').classList.remove('hidden');
        marquerCasesErreur('cases-lieu');
        erreurs++;
      }

      if (erreurs > 0) {
        document.getElementById('erreur-global-ete').classList.remove('hidden');
        return;
      }

      marquerCasesSucces('cases-coupable');
      marquerCasesSucces('cases-methode');
      marquerCasesSucces('cases-lieu');
      await sauvegarderResolutionEte();

      setTimeout(() => {
        document.getElementById('modal-ete').classList.add('hidden');
        afficherSuccesEte();
      }, 600);
    });
  }

  /* Télécharger image */
  const btnDl = document.getElementById('btn-dl-partage-ete');
  if (btnDl) {
    btnDl.addEventListener('click', () => {
      const canvas = document.getElementById('canvas-partage-ete');
      const lien = document.createElement('a');
      lien.download = 'affaire-de-lete-resolue.png';
      lien.href = canvas.toDataURL('image/png');
      lien.click();
    });
  }

  /* Copier texte */
  const btnCopier = document.getElementById('btn-copier-texte-ete');
  if (btnCopier) {
    btnCopier.addEventListener('click', () => {
      const texte = document.getElementById('texte-partage-ete');
      navigator.clipboard.writeText(texte.value).then(() => {
        btnCopier.textContent = '✓ Copié !';
        setTimeout(() => { btnCopier.textContent = 'Copier le texte'; }, 2000);
      }).catch(() => {
        texte.select();
        document.execCommand('copy');
        btnCopier.textContent = '✓ Copié !';
        setTimeout(() => { btnCopier.textContent = 'Copier le texte'; }, 2000);
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     AFFAIRE DES VACANCES — N°002
  ══════════════════════════════════════════════════════ */

  /* Statut carte Vacances */
  const statutVacances = document.getElementById('statut-vacances');
  const btnOuvrirVacances = document.getElementById('btn-ouvrir-vacances');

  if (isLoggedIn() && await estDejaResolueVacances()) {
    if (statutVacances) statutVacances.innerHTML = '<span class="statut-resolu">✓ Dossier refermé</span>';
    if (btnOuvrirVacances) { btnOuvrirVacances.textContent = 'Voir mon résultat →'; btnOuvrirVacances.style.background = '#2d5a27'; }
  } else if (isLoggedIn()) {
    if (statutVacances) statutVacances.innerHTML = '<span class="statut-en-cours">● Dossier ouvert</span>';
  } else {
    if (statutVacances) statutVacances.innerHTML = '<span style="color:#888;font-size:12px">🔒 Connexion requise pour valider</span>';
  }

  /* Générer les cases Vacances */
  genererCases('cases-vacances-coupable', CHAMPS_VACANCES.coupable);
  genererCases('cases-vacances-methode', CHAMPS_VACANCES.methode);
  genererCases('cases-vacances-lieu', CHAMPS_VACANCES.lieu);

  /* Bouton ouvrir Vacances */
  if (btnOuvrirVacances) {
    btnOuvrirVacances.addEventListener('click', async () => {
      if (!isLoggedIn()) {
        document.getElementById('modal-connexion').classList.remove('hidden');
        return;
      }
      if (await estDejaResolueVacances()) {
        afficherSuccesVacances();
        return;
      }
      document.getElementById('modal-vacances').classList.remove('hidden');
      setTimeout(() => {
        const first = document.querySelector('#cases-vacances-coupable .case-lettre');
        if (first) first.focus();
      }, 100);
    });
  }

  /* Fermer modal Vacances */
  const btnFermerModalVacances = document.getElementById('modal-vacances-fermer');
  if (btnFermerModalVacances) {
    btnFermerModalVacances.addEventListener('click', () => {
      document.getElementById('modal-vacances').classList.add('hidden');
    });
  }
  const modalOverlayVacances = document.getElementById('modal-vacances');
  if (modalOverlayVacances) {
    modalOverlayVacances.addEventListener('click', (e) => {
      if (e.target === modalOverlayVacances) modalOverlayVacances.classList.add('hidden');
    });
  }

  /* Validation Vacances */
  const btnValiderVacances = document.getElementById('btn-valider-vacances');
  if (btnValiderVacances) {
    btnValiderVacances.addEventListener('click', async () => {
      document.querySelectorAll('#modal-vacances .champ-erreur').forEach(e => e.classList.add('hidden'));

      const repCoupable = normaliser(lireCases('cases-vacances-coupable'));
      const repMethode  = normaliser(lireCases('cases-vacances-methode'));
      const repLieu     = normaliser(lireCases('cases-vacances-lieu'));
      let erreurs = 0;

      if (repCoupable !== SOLUTION_VACANCES.coupable) {
        document.getElementById('erreur-vacances-coupable').classList.remove('hidden');
        marquerCasesErreur('cases-vacances-coupable');
        erreurs++;
      }
      if (repMethode !== SOLUTION_VACANCES.methode) {
        document.getElementById('erreur-vacances-methode').classList.remove('hidden');
        marquerCasesErreur('cases-vacances-methode');
        erreurs++;
      }
      if (repLieu !== SOLUTION_VACANCES.lieu) {
        document.getElementById('erreur-vacances-lieu').classList.remove('hidden');
        marquerCasesErreur('cases-vacances-lieu');
        erreurs++;
      }

      if (erreurs > 0) {
        document.getElementById('erreur-global-vacances').classList.remove('hidden');
        return;
      }

      marquerCasesSucces('cases-vacances-coupable');
      marquerCasesSucces('cases-vacances-methode');
      marquerCasesSucces('cases-vacances-lieu');
      await sauvegarderResolutionVacances();

      setTimeout(() => {
        document.getElementById('modal-vacances').classList.add('hidden');
        afficherSuccesVacances();
      }, 600);
    });
  }

  /* Télécharger image Vacances */
  const btnDlVacances = document.getElementById('btn-dl-partage-vacances');
  if (btnDlVacances) {
    btnDlVacances.addEventListener('click', () => {
      const canvas = document.getElementById('canvas-partage-vacances');
      const lien = document.createElement('a');
      lien.download = 'affaire-des-vacances-resolue.png';
      lien.href = canvas.toDataURL('image/png');
      lien.click();
    });
  }

  /* Copier texte Vacances */
  const btnCopierVacances = document.getElementById('btn-copier-texte-vacances');
  if (btnCopierVacances) {
    btnCopierVacances.addEventListener('click', () => {
      const texte = document.getElementById('texte-partage-vacances');
      navigator.clipboard.writeText(texte.value).then(() => {
        btnCopierVacances.textContent = '✓ Copié !';
        setTimeout(() => { btnCopierVacances.textContent = 'Copier le texte'; }, 2000);
      }).catch(() => {
        texte.select();
        document.execCommand('copy');
        btnCopierVacances.textContent = '✓ Copié !';
        setTimeout(() => { btnCopierVacances.textContent = 'Copier le texte'; }, 2000);
      });
    });
  }
});
