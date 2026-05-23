/* ═══════════════════════════════════════════════════════════
   tutoriel.js — Affaire de démonstration guidée
═══════════════════════════════════════════════════════════ */

/*
  Grille 8×8 — chaque cellule appartient soit à un mot soit aux résiduelles.

  row 0 : RAPPORT(H,0-6)     + R (REGISTRE col7)
  row 1 : P(résid,0) PISTE(H,1-5) A(résid,6) + E (REGISTRE col7)
  row 2 : PORTAIL(H,0-6)     + G (REGISTRE col7)
  row 3 : U(résid,0) MOTIF(H,1-5) V(résid,6) + I (REGISTRE col7)
  row 4 : COULOIR(H,0-6)     + S (REGISTRE col7)
  row 5 : L(résid,0) CRIME(H,1-5) C(résid,6) + T (REGISTRE col7)
  row 6 : TABLEAU(H,0-6)     + R (REGISTRE col7)
  row 7 : A(résid,0) GARDE(H,1-5) E(résid,6) + E (REGISTRE col7)

  56 cellules-mots + 8 résiduelles = 64 ✓
  Résiduelles : P,A,U,V,L,C,A,E → PAUL + CAVE ✓
*/

var TUTO_GRID = [
  ['R','A','P','P','O','R','T','R'],
  ['P','P','I','S','T','E','A','E'],
  ['P','O','R','T','A','I','L','G'],
  ['U','M','O','T','I','F','V','I'],
  ['C','O','U','L','O','I','R','S'],
  ['L','C','R','I','M','E','C','T'],
  ['T','A','B','L','E','A','U','R'],
  ['A','G','A','R','D','E','E','E']
];

var TUTO_WORDS    = ['RAPPORT','PISTE','PORTAIL','MOTIF','COULOIR','CRIME','TABLEAU','GARDE','REGISTRE'];
var TUTO_GHOST    = 'CORDE';
var TUTO_RESIDUELS = [
  [1,0],[1,6],[3,0],[3,6],[5,0],[5,6],[7,0],[7,6]
];
var TUTO_SOLUTION = { tueur: 'PAUL', methode: 'CORDE', lieu: 'CAVE' };

/* Position data for each findable word (used by verifierGrilleTutoriel) */
var MOTS_TUTORIEL = [
  { mot: 'RAPPORT',  dir: 'H', positions: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]] },
  { mot: 'PISTE',    dir: 'H', positions: [[1,1],[1,2],[1,3],[1,4],[1,5]] },
  { mot: 'PORTAIL',  dir: 'H', positions: [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6]] },
  { mot: 'MOTIF',    dir: 'H', positions: [[3,1],[3,2],[3,3],[3,4],[3,5]] },
  { mot: 'COULOIR',  dir: 'H', positions: [[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]] },
  { mot: 'CRIME',    dir: 'H', positions: [[5,1],[5,2],[5,3],[5,4],[5,5]] },
  { mot: 'TABLEAU',  dir: 'H', positions: [[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6]] },
  { mot: 'GARDE',    dir: 'H', positions: [[7,1],[7,2],[7,3],[7,4],[7,5]] },
  { mot: 'REGISTRE', dir: 'V', positions: [[0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7]] }
];

var TUTO_RESIDUELS_DATA = [
  { row:1, col:0, lettre:'P' },
  { row:1, col:6, lettre:'A' },
  { row:3, col:0, lettre:'U' },
  { row:3, col:6, lettre:'V' },
  { row:5, col:0, lettre:'L' },
  { row:5, col:6, lettre:'C' },
  { row:7, col:0, lettre:'A' },
  { row:7, col:6, lettre:'E' }
];

