import { CanvasTexture, RepeatWrapping } from 'three';

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* A rib knit, for a neckband: the normal varies across the band only, so the
   collar reads as vertical wales instead of a weave. */
export function makeRibNormal(size = 256, ribs = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const period = size / ribs;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = Math.sin((x / period) * Math.PI * 2) * 0.62;
      const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx));
      const i = (y * size + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = 128;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/* Fabric maps, drawn instead of downloaded: a weave normal map, a matching
   roughness map and a near-white tint map, so the cloth breaks up the lamp
   rather than reading as plastic. Generated once, tiled by the material.

   `period` is the pixel width of one weave cell. The default 14 is the fine
   grist the simulated outfit is drawn in; a dropped-in model whose whole uv
   sheet covers the single garment needs a much coarser cell to show a weave at
   all instead of dissolving into aliasing. */
export function makeFabricMaps(size = 256, period = 14) {
  const normalCanvas = document.createElement('canvas');
  const roughCanvas = document.createElement('canvas');
  const tintCanvas = document.createElement('canvas');
  normalCanvas.width = normalCanvas.height = size;
  roughCanvas.width = roughCanvas.height = size;
  tintCanvas.width = tintCanvas.height = size;

  const ctxN = normalCanvas.getContext('2d');
  const ctxR = roughCanvas.getContext('2d');
  const ctxT = tintCanvas.getContext('2d');
  const n = ctxN.createImageData(size, size);
  const r = ctxR.createImageData(size, size);
  const t = ctxT.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / period) * Math.PI;
      const v = (y / period) * Math.PI;
      const warp = (Math.floor(x / period) + Math.floor(y / period)) % 2 === 0;
      // over/under: alternating threads dominate, which is what makes a weave read as a weave
      let nx = Math.sin(u) * (warp ? 0.55 : 0.2);
      let ny = Math.sin(v) * (warp ? 0.2 : 0.55);
      // slubs — a slow irregularity so the cloth is never a perfect grid
      const slub = Math.sin((x + y) * 0.035) * 0.12 + Math.sin(x * 0.011 - y * 0.017) * 0.1;
      nx += slub;
      ny += slub * 0.7;
      const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));

      const i = (y * size + x) * 4;
      n.data[i] = (nx * 0.5 + 0.5) * 255;
      n.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      n.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      n.data[i + 3] = 255;

      const rough = clamp(158 + Math.sin(u * 2) * 34 + slub * 200, 0, 255);
      r.data[i] = r.data[i + 1] = r.data[i + 2] = rough;
      r.data[i + 3] = 255;

      // Almost white, so it multiplies the colour by roughly one: the threads
      // only lift and drop the tone a few percent, which is all a woven
      // surface does under a lamp.
      const grist = clamp(250 + Math.sin(u * 2) * 4 + slub * 22, 0, 255);
      t.data[i] = t.data[i + 1] = t.data[i + 2] = grist;
      t.data[i + 3] = 255;
    }
  }

  ctxN.putImageData(n, 0, 0);
  ctxR.putImageData(r, 0, 0);
  ctxT.putImageData(t, 0, 0);

  const normal = new CanvasTexture(normalCanvas);
  const roughness = new CanvasTexture(roughCanvas);
  const tint = new CanvasTexture(tintCanvas);
  for (const tex of [normal, roughness, tint]) {
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.needsUpdate = true;
  }

  return {
    normal,
    roughness,
    tint,
    setRepeat(value) {
      normal.repeat.set(value, value);
      roughness.repeat.set(value, value);
      tint.repeat.set(value, value);
    },
    dispose() {
      normal.dispose();
      roughness.dispose();
      tint.dispose();
    }
  };
}
