/* ═══════════════════════════════════════════════════════════
   affaires.js — Moteur mots mêlés & données AFFAIRES
═══════════════════════════════════════════════════════════ */

function generateGrid(placements, residualSeq) {
  var r, c, i, pr, pc;
  var grid = [], wordCells = [];
  for (r = 0; r < 10; r++) {
    grid.push([]); wordCells.push([]);
    for (c = 0; c < 10; c++) { grid[r].push(null); wordCells[r].push(false); }
  }
  placements.forEach(function(p) {
    for (i = 0; i < p.mot.length; i++) {
      switch(p.dir) {
        case 'H':   pr = p.row;     pc = p.col + i; break;
        case 'HR':  pr = p.row;     pc = p.col - i; break;
        case 'V':   pr = p.row + i; pc = p.col;     break;
        case 'VR':  pr = p.row - i; pc = p.col;     break;
        case 'DH':  pr = p.row + i; pc = p.col + i; break;
        case 'DB':  pr = p.row + i; pc = p.col - i; break;
        case 'DHR': pr = p.row - i; pc = p.col - i; break;
        case 'DBR': pr = p.row - i; pc = p.col + i; break;
        default:    pr = p.row;     pc = p.col + i;
      }
      if (pr >= 0 && pr < 10 && pc >= 0 && pc < 10) {
        grid[pr][pc] = p.mot[i];
        wordCells[pr][pc] = true;
      }
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
  /* ── AFFAIRE 1 ─────────────────────────────────────────── */
  {
    id: 1, affaireNum: 1, niveau: 1,
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

  /* ── AFFAIRE 2 ─────────────────────────────────────────── */
  {
    id: 2, affaireNum: 2, niveau: 1,
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

  /* ── AFFAIRE 3 ─────────────────────────────────────────── */
  {
    id: 3, affaireNum: 3, niveau: 1,
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
    nextAffaire: 4
  },

  /* ── AFFAIRE 4 — Le Bal Masqué ─────────────────────────── */
  {
    id: 4, affaireNum: 4, niveau: 1,
    titre: 'Le Bal Masqué',
    ghost: {mot: 'HUGO', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'MASQUERADE', row:0, col:0, dir:'H'},
      {mot:'VALSE',      row:1, col:0, dir:'H'},
      {mot:'MIROIR',     row:2, col:0, dir:'H'},
      {mot:'BOUGIE',     row:3, col:0, dir:'H'},
      {mot:'RIDEAU',     row:4, col:0, dir:'H'},
      {mot:'INVITE',     row:5, col:0, dir:'H'},
      {mot:'COULOIR',    row:6, col:0, dir:'H'},
      {mot:'CARTON',     row:7, col:0, dir:'H'},
      {mot:'CAPES',      row:8, col:0, dir:'H'},
      {mot:'BAL',        row:9, col:0, dir:'H'},
      {mot:'BAISER',     row:1, col:6, dir:'V'},
      {mot:'NOCTURNE',   row:1, col:7, dir:'V'},
      {mot:'EVENTAIL',   row:1, col:8, dir:'V'},
      {mot:'FENETRE',    row:1, col:9, dir:'V'},
      {mot:'FEE',        row:7, col:6, dir:'V'}
    ],
    residualSeq: 'LACETLOGE',
    solution: {tueur:'HUGO', methode:'LACET', lieu:'LOGE'},
    nextAffaire: 5
  },

  /* ── AFFAIRE 5 — La Chambre Froide ─────────────────────── */
  {
    id: 5, affaireNum: 5, niveau: 1,
    titre: 'La Chambre Froide',
    ghost: {mot: 'GEL', cat: 'METHODE'},
    wordPlacements: [
      {mot:'CONGELE',  row:0, col:0, dir:'H'},
      {mot:'FRISSON',  row:1, col:0, dir:'H'},
      {mot:'CADAVRE',  row:2, col:0, dir:'H'},
      {mot:'BANQUISE', row:3, col:0, dir:'H'},
      {mot:'GIVRE',    row:4, col:0, dir:'H'},
      {mot:'GLACE',    row:5, col:0, dir:'H'},
      {mot:'NEIGE',    row:6, col:0, dir:'H'},
      {mot:'FROID',    row:7, col:0, dir:'H'},
      {mot:'TUNDRA',   row:8, col:0, dir:'H'},
      {mot:'ARCTIQUE', row:9, col:0, dir:'H'},
      {mot:'BRUME',    row:4, col:7, dir:'V'},
      {mot:'RONCE',    row:0, col:8, dir:'V'},
      {mot:'LIEN',     row:0, col:9, dir:'V'},
      {mot:'VAGUE',    row:5, col:8, dir:'V'},
      {mot:'DRAME',    row:5, col:9, dir:'V'}
    ],
    residualSeq: 'EDMONDRESERVE',
    solution: {tueur:'EDMOND', methode:'GEL', lieu:'RESERVE'},
    nextAffaire: 6
  },

  /* ── AFFAIRE 6 — Le Cabinet du Docteur ─────────────────── */
  {
    id: 6, affaireNum: 6, niveau: 1,
    titre: 'Le Cabinet du Docteur',
    ghost: {mot: 'BUREAU', cat: 'LIEU'},
    wordPlacements: [
      {mot:'ORDONNANCE', row:0, col:0, dir:'H'},
      {mot:'PATIENT',    row:1, col:0, dir:'H'},
      {mot:'DOSSIER',    row:2, col:0, dir:'H'},
      {mot:'CABINET',    row:3, col:0, dir:'H'},
      {mot:'SCALPEL',    row:4, col:0, dir:'H'},
      {mot:'DIAGNOSE',   row:5, col:0, dir:'H'},
      {mot:'MEDECINE',   row:6, col:0, dir:'H'},
      {mot:'PANSEMENT',  row:7, col:0, dir:'H'},
      {mot:'REMEDIER',   row:8, col:0, dir:'H'},
      {mot:'CHIRURGIE',  row:9, col:0, dir:'H'},
      {mot:'SOI',        row:1, col:7, dir:'V'},
      {mot:'RAP',        row:1, col:8, dir:'V'}
    ],
    residualSeq: 'CLAIRESERINGUE',
    solution: {tueur:'CLAIRE', methode:'SERINGUE', lieu:'BUREAU'},
    nextAffaire: 7
  },

  /* ── AFFAIRE 7 — L'Incendie du Théâtre ─────────────────── */
  {
    id: 7, affaireNum: 7, niveau: 1,
    titre: "L'Incendie du Théâtre",
    ghost: {mot: 'FEU', cat: 'METHODE'},
    wordPlacements: [
      {mot:'RIDEAU',    row:0, col:0, dir:'H'},
      {mot:'MACHINERIE',row:1, col:0, dir:'H'},
      {mot:'COULISSE',  row:2, col:0, dir:'H'},
      {mot:'DECOR',     row:3, col:0, dir:'H'},
      {mot:'LOGE',      row:4, col:0, dir:'H'},
      {mot:'ACTEUR',    row:5, col:0, dir:'H'},
      {mot:'COMEDIEN',  row:6, col:0, dir:'H'},
      {mot:'PLATEAU',   row:7, col:0, dir:'H'},
      {mot:'COULOIR',   row:8, col:0, dir:'H'},
      {mot:'RAMPE',     row:9, col:0, dir:'H'},
      {mot:'PATIENCE',  row:2, col:8, dir:'V'},
      {mot:'BALCON',    row:2, col:9, dir:'V'},
      {mot:'TOR',       row:3, col:7, dir:'V'},
      {mot:'SIT',       row:7, col:7, dir:'V'},
      {mot:'ODE',       row:3, col:6, dir:'V'}
    ],
    residualSeq: 'GASTONSCENE',
    solution: {tueur:'GASTON', methode:'FEU', lieu:'SCENE'},
    nextAffaire: 8
  },

  /* ── AFFAIRE 8 — Le Port de Marseille ──────────────────── */
  {
    id: 8, affaireNum: 8, niveau: 2,
    titre: 'Le Port de Marseille',
    ghost: {mot: 'RAFAEL', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'ANCRE',     row:0, col:0, dir:'H'},
      {mot:'BATEAU',    row:1, col:0, dir:'H'},
      {mot:'CAPITAINE', row:2, col:0, dir:'H'},
      {mot:'DRAPEAU',   row:3, col:0, dir:'H'},
      {mot:'ESCALE',    row:4, col:0, dir:'H'},
      {mot:'FILET',     row:5, col:0, dir:'H'},
      {mot:'GOELETTE',  row:6, col:0, dir:'H'},
      {mot:'HUBLOT',    row:7, col:0, dir:'H'},
      {mot:'JETEE',     row:8, col:0, dir:'H'},
      {mot:'QUAI',      row:9, col:0, dir:'H'},
      {mot:'CANAL',     row:0, col:5, dir:'DH'},
      {mot:'SON',       row:0, col:9, dir:'DB'},
      {mot:'ABORD',     row:5, col:8, dir:'V'},
      {mot:'EMERI',     row:5, col:9, dir:'V'},
      {mot:'GRE',       row:7, col:7, dir:'V'},
      {mot:'ODE',       row:7, col:6, dir:'V'},
      {mot:'SEL',       row:5, col:5, dir:'H'},
      {mot:'MAT',       row:4, col:6, dir:'H'},
      {mot:'UN',        row:3, col:6, dir:'H'}
    ],
    residualSeq: 'NOYADECALE',
    solution: {tueur:'RAFAEL', methode:'NOYADE', lieu:'CALE'},
    nextAffaire: 9
  },

  /* ── AFFAIRE 9 — La Pension du Lac ─────────────────────── */
  {
    id: 9, affaireNum: 9, niveau: 2,
    titre: 'La Pension du Lac',
    ghost: {mot: 'POISON', cat: 'METHODE'},
    wordPlacements: [
      {mot:'PENSION',   row:0, col:0, dir:'H'},
      {mot:'CHAMBRE',   row:1, col:0, dir:'H'},
      {mot:'COULOIR',   row:2, col:0, dir:'H'},
      {mot:'BALCON',    row:3, col:0, dir:'H'},
      {mot:'JARDINET',  row:4, col:0, dir:'H'},
      {mot:'ESCALIER',  row:5, col:0, dir:'H'},
      {mot:'VERANDA',   row:6, col:0, dir:'H'},
      {mot:'PORTAIL',   row:7, col:0, dir:'H'},
      {mot:'TERRASSE',  row:8, col:0, dir:'H'},
      {mot:'FONTAINE',  row:9, col:0, dir:'H'},
      {mot:'BRUME',     row:0, col:8, dir:'V'},
      {mot:'ETUDE',     row:0, col:9, dir:'V'},
      {mot:'ARC',       row:6, col:7, dir:'DH'}
    ],
    residualSeq: 'SUZANNEGRENIER',
    solution: {tueur:'SUZANNE', methode:'POISON', lieu:'GRENIER'},
    nextAffaire: 10
  },

  /* ── AFFAIRE 10 — La Galerie des Glaces ────────────────── */
  {
    id: 10, affaireNum: 10, niveau: 2,
    titre: 'La Galerie des Glaces',
    ghost: {mot: 'SALON', cat: 'LIEU'},
    wordPlacements: [
      {mot:'GALERIE',   row:0, col:0, dir:'H'},
      {mot:'MIROIR',    row:1, col:0, dir:'H'},
      {mot:'LUSTRE',    row:2, col:0, dir:'H'},
      {mot:'PARQUET',   row:3, col:0, dir:'H'},
      {mot:'RIDEAU',    row:4, col:0, dir:'H'},
      {mot:'TABLEAUX',  row:5, col:0, dir:'H'},
      {mot:'SCULPTURE', row:6, col:0, dir:'H'},
      {mot:'PORTRAIT',  row:7, col:0, dir:'H'},
      {mot:'ORNEMENT',  row:8, col:0, dir:'H'},
      {mot:'VERRIERE',  row:9, col:0, dir:'H'},
      {mot:'MARBRE',    row:0, col:8, dir:'V'},
      {mot:'ANCIEN',    row:0, col:9, dir:'V'},
      {mot:'OR',        row:0, col:7, dir:'V'},
      {mot:'MOB',       row:1, col:6, dir:'DH'}
    ],
    residualSeq: 'ARMANDCABLE',
    solution: {tueur:'ARMAND', methode:'CABLE', lieu:'SALON'},
    nextAffaire: 11
  },

  /* ── AFFAIRE 11 — Le Monastère des Brumes ──────────────── */
  {
    id: 11, affaireNum: 11, niveau: 2,
    titre: 'Le Monastère des Brumes',
    ghost: {mot: 'BENOIT', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'MONASTERE', row:0, col:0, dir:'H'},
      {mot:'CLOITRE',   row:1, col:0, dir:'H'},
      {mot:'CHAPELLE',  row:2, col:0, dir:'H'},
      {mot:'CLOCHE',    row:3, col:0, dir:'H'},
      {mot:'NUIT',      row:4, col:0, dir:'H'},
      {mot:'BRUME',     row:5, col:0, dir:'H'},
      {mot:'CELLULE',   row:6, col:0, dir:'H'},
      {mot:'PRIEUR',    row:7, col:0, dir:'H'},
      {mot:'ENLUMINURE',row:8, col:0, dir:'H'},
      {mot:'RELIQUE',   row:9, col:0, dir:'H'},
      {mot:'CHANOINE',  row:0, col:9, dir:'V'},
      {mot:'LECTEUR',   row:1, col:8, dir:'V'},
      {mot:'NUEE',      row:4, col:4, dir:'DH'},
      {mot:'EU',        row:1, col:6, dir:'H'}
    ],
    residualSeq: 'PIERRECRYPTE',
    solution: {tueur:'BENOIT', methode:'PIERRE', lieu:'CRYPTE'},
    nextAffaire: 12
  },

  /* ── AFFAIRE 12 — La Villa des Roses ───────────────────── */
  {
    id: 12, affaireNum: 12, niveau: 2,
    titre: 'La Villa des Roses',
    ghost: {mot: 'TASSE', cat: 'METHODE'},
    wordPlacements: [
      {mot:'ROSIER',    row:0, col:0, dir:'H'},
      {mot:'VIOLETTE',  row:1, col:0, dir:'H'},
      {mot:'PIVOINE',   row:2, col:0, dir:'H'},
      {mot:'LAVANDE',   row:3, col:0, dir:'H'},
      {mot:'GLORIETTE', row:4, col:0, dir:'H'},
      {mot:'FONTAINE',  row:5, col:0, dir:'H'},
      {mot:'BALUSTRADE',row:6, col:0, dir:'H'},
      {mot:'PERGOLA',   row:7, col:0, dir:'H'},
      {mot:'TREILLE',   row:8, col:0, dir:'H'},
      {mot:'PARTERRE',  row:9, col:0, dir:'H'},
      {mot:'GELE',      row:0, col:6, dir:'DH'},
      {mot:'GALE',      row:0, col:9, dir:'V'},
      {mot:'NE',        row:3, col:8, dir:'V'},
      {mot:'LA',        row:7, col:8, dir:'V'},
      {mot:'IL',        row:2, col:7, dir:'H'}
    ],
    residualSeq: 'MATHIEUJARDIN',
    solution: {tueur:'MATHIEU', methode:'TASSE', lieu:'JARDIN'},
    nextAffaire: 13
  },

  /* ── AFFAIRE 13 — L'Exposition Universelle ──────────────── */
  {
    id: 13, affaireNum: 13, niveau: 2,
    titre: "L'Exposition Universelle",
    ghost: {mot: 'LEOPOLD', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'EXPOSITION', row:0, col:0, dir:'H'},
      {mot:'GALERIE',    row:1, col:0, dir:'H'},
      {mot:'MACHINE',    row:2, col:0, dir:'H'},
      {mot:'INDUSTRIE',  row:3, col:0, dir:'H'},
      {mot:'VAPEUR',     row:4, col:0, dir:'H'},
      {mot:'PROGRES',    row:5, col:0, dir:'H'},
      {mot:'TELEGRAPH',  row:6, col:0, dir:'H'},
      {mot:'LOCOMOTIVE', row:7, col:0, dir:'H'},
      {mot:'DIRIGEABLE', row:8, col:0, dir:'H'},
      {mot:'INVENTION',  row:9, col:0, dir:'H'},
      {mot:'BIC',        row:1, col:7, dir:'DH'},
      {mot:'EN',         row:8, col:9, dir:'V'}
    ],
    residualSeq: 'ARMEPAVILLON',
    solution: {tueur:'LEOPOLD', methode:'ARME', lieu:'PAVILLON'},
    nextAffaire: 14
  },

  /* ── AFFAIRE 14 — Le Cirque d'Hiver ────────────────────── */
  {
    id: 14, affaireNum: 14, niveau: 2,
    titre: "Le Cirque d'Hiver",
    ghost: {mot: 'COUTEAU', cat: 'METHODE'},
    wordPlacements: [
      {mot:'ACROBATE',  row:0, col:0, dir:'H'},
      {mot:'TRAPEZE',   row:1, col:0, dir:'H'},
      {mot:'JONGLEUR',  row:2, col:0, dir:'H'},
      {mot:'ECUYER',    row:3, col:0, dir:'H'},
      {mot:'CLOWN',     row:4, col:0, dir:'H'},
      {mot:'LION',      row:5, col:0, dir:'H'},
      {mot:'ELEPHANT',  row:6, col:0, dir:'H'},
      {mot:'DRESSEUR',  row:7, col:0, dir:'H'},
      {mot:'CHAPITEAU', row:8, col:0, dir:'H'},
      {mot:'SPECTACLE', row:9, col:0, dir:'H'},
      {mot:'FESTIVAL',  row:0, col:8, dir:'V'},
      {mot:'CORDE',     row:0, col:9, dir:'V'},
      {mot:'HAIE',      row:5, col:9, dir:'V'},
      {mot:'AN',        row:5, col:5, dir:'DH'}
    ],
    residualSeq: 'MARCOPISTE',
    solution: {tueur:'MARCO', methode:'COUTEAU', lieu:'PISTE'},
    nextAffaire: 15
  },

  /* ── AFFAIRE 15 — Les Catacombes ────────────────────────── */
  {
    id: 15, affaireNum: 15, niveau: 3,
    titre: 'Les Catacombes',
    ghost: {mot: 'LAME', cat: 'METHODE'},
    wordPlacements: [
      {mot:'CATACOMBE', row:0, col:0, dir:'H'},
      {mot:'OSSUAIRE',  row:1, col:0, dir:'H'},
      {mot:'GALERIE',   row:2, col:0, dir:'H'},
      {mot:'TOMBEAU',   row:3, col:0, dir:'H'},
      {mot:'SARCOPHAGE',row:4, col:0, dir:'H'},
      {mot:'CRYPTE',    row:5, col:0, dir:'H'},
      {mot:'LANTERNE',  row:6, col:0, dir:'H'},
      {mot:'PASSAGE',   row:7, col:0, dir:'H'},
      {mot:'ESCALIER',  row:8, col:0, dir:'H'},
      {mot:'NICHE',     row:9, col:0, dir:'H'},
      {mot:'FOSSE',     row:9, col:9, dir:'HR'},
      {mot:'ARCS',      row:8, col:9, dir:'VR'},
      {mot:'AIR',       row:3, col:8, dir:'DHR'},
      {mot:'EL',        row:0, col:8, dir:'V'}
    ],
    residualSeq: 'VICTORCOULOIR',
    solution: {tueur:'VICTOR', methode:'LAME', lieu:'COULOIR'},
    nextAffaire: 16
  },

  /* ── AFFAIRE 16 — Le Bal de la Préfecture ───────────────── */
  {
    id: 16, affaireNum: 16, niveau: 3,
    titre: 'Le Bal de la Préfecture',
    ghost: {mot: 'CAMILLE', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'PREFECTURE', row:0, col:0, dir:'H'},
      {mot:'DANSEUR',    row:1, col:0, dir:'H'},
      {mot:'ORCHESTRE',  row:2, col:0, dir:'H'},
      {mot:'INVITATION', row:3, col:0, dir:'H'},
      {mot:'ROBE',       row:4, col:0, dir:'H'},
      {mot:'CRAVATE',    row:5, col:0, dir:'H'},
      {mot:'WALTZ',      row:6, col:0, dir:'H'},
      {mot:'BUFFET',     row:7, col:0, dir:'H'},
      {mot:'FLACONS',    row:8, col:0, dir:'H'},
      {mot:'CHAMPAGNE',  row:9, col:0, dir:'H'},
      {mot:'MER',        row:1, col:9, dir:'HR'},
      {mot:'TO',         row:4, col:9, dir:'DHR'},
      {mot:'ATOM',       row:4, col:4, dir:'DH'},
      {mot:'BRUME',      row:5, col:9, dir:'V'},
      {mot:'BEL',        row:5, col:8, dir:'V'}
    ],
    residualSeq: 'POISONSALON',
    solution: {tueur:'CAMILLE', methode:'POISON', lieu:'SALON'},
    nextAffaire: 17
  },

  /* ── AFFAIRE 17 — Le Quai des Brumes ───────────────────── */
  {
    id: 17, affaireNum: 17, niveau: 3,
    titre: 'Le Quai des Brumes',
    ghost: {mot: 'BERGE', cat: 'LIEU'},
    wordPlacements: [
      {mot:'BROUILLARD', row:0, col:0, dir:'H'},
      {mot:'CAPITAINE',  row:1, col:0, dir:'H'},
      {mot:'REMORQUEUR', row:2, col:0, dir:'H'},
      {mot:'SIRENE',     row:3, col:0, dir:'H'},
      {mot:'ANCRE',      row:4, col:0, dir:'H'},
      {mot:'FILET',      row:5, col:0, dir:'H'},
      {mot:'MOUETTE',    row:6, col:0, dir:'H'},
      {mot:'BRUME',      row:7, col:0, dir:'H'},
      {mot:'VAPEUR',     row:8, col:0, dir:'H'},
      {mot:'HORIZON',    row:9, col:0, dir:'H'},
      {mot:'PORT',       row:3, col:9, dir:'HR'},
      {mot:'MOTEUR',     row:9, col:9, dir:'VR'},
      {mot:'ED',         row:1, col:9, dir:'VR'},
      {mot:'AERAS',      row:4, col:7, dir:'V'},
      {mot:'TU',         row:4, col:8, dir:'V'}
    ],
    residualSeq: 'PASCALNOYADE',
    solution: {tueur:'PASCAL', methode:'NOYADE', lieu:'BERGE'},
    nextAffaire: 18
  },

  /* ── AFFAIRE 18 — L'Atelier du Sculpteur ───────────────── */
  {
    id: 18, affaireNum: 18, niveau: 3,
    titre: "L'Atelier du Sculpteur",
    ghost: {mot: 'BERNARD', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'SCULPTURE',  row:0, col:0, dir:'H'},
      {mot:'CISEAU',     row:1, col:0, dir:'H'},
      {mot:'ARGILE',     row:2, col:0, dir:'H'},
      {mot:'MARBRE',     row:3, col:0, dir:'H'},
      {mot:'BRONZE',     row:4, col:0, dir:'H'},
      {mot:'PIEDESTAL',  row:5, col:0, dir:'H'},
      {mot:'BURIN',      row:6, col:0, dir:'H'},
      {mot:'GALERIE',    row:7, col:0, dir:'H'},
      {mot:'VERNISSAGE', row:8, col:0, dir:'H'},
      {mot:'EXPOSITION', row:9, col:0, dir:'H'},
      {mot:'LE',         row:1, col:9, dir:'DHR'},
      {mot:'IDE',        row:2, col:9, dir:'V'},
      {mot:'PE',         row:6, col:9, dir:'VR'},
      {mot:'OVNI',       row:1, col:8, dir:'V'},
      {mot:'ID',         row:1, col:7, dir:'V'}
    ],
    residualSeq: 'MARTEAUATELIER',
    solution: {tueur:'BERNARD', methode:'MARTEAU', lieu:'ATELIER'},
    nextAffaire: 19
  },

  /* ── AFFAIRE 19 — La Librairie Fantôme ─────────────────── */
  {
    id: 19, affaireNum: 19, niveau: 3,
    titre: 'La Librairie Fantôme',
    ghost: {mot: 'LACET', cat: 'METHODE'},
    wordPlacements: [
      {mot:'LIBRAIRIE',  row:0, col:0, dir:'H'},
      {mot:'CATALOGUE',  row:1, col:0, dir:'H'},
      {mot:'MANUSCRIT',  row:2, col:0, dir:'H'},
      {mot:'PARCHEMIN',  row:3, col:0, dir:'H'},
      {mot:'RELIURE',    row:4, col:0, dir:'H'},
      {mot:'INCUNABLE',  row:5, col:0, dir:'H'},
      {mot:'GRIMOIRE',   row:6, col:0, dir:'H'},
      {mot:'CODEX',      row:7, col:0, dir:'H'},
      {mot:'ENLUMINURE', row:8, col:0, dir:'H'},
      {mot:'SCRIPTEUR',  row:9, col:0, dir:'H'},
      {mot:'COR',        row:7, col:7, dir:'HR'}
    ],
    residualSeq: 'SIMONERESERVE',
    solution: {tueur:'SIMONE', methode:'LACET', lieu:'RESERVE'},
    nextAffaire: 20
  },

  /* ── AFFAIRE 20 — Le Dernier Acte ──────────────────────── */
  {
    id: 20, affaireNum: 20, niveau: 3,
    titre: 'Le Dernier Acte',
    ghost: {mot: 'THEODORE', cat: 'TUEUR'},
    wordPlacements: [
      {mot:'DRAMATURGE', row:0, col:0, dir:'H'},
      {mot:'COMEDIE',    row:1, col:0, dir:'H'},
      {mot:'TRAGEDIE',   row:2, col:0, dir:'H'},
      {mot:'MELODRAME',  row:3, col:0, dir:'H'},
      {mot:'RIDEAU',     row:4, col:0, dir:'H'},
      {mot:'COSTUMES',   row:5, col:0, dir:'H'},
      {mot:'ECLAIRAGE',  row:6, col:0, dir:'H'},
      {mot:'DECORS',     row:7, col:0, dir:'H'},
      {mot:'MISE',       row:8, col:0, dir:'H'},
      {mot:'CLAP',       row:9, col:0, dir:'H'},
      {mot:'LU',         row:1, col:8, dir:'V'},
      {mot:'TRO',        row:1, col:9, dir:'V'},
      {mot:'CORDE',      row:8, col:9, dir:'VR'},
      {mot:'BOIS',       row:8, col:4, dir:'H'},
      {mot:'ARC',        row:7, col:6, dir:'H'},
      {mot:'IR',         row:4, col:6, dir:'DHR'},
      {mot:'NE',         row:4, col:7, dir:'DBR'}
    ],
    residualSeq: 'POISONLOGE',
    solution: {tueur:'THEODORE', methode:'POISON', lieu:'LOGE'},
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

function wsGetCellsBetween(sr, sc, er, ec) {
  if (sr === er && sc === ec) return [[sr, sc]];
  var dr = er - sr, dc = ec - sc;
  var steps, rdir, cdir;
  if (dr === 0) { steps = Math.abs(dc); rdir = 0; cdir = dc > 0 ? 1 : -1; }
  else if (dc === 0) { steps = Math.abs(dr); rdir = dr > 0 ? 1 : -1; cdir = 0; }
  else if (Math.abs(dr) === Math.abs(dc)) { steps = Math.abs(dr); rdir = dr > 0 ? 1 : -1; cdir = dc > 0 ? 1 : -1; }
  else return null;
  var cells = [];
  for (var i = 0; i <= steps; i++) cells.push([sr + i*rdir, sc + i*cdir]);
  return cells;
}

class GridSelector {
  constructor(gridElement, onWordSelected) {
    this.grid = gridElement;
    this.onWordSelected = onWordSelected;
    this.startCell = null;
    this.previewCells = [];
    this.handleCellClick = this.handleCellClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleRightClick = this.handleRightClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.attachEvents();
  }

  attachEvents() {
    this.grid.addEventListener('click', this.handleCellClick);
    this.grid.addEventListener('mouseover', this.handleMouseOver);
    this.grid.addEventListener('contextmenu', this.handleRightClick);
    document.addEventListener('keydown', this.handleKeyDown);
    this.grid.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.grid.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.grid.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  getCellAt(row, col) {
    return this.grid.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
  }

  getCellFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const cell = el.closest('[data-row][data-col]');
    if (!cell) return null;
    return { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col), el: cell };
  }

  getPath(start, end) {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    const isH = dr === 0 && dc !== 0;
    const isV = dc === 0 && dr !== 0;
    const isDiag = Math.abs(dr) === Math.abs(dc) && dr !== 0;
    if (!isH && !isV && !isDiag) return null;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push({ row: start.row + i * stepR, col: start.col + i * stepC });
    }
    return path;
  }

  clearPreview() {
    this.previewCells.forEach(c => { if (c.el) { c.el.classList.remove('preview-valid', 'preview-invalid'); } });
    this.previewCells = [];
  }

  showPreview(start, end) {
    this.clearPreview();
    const path = this.getPath(start, end);
    if (!path) {
      const endEl = this.getCellAt(end.row, end.col);
      if (endEl) { endEl.classList.add('preview-invalid'); this.previewCells = [{ el: endEl }]; }
      return;
    }
    path.forEach(p => {
      const el = this.getCellAt(p.row, p.col);
      if (el) { el.classList.add('preview-valid'); this.previewCells.push({ el }); }
    });
  }

  cancel() {
    this.clearPreview();
    if (this.startCell) {
      const el = this.getCellAt(this.startCell.row, this.startCell.col);
      if (el) el.classList.remove('selected-start');
    }
    this.startCell = null;
    this.updateHint('');
  }

  updateHint(msg) {
    const hint = document.getElementById('grid-hint');
    if (hint) hint.textContent = msg;
  }

  handleCellClick(e) {
    const cell = e.target.closest('[data-row][data-col]');
    if (!cell) return;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    if (!this.startCell) {
      this.startCell = { row, col };
      cell.classList.add('selected-start');
      this.updateHint('Cliquez sur la dernière lettre du mot');
      return;
    }
    if (this.startCell.row === row && this.startCell.col === col) { this.cancel(); return; }
    const path = this.getPath(this.startCell, { row, col });
    if (!path) {
      this.cancel();
      this.startCell = { row, col };
      cell.classList.add('selected-start');
      this.updateHint('Cliquez sur la dernière lettre du mot');
      return;
    }
    const word = path.map(p => { const c = this.getCellAt(p.row, p.col); return c ? (c.dataset.letter || c.textContent) : ''; }).join('');
    this.clearPreview();
    const startEl = this.getCellAt(this.startCell.row, this.startCell.col);
    if (startEl) startEl.classList.remove('selected-start');
    this.startCell = null;
    this.updateHint('');
    this.onWordSelected(word, path);
  }

  handleMouseOver(e) {
    if (!this.startCell) return;
    const cell = e.target.closest('[data-row][data-col]');
    if (!cell) return;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    if (row === this.startCell.row && col === this.startCell.col) return;
    this.showPreview(this.startCell, { row, col });
  }

  handleRightClick(e) { e.preventDefault(); this.cancel(); }
  handleKeyDown(e) { if (e.key === 'Escape') this.cancel(); }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = this.getCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) return;
    this.cancel();
    this.startCell = { row: cell.row, col: cell.col };
    cell.el.classList.add('selected-start');
    this.updateHint('Glissez vers la dernière lettre du mot');
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this.startCell) return;
    const touch = e.touches[0];
    const cell = this.getCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) return;
    this.showPreview(this.startCell, { row: cell.row, col: cell.col });
  }

  handleTouchEnd(e) {
    e.preventDefault();
    if (!this.startCell) return;
    const touch = e.changedTouches[0];
    const cell = this.getCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) { this.cancel(); return; }
    const path = this.getPath(this.startCell, { row: cell.row, col: cell.col });
    if (!path) { this.cancel(); return; }
    const word = path.map(p => { const c = this.getCellAt(p.row, p.col); return c ? (c.dataset.letter || c.textContent) : ''; }).join('');
    const startEl = this.getCellAt(this.startCell.row, this.startCell.col);
    if (startEl) startEl.classList.remove('selected-start');
    this.clearPreview();
    this.startCell = null;
    this.updateHint('');
    this.onWordSelected(word, path);
  }

  destroy() {
    this.grid.removeEventListener('click', this.handleCellClick);
    this.grid.removeEventListener('mouseover', this.handleMouseOver);
    this.grid.removeEventListener('contextmenu', this.handleRightClick);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.grid.removeEventListener('touchstart', this.handleTouchStart);
    this.grid.removeEventListener('touchmove', this.handleTouchMove);
    this.grid.removeEventListener('touchend', this.handleTouchEnd);
  }
}

