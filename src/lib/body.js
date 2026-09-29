import { MathUtils } from 'three';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------------------------------------------------------------------------
   The form the clothes are cut for.

   Nothing here is drawn — the outfit is what you see — but every piece is cut
   over this body and collides with it, which is the difference between a garment
   and a sheet. 1 unit ≈ 62 cm, y = 0 at the natural waist.
--------------------------------------------------------------------------- */

// Torso loft: [y, half width, half depth]. The cross-section is a superellipse,
// so the chest is a flattened oval rather than a pipe.
const TORSO = [
  [-0.36, 0.344, 0.198],
  [-0.2, 0.36, 0.205],
  [-0.08, 0.352, 0.2],
  [0.08, 0.278, 0.176],
  [0.28, 0.305, 0.19],
  [0.5, 0.336, 0.206],
  [0.65, 0.356, 0.212],
  [0.79, 0.396, 0.202],
  [0.86, 0.34, 0.184],
  [0.93, 0.176, 0.14],
  [1.0, 0.108, 0.104]
];
const TORSO_E = 2.5;

const TORSO_LO = TORSO[0][0];
const TORSO_HI = TORSO[TORSO.length - 1][0];

const NECK = { a: [0, 0.96, 0.01], b: [0, 1.24, 0.02], ra: 0.098, rb: 0.092 };

// Right half; the left is mirrored. [from, to, radius at from, radius at to]
const ARMS = [
  [[0.3, 0.75, 0.0], [0.42, 0.36, -0.012], 0.079, 0.059],
  [[0.42, 0.36, -0.012], [0.48, -0.035, 0.018], 0.059, 0.033]
];
const LEGS = [
  [[0.132, -0.16, 0.0], [0.142, -1.05, -0.008], 0.156, 0.108],
  [[0.142, -1.05, -0.008], [0.152, -1.9, 0.006], 0.108, 0.056]
];

export const SHOULDER_JOINT = [0.3, 0.75, 0.0];

// Where the outfit's landmarks sit, so cloth and specs agree on one set of facts.
export const SCALE = { waist: 0, bandTop: 0.075, tuck: -0.16, hem: -1.78 };

/* torso half-width / half-depth at a height */
export function torsoRadii(y) {
  const t = clamp(y, TORSO_LO, TORSO_HI);
  let i = 0;
  while (i < TORSO.length - 2 && TORSO[i + 1][0] < t) i++;
  const [y0, x0, z0] = TORSO[i];
  const [y1, x1, z1] = TORSO[i + 1];
  const k = smoothstep(y0, y1, t);
  return { rx: x0 + (x1 - x0) * k, rz: z0 + (z1 - z0) * k };
}

const pow = (v, p) => Math.sign(v) * Math.abs(v) ** p;
const SN = 2 / TORSO_E;

/* A point on the torso's skin: phi = 0 is dead centre front, pi/2 the right side. */
export function torsoSurface(phi, y, ease = 0) {
  const { rx, rz } = torsoRadii(y);
  return [pow(Math.sin(phi), SN) * (rx + ease), y, pow(Math.cos(phi), SN) * (rz + ease)];
}

/* Also useful off the torso: the same superellipse in an arbitrary frame. */
export function superellipse(phi, rx, rz) {
  return [pow(Math.sin(phi), SN) * rx, 0, pow(Math.cos(phi), SN) * rz];
}

/* --- the body's volume, as shapes a particle can be pushed out of ---------- */

/* Which parts of the form a given piece of cloth can ever reach. A sleeve only
   meets the torso and its own arm; the trousers hang clear of everything. The
   solver tests what a piece declares and nothing else. */
export const SOLIDS = {
  torso: [0],
  torsoNeck: [0, 1],
  arm: (sign) => [0, sign > 0 ? 2 : 4, sign > 0 ? 3 : 5],
  armOnly: (sign) => (sign > 0 ? [2, 3] : [4, 5]),
  all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
};

const shapes = [
  { kind: 'loft', y0: TORSO_LO, y1: TORSO_HI },
  { kind: 'capsule', a: NECK.a, b: NECK.b, ra: NECK.ra, rb: NECK.rb }
];
for (const s of ARMS) shapes.push({ kind: 'capsule', a: s[0], b: s[1], ra: s[2], rb: s[3] });
for (const s of ARMS) shapes.push({ kind: 'capsule', a: [-s[0][0], s[0][1], s[0][2]], b: [-s[1][0], s[1][1], s[1][2]], ra: s[2], rb: s[3] });
for (const s of LEGS) shapes.push({ kind: 'capsule', a: s[0], b: s[1], ra: s[2], rb: s[3] });
for (const s of LEGS) shapes.push({ kind: 'capsule', a: [-s[0][0], s[0][1], s[0][2]], b: [-s[1][0], s[1][1], s[1][2]], ra: s[2], rb: s[3] });

