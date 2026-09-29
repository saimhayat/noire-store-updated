import {
  SCALE,
  SOLIDS,
  armFrame,
  bodyGap,
  legFrame,
  shirtEase,
  torsoRadii,
  torsoSurface,
  trouserRadii
} from './body.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------------------------------------------------------------------------
   Cutting the cloth.

   Every piece is a grid laid on the form: one axis wraps the body, the other
   runs down it. Because the pieces are cut to the same measurements the solver
   collides them against, the outfit keeps a worn silhouette while the weave
   moves. Seams are not modelled as stitching: two pieces that share an edge
   sample the same curve, so they meet exactly and read as one garment.
--------------------------------------------------------------------------- */

const SHIRT_COLS = 40;
const SLEEVE_COLS = 16;
const SLEEVE_ROWS = 16;
const TROUSER_COLS = 28;
const LEG_COLS = 16;
const LEG_ROWS = 18;

/* The shirt body's top edge as it wraps the torso: the neckline, then the
   armhole cut away for the sleeve. phi = 0 is dead centre front. */
const TOP_KEYS = [
  [0, 0.83],
  [0.32, 0.862],
  [0.55, 0.888],
  [0.78, 0.802],
  [1.05, 0.734],
  [Math.PI / 2, 0.663],
  [2.09, 0.734],
  [2.36, 0.802],
  [2.59, 0.892],
  [2.85, 0.902],
  [Math.PI, 0.874]
];

function topEdge(phi) {
  const p = phi <= Math.PI ? phi : 2 * Math.PI - phi;
  let i = 0;
  while (i < TOP_KEYS.length - 2 && TOP_KEYS[i + 1][0] < p) i++;
  const [p0, y0] = TOP_KEYS[i];
  const [p1, y1] = TOP_KEYS[i + 1];
  return y0 + (y1 - y0) * smoothstep(p0, p1, p);
}

const SHOULDER_FRONT = 0.55;
const SHOULDER_BACK = 2.59;

/* A point on the shell the shirt is cut over. */
function shellPoint(phi, y) {
  return torsoSurface(phi, y, shirtEase(y));
}

/* The armhole as one closed loop: over the shoulder from the front shoulder
   point to the back one, then down the back armhole, under the arm, and up the
   front. This is the curve a set-in sleeve is sewn to, and the shirt body's top
   edge in the same range is the same curve — so they meet. */
function armholeLoop(t, sign) {
  const k = ((t % 1) + 1) % 1;
  if (k < 0.5) {
    // over the top of the shoulder: the seam a sleeve head is set into
    const s = k / 0.5;
    const phi = SHOULDER_FRONT + (SHOULDER_BACK - SHOULDER_FRONT) * s;
    const high = 0.888 + 0.004 * s;
    const y = high - 0.088 * Math.sin(Math.PI * s);
    const p = shellPoint(phi, y);
    return [p[0] * sign, p[1], p[2]];
  }
  // the armhole itself, walked from the back shoulder point down to the armpit
  // and back up the front: the shirt's top edge, sampled again
  const s = (k - 0.5) / 0.5;
  const phi = SHOULDER_BACK + (SHOULDER_FRONT - SHOULDER_BACK) * s;
  const p = shellPoint(phi, topEdge(phi));
  return [p[0] * sign, p[1], p[2]];
}

/* Where that loop sits on the sleeve as a circle around the arm: front, outboard,
   underarm, back, so the two parameterisations can be blended. */
function ringAngle(t) {
  const k = ((t % 1) + 1) % 1;
  if (k < 0.5) return Math.PI / 2 - 2 * Math.PI * k; // front, over the top, to back
  return Math.PI / 2 - 2 * Math.PI * k; // and on around, evenly
}

const SLEEVE_R = [[0, 0.164], [0.12, 0.132], [0.3, 0.115], [0.5, 0.103], [0.72, 0.086], [0.88, 0.07], [1, 0.058]];
const sample = (table, u) => {
  let i = 0;
  while (i < table.length - 2 && table[i + 1][0] < u) i++;
  const [u0, v0] = table[i];
  const [u1, v1] = table[i + 1];
  return v0 + (v1 - v0) * smoothstep(u0, u1, u);
};

