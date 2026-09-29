import { BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { bodyContacts, collideBody } from './body.js';
import { CLOTH_PRESETS } from '../data/cloth.js';

/* The house cloths live in `src/data/cloth.js` — a pure data module the shop can
   read without loading three.js — and are re-exported here so the solver and
   everything around it keeps one import path. */
export { CLOTH_PRESETS, STAND_CLOTHS, clothByKey } from '../data/cloth.js';

/* ---------------------------------------------------------------------------
   The solver.

   Each piece of the pattern is a Verlet cloth: distance constraints taken from
   the cut's own measurements, so the garment's resting shape is the shape it
   was cut to, and gravity loaded through the seams it hangs from. What the
   fabric does beyond that — drape, hem swing, ripple — is emergent.
--------------------------------------------------------------------------- */

/* Which way a face looks is decided once, from the piece's own centre: every
   panel here is a shell wrapped around a body, so the outside is always the side
   away from the middle. Without this the outfit lights inside out wherever a
   grid happens to run top-down, which is the kind of bug you only see as a panel
   that looks like it was cut from black paper. */
function orientOutward(pos, index) {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  const n = pos.length / 3;
  for (let i = 0; i < pos.length; i += 3) {
    cx += pos[i];
    cy += pos[i + 1];
    cz += pos[i + 2];
  }
  cx /= n;
  cy /= n;
  cz /= n;

  for (let t = 0; t < index.length; t += 3) {
    const a = index[t] * 3;
    const b = index[t + 1] * 3;
    const c = index[t + 2] * 3;
    const nx = (pos[b + 1] - pos[a + 1]) * (pos[c + 2] - pos[a + 2]) - (pos[b + 2] - pos[a + 2]) * (pos[c + 1] - pos[a + 1]);
    const ny = (pos[b + 2] - pos[a + 2]) * (pos[c] - pos[a]) - (pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]);
    const nz = (pos[b] - pos[a]) * (pos[c + 1] - pos[a + 1]) - (pos[b + 1] - pos[a + 1]) * (pos[c] - pos[a]);
    const gx = (pos[a] + pos[b] + pos[c]) / 3 - cx;
    const gy = (pos[a + 1] + pos[b + 1] + pos[c + 1]) / 3 - cy;
    const gz = (pos[a + 2] + pos[b + 2] + pos[c + 2]) / 3 - cz;
    if (nx * gx + ny * gy + nz * gz < 0) {
      index[t + 1] = c / 3;
      index[t + 2] = b / 3;
    }
  }
}

