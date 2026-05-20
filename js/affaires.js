/* ═══════════════════════════════════════════════════════════
   affaires.js — Moteur mots mêlés & données AFFAIRES
═══════════════════════════════════════════════════════════ */

var wsActiveAffaire = null;

function generateGrid(placements, residualSeq) {
  var r, c, i, pr, pc;
  var grid = [], wordCells = [];
  for (r = 0; r < 10; r++) {
    grid.push([]); wordCells.push([]);
    for (c = 0; c < 10; c++) { grid[r].push(null); wordCells[r].push(false); }
  }
  placements.forEach(function(p) {
    for (i = 0; i < p.mot.length; i++) {
      pr = p.dir === 'V' ? p.row + i : p.row;
      pc = p.dir === 'H' ? p.col + i : p.col;
      grid[pr][pc] = p.mot[i];
      wordCells[pr][pc] = true;
    }
  });
  var residuels = [], seqIdx = 0;
  for (r = 0; r < 10; r++) {
    for (c = 0; c < 10; c++) {
      if (!wordCells[r][c]) {
        grid[r][c] = residualSeq[seqIdx % residualSeq.length];
        seqIdx++;
        residuels.push([r, c]);
      }
    }
  }
  return {grid: grid, residuels: residuels};
}

var AFFAIRES = [
  {
    id: 1,
    affaireNum: 1,
    titre: 'La Nuit du Palais Royal',
    ghost: {mot: 'GRENIER', cat: 'LIEU'},
    wordPlacements: [
      {mot:'RAPPORT',  row:0, col:0, dir:'H'},
      {mot:'PORTRAIT', row:0, col:7, dir:'V'},
      {mot:'MOBILE',   row:1, col:0, dir:'H'},
      {mot:'REGISTRE', row:2, col:1, dir:'H'},
      {mot:'VERDICT',  row:3, col:0, dir:'H'},
      {mot:'PENSION',  row:4, col:0, dir:'H'},
      {mot:'COGNAC',   row:5, col:0, dir:'H'},
      {mot:'BRUYERE',  row:6, col:0, dir:'H'},
      {mot:'PASSAGE',  row:7, col:0, dir:'H'},
      {mot:'CONTRAT',  row:8, col:0, dir:'H'},
      {mot:'LANTERNE', row:9, col:0, dir:'H'},
      {mot:'CLEF',     row:0, col:8, dir:'V'},
      {mot:'ALIBI',    row:0, col:9, dir:'V'},
      {mot:'LIVRE',    row:5, col:8, dir:'V'}
    ],
    residualSeq: 'MARCPOISON',
    solution: {tueur:'MARC', methode:'POISON', lieu:'GRENIER'},
    nextAffaire: 2
  },
  {
    id: 2,
    affaireNum: 2,
    titre: 'Le Dernier Train de Lyon',
    ghost: {mot: 'LAME', cat: 'METHODE'},
    wordPlacements: [
      {mot:'COULOIR',   row:0, col:0, dir:'V'},
      {mot:'PORTEUR',   row:0, col:1, dir:'H'},
      {mot:'EXPRESS',   row:1, col:1, dir:'H'},
      {mot:'BAGAGE',    row:2, col:1, dir:'H'},
      {mot:'FENETRE',   row:3, col:1, dir:'H'},
      {mot:'CONSIGNE',  row:4, col:1, dir:'H'},
      {mot:'WAGON',     row:5, col:1, dir:'H'},
      {mot:'COUCHETTE', row:6, col:1, dir:'H'},
      {mot:'RETARD',    row:7, col:0, dir:'H'},
      {mot:'ARRIVEE',   row:8, col:0, dir:'H'},
      {mot:'NUIT',      row:9, col:0, dir:'H'},
      {mot:'FUMOIR',    row:0, col:9, dir:'V'},
      {mot:'RAIL',      row:7, col:6, dir:'H'},
      {mot:'GARE',      row:9, col:4, dir:'H'},
      {mot:'BUS',       row:5, col:6, dir:'H'}
    ],
    residualSeq: 'VICTORQUAI',
    solution: {tueur:'VICTOR', methode:'LAME', lieu:'QUAI'},
    nextAffaire: 3
  },
  {
    id: 3,
    affaireNum: 3,
    titre: 'Rue des Orfèvres',
    ghost: {mot: 'BLANCHE', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'ARCHIVES', row:0, col:0, dir:'H'},
      {mot:'CONTRAT',  row:1, col:0, dir:'H'},
      {mot:'DOSSIER',  row:2, col:0, dir:'H'},
      {mot:'VERDICT',  row:3, col:0, dir:'H'},
      {mot:'PARQUET',  row:4, col:0, dir:'H'},
      {mot:'RAPPORT',  row:5, col:0, dir:'H'},
      {mot:'SUSPECT',  row:6, col:0, dir:'H'},
      {mot:'TEMOIN',   row:7, col:0, dir:'H'},
      {mot:'MOBILE',   row:8, col:0, dir:'H'},
      {mot:'CORDEAU',  row:9, col:0, dir:'H'},
      {mot:'REGISTRE', row:0, col:8, dir:'V'},
      {mot:'SCEAU',    row:0, col:9, dir:'V'},
      {mot:'TOGE',     row:1, col:7, dir:'V'},
      {mot:'VIE',      row:8, col:6, dir:'H'}
    ],
    residualSeq: 'ARSENICCAVE',
    solution: {tueur:'BLANCHE', methode:'ARSENIC', lieu:'CAVE'},
    nextAffaire: null
  }
];