/* A little helper for the pieces: a grid of particles, plus the triangles that
   draw it. `shade` is the thread-level lighting baked at build time. */
function piece(key, cols, rows, kind) {
  const p = {
    key,
    kind,
    cols,
    rows,
    count: cols * rows,
    pos: new Float32Array(cols * rows * 3),
    shade: new Float32Array(cols * rows * 3),
    fixed: new Uint8Array(cols * rows),
    index: [],
    tuning: {}
  };
  p.put = (i, j, x, y, z) => {
    const k = (j * cols + i) * 3;
    p.pos[k] = x;
    p.pos[k + 1] = y;
    p.pos[k + 2] = z;
  };
  p.at = (i, j) => {
    const k = (j * cols + i) * 3;
    return [p.pos[k], p.pos[k + 1], p.pos[k + 2]];
  };
  p.tint = (i, j, v, warm = 0) => {
    const k = (j * cols + i) * 3;
    p.shade[k] = v * (1 + warm * 0.05);
    p.shade[k + 1] = v;
    p.shade[k + 2] = v * (1 - warm * 0.06);
  };
  p.quads = () => {
    const { cols: c, rows: r } = p;
    for (let j = 0; j < r - 1; j++) {
      for (let i = 0; i < c; i++) {
        const a = j * c + i;
        const b = i === c - 1 ? j * c : a + 1;
        const d = a + c;
        const e = i === c - 1 ? j * c + c : a + c + 1;
        p.index.push(a, b, e, a, e, d);
      }
    }
  };
  return p;
}

/* --------------------------------------------------------------- the shirt */

function buildShirtBody() {
  const p = piece('shirtBody', SHIRT_COLS, 18, 'shirt');
  const hem = SCALE.tuck;
  for (let i = 0; i < SHIRT_COLS; i++) {
    const phi = (i / SHIRT_COLS) * 2 * Math.PI;
    const top = topEdge(phi);
    // the placket is folded out of this same sheet, so it can never float free
    const toCentre = Math.min(phi, 2 * Math.PI - phi);
    const placketFold = 0.016 * (1 - smoothstep(0.0, 0.05, toCentre));
    // front panels ease over the waistband: the fabric is drawn in where the
    // trousers hold it and blouses out just above, which is what a tuck looks like
    for (let j = 0; j < p.rows; j++) {
      const v = j / (p.rows - 1);
      const y = hem + (top - hem) * v;
      const ease = shirtEase(y) + placketFold;
      const s = torsoSurface(phi, y, ease);
      p.put(i, j, s[0], s[1], s[2]);
      const edge = 1 - smoothstep(0.0, 0.055, toCentre) * 0;
      let shade = 0.7 + 0.3 * smoothstep(0, 0.075, bodyGap(s[0], s[1], s[2]));
      // the placket's two fold lines, and the seam each side of it
      shade -= 0.16 * (1 - smoothstep(0.018, 0.055, toCentre));
      shade -= 0.12 * edge * 0;
      // a yoke seam across the back shoulders, plus the armhole edge in shadow
      if (phi > 0.7 && phi < 2.6) {
        shade -= 0.1 * (1 - smoothstep(0.0, 0.075, Math.abs(y - top)));
      }
      p.tint(i, j, clamp(shade, 0.35, 1.02));
    }
    // Row 0 of this piece is the hem (the rows climb); the shirt hangs from its
    // top edge, which is the last row.
    p.fixed[(p.rows - 1) * p.cols + i] = 1;
  }
  p.quads();
  p.solids = SOLIDS.torso;
  p.material = 'shirt';
  // A body panel is stiff along the weave and soft across it: that is what lets
  // it fall in folds rather than stand away from the body like a board.
  p.tuning = { shear: 0.92, bend: 0.72 };
  return p;
}