/* ── Vérification de la grille ── */
function verifierGrilleTutoriel() {
  var ROWS = 8, COLS = 8;
  var couvert = {};

  MOTS_TUTORIEL.forEach(function(m) {
    m.positions.forEach(function(pos, idx) {
      var r = pos[0], c = pos[1];
      var lettreMot = m.mot[idx];
      if (TUTO_GRID[r][c] !== lettreMot) {
        console.error('%cERREUR (' + r + ',' + c + '): grille="' +
          TUTO_GRID[r][c] + '" mot=' + m.mot + ' attendu="' + lettreMot + '"',
          'color:#c97a7a');
      }
      couvert[r + ',' + c] = true;
    });
  });

  TUTO_RESIDUELS_DATA.forEach(function(res) {
    var key = res.row + ',' + res.col;
    if (couvert[key]) {
      console.error('%cERREUR: résiduelle (' + res.row + ',' + res.col + ') déjà couverte', 'color:#c97a7a');
    }
    if (TUTO_GRID[res.row][res.col] !== res.lettre) {
      console.error('%cERREUR résiduelle (' + res.row + ',' + res.col + '): grille="' +
        TUTO_GRID[res.row][res.col] + '" attendu="' + res.lettre + '"', 'color:#c97a7a');
    }
    couvert[key] = true;
  });

  var total = Object.keys(couvert).length;
  if (total !== ROWS * COLS) {
    console.error('%cERREUR: ' + total + ' cellules couvertes sur ' + (ROWS * COLS), 'color:#c97a7a');
  }

  var lettresRes = TUTO_RESIDUELS_DATA.map(function(r) { return r.lettre; }).sort().join('');
  var lettresAttendues = 'PAUL'.split('').concat('CAVE'.split('')).sort().join('');
  if (lettresRes !== lettresAttendues) {
    console.error('%cERREUR résiduelles: "' + lettresRes + '" attendu "' + lettresAttendues + '"', 'color:#c97a7a');
  }

  console.log(
    '%c✓ Grille tutoriel validée : ' +
    (total - TUTO_RESIDUELS_DATA.length) + ' cellules-mots + ' +
    TUTO_RESIDUELS_DATA.length + ' résiduelles = ' + total,
    'color:#4caf50'
  );
}

var tS = { step: 1, found: [], startCell: null, previewCells: [], hintTimers: [] };

/* ── Helpers ── */
function tCell(r, c) {
  return document.querySelector('#tuto-grid [data-r="'+r+'"][data-c="'+c+'"]');
}

function tPath(sr, sc, er, ec) {
  var dr = er-sr, dc = ec-sc;
  if (dr===0 && dc===0) return [[sr,sc]];
  var isH = dr===0, isV = dc===0, isDiag = Math.abs(dr)===Math.abs(dc);
  if (!isH && !isV && !isDiag) return null;
  var steps = Math.max(Math.abs(dr), Math.abs(dc));
  var rS = dr===0?0:(dr>0?1:-1), cS = dc===0?0:(dc>0?1:-1);
  var path=[];
  for (var i=0; i<=steps; i++) path.push([sr+i*rS, sc+i*cS]);
  return path;
}

function tNorm(s) {
  return (s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
}

/* ── Confetti ── */
function tConfetti() {
  var colors = ['#c9a84c','#e8d5a3','#4a9a40','#f5f0e8','#c9a84c'];
  for (var i=0; i<48; i++) {
    (function(idx){
      setTimeout(function(){
        var d = document.createElement('div');
        d.style.cssText = 'position:fixed;top:-8px;left:'+(Math.random()*100)+'%;'
          +'width:'+(5+Math.random()*5)+'px;height:'+(5+Math.random()*5)+'px;'
          +'background:'+colors[idx%colors.length]+';border-radius:50%;z-index:9999;'
          +'pointer-events:none;animation:confettiFall '+(1.1+Math.random()*1.4)+'s ease forwards;';
        document.body.appendChild(d);
        setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},3000);
      }, idx*35);
    })(i);
  }
}

/* ── Rendu grille ── */
function tRenderGrid() {
  var grid = document.getElementById('tuto-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (var r=0; r<8; r++) {
    for (var c=0; c<8; c++) {
      var cell = document.createElement('div');
      cell.className = 'tuto-cell';
      cell.dataset.r = r; cell.dataset.c = c;
      cell.textContent = TUTO_GRID[r][c];
      grid.appendChild(cell);
    }
  }
  grid.addEventListener('click', tHandleClick);
  grid.addEventListener('mouseover', tHandleHover);
  grid.addEventListener('contextmenu', function(e){ e.preventDefault(); tCancelSel(); });
  grid.addEventListener('touchstart', function(e){
    e.preventDefault();
    var t = e.touches[0];
    var el = document.elementFromPoint(t.clientX, t.clientY);
    var cell = el && el.closest('[data-r][data-c]');
    if (!cell) return;
    tHandleClick({target: cell});
  }, {passive:false});
  grid.addEventListener('touchmove', function(e){
    e.preventDefault();
    if (!tS.startCell || tS.step!==2) return;
    var t = e.touches[0];
    var el = document.elementFromPoint(t.clientX, t.clientY);
    var cell = el && el.closest('[data-r][data-c]');
    if (!cell) return;
    tHandleHover({target: cell});
  }, {passive:false});
}