var wsStates = {};

function wsNorm(s) {
  return (s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
}

function wsGetCell(affId, r, c) {
  var g = document.getElementById('ws-grid-' + affId);
  return g ? g.querySelector('[data-r="'+r+'"][data-c="'+c+'"]') : null;
}

function wsGetCellsBetween(r1,c1,r2,c2) {
  var cells = [];
  if (r1 === r2) {
    var mn = Math.min(c1,c2), mx = Math.max(c1,c2);
    for (var c = mn; c <= mx; c++) cells.push([r1,c]);
  } else if (c1 === c2) {
    var mn2 = Math.min(r1,r2), mx2 = Math.max(r1,r2);
    for (var r = mn2; r <= mx2; r++) cells.push([r,c1]);
  }
  return cells;
}

function wsInitAffaire(aff) {
  if (!aff.grid) {
    var result = generateGrid(aff.wordPlacements, aff.residualSeq);
    aff.grid = result.grid;
    aff.residuels = result.residuels;
  }
  wsStates[aff.id] = {found:[], done:false, mouseDown:false, startCell:null, endCell:null, axis:null};

  var hdr = document.getElementById('ws-hdr-' + aff.id);
  if (hdr) {
    hdr.innerHTML =
      '<div class="s2-progress">' +
        wsStep('Affaire 1', aff.affaireNum >= 1) +
        '<div class="s2-connector"></div>' +
        wsStep('Affaire 2', aff.affaireNum >= 2) +
        '<div class="s2-connector"></div>' +
        wsStep('Affaire 3', aff.affaireNum >= 3) +
      '</div>' +
      '<p class="ws-titre">' + aff.titre + '</p>' +
      '<div class="divider"></div>';
  }

  wsRenderGrid(aff);
  wsRenderWordList(aff);

  verifyGrid(aff);
  var ans = document.getElementById('ws-ans-' + aff.id);
  if (ans) { ans.innerHTML = ''; ans.style.display = 'none'; }
}

function wsStep(label, lit) {
  return '<div class="s2-step'+(lit?' lit':'')+'"><div class="s2-dot"></div><span class="s2-step-label">'+label+'</span></div>';
}

function wsExtendSel(aff, r, c) {
  var st = wsStates[aff.id];
  if (!st.startCell) return;
  var sr = st.startCell[0], sc = st.startCell[1];
  if (r === sr && c === sc) { wsClearSel(aff); st.endCell = [r, c]; return; }
  if (!st.axis) {
    if (r === sr) st.axis = 'H';
    else if (c === sc) st.axis = 'V';
    else st.axis = (Math.abs(r - sr) >= Math.abs(c - sc)) ? 'V' : 'H';
  }
  st.endCell = (st.axis === 'H') ? [sr, c] : [r, sc];
  var cells = (st.axis === 'H')
    ? wsGetCellsBetween(sr, sc, sr, c)
    : wsGetCellsBetween(sr, sc, r, sc);
  wsClearSel(aff);
  cells.forEach(function(pos) {
    var cell = wsGetCell(aff.id, pos[0], pos[1]);
    if (cell && !cell.classList.contains('ws-found')) cell.classList.add('ws-sel');
  });
}

function wsRenderGrid(aff) {
  var gridEl = document.getElementById('ws-grid-' + aff.id);
  if (!gridEl) return;
  gridEl.innerHTML = '';
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 10; c++) {
      var cell = document.createElement('div');
      cell.className = 'ws-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = aff.grid[r][c];
      gridEl.appendChild(cell);
    }
  }

  gridEl.addEventListener('mousedown', function(e) {
    e.preventDefault();
    var st = wsStates[aff.id];
    if (st.done) return;
    var t = e.target.closest('.ws-cell');
    if (!t) return;
    st.mouseDown = true;
    st.startCell = [parseInt(t.dataset.r), parseInt(t.dataset.c)];
    st.endCell = st.startCell;
    st.axis = null;
    wsActiveAffaire = aff;
    wsClearSel(aff);
    if (!t.classList.contains('ws-found')) t.classList.add('ws-sel');
  });

  gridEl.addEventListener('mouseover', function(e) {
    var st = wsStates[aff.id];
    if (!st.mouseDown) return;
    var t = e.target.closest('.ws-cell');
    if (t) wsExtendSel(aff, parseInt(t.dataset.r), parseInt(t.dataset.c));
  });

  gridEl.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var st = wsStates[aff.id];
    if (st.done) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var cell = el && el.closest('.ws-cell');
    if (!cell) return;
    st.mouseDown = true;
    st.startCell = [parseInt(cell.dataset.r), parseInt(cell.dataset.c)];
    st.endCell = st.startCell;
    st.axis = null;
    wsActiveAffaire = aff;
    wsClearSel(aff);
    if (!cell.classList.contains('ws-found')) cell.classList.add('ws-sel');
  }, {passive:false});

  gridEl.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var st = wsStates[aff.id];
    if (!st.mouseDown) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var cell = el && el.closest('.ws-cell');
    if (cell) wsExtendSel(aff, parseInt(cell.dataset.r), parseInt(cell.dataset.c));
  }, {passive:false});

  gridEl.addEventListener('touchend', function(e) {
    e.preventDefault();
    var st = wsStates[aff.id];
    if (!st.mouseDown) return;
    st.mouseDown = false;
    wsActiveAffaire = null;
    var selCells = wsSelRange(st);
    wsClearSel(aff);
    st.startCell = null;
    st.endCell = null;
    st.axis = null;
    if (selCells.length >= 2) wsCheckMatch(aff, selCells);
  }, {passive:false});
}