function buildSleeve(sign) {
  const p = piece(sign > 0 ? 'sleeveR' : 'sleeveL', SLEEVE_COLS, SLEEVE_ROWS, 'shirt');
  for (let j = 0; j < p.rows; j++) {
    const v = j / (p.rows - 1);
    const w = smoothstep(0, 0.34, v);
    const u = v; // travel down the arm
    const f = armFrame(u, sign);
    for (let i = 0; i < p.cols; i++) {
      const t = i / p.cols;
      const ring = armholeLoop(t, sign);
      const psi = ringAngle(t);
      const r = sample(SLEEVE_R, u);
      const cx = f.p[0] + (Math.sin(psi) * f.X[0] + Math.cos(psi) * f.Z[0]) * r;
      const cy = f.p[1] + (Math.sin(psi) * f.X[1] + Math.cos(psi) * f.Z[1]) * r;
      const cz = f.p[2] + (Math.sin(psi) * f.X[2] + Math.cos(psi) * f.Z[2]) * r;
      // the cap is the armhole loop; below it the sleeve settles onto the arm
      const x = ring[0] + (cx - ring[0]) * w;
      const y = ring[1] + (cy - ring[1]) * w;
      const z = ring[2] + (cz - ring[2]) * w;
      p.put(i, j, x, y, z);
      let shade = 0.72 + 0.28 * smoothstep(0, 0.07, bodyGap(x, y, z));
      // the seam where the sleeve meets the shirt, and the underarm in shadow
      shade -= 0.13 * (1 - smoothstep(0.0, 0.06, v));
      if (Math.sin(psi) < -0.2) shade -= 0.06 * (0.2 + Math.sin(psi));
      p.tint(i, j, clamp(shade, 0.35, 1.02));
    }
    if (j === 0) for (let i = 0; i < p.cols; i++) p.fixed[j * p.cols + i] = 1;
  }
  p.quads();
  p.solids = SOLIDS.arm(sign);
  p.material = 'shirt';
  p.tuning = { shear: 0.86, bend: 0.6 };
  return p;
}

/* The collar: a stand that rises around the neck and a fall that lies over the
   shoulders. Cut from the neckline itself, so the band sits on the opening. */
function necklineLoop() {
  const pts = [];
  const front = 14;
  const back = 14;
  for (let i = 0; i < front; i++) {
    const phi = (i / front) * SHOULDER_FRONT;
    pts.push(shellPoint(phi, topEdge(phi)));
  }
  for (let i = 1; i < front; i++) {
    // across the top of the shoulder, front shoulder point to back
    const s = i / front;
    const phi = SHOULDER_FRONT + (SHOULDER_BACK - SHOULDER_FRONT) * s;
    const y = 0.888 - 0.088 * Math.sin(Math.PI * s);
    pts.push(shellPoint(phi, y));
  }
  for (let i = 0; i < back; i++) {
    const phi = SHOULDER_BACK + ((Math.PI - SHOULDER_BACK) * i) / back;
    pts.push(shellPoint(phi, topEdge(phi)));
  }
  for (let i = 0; i < back; i++) {
    const phi = Math.PI + ((2 * Math.PI - SHOULDER_FRONT - Math.PI) * i) / back;
    pts.push(shellPoint(phi, topEdge(phi)));
  }
  return pts;
}