const bounds = shapes.map((s) => (s.kind === 'capsule'
  ? {
      lo: Math.min(s.a[0], s.b[0]) - s.ra - s.rb, hi: Math.max(s.a[0], s.b[0]) + s.ra + s.rb,
      ylo: Math.min(s.a[1], s.b[1]) - s.ra - s.rb, yhi: Math.max(s.a[1], s.b[1]) + s.ra + s.rb,
      zlo: Math.min(s.a[2], s.b[2]) - s.ra - s.rb, zhi: Math.max(s.a[2], s.b[2]) + s.ra + s.rb
    }
  : { lo: -0.6, hi: 0.6, ylo: s.y0 - 0.1, yhi: s.y1 + 0.1, zlo: -0.4, zhi: 0.4 }));

/* Which shapes a particle could ever touch, decided once from the cut. A garment
   hangs where it was cut, so a particle that starts clear of the body stays
   clear of it, and the solver can skip nine tenths of the work. */
/* |v|^2.5 without a call into pow: the torso's cross-section is a superellipse,
   and this is the hot loop of the whole simulation. */
const p25 = (v) => {
  const a = v < 0 ? -v : v;
  return a * a * Math.sqrt(a);
};

/* Distance from a point to a shape's surface (negative inside), so a piece can
   decide once which parts of the form it will ever need to be tested against. */