function wsClearSel(aff) {
  var g = document.getElementById('ws-grid-' + aff.id);
  if (!g) return;
  g.querySelectorAll('.ws-sel').forEach(function(c) {
    c.classList.remove('ws-sel');
  });
}

function wsSelRange(st) {
  if (!st.startCell || !st.endCell) return [];
  var sr = st.startCell[0], sc = st.startCell[1];
  var er = st.endCell[0],   ec = st.endCell[1];
  if (st.axis === 'H') return wsGetCellsBetween(sr, sc, sr, ec);
  if (st.axis === 'V') return wsGetCellsBetween(sr, sc, er, sc);
  if (sr === er) return wsGetCellsBetween(sr, sc, sr, ec);
  if (sc === ec) return wsGetCellsBetween(sr, sc, er, sc);
  return [];
}

function wsCheckMatch(aff, cells) {
  var forward = cells.map(function(p) { return aff.grid[p[0]][p[1]]; }).join('');
  var backward = forward.split('').reverse().join('');
  var st = wsStates[aff.id];
  var foundMot = null;
  aff.wordPlacements.forEach(function(p) {
    if (st.found.indexOf(p.mot) !== -1) return;
    if (forward === p.mot || backward === p.mot) foundMot = p.mot;
  });
  if (foundMot) {
    st.found.push(foundMot);
    cells.forEach(function(p) {
      var c = wsGetCell(aff.id, p[0], p[1]);
      if (c) { c.classList.remove('ws-sel'); c.classList.add('ws-found'); }
    });
    var item = document.querySelector('#ws-wlist-'+aff.id+' [data-mot="'+foundMot+'"]');
    if (item) item.classList.add('ws-word-found');
    if (st.found.length >= aff.wordPlacements.length) {
      st.done = true;
      setTimeout(function() { wsRevealGhost(aff); }, 400);
    }
  }
}