function buildCollar() {
  const cols = 24;
  const p = piece('collar', cols, 5, 'band');
  const loop = necklineLoop();
  const n = loop.length;
  const COLLAR = [
    [0, 0],
    [0.34, 0.55],
    [0.62, 0.86],
    [0.86, 1.02],
    [1, 1.0]
  ];
  for (let i = 0; i < cols; i++) {
    const src = ((i / cols) * n) % n;
    const s0 = Math.floor(src);
    const s1 = (s0 + 1) % n;
    const k = src - s0;
    const b = [
      loop[s0][0] + (loop[s1][0] - loop[s0][0]) * k,
      loop[s0][1] + (loop[s1][1] - loop[s0][1]) * k,
      loop[s0][2] + (loop[s1][2] - loop[s0][2]) * k
    ];
    const rawAngle = Math.atan2(b[0], b[2]);
    // where the neck is, and how far the collar's edge sits from it
    const r0 = Math.hypot(b[0], b[2]);
    for (let j = 0; j < p.rows; j++) {
      const [h1, k1] = COLLAR[j];
      const y = b[1] + (1.0 - b[1]) * h1 + (j === p.rows - 1 ? -0.08 : 0);
      const r = r0 + (0.116 - r0) * smoothstep(0, 0.62, h1) + 0.135 * smoothstep(0.62, 1, h1);
      const x = Math.sin(rawAngle) * r;
      const z = Math.cos(rawAngle) * r;
      p.put(i, j, x, y, z);
      const shade = 0.74 + 0.26 * smoothstep(0, 0.06, bodyGap(x, y, z));
      p.tint(i, j, clamp(shade, 0.4, 1.02));
    }
    p.fixed[i] = 1;
  }
  p.quads();
  p.solids = SOLIDS.torsoNeck;
  p.material = 'shirt';
  // a collar is fused: it holds its stand whatever the cloth around it does
  p.tuning = { shear: 1, bend: 0.9, gust: 0.22, damp: 0.97 };
  return p;
}

function buildCuff(sign) {
  const cols = 14;
  const p = piece(sign > 0 ? 'cuffR' : 'cuffL', cols, 4, 'band');
  for (let i = 0; i < cols; i++) {
    const t = i / cols;
    const psi = Math.PI / 2 - 2 * Math.PI * t;
    for (let j = 0; j < p.rows; j++) {
      const v = j / (p.rows - 1);
      const u = 0.9 + 0.11 * v;
      const f = armFrame(u, sign);
      const r = sample(SLEEVE_R, u) + 0.012;
      const x = f.p[0] + (Math.sin(psi) * f.X[0] + Math.cos(psi) * f.Z[0]) * r;
      const y = f.p[1] + (Math.sin(psi) * f.X[1] + Math.cos(psi) * f.Z[1]) * r;
      const z = f.p[2] + (Math.sin(psi) * f.X[2] + Math.cos(psi) * f.Z[2]) * r;
      p.put(i, j, x, y, z);
      const shade = 0.74 + 0.26 * smoothstep(0, 0.05, bodyGap(x, y, z));
      p.tint(i, j, clamp(shade - (j === 0 ? 0.08 : 0), 0.4, 1.02));
    }
  }
  p.quads();
  p.solids = SOLIDS.armOnly(sign);
  p.material = 'shirt';
  p.tuning = { shear: 0.95, bend: 0.9, gust: 0.3, damp: 0.97 };
  return p;
}

/* ------------------------------------------------------------ the trousers */

function buildPelvis() {
  const p = piece('pelvis', TROUSER_COLS, 12, 'trouser');
  const top = SCALE.bandTop;
  const bottom = -0.3;
  for (let i = 0; i < p.cols; i++) {
    const phi = (i / p.cols) * 2 * Math.PI;
    for (let j = 0; j < p.rows; j++) {
      const v = j / (p.rows - 1);
      const y = top + (bottom - top) * v;
      // the hip narrows into the legs: what is below is hidden inside them, but
      // a piece that does not taper will poke out through them
      const taper = 1 - 0.46 * smoothstep(0.55, 1, v);
      const { rx, rz } = trouserRadii(y);
      const s = torsoSurface(phi, y, (rx - torsoRadii(y).rx) * 1);
      const x = s[0] * taper;
      const z = s[2] * taper;
      p.put(i, j, x, y, z);
      let shade = 0.7 + 0.3 * smoothstep(0, 0.07, bodyGap(x, y, z));
      // the rise and side seams, and the shadow under the belt
      const front = Math.min(phi, 2 * Math.PI - phi);
      shade -= 0.09 * (1 - smoothstep(0.0, 0.16, front)) * smoothstep(0.1, 0.6, v);
      p.tint(i, j, clamp(shade, 0.35, 1.02));
    }
    p.fixed[i] = 1;
  }
  p.quads();
  // The trousers are cut a good hand's width clear of the legs and pinned at the
  // waist, so nothing here ever meets the form: what would collide is the fabric
  // between the thighs, which is meant to be inside it.
  p.solids = [];
  p.material = 'trouser';
  p.tuning = { shear: 0.98, bend: 0.92, gust: 0.14, damp: 0.975 };
  return p;
}