/* ── Rendu liste de mots ── */
function tRenderWords() {
  var list = document.getElementById('tuto-words');
  if (!list) return;
  list.innerHTML = '<div class="tuto-list-lbl">Mots à trouver</div>';
  TUTO_WORDS.forEach(function(w){
    var el = document.createElement('div');
    el.className = 'tuto-word-item'; el.id = 'tword-'+w; el.textContent = w;
    list.appendChild(el);
  });
  var ghost = document.createElement('div');
  ghost.className = 'tuto-word-item tuto-ghost-item';
  ghost.id = 'tword-'+TUTO_GHOST; ghost.textContent = TUTO_GHOST;
  list.appendChild(ghost);
}

/* ── Interaction grille ── */
function tHandleClick(e) {
  if (tS.step !== 2) return;
  var cell = e.target.closest ? e.target.closest('[data-r][data-c]') : e.target;
  if (!cell || !cell.dataset) return;
  var r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);

  if (!tS.startCell) {
    tS.startCell = [r,c];
    cell.classList.add('tuto-sel');
    return;
  }
  if (tS.startCell[0]===r && tS.startCell[1]===c) { tCancelSel(); return; }

  var path = tPath(tS.startCell[0], tS.startCell[1], r, c);
  var startEl = tCell(tS.startCell[0], tS.startCell[1]);
  if (startEl) startEl.classList.remove('tuto-sel');
  tClearPreview();
  tS.startCell = null;

  if (!path || path.length < 2) {
    tS.startCell = [r,c]; cell.classList.add('tuto-sel'); return;
  }

  var word = path.map(function(p){ return TUTO_GRID[p[0]][p[1]]; }).join('');
  var rev  = word.split('').reverse().join('');
  var matched = null;
  for (var i=0; i<TUTO_WORDS.length; i++) {
    var w = TUTO_WORDS[i];
    if ((word===w || rev===w) && tS.found.indexOf(w)===-1) { matched=w; break; }
  }

  if (matched) {
    tS.found.push(matched);
    path.forEach(function(p){
      var cl = tCell(p[0],p[1]);
      if (cl) { cl.classList.remove('tuto-guide','tuto-sel'); cl.classList.add('tuto-found'); }
    });
    var wEl = document.getElementById('tword-'+matched);
    if (wEl) wEl.classList.add('tuto-word-found');
    if (matched==='RAPPORT') tConfetti();
    tUpdateStep2();
  } else {
    path.forEach(function(p){
      var cl = tCell(p[0],p[1]);
      if (cl) {
        cl.classList.add('tuto-flash-err');
        (function(el){ setTimeout(function(){ el.classList.remove('tuto-flash-err'); },400); })(cl);
      }
    });
  }
}

function tHandleHover(e) {
  if (!tS.startCell || tS.step!==2) return;
  var cell = e.target.closest ? e.target.closest('[data-r][data-c]') : e.target;
  if (!cell || !cell.dataset) return;
  var r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
  if (tS.startCell[0]===r && tS.startCell[1]===c) return;
  tClearPreview();
  var path = tPath(tS.startCell[0], tS.startCell[1], r, c);
  if (!path) return;
  path.forEach(function(p){
    var cl = tCell(p[0],p[1]);
    if (cl && !cl.classList.contains('tuto-found')) {
      cl.classList.add('tuto-preview'); tS.previewCells.push(cl);
    }
  });
}

function tClearPreview() {
  tS.previewCells.forEach(function(c){ c.classList.remove('tuto-preview'); });
  tS.previewCells = [];
}

function tCancelSel() {
  if (tS.startCell) {
    var el = tCell(tS.startCell[0], tS.startCell[1]);
    if (el) el.classList.remove('tuto-sel');
    tS.startCell = null;
  }
  tClearPreview();
}

function tUpdateStep2() {
  var prog = document.getElementById('step2-progress');
  if (prog) prog.textContent = tS.found.length + ' / '+TUTO_WORDS.length+' mots trouvés';
  if (tS.found.length === TUTO_WORDS.length) {
    document.querySelectorAll('.tuto-guide').forEach(function(c){ c.classList.remove('tuto-guide'); });
    var btn = document.getElementById('btn-step2');
    if (btn) btn.classList.remove('hidden');
  }
}

/* ── Navigation étapes ── */
function tGoToStep(n) {
  tS.step = n;
  for (var i=1; i<=5; i++) {
    var dot = document.getElementById('tp'+i);
    if (dot) { dot.classList.toggle('active', i===n); dot.classList.toggle('done', i<n); }
  }
  var wrapper = document.getElementById('tuto-grid-wrapper');
  if (wrapper) wrapper.classList.toggle('grille-bloquee', n===1);

  var fns = [null, tStep1, tStep2, tStep3, tStep4, tStep5];
  if (fns[n]) fns[n]();
}