function wsRenderWordList(aff) {
  var el = document.getElementById('ws-wlist-' + aff.id);
  if (!el) return;
  el.innerHTML = '<div class="ws-list-lbl">Mots à trouver</div>';
  aff.wordPlacements.forEach(function(p) {
    var item = document.createElement('div');
    item.className = 'ws-word-item';
    item.dataset.mot = p.mot;
    item.textContent = p.mot;
    el.appendChild(item);
  });
  var ghost = document.createElement('div');
  ghost.className = 'ws-word-item';
  ghost.id = 'ws-ghost-item-' + aff.id;
  ghost.textContent = aff.ghost.mot;
  el.appendChild(ghost);
}

function wsRevealGhost(aff) {
  var ghostItem = document.getElementById('ws-ghost-item-' + aff.id);
  if (ghostItem) {
    ghostItem.classList.add('ws-word-ghost-revealed');
    var msg = document.createElement('div');
    msg.className = 'ws-ghost-msg';
    msg.textContent = 'Ce mot est introuvable dans la grille. Il constitue votre premier indice.';
    ghostItem.parentNode.insertBefore(msg, ghostItem.nextSibling);
  }
  setTimeout(function() { wsIlluminateResiduals(aff); }, 1800);
}

function verifyGrid(aff) {
  var wordCells = {};
  aff.wordPlacements.forEach(function(p) {
    for (var i = 0; i < p.mot.length; i++) {
      var r = p.dir === 'V' ? p.row + i : p.row;
      var c = p.dir === 'H' ? p.col + i : p.col;
      var key = r + ',' + c;
      if (wordCells[key] && wordCells[key] !== p.mot[i]) {
        console.error('[verifyGrid] Affaire ' + aff.affaireNum + ': conflit cellule (' + r + ',' + c + ') entre "' + wordCells[key] + '" et "' + p.mot[i] + '"');
      }
      wordCells[key] = p.mot[i];
    }
  });
  var uniqueWordCount = Object.keys(wordCells).length;
  var residualCount = aff.residuels.length;
  var total = uniqueWordCount + residualCount;
  if (total !== 100) {
    console.error('[verifyGrid] Affaire ' + aff.affaireNum + ': total=' + total + ' (attendu 100). mots=' + uniqueWordCount + ', res=' + residualCount);
  }
  var ghost = aff.ghost.cat;
  var expected = '';
  if (ghost === 'TUEUR') expected = aff.solution.methode + aff.solution.lieu;
  else if (ghost === 'METHODE') expected = aff.solution.tueur + aff.solution.lieu;
  else expected = aff.solution.tueur + aff.solution.methode;
  var residualLetters = aff.residuels.map(function(pos) { return aff.grid[pos[0]][pos[1]]; }).join('');
  var rSorted = residualLetters.split('').sort().join('');
  var eSorted = expected.split('').sort().join('');
  if (rSorted !== eSorted) {
    console.error('[verifyGrid] Affaire ' + aff.affaireNum + ': residuels="' + residualLetters + '" != attendu="' + expected + '"');
  } else {
    console.log('[verifyGrid] Affaire ' + aff.affaireNum + ' OK — ' + uniqueWordCount + ' mots + ' + residualCount + ' res = 100');
  }
}