function buildBand() {
  const p = piece('band', TROUSER_COLS, 4, 'band');
  const top = SCALE.bandTop;
  const bottom = -0.055;
  for (let i = 0; i < p.cols; i++) {
    const phi = (i / p.cols) * 2 * Math.PI;
    for (let j = 0; j < p.rows; j++) {
      const v = j / (p.rows - 1);
      const y = top + (bottom - top) * v;
      const { rx, rz } = trouserRadii(y);
      const s = torsoSurface(phi, y, (rx - torsoRadii(y).rx) * 1 + 0.012);
      p.put(i, j, s[0], y, s[2]);
      const shade = 0.76 + 0.24 * smoothstep(0, 0.05, bodyGap(s[0], y, s[2]));
      p.tint(i, j, clamp(shade - (j === p.rows - 1 ? 0.1 : 0), 0.4, 1.02));
    }
    p.fixed[i] = 1;
  }
  p.quads();
  p.solids = [];
  p.material = 'trouser';
  p.tuning = { shear: 1, bend: 1, gust: 0.1, damp: 0.965 };
  return p;
}

/* A pressed trouser leg: an outside crease down the front, a softer one at the
   back, and the leg drifting away from the knee as a real one does. */
function buildLeg(sign) {
  const p = piece(sign > 0 ? 'legR' : 'legL', LEG_COLS, LEG_ROWS, 'trouser');
  const start = -0.2;
  const end = SCALE.hem;
  for (let j = 0; j < p.rows; j++) {
    const v = j / (p.rows - 1);
    const y = start + (end - start) * v;
    const u = (y - -0.24) / ((SCALE.hem - 0.02) - -0.24);
    const f = legFrame(u, sign);
    for (let i = 0; i < p.cols; i++) {
      const phi = (i / p.cols) * 2 * Math.PI;
      const src = legFrame(u, sign);
      // crease: the fabric is pressed flat, so the front is a ridge not a curve
      const front = 1 - smoothstep(0.0, 0.34, Math.min(phi, 2 * Math.PI - phi));
      const back = 1 - smoothstep(0.0, 0.4, Math.abs(phi - Math.PI));
      const ridge = 0.016 * front + 0.009 * back;
      const r = f.r + ridge;
      const x = src.p[0] + Math.sin(phi) * r * sign;
      const z = src.p[2] + Math.cos(phi) * r;
      p.put(i, j, x, y, z);
      let shade = 0.72 + 0.28 * smoothstep(0, 0.07, bodyGap(x, y, z));
      // the crease catches the light; the side seams are stitched shut
      shade += 0.1 * front * (0.4 + 0.6 * v);
      shade += 0.05 * back;
      shade -= 0.08 * (1 - smoothstep(0.0, 0.22, Math.abs(Math.abs(phi) - Math.PI / 2)));
      p.tint(i, j, clamp(shade, 0.35, 1.05));
      // the trousers hang from the waist: the tops of the legs sit inside the
      // pelvis, so they are held there rather than left to slide down
      if (j === 0) p.fixed[i] = 1;
    }
  }
  p.quads();
  p.solids = [];
  p.material = 'trouser';
  // a wool trouser does not fly: it swings a hand's width and settles
  p.tuning = { shear: 1, bend: 0.95, gust: 0.12, damp: 0.975 };
  return p;
}

/* The belt is cut from the same measurements as the waistband, a little proud of
   it, and held still: a belt does not drape, it fastens. */