function buildCloth(p) {
  const { cols, rows, count, pos } = p;
  const rest = Float32Array.from(pos);
  const prev = Float32Array.from(pos);
  const live = new Uint8Array(count).fill(1);
  const fixed = p.fixed;

  const pairs = [];
  const kinds = [];
  const dist = (a, b) =>
    Math.max(
      Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2]),
      1e-4
    );
  const add = (a, b, kind) => {
    const d = dist(a, b);
    // A piece can fold back on itself at a corner (a sleeve head meeting at the
    // shoulder point): a constraint of near-zero length would explode.
    if (!(d > 2e-3)) return;
    pairs.push(a, b, d);
    kinds.push(kind);
  };

  // Every piece is a closed loop around the body, so the columns wrap: the
  // weave, the diagonal shear, and the bending stiffness all reach across the
  // seam, which is why a garment behaves as one piece of cloth.
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const right = i === cols - 1 ? j * cols : k + 1;
      if (j < rows - 1) {
        const next = (j + 1) * cols;
        add(k, next + i, 0);
        // the two diagonals: shear is what decides whether a cloth drapes or
        // stands up like a board. Both stay inside the grid — the wrap column
        // must land on the next row's first particle, not past the end of it.
        add(k, next + ((i + 1) % cols), 1);
        add(right, next + i, 1);
      }
      // Bending, both ways: down the piece so a hem cannot curl into a tube,
      // and around it so a trouser leg stays a leg rather than a sock
      if (j < rows - 2) add(k, k + cols * 2, 2);
      add(k, j * cols + ((i + 2) % cols), 2);
    }
  }

  const cn = pairs.length / 3;
  const ca = new Int32Array(cn);
  const cb = new Int32Array(cn);
  const cl = new Float32Array(cn);
  const cw = new Float32Array(cn);
  const ck = new Uint8Array(cn);
  for (let n = 0; n < cn; n++) {
    ca[n] = pairs[n * 3];
    cb[n] = pairs[n * 3 + 1];
    cl[n] = pairs[n * 3 + 2];
    cw[n] = 1;
    ck[n] = kinds[n];
  }

  orientOutward(pos, p.index);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(p.shade, 3));
  geometry.setIndex(p.index);
  geometry.computeVertexNormals();
  const position = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');
  const normalArray = normalAttr.array;
  const tris = Uint32Array.from(p.index);
  const scratch = new Float32Array(count * 3);
  // Which parts of the form can this particle ever reach? Decided once, from
  // the cut: the fabric hangs where it was cut, so a particle that starts a
  // hand's width clear of the body never needs to be tested against it.
  const contacts = bodyContacts(pos, count, p.solids || [0]);
  // the trousers are the outer layer over the hips: they are held off the body,
  // but they are not held off the shirt underneath them
  const solidGap = p.kind === 'shirt' ? 0.008 : 0;

  let dirty = true;
  let tuning = { shear: 1, bend: 1, damp: 0.99, gravity: 2.2, gust: 1 };

  const state = {
    key: p.key,
    kind: p.kind,
    geometry,
    cols,
    rows,
    count,
    rest,
    pos,
    prev,
    live,
    fixed: p.fixed,
    contacts,
    get tuning() {
      return tuning;
    },
    setTuning(next) {
      tuning = next;
      dirty = true;
    }
  };

  const cKind = p.kind;
  state.step = (dt, wind, gustScale, collide) => {
    if (dirty) {
      for (let n = 0; n < cn; n++) cw[n] = ck[n] === 0 ? 1 : ck[n] === 1 ? tuning.shear : tuning.bend;
      dirty = false;
    }
    const sub = 2;
    // Small stiff pieces (a collar, a cuff, a waistband) are cheap, so they get
    // solved properly; the big drapey sheets are the ones that cost.
    const iters = count > 800 ? 1 : count > 400 ? 2 : 3;
    const h = dt / sub;
    const damp = tuning.damp;

    for (let s = 0; s < sub; s++) {
      if (state.probe) state.probe('sub' + s);
      const g = tuning.gravity * h * h;
      const ax = wind[0] * tuning.gust * gustScale * h * h;
      const ay = wind[1] * tuning.gust * gustScale * h * h;
      const az = wind[2] * tuning.gust * gustScale * h * h;

      for (let k = 0; k < count; k++) {
        if (fixed[k]) continue;
        const i3 = k * 3;
        const vx = (pos[i3] - prev[i3]) * damp;
        const vy = (pos[i3 + 1] - prev[i3 + 1]) * damp;
        const vz = (pos[i3 + 2] - prev[i3 + 2]) * damp;
        prev[i3] = pos[i3];
        prev[i3 + 1] = pos[i3 + 1];
        prev[i3 + 2] = pos[i3 + 2];
        pos[i3] += vx + ax;
        pos[i3 + 1] += vy - g + ay;
        pos[i3 + 2] += vz + az;
      }

      for (let it = 0; it < iters; it++) {
        if (state.probe) state.probe('it' + it);
        for (let n = 0; n < cn; n++) {
          const a = ca[n];
          const b = cb[n];
          const i3 = a * 3;
          const j3 = b * 3;
          const dx = pos[j3] - pos[i3];
          const dy = pos[j3 + 1] - pos[i3 + 1];
          const dz = pos[j3 + 2] - pos[i3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          const f = ((d - cl[n]) / d) * 0.5 * cw[n];
          const mx = dx * f;
          const my = dy * f;
          const mz = dz * f;
          if (!fixed[a]) {
            pos[i3] += mx;
            pos[i3 + 1] += my;
            pos[i3 + 2] += mz;
          }
          if (!fixed[b]) {
            pos[j3] -= mx;
            pos[j3 + 1] -= my;
            pos[j3 + 2] -= mz;
          }
        }
      }
      // once per substep, after the weave is solved: the form has the last word
      // on where the fabric can be
      collide(pos, contacts, solidGap === undefined ? gap : solidGap);
    }

    position.array.set(pos);
    position.needsUpdate = true;
  };

  // a seam can move a particle after its own piece was solved
  state.sync = () => {
    position.array.set(pos);
    position.needsUpdate = true;
  };

  /* Normals, straight off the grid. three's own pass rebuilds a map of the whole
     geometry every frame; this walks the same quads in index order, which is
     what a garment redrawn sixty times a second can afford. */
  state.commit = () => {
    scratch.fill(0);
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t] * 3;
      const b = tris[t + 1] * 3;
      const c = tris[t + 2] * 3;
      const ux = pos[b] - pos[a];
      const uy = pos[b + 1] - pos[a + 1];
      const uz = pos[b + 2] - pos[a + 2];
      const vx = pos[c] - pos[a];
      const vy = pos[c + 1] - pos[a + 1];
      const vz = pos[c + 2] - pos[a + 2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      scratch[a] += nx; scratch[a + 1] += ny; scratch[a + 2] += nz;
      scratch[b] += nx; scratch[b + 1] += ny; scratch[b + 2] += nz;
      scratch[c] += nx; scratch[c + 1] += ny; scratch[c + 2] += nz;
    }
    for (let k = 0; k < count; k++) {
      const i3 = k * 3;
      const x = scratch[i3];
      const y = scratch[i3 + 1];
      const z = scratch[i3 + 2];
      const l = Math.sqrt(x * x + y * y + z * z) || 1;
      normalArray[i3] = x / l;
      normalArray[i3 + 1] = y / l;
      normalArray[i3 + 2] = z / l;
    }
    normalAttr.needsUpdate = true;
  };
  state.dispose = () => geometry.dispose();
  return state;
}