function wsIlluminateResiduals(aff) {
  var res = aff.residuels;
  var interval = Math.min(300, Math.ceil(2800 / res.length));
  res.forEach(function(pos, i) {
    setTimeout(function() {
      var c = wsGetCell(aff.id, pos[0], pos[1]);
      if (c) c.classList.add('ws-residual');
    }, i * interval);
  });
  setTimeout(function() { wsShowAnswerForm(aff); }, Math.min(2800, res.length * interval) + 500);
}

function wsShowAnswerForm(aff) {
  var sec = document.getElementById('ws-ans-' + aff.id);
  if (!sec) return;
  sec.style.display = 'block';
  var fields = [
    {key:'tueur',    label:'TUEUR',   len:aff.solution.tueur.length},
    {key:'methode',  label:'MÉTHODE', len:aff.solution.methode.length},
    {key:'lieu',     label:'LIEU',    len:aff.solution.lieu.length}
  ];
  var html = '';
  fields.forEach(function(f) {
    html += '<div class="ws-answer-row"><span class="ws-answer-lbl">' + f.label + '</span>';
    html += '<div class="ws-char-boxes" id="ws-chars-' + aff.id + '-' + f.key + '">';
    for (var i = 0; i < f.len; i++) {
      html += '<input class="ws-char-inp" type="text" inputmode="text" maxlength="2" autocomplete="off" data-idx="' + i + '" />';
    }
    html += '</div></div>';
  });
  html += '<button class="btn ws-sub-btn" id="ws-sub-' + aff.id + '">Refermer le dossier</button>';
  html += '<div class="ws-stamp-wrap" id="ws-sw-' + aff.id + '"></div>';
  if (aff.nextAffaire) {
    html += '<div id="ws-nxt-' + aff.id + '" style="display:none"><button class="btn" id="ws-nxt-btn-' + aff.id + '">Affaire suivante &rarr;</button></div>';
  } else {
    html += '<div id="ws-nxt-' + aff.id + '" style="display:none"><p style="font-family:var(--font-corps);font-style:italic;color:var(--or-clair);font-size:0.9rem;margin-top:0.5rem;">Vous avez résolu les trois affaires.</p></div>';
  }
  sec.innerHTML = html;

  fields.forEach(function(f) {
    var boxes = Array.prototype.slice.call(sec.querySelectorAll('#ws-chars-' + aff.id + '-' + f.key + ' .ws-char-inp'));
    boxes.forEach(function(box, idx) {
      box.addEventListener('input', function() {
        var v = wsNorm(box.value).replace(/[^A-Z]/g, '');
        box.value = v ? v[v.length - 1] : '';
        if (box.value && idx < boxes.length - 1) boxes[idx + 1].focus();
      });
      box.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !box.value && idx > 0) {
          boxes[idx - 1].focus();
          boxes[idx - 1].value = '';
        }
      });
    });
  });

  var firstBox = sec.querySelector('.ws-char-inp');
  if (firstBox) firstBox.focus();

  document.getElementById('ws-sub-' + aff.id).addEventListener('click', function() {
    wsValidate(aff);
  });
  if (aff.nextAffaire) {
    document.getElementById('ws-nxt-btn-' + aff.id).addEventListener('click', function() {
      showAffaire(aff.nextAffaire);
    });
  }
}