function buildBelt() {
  const p = piece('belt', TROUSER_COLS, 3, 'belt');
  const top = 0.052;
  const bottom = -0.012;
  for (let i = 0; i < p.cols; i++) {
    const phi = (i / p.cols) * 2 * Math.PI;
    for (let j = 0; j < p.rows; j++) {
      const v = j / (p.rows - 1);
      const y = top + (bottom - top) * v;
      const { rx, rz } = trouserRadii(y);
      const s = torsoSurface(phi, y, (rx - torsoRadii(y).rx) * 1 + 0.024);
      p.put(i, j, s[0], y, s[2]);
      const shade = 0.82 + 0.18 * v;
      p.tint(i, j, clamp(shade, 0.4, 1.02));
      p.fixed[i] = 1;
    }
  }
  p.quads();
  p.solids = [];
  p.material = 'leather';
  p.tuning = { shear: 1, bend: 1, gust: 0.02, damp: 0.96 };
  return p;
}

/* Everything that fastens the outfit: where it sits, and which way it faces. */
function trimsOf(belt) {
  const at = (phi, y, lift) => {
    const { rx, rz } = trouserRadii(y);
    return torsoSurface(phi, y, (rx - torsoRadii(y).rx) * 1 + lift);
  };
  const loops = [0.62, 1.42, 2.72, 3.56, 4.72, 5.52].map((phi) => {
    const a = at(phi, 0.02, 0.026);
    const b = at(phi + 0.01, 0.02, 0.026);
    const n = [a[0] - 0, a[2] - 0];
    const len = Math.hypot(n[0], n[1]) || 1;
    return { p: [a[0], 0.02, a[2]], n: [n[0] / len, 0, n[1] / len], width: Math.hypot(b[0] - a[0], b[2] - a[2]) * 60 };
  });
  const front = at(0, 0.02, 0.03);
  return { loops, buckle: { p: [front[0], 0.02, front[2]], n: [0, 0, 1] }, belt };
}

/* Buttons ride on particles of the cloth they are sewn to, so they travel with
   the fabric instead of floating beside it. */
/* A cuff is sewn to the sleeve's end, so it is not pinned to the world: it
   rides the last row of the sleeve it was cut from. */
function cuffLinks(pieces) {
  const links = [];
  for (const side of ['R', 'L']) {
    const sleeve = pieces.find((p) => p.key === `sleeve${side}`);
    const cuff = pieces.find((p) => p.key === `cuff${side}`);
    for (let i = 0; i < cuff.cols; i++) {
      const j = Math.round((i / cuff.cols) * sleeve.cols) % sleeve.cols;
      links.push({
        from: `sleeve${side}`,
        fromIndex: (sleeve.rows - 1) * sleeve.cols + j,
        to: `cuff${side}`,
        toIndex: i
      });
    }
  }
  return links;
}

function buttonSeats(pieces) {
  const body = pieces.find((p) => p.key === 'shirtBody');
  const seats = [];
  for (let n = 0; n < 6; n++) {
    const j = 2 + Math.round(n * 2.9);
    seats.push({ piece: 'shirtBody', index: j * body.cols });
  }
  for (const key of ['cuffR', 'cuffL']) {
    const cuff = pieces.find((p) => p.key === key);
    const col = Math.round(cuff.cols * (key === 'cuffR' ? 0.5 : 0.5));
    seats.push({ piece: key, index: 1 * cuff.cols + col, outward: true });
  }
  return seats;
}

export function buildOutfit() {
  const pieces = [];
  const body = buildShirtBody();
  pieces.push(body);
  pieces.push(buildSleeve(1));
  pieces.push(buildSleeve(-1));
  pieces.push(buildCollar());
  pieces.push(buildCuff(1));
  pieces.push(buildCuff(-1));
  const pelvis = buildPelvis();
  pieces.push(pelvis);
  pieces.push(buildBand());
  pieces.push(buildLeg(1));
  pieces.push(buildLeg(-1));
  const belt = buildBelt();
  pieces.push(belt);
  return { pieces, buttons: buttonSeats(pieces), links: cuffLinks(pieces), pelvis, trims: trimsOf(belt) };
}