function shapeGap(px, py, pz, shape) {
  if (shape.kind === 'loft') {
    const { rx, rz } = torsoRadii(clamp(py, TORSO_LO, TORSO_HI));
    const s = (p25(px / rx) + p25(pz / rz)) ** 0.4;
    return (s - 1) * Math.min(rx, rz);
  }
  const ax = shape.a[0];
  const ay = shape.a[1];
  const az = shape.a[2];
  const dx = shape.b[0] - ax;
  const dy = shape.b[1] - ay;
  const dz = shape.b[2] - az;
  const l2 = dx * dx + dy * dy + dz * dz;
  let t = ((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = ax + dx * t;
  const qy = ay + dy * t;
  const qz = az + dz * t;
  const vx = px - qx;
  const vy = py - qy;
  const vz = pz - qz;
  return Math.sqrt(vx * vx + vy * vy + vz * vz) - (shape.ra + (shape.rb - shape.ra) * t);
}

/* Which particles each shape could ever need to touch, decided once from the
   cut. A garment hangs where it was cut, so this is nearly all the work of the
   collision pass done at build time, and what is left runs over a short list
   per shape instead of every shape per particle. */
export function bodyContacts(pos, count, allowed, margin = 0.13) {
  const buckets = allowed.map((s) => ({ s, list: [] }));
  for (let k = 0; k < count; k++) {
    const i3 = k * 3;
    const x = pos[i3];
    const y = pos[i3 + 1];
    const z = pos[i3 + 2];
    for (const bucket of buckets) {
      if (shapeGap(x, y, z, shapes[bucket.s]) < margin) bucket.list.push(k);
    }
  }
  return buckets.map((b) => ({ s: b.s, list: Int32Array.from(b.list) }));
}

/* Push the cloth out of the form. */
export function collideBody(pos, buckets, gap) {
  for (let n = 0; n < buckets.length; n++) {
    const bucket = buckets[n];
    const list = bucket.list;
    const shape = shapes[bucket.s];

    if (shape.kind === 'loft') {
      for (let m = 0; m < list.length; m++) {
        const i3 = list[m] * 3;
        const py = pos[i3 + 1];
        const { rx, rz } = torsoRadii(clamp(py, TORSO_LO, TORSO_HI));
        const s = (p25(pos[i3] / rx) + p25(pos[i3 + 2] / rz)) ** 0.4;
        const want = 1 + gap / Math.max(rx, rz);
        if (s < want && s > 1e-4) {
          const f = want / s;
          pos[i3] *= f;
          pos[i3 + 2] *= f;
        }
      }
      continue;
    }

    const ax = shape.a[0];
    const ay = shape.a[1];
    const az = shape.a[2];
    const dx = shape.b[0] - ax;
    const dy = shape.b[1] - ay;
    const dz = shape.b[2] - az;
    const l2 = dx * dx + dy * dy + dz * dz;
    const ra = shape.ra + gap;
    const rb = shape.rb + gap;

    for (let m = 0; m < list.length; m++) {
      const i3 = list[m] * 3;
      const px = pos[i3];
      const py = pos[i3 + 1];
      const pz = pos[i3 + 2];
      let t = ((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / l2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = ax + dx * t;
      const qy = ay + dy * t;
      const qz = az + dz * t;
      const r = ra + (rb - ra) * t;
      const vx = px - qx;
      const vy = py - qy;
      const vz = pz - qz;
      const d = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1e-6;
      if (d < r) {
        const f = r / d;
        pos[i3] = qx + vx * f;
        pos[i3 + 1] = qy + vy * f;
        pos[i3 + 2] = qz + vz * f;
      }
    }
  }
}

/* How far a point sits outside the body — used to shade fabric into shadow where
   it is pressed against the form, the way a tucked hem reads darker. */
export function bodyGap(x, y, z) {
  const { rx, rz } = torsoRadii(clamp(y, TORSO_LO, TORSO_HI));
  const ax = x / rx;
  const az = z / rz;
  const s = (Math.abs(ax) ** TORSO_E + Math.abs(az) ** TORSO_E) ** (1 / TORSO_E);
  let best = (s - 1) * Math.min(rx, rz);

  for (let i = 1; i < shapes.length; i++) {
    const shape = shapes[i];
    const dx = shape.b[0] - shape.a[0];
    const dy = shape.b[1] - shape.a[1];
    const dz = shape.b[2] - shape.a[2];
    const l2 = dx * dx + dy * dy + dz * dz;
    let t = ((x - shape.a[0]) * dx + (y - shape.a[1]) * dy + (z - shape.a[2]) * dz) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = shape.a[0] + dx * t;
    const qy = shape.a[1] + dy * t;
    const qz = shape.a[2] + dz * t;
    const d = Math.sqrt((x - qx) ** 2 + (y - qy) ** 2 + (z - qz) ** 2);
    best = Math.min(best, d - (shape.ra + (shape.rb - shape.ra) * t));
  }
  return Math.max(best, 0);
}

/* The arm's axis, so sleeves can be built around it. u = 0 shoulder, 1 wrist.
   Two segments, so an elbow exists; radius follows a real arm, not a pipe. */
const ARM_U = (() => {
  const seg = [];
  let total = 0;
  for (const [a, b] of ARMS) {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    seg.push({ from: total, len: l });
    total += l;
  }
  return { seg, total };
})();
const ARM_R = [[0, 0.079], [0.22, 0.07], [0.44, 0.059], [0.62, 0.053], [0.82, 0.046], [1, 0.041]];

function sampling(table, u) {
  let i = 0;
  while (i < table.length - 2 && table[i + 1][0] < u) i++;
  const [u0, v0] = table[i];
  const [u1, v1] = table[i + 1];
  return v0 + (v1 - v0) * smoothstep(u0, u1, u);
}

export function armFrame(u, sign = 1) {
  const d = u * ARM_U.total;
  let si = 0;
  while (si < ARM_U.seg.length - 1 && ARM_U.seg[si + 1].from < d) si++;
  const s = ARM_U.seg[si];
  const k = clamp((d - s.from) / s.len, 0, 1);
  const a = ARMS[si][0];
  const b = ARMS[si][1];
  const p = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  // Down the arm, outboard of the torso, and forward — a stable frame even
  // though a hanging arm is very nearly vertical. Both arms are built from the
  // same measurements, mirrored, so the two sleeves cannot drift apart.
  let A = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const la = Math.hypot(A[0], A[1], A[2]);
  A = [(A[0] / la) * sign, A[1] / la, A[2] / la];
  let X = [-A[1] * sign, A[0] * sign, 0];
  const lx = Math.hypot(X[0], X[1], X[2]) || 1;
  X = [X[0] / lx, X[1] / lx, 0];
  let Z = [
    A[1] * X[2] - A[2] * X[1],
    A[2] * X[0] - A[0] * X[2],
    A[0] * X[1] - A[1] * X[0]
  ];
  if (Z[2] < 0) Z = [-Z[0], -Z[1], -Z[2]];
  return {
    p: [p[0] * sign, p[1], p[2]],
    A,
    X,
    Z,
    r: sampling(ARM_R, u)
  };
}

/* The trouser leg's own profile: a straight leg does not follow a knee.
   u = 0 at the crotch, 1 at the hem. */
const LEG_R = [[0, 0.215], [0.1, 0.202], [0.3, 0.187], [0.52, 0.172], [0.75, 0.163], [1, 0.158]];
export function legFrame(u, sign = 1) {
  const t = clamp(u, 0, 1);
  const startY = -0.24;
  const endY = SCALE.hem - 0.02;
  const y = startY + (endY - startY) * t;
  const x = 0.13 + 0.032 * t;
  const z = -0.005 + 0.011 * t;
  return { p: [x * sign, y, z], r: sampling(LEG_R, t) };
}

/* The shirt's ease, and the trouser's, kept in one place so the two can never
   silently disagree and let one fabric poke through the other. */
export function shirtEase(y) {
  return 0.012 + 0.07 * smoothstep(-0.02, 0.34, y);
}
export function trouserEase(y) {
  return Math.max(0.042, shirtEase(y) + 0.032);
}
export function trouserRadii(y) {
  const { rx, rz } = torsoRadii(y);
  const e = trouserEase(y);
  return { rx: rx + e, rz: rz + e };
}
