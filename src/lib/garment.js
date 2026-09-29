import {
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  SRGBColorSpace,
  TubeGeometry,
  Vector3
} from 'three';

/* ---------------------------------------------------------------------------
   Tailoring a dropped-in mesh.

   A glTF garment arrives as geometry and nothing else: it has no idea it is a
   shirt. So its seams are read back out of it — the edges that belong to one
   triangle only are, in order of height, the neck, the two cuffs and the hem —
   and everything the house adds is built on those curves. Nothing here needs to
   know which file it was handed.
--------------------------------------------------------------------------- */

const key = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);

/* The openings of a shell, as closed rings of vertex indices.

   Exporters routinely leave a seam unwelded — the two sides of a side seam hold
   duplicate vertices at the same point — so positions are welded first. Without
   that, every seam reads as an opening and the neckline is lost among them. */
export function openings(geometry) {
  const index = geometry.index;
  const pos = geometry.attributes.position;
  if (!index) return [];

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const span = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z, 1e-4);
  const cell = span * 1e-4;
  const weld = new Int32Array(pos.count);
  const seats = new Map();
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) / cell)}:${Math.round(pos.getY(i) / cell)}:${Math.round(pos.getZ(i) / cell)}`;
    const seat = seats.get(k);
    if (seat === undefined) {
      seats.set(k, i);
      weld[i] = i;
    } else {
      weld[i] = seat;
    }
  }

  const edges = new Map();
  const add = (a, b) => {
    const k = key(a, b);
    const found = edges.get(k);
    if (found) found.hits += 1;
    else edges.set(k, { a, b, hits: 1 });
  };
  for (let t = 0; t < index.count; t += 3) {
    add(weld[index.getX(t)], weld[index.getX(t + 1)]);
    add(weld[index.getX(t + 1)], weld[index.getX(t + 2)]);
    add(weld[index.getX(t + 2)], weld[index.getX(t)]);
  }

  // an edge with a neighbour on one side only is on an opening
  const ring = new Map();
  const link = (a, b) => {
    if (!ring.has(a)) ring.set(a, []);
    ring.get(a).push(b);
  };
  for (const e of edges.values()) {
    if (e.hits !== 1) continue;
    link(e.a, e.b);
    link(e.b, e.a);
  }

  const rings = [];
  const spent = new Set();
  for (const start of ring.keys()) {
    if (spent.has(start)) continue;
    const loop = [];
    let at = start;
    while (at !== undefined && !spent.has(at)) {
      spent.add(at);
      loop.push(at);
      const next = (ring.get(at) || []).find((n) => !spent.has(n));
      at = next;
    }
    if (loop.length < 16) continue;
    const points = loop.map((i) => new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    const normals = loop.map((i) => {
      const n = new Vector3(
        geometry.attributes.normal.getX(i),
        geometry.attributes.normal.getY(i),
        geometry.attributes.normal.getZ(i)
      );
      return n.lengthSq() > 0 ? n.normalize() : n.set(0, 1, 0);
    });
    const centre = points.reduce((acc, p) => acc.add(p), new Vector3()).multiplyScalar(1 / points.length);
    rings.push({ loop, points, normals, centre, y: centre.y });
  }
  // highest first: neck, cuffs, hem
  return rings.sort((a, b) => b.y - a.y);
}

/* Relieve the cut: a modern shirt is boxy and long rather than tube-like, so
   the body is carried out as it falls and the hem dropped with it. Applied to
   a copy of the file's own geometry — the cache keeps the original. */
export function relaxCut(geometry, { shoulder = 1.1, splay = 0.15, length = 1.13 } = {}) {
  const pos = geometry.attributes.position;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const cx = (box.min.x + box.max.x) / 2;
  const cz = (box.min.z + box.max.z) / 2;
  const hem = box.min.y;
  const top = box.max.y;
  const tall = Math.max(top - hem, 1e-4);

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const v = (y - hem) / tall; // 0 at the hem, 1 at the shoulder
    const carry = shoulder + splay * (1 - v) * (1 - v);
    pos.setX(i, cx + (pos.getX(i) - cx) * carry);
    pos.setZ(i, cz + (pos.getZ(i) - cz) * carry);
    pos.setY(i, top - (top - y) * length);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  // the box the cut is measured from is the one it finished at, not the one it
  // arrived with
  geometry.computeBoundingBox();
  return geometry;
}

/* A rib collar, stood up off the neckline ring: the band is the opening carried
   upward and flared slightly outward, with its own uv run (u around the neck,
   v up the band) so a rib texture can have the last word on how it reads. */
export function collarBand(ring, { height = 0.046, flare = 0.014, tuck = 0.006 } = {}) {
  const geometry = new BufferGeometry();
  const n = ring.points.length;
  const position = new Float32Array(n * 2 * 3);
  const normal = new Float32Array(n * 2 * 3);
  const uv = new Float32Array(n * 2 * 2);
  const index = [];

  for (let i = 0; i < n; i++) {
    const p = ring.points[i];
    const out = new Vector3(p.x - ring.centre.x, 0, p.z - ring.centre.z);
    if (out.lengthSq() < 1e-9) out.set(0, 0, 1);
    out.normalize();
    const base = p.clone().addScaledVector(out, -tuck);
    const top = base.clone().setY(base.y + height).addScaledVector(out, flare);

    const a = i * 6;
    position[a] = base.x;
    position[a + 1] = base.y;
    position[a + 2] = base.z;
    position[a + 3] = top.x;
    position[a + 4] = top.y;
    position[a + 5] = top.z;
    // the band is a curtain around the neck: it catches the lamp from the side
    // whatever way the file happened to wind its triangles
    normal[a] = out.x;
    normal[a + 1] = out.y;
    normal[a + 2] = out.z;
    normal[a + 3] = out.x;
    normal[a + 4] = out.y;
    normal[a + 5] = out.z;

    const u = i * 2;
    uv[u] = i / n;
    uv[u + 1] = 0;
    uv[u + 2] = i / n;
    uv[u + 3] = 1;

    const next = ((i + 1) % n) * 2;
    index.push(i * 2, next, next + 1, i * 2, next + 1, i * 2 + 1);
  }

  geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normal, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  return geometry;
}

/* A machinist's topstitch: a line of thread run parallel to an opening, a
   little way in from the edge and sitting proud of the cloth. The offset
   direction is taken from the surface itself, so it follows every fold the
   hem already has. */
function stitchRail(ring, { inset, lift, radius }) {
  const n = ring.points.length;
  const path = [];
  for (let i = 0; i < n; i++) {
    const p = ring.points[i];
    const before = ring.points[(i - 1 + n) % n];
    const after = ring.points[(i + 1) % n];
    const tangent = after.clone().sub(before).normalize();
    const normal = ring.normals[i];
    const across = new Vector3().crossVectors(normal, tangent).normalize();
    if (across.dot(ring.centre.clone().sub(p)) < 0) across.negate();
    path.push(p.clone().addScaledVector(across, inset).addScaledVector(normal, lift));
  }
  const curve = new CatmullRomCurve3(path, true, 'catmullrom', 0.5);
  return new TubeGeometry(curve, Math.max(32, n), radius, 5, true);
}

/* Everything the house adds to a file it did not cut: the collar, a stitch along
   every opening, and the mark. Heights are fractions of the garment's own
   height, so a metre-tall scan and a twenty-centimetre swatch are trimmed the
   same. */
export function tailor(geometry, height) {
  const rings = openings(geometry);
  if (!rings.length) return null;
  const unit = Math.max(height, 1e-4);
  // rings arrive highest first, so the neck leads; a shell with more openings
  // than a shirt has gets its biggest few stitched and the slivers left alone
  const neck = rings[0];
  const collar = collarBand(neck, {
    height: unit * 0.031,
    flare: unit * 0.009,
    tuck: unit * 0.005
  });
  const stitches = rings
    .slice(0, 6)
    .map((ring) => stitchRail(ring, { inset: unit * 0.021, lift: unit * 0.0016, radius: unit * 0.0034 }));
  return { collar, stitches, neck };
}

/* Which way a garment looks: a neckline dips at the front, so the lowest point
   of the neck ring faces the way the wearer does. */
export function facing(ring) {
  const low = ring.points.reduce((a, p) => (p.y < a.y ? p : a), ring.points[0]);
  const out = new Vector3(low.x - ring.centre.x, 0, low.z - ring.centre.z);
  return out.lengthSq() > 1e-9 ? out.normalize() : new Vector3(0, 0, 1);
}

/* The house wordmark, drawn white on nothing so a material can colour it and
   the leather of the plate keeps its shape whatever face the type loads in. */
export function makeWordmark(text = 'NOIRÉ', { width = 1024, height = 256, fill = 0.9, tracking = 0.2 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const face = (px) => `500 ${px}px "Bodoni Moda", "Times New Roman", serif`;
  const chars = [...text];

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    let px = height * 0.66;
    let run = 0;
    // the plate is a fixed shape; the type takes the width it is given
    for (let pass = 0; pass < 10; pass++) {
      ctx.font = face(px);
      const gap = px * tracking;
      run = chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + gap * (chars.length - 1);
      if (run <= width * fill || px < 8) break;
      px *= (width * fill) / run;
    }
    ctx.font = face(px);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const gap = px * tracking;
    let x = (width - run) / 2;
    for (const c of chars) {
      ctx.fillText(c, x, height * 0.52);
      x += ctx.measureText(c).width + gap;
    }
  };

  draw();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  // the display face arrives after the first paint often enough to be worth
  // re-plating: the canvas keeps its size, so nothing downstream moves
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      draw();
      texture.needsUpdate = true;
    });
  }
  return texture;
}

/* A chest mark, laid on the cloth rather than floated near it: the plate is cut
   as a grid and every vertex is then pushed onto the surface the ray finds, so
   the type wraps the chest the way a screen print does. */
export function chestMark(geometry, neck, { across = 0.28, rise = 0.72, plate = 4 } = {}) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const span = box.getSize(new Vector3());
  const centre = box.getCenter(new Vector3());
  const front = facing(neck);
  const offset = Math.max(span.y, 1e-4) * 0.007;

  const probe = new Raycaster();
  const target = new Mesh(geometry);
  target.updateMatrixWorld(true);

  const anchor = new Vector3(centre.x, box.min.y + (neck.centre.y - box.min.y) * rise, centre.z);
  probe.set(anchor.clone().addScaledVector(front, span.length()), front.clone().negate());
  const landing = probe.intersectObject(target, false)[0];
  if (!landing || !landing.face) return null;

  const normal = landing.face.normal.clone().normalize();
  const quaternion = new Quaternion().setFromRotationMatrix(
    new Matrix4().lookAt(normal, new Vector3(), new Vector3(0, 1, 0))
  );
  const position = landing.point.clone().addScaledVector(normal, offset);
  const width = Math.max(span.x, span.z) * across;
  const plane = new PlaneGeometry(width, width / plate, 10, 2);

  const spot = plane.attributes.position;
  const scratch = new Vector3();
  for (let i = 0; i < spot.count; i++) {
    scratch.set(spot.getX(i), spot.getY(i), 0).applyQuaternion(quaternion).add(position);
    probe.set(scratch.clone().addScaledVector(normal, offset * 8), normal.clone().negate());
    const hit = probe.intersectObject(target, false)[0];
    spot.setZ(i, (hit ? hit.point.clone().sub(position).dot(normal) : 0) + offset * 0.5);
  }
  spot.needsUpdate = true;
  plane.computeVertexNormals();

  return { geometry: plane, position, quaternion };
}