/* A piece of the pattern answers to the cloth it is cut in *and* to its own job:
   a poplin shirt is quick and loose, an interfused collar in the same poplin is
   not. The preset carries the cloth, the pattern carries the job. */
function effective(preset, piece) {
  const m = piece.tuning || {};
  return {
    shear: preset.shear * (m.shear === undefined ? 1 : m.shear),
    bend: preset.bend * (m.bend === undefined ? 1 : m.bend),
    damp: m.damp === undefined ? preset.damp : m.damp,
    gravity: preset.gravity * (m.gravity === undefined ? 1 : m.gravity),
    gust: preset.gust * (m.gust === undefined ? 1 : m.gust)
  };
}

/* Build and step the whole outfit as one garment. */
export function createOutfit({ pieces, preset = CLOTH_PRESETS[0], links = [] }) {
  const cloths = pieces.map(buildCloth);
  const byKey = new Map(cloths.map((c) => [c.key, c]));
  const seams = links
    .map((l) => {
      const from = byKey.get(l.from);
      const to = byKey.get(l.to);
      return from && to ? { from: from.pos, fromIndex: l.fromIndex, to: to.pos, toIndex: l.toIndex } : null;
    })
    .filter(Boolean);
  const apply = (p) => {
    cloths.forEach((c, i) => c.setTuning(effective(p, pieces[i])));
  };
  apply(preset);
  return {
    cloths,
    setPreset: apply,
    step(dt, wind = [0, 0, 0], gust = 1) {
      for (const c of cloths) c.step(dt, wind, gust, collideBody);
      // seams, solved after the pieces they join: a cuff rides the sleeve's end
      for (const s of seams) {
        const a = s.fromIndex * 3;
        const b = s.toIndex * 3;
        s.to[b] = s.from[a];
        s.to[b + 1] = s.from[a + 1];
        s.to[b + 2] = s.from[a + 2];
      }
      for (const c of cloths) c.sync();
    },
    commit() {
      for (const c of cloths) c.commit();
    },
    dispose() {
      for (const c of cloths) c.dispose();
    }
  };
}