function wsInitAffaire(aff) {
  if (!aff.grid) {
    var result = generateGrid(aff.wordPlacements, aff.residualSeq);
    aff.grid = result.grid;
    aff.residuels = result.residuels;
  }
  wsStates[aff.id] = {found:[], done:false, selector:null, erreurs:0, premiereTentative:true, timer:null};

  var hdr = document.getElementById('ws-hdr-' + aff.id);
  if (hdr) {
    hdr.innerHTML =
      '<p class="ws-titre">N°' + String(aff.id).padStart(2,'0') + ' — ' + aff.titre + '</p>' +
      '<div class="divider"></div>';
  }

  /* ── Timer ── */
  var duree = (typeof DUREES !== 'undefined' ? DUREES[aff.niveau] : null) || 300;
  var wsBody = document.querySelector('#jeu-affaire-container .ws-body');
  if (wsBody && !document.getElementById('timer-container')) {
    var timerDiv = document.createElement('div');
    timerDiv.id = 'timer-container';
    timerDiv.innerHTML =
      '<div id="timer-barre-wrapper"><div id="timer-barre"></div></div>' +
      '<div id="timer-texte">--:--</div>';
    wsBody.parentNode.insertBefore(timerDiv, wsBody);
  }
  if (typeof AffaireTimer !== 'undefined') {
    var t = new AffaireTimer(duree,
      function(tr) { updateTimerUI(tr, duree); },
      function() { afficherNotification('⏱ Temps écoulé ! Vous pouvez encore résoudre l\'affaire mais sans bonus de vitesse.', 'warning', 4000); }
    );
    wsStates[aff.id].timer = t;
    t.start();
    updateTimerUI(duree, duree);
  }

  wsRenderGrid(aff);
  wsRenderWordList(aff);

  verifyGrid(aff);
  var ans = document.getElementById('ws-ans-' + aff.id);
  if (ans) { ans.innerHTML = ''; ans.style.display = 'none'; }
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
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.letter = aff.grid[r][c];
      cell.textContent = aff.grid[r][c];
      gridEl.appendChild(cell);
    }
  }

  // Hint element
  var existingHint = document.getElementById('grid-hint');
  if (!existingHint) {
    var hintEl = document.createElement('p');
    hintEl.id = 'grid-hint';
    hintEl.style.cssText = "font-family:'EB Garamond',serif;font-style:italic;color:#c9a84c;text-align:center;height:20px;font-size:14px;margin-top:8px;";
    if (gridEl.parentNode) gridEl.parentNode.insertBefore(hintEl, gridEl.nextSibling);
  }

  var selector = new GridSelector(gridEl, function(word, path) {
    var cells = path.map(function(p) { return [p.row, p.col]; });
    wsCheckMatch(aff, cells);
  });

  wsStates[aff.id].selector = selector;
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
  } else {
    cells.forEach(function(p) {
      var c = wsGetCell(aff.id, p[0], p[1]);
      if (c) { c.classList.add('ws-flash-error'); setTimeout(function() { c.classList.remove('ws-flash-error'); }, 400); }
    });
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
  // Mise à jour de la progression
  var prog = getProgression();
  var resolues = prog.affairesResolues || [];
  if (resolues.indexOf(aff.id) === -1) {
    resolues.push(aff.id);
    updateProgression({ affairesResolues: resolues, grade: getGrade(resolues.length) });
  }
  setTimeout(function() { wsIlluminateResiduals(aff); }, 1800);
}