function wsValidate(aff) {
  function readField(key) {
    var boxes = document.querySelectorAll('#ws-chars-' + aff.id + '-' + key + ' .ws-char-inp');
    var v = '';
    boxes.forEach(function(b) { v += b.value; });
    return wsNorm(v);
  }
  var okT = readField('tueur')   === wsNorm(aff.solution.tueur);
  var okM = readField('methode') === wsNorm(aff.solution.methode);
  var okL = readField('lieu')    === wsNorm(aff.solution.lieu);
  var ok = okT && okM && okL;

  // Mise à jour du score utilisateur
  if (ok) {
    var user = getUser();
    if (user && user.affairesResolues.indexOf(aff.id) === -1) {
      user.affairesResolues.push(aff.id);
      var total = user.affairesResolues.length;
      if (total >= 3) user.grade = 'Commissaire Divisionnaire';
      else if (total >= 2) user.grade = 'Commissaire';
      else if (total >= 1) user.grade = 'Inspecteur';
      updateUser(user);
    }
  }

  var wrap = document.getElementById('ws-sw-' + aff.id);
  var stamp = document.createElement('div');
  stamp.className = 'ws-stamp ' + (ok ? 'ws-resolu' : 'ws-echec');
  stamp.textContent = ok ? 'RÉSOLU' : 'ÉCHEC';
  wrap.appendChild(stamp);
  if (!ok) {
    var sol = document.createElement('p');
    sol.className = 'ws-sol-reveal';
    sol.textContent = 'Tueur : ' + aff.solution.tueur + ' — Méthode : ' + aff.solution.methode + ' — Lieu : ' + aff.solution.lieu;
    wrap.appendChild(sol);
  }
  document.getElementById('ws-sub-' + aff.id).disabled = true;
  document.getElementById('ws-nxt-' + aff.id).style.display = 'block';
}

document.addEventListener('mouseup', function() {
  if (!wsActiveAffaire) return;
  var aff = wsActiveAffaire;
  var st = wsStates[aff.id];
  if (!st || !st.mouseDown) return;
  st.mouseDown = false;
  wsActiveAffaire = null;
  var selCells = wsSelRange(st);
  wsClearSel(aff);
  st.startCell = null;
  st.endCell = null;
  st.axis = null;
  if (selCells.length >= 2) wsCheckMatch(aff, selCells);
});

/* ═══════════════════════════════════════════════════════════
   Navigation entre affaires (séquentielle)
═══════════════════════════════════════════════════════════ */
var currentAffaireId = 1;

function showAffaire(id) {
  // Masquer toutes les affaires
  document.querySelectorAll('.affaire-screen').forEach(function(el) {
    el.classList.remove('active');
  });
  // Afficher la demandée
  var target = document.getElementById('affaire-' + id);
  if (target) {
    target.classList.add('active');
    currentAffaireId = id;
    var aff = AFFAIRES.find(function(a) { return a.id === id; });
    if (aff) wsInitAffaire(aff);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var user = getUser();
  var resolues = user ? user.affairesResolues : [];

  // Déverrouiller les affaires résolues + la suivante
  AFFAIRES.forEach(function(aff, idx) {
    var lockedEl = document.getElementById('affaire-locked-' + aff.id);
    var screenEl = document.getElementById('affaire-' + aff.id);

    var unlocked = (aff.id === 1) || (idx > 0 && resolues.indexOf(AFFAIRES[idx-1].id) !== -1);

    if (lockedEl) {
      lockedEl.style.display = unlocked ? 'none' : 'flex';
    }
    if (screenEl) {
      if (!unlocked) {
        screenEl.querySelector('.affaire-game').style.display = 'none';
        screenEl.querySelector('.affaire-locked').style.display = 'flex';
      }
    }
  });

  // Afficher la première affaire non résolue
  var firstUnresolved = AFFAIRES.find(function(a) {
    return resolues.indexOf(a.id) === -1;
  }) || AFFAIRES[0];

  showAffaire(firstUnresolved.id);
});