function tSetPanel(html) {
  var p = document.getElementById('panneau-guide');
  if (p) p.innerHTML = html;
}

/* ── Étape 1 — Bienvenue ── */
function tStep1() {
  tSetPanel(
    '<h2 class="tuto-titre">Bienvenue, Inspecteur.</h2>'+
    '<p>Dans chaque affaire, une grille de mots mêlés cache les indices d\'un crime. Votre mission : trouver le tueur, la méthode et le lieu.</p>'+
    '<p>Observez la liste de mots à droite de la grille. Certains sont dans la grille. <strong>L\'un d\'eux est introuvable</strong>. Ce mot fantôme est votre premier indice.</p>'+
    '<button id="btn-step1" class="tuto-btn-primary">Compris, je commence →</button>'
  );
  document.querySelectorAll('.tuto-word-item').forEach(function(el){ el.classList.add('highlight-guide'); });
  document.getElementById('btn-step1').addEventListener('click', function(){ tGoToStep(2); });
}

/* ── Étape 2 — Trouver les mots ── */
function tStep2() {
  document.querySelectorAll('.tuto-word-item').forEach(function(el){ el.classList.remove('highlight-guide'); });
  // Mettre RAPPORT en surbrillance sur la première ligne si pas encore trouvé
  if (tS.found.indexOf('RAPPORT')===-1) {
    [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]].forEach(function(p){
      var cl = tCell(p[0],p[1]);
      if (cl && !cl.classList.contains('tuto-found')) cl.classList.add('tuto-guide');
    });
  }
  tSetPanel(
    '<h2 class="tuto-titre">Trouvez les mots cachés.</h2>'+
    '<p>Cliquez sur la <strong>première lettre</strong> d\'un mot, puis sur la <strong>dernière</strong>. Les mots peuvent être horizontaux ou verticaux.</p>'+
    '<p>Commencez par <strong>RAPPORT</strong> — horizontal sur la première ligne ↗</p>'+
    '<div class="tuto-arrow-anim">→ regardez la grille</div>'+
    '<div id="step2-progress" class="tuto-prog-txt">0 / '+TUTO_WORDS.length+' mots trouvés</div>'+
    '<button id="btn-step2" class="tuto-btn-primary hidden">Continuer →</button>'
  );
  tUpdateStep2();
  document.getElementById('btn-step2').addEventListener('click', function(){ tGoToStep(3); });
}

/* ── Étape 3 — Mot fantôme ── */
function tStep3() {
  var ghostEl = document.getElementById('tword-'+TUTO_GHOST);
  if (ghostEl) {
    ghostEl.classList.add('tuto-ghost-revealed');
    var msg = document.createElement('div');
    msg.className = 'tuto-ghost-msg';
    msg.textContent = '✗ Introuvable dans la grille — c\'est votre indice !';
    if (ghostEl.parentNode) ghostEl.parentNode.insertBefore(msg, ghostEl.nextSibling);
  }
  tSetPanel(
    '<h2 class="tuto-titre">Le mot fantôme révèle un indice.</h2>'+
    '<p><strong>CORDE</strong> est dans la liste mais <strong>introuvable</strong> dans la grille.</p>'+
    '<p>Ce mot fantôme est votre <strong>PREMIER INDICE</strong>. Il révèle la <strong>MÉTHODE</strong> du crime.</p>'+
    '<div class="tuto-indice-box">🗡&nbsp;&nbsp;MÉTHODE : CORDE</div>'+
    '<p style="font-size:0.82rem;opacity:0.65;margin-top:6px">Les lettres restantes dans la grille vont s\'illuminer…</p>'+
    '<button id="btn-step3" class="tuto-btn-primary">Je vois les lettres restantes →</button>'
  );
  var delay = 0;
  var interval = Math.min(200, Math.ceil(2400 / TUTO_RESIDUELS.length));
  TUTO_RESIDUELS.forEach(function(pos){
    (function(p,d){ setTimeout(function(){
      var cl = tCell(p[0],p[1]);
      if (cl) cl.classList.add('tuto-residual');
    },d); })(pos, delay);
    delay += interval;
  });
  document.getElementById('btn-step3').addEventListener('click', function(){ tGoToStep(4); });
}