function verifyGrid(aff) {
  var wordCells = {};
  aff.wordPlacements.forEach(function(p) {
    for (var i = 0; i < p.mot.length; i++) {
      var r, c;
      switch(p.dir) {
        case 'H':   r = p.row;     c = p.col + i; break;
        case 'HR':  r = p.row;     c = p.col - i; break;
        case 'V':   r = p.row + i; c = p.col;     break;
        case 'VR':  r = p.row - i; c = p.col;     break;
        case 'DH':  r = p.row + i; c = p.col + i; break;
        case 'DB':  r = p.row + i; c = p.col - i; break;
        case 'DHR': r = p.row - i; c = p.col - i; break;
        case 'DBR': r = p.row - i; c = p.col + i; break;
        default:    r = p.row;     c = p.col + i;
      }
      var key = r + ',' + c;
      if (wordCells[key] && wordCells[key] !== p.mot[i]) {
        console.error('[verifyGrid] Affaire ' + aff.id + ': conflit cellule (' + r + ',' + c + ') entre "' + wordCells[key] + '" et "' + p.mot[i] + '"');
      }
      wordCells[key] = p.mot[i];
    }
  });
  var uniqueWordCount = Object.keys(wordCells).length;
  var residualCount = aff.residuels.length;
  var total = uniqueWordCount + residualCount;
  if (total !== 100) {
    console.error('[verifyGrid] Affaire ' + aff.id + ': total=' + total + ' (attendu 100). mots=' + uniqueWordCount + ', res=' + residualCount);
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
    console.error('[verifyGrid] Affaire ' + aff.id + ': residuels="' + residualLetters + '" != attendu="' + expected + '"');
  } else {
    console.log('[verifyGrid] Affaire ' + aff.id + ' OK — ' + uniqueWordCount + ' mots + ' + residualCount + ' res = 100');
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
  html += '<div id="ws-nxt-' + aff.id + '" style="display:none"><button class="btn" id="ws-nxt-btn-' + aff.id + '">← Retour aux dossiers</button></div>';
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
  document.getElementById('ws-nxt-btn-' + aff.id).addEventListener('click', function() {
    location.reload();
  });
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
  var ok  = okT && okM && okL;
  var st  = wsStates[aff.id];

  if (!ok) {
    st.erreurs++;
    st.premiereTentative = false;
    var subBtn = document.getElementById('ws-sub-' + aff.id);
    if (subBtn) {
      var orig = subBtn.textContent;
      subBtn.textContent = '✗ Réponse incorrecte';
      subBtn.style.cssText += ';border-color:#8b1a1a;color:#8b1a1a;';
      setTimeout(function() {
        subBtn.textContent = orig;
        subBtn.style.borderColor = '';
        subBtn.style.color = '';
      }, 1200);
    }
    return;
  }

  /* ── Succès ── */
  var timer       = st.timer;
  var tempsRestant = timer ? timer.getTempsRestant() : 0;
  if (timer) timer.stop();

  var scoreData = typeof calculerScore === 'function' ? calculerScore({
    niveau: aff.niveau,
    tempsRestant: tempsRestant,
    erreurs: st.erreurs,
    premiereTentative: st.premiereTentative
  }) : { points: 100, base: 100, bonusVitesse: 0, bonusPremiere: 0, penalite: 0 };

  /* Stocker le meilleur score */
  var prog   = getProgression();
  var scores = prog.scores || {};
  var duree  = (typeof DUREES !== 'undefined' ? DUREES[aff.niveau] : null) || 300;
  var tempsPris = duree - tempsRestant;
  if (!scores[aff.id] || scoreData.points > scores[aff.id].points) {
    scores[aff.id] = {
      points: scoreData.points,
      temps:  tempsPris,
      erreurs: st.erreurs,
      date:   new Date().toISOString()
    };
    updateProgression({ scores: scores });
  }

  /* Overlay résultat */
  if (typeof afficherResultat === 'function') {
    afficherResultat(aff, scoreData);
  } else {
    var wrap = document.getElementById('ws-sw-' + aff.id);
    if (wrap) {
      var stamp = document.createElement('div');
      stamp.className = 'ws-stamp ws-resolu';
      stamp.textContent = 'RÉSOLU';
      wrap.appendChild(stamp);
    }
    document.getElementById('ws-nxt-' + aff.id).style.display = 'block';
  }
  document.getElementById('ws-sub-' + aff.id).disabled = true;
}

// Escape key handling is now managed by GridSelector