/* ── Étape 4 — Déduire ── */
function tStep4() {
  tS.hintTimers.forEach(function(t){ clearTimeout(t); });
  tS.hintTimers = [
    setTimeout(function(){
      var el=document.getElementById('hint1'); if(el) el.style.display='block';
    }, 10000),
    setTimeout(function(){
      var el=document.getElementById('hint2'); if(el) el.style.display='block';
    }, 20000)
  ];

  tSetPanel(
    '<h2 class="tuto-titre">Assemblez les indices.</h2>'+
    '<p>Les lettres illuminées en or forment les deux indices restants :</p>'+
    '<p>Un <strong>prénom</strong> → le TUEUR<br>Un <strong>lieu</strong> → l\'endroit du crime</p>'+
    '<div id="hint1" class="tuto-hint" style="display:none">Indice : cherchez un prénom de 4 lettres parmi les lettres illuminées…</div>'+
    '<div id="hint2" class="tuto-hint" style="display:none">Les lettres P‑A‑U‑L et C‑A‑V‑E se cachent parmi les lettres illuminées.</div>'+
    '<div class="tuto-fields">'+
      tFieldHtml('TUEUR',4,'f-tueur')+
      tFieldPrefilled('MÉTHODE',TUTO_SOLUTION.methode)+
      tFieldHtml('LIEU',4,'f-lieu')+
      '<button id="btn-valider" class="tuto-btn-primary" style="margin-top:10px;width:100%;text-align:center">Refermer le dossier</button>'+
      '<div id="tuto-err" style="display:none;color:#c97a7a;font-family:\'Courier Prime\',monospace;font-size:12px;text-align:center;margin-top:6px">Réponse incorrecte, réessayez.</div>'+
    '</div>'
  );
  tWireInputs('f-tueur',4);
  tWireInputs('f-lieu',4);
  document.getElementById('btn-valider').addEventListener('click', tValidate);
}

function tFieldHtml(label, len, id) {
  var boxes='';
  for (var i=0; i<len; i++) boxes+='<input class="tuto-char-inp" type="text" maxlength="2" autocomplete="off" data-idx="'+i+'" />';
  return '<div class="tuto-field-row"><span class="tuto-field-lbl">'+label+'</span><div id="'+id+'" class="tuto-char-boxes">'+boxes+'</div></div>';
}

function tFieldPrefilled(label, word) {
  var boxes='';
  for (var i=0; i<word.length; i++) boxes+='<div class="tuto-char-pre">'+word[i]+'</div>';
  return '<div class="tuto-field-row"><span class="tuto-field-lbl">'+label+'</span><div class="tuto-char-boxes tuto-prefilled">'+boxes+'</div></div>';
}

function tWireInputs(containerId, len) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var boxes = Array.prototype.slice.call(container.querySelectorAll('.tuto-char-inp'));
  boxes.forEach(function(box, idx){
    box.addEventListener('input', function(){
      var v = tNorm(box.value).replace(/[^A-Z]/g,'');
      box.value = v ? v[v.length-1] : '';
      if (box.value && idx < boxes.length-1) boxes[idx+1].focus();
    });
    box.addEventListener('keydown', function(e){
      if (e.key==='Backspace' && !box.value && idx>0){
        boxes[idx-1].focus(); boxes[idx-1].value='';
      }
    });
  });
  if (boxes[0]) boxes[0].focus();
}

function tReadField(id) {
  var container = document.getElementById(id);
  if (!container) return '';
  var v='';
  container.querySelectorAll('.tuto-char-inp').forEach(function(b){ v+=b.value; });
  return tNorm(v);
}

function tValidate() {
  tS.hintTimers.forEach(function(t){ clearTimeout(t); });
  var okT = tReadField('f-tueur') === tNorm(TUTO_SOLUTION.tueur);
  var okL = tReadField('f-lieu')  === tNorm(TUTO_SOLUTION.lieu);
  var errEl = document.getElementById('tuto-err');
  if (okT && okL) {
    if (errEl) errEl.style.display='none';
    tGoToStep(5);
  } else {
    if (errEl) errEl.style.display='block';
    var btn = document.getElementById('btn-valider');
    if (btn) {
      btn.style.borderColor='#8b1a1a'; btn.style.color='#8b1a1a';
      setTimeout(function(){ btn.style.borderColor=''; btn.style.color=''; },1200);
    }
  }
}

/* ── Étape 5 — Résultat ── */
function tStep5() {
  tConfetti();
  var overlay = document.getElementById('overlay-tuto');
  if (overlay) overlay.classList.remove('hidden');
  var btnReplay = document.getElementById('btn-rejouer-tuto');
  if (btnReplay) btnReplay.addEventListener('click', function(){
    overlay.classList.add('hidden');
    tS = {step:1, found:[], startCell:null, previewCells:[], hintTimers:[]};
    tRenderGrid(); tRenderWords(); tGoToStep(1);
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function(){
  verifierGrilleTutoriel();
  tRenderGrid();
  tRenderWords();
  tGoToStep(1);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') tCancelSel(); });
});
