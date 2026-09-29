import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, Sparkles, useGLTF } from '@react-three/drei';
import {
  ACESFilmicToneMapping,
  Box3,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  TorusGeometry,
  Vector2,
  Vector3
} from 'three';

import { clothByKey, createOutfit } from '../lib/cloth.js';
import { buildOutfit } from '../lib/pattern.js';
import { makeFabricMaps, makeRibNormal } from '../lib/fabric.js';
import { chestMark, makeWordmark, relaxCut, tailor } from '../lib/garment.js';

const UP = new Vector3(0, 1, 0);

/* --------------------------------------------------------------- the model

   Drop a glTF binary here and it takes the hero:

       public/models/shirt.glb   →   /models/shirt.glb

   Nothing else needs changing: the file is detected at load, and the model is
   framed, lit and moved by the same rig that wears the simulated outfit. Until
   then the outfit below stands in. See public/models/README.md for what the
   file needs (centred origin, Y-up, glTF 2.0). */
const MODEL_URL = '/models/shirt.glb';

/* Dress the model as house cloth — dyed, trimmed and marked. Set false to leave
   the file alone and let it appear exactly as it was authored. */
const RECOLOUR_MODEL = true;

/* Winter 26 goes to the floor in one dye rather than in swatches of raw stock:
   an ink garment with bone trims. What the cloth selector changes on the model
   is therefore its character — the weave, how it grazes, how it falls — while
   the colour's dye and its mark stay the house's. */
const HOUSE_DYE = { body: '#20252d', trim: '#e9e4da' };

/* Ink is the one colour the lamp cannot lift on its own, so the body cloth
   carries a little more sheen than the stand's preset: the graze is what draws
   the silhouette of a dark garment under a warm light. */
const INK_SHEEN = 0.16;

/* How far the hero has scrolled (0 → 1). Shared with the director without a
   re-render: both components read it every frame. */
const stage = { scroll: 0 };

/* The room the outfit is shown in. Warmth is rationed, and the key light here is
   the same lamp as the hero's gradient pool: nothing else on the page glows. */

/* A deep graphite wool — dark enough to sit under the bone shirt, light enough
   that the weave, the pressed crease and the folds all read. */
const TROUSER_CLOTH = {
  color: '#3f4650',
  roughness: 0.92,
  sheen: 0.4,
  sheenColor: '#c9d3e2',
  sheenRoughness: 0.5,
  repeat: 30,
  normalScale: 0.5
};

const LEATHER = { color: '#141619', roughness: 0.42, sheen: 0.5, sheenColor: '#8f96a2', metalness: 0.08 };
const BUTTON = { color: '#2b2f36', roughness: 0.34, metalness: 0.12 };

/* Everything on the rig stands this tall, so a drop-in model lands in the same
   framing as the outfit it replaces. */
const FRAME_HEIGHT = 2.45;

/* A standalone garment (no legs, no full figure under it) reads as "large and
   centred" at a shorter frame height than the full outfit above — this is the
   one to nudge if a dropped-in shirt.glb looks too zoomed in or too small.
   It stands a little larger than the sheet it hangs on so the cloth, not the
   page, is the subject. */
const MODEL_FRAME_HEIGHT = 1.75;

/* Is there a model to load? Vite serves an index.html for any path it cannot
   find, so a bare 200 means "missing" and only a real file counts. */
function useModelPresence() {
  const [present, setPresent] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(MODEL_URL, { method: 'HEAD' })
      .then((r) => {
        const type = (r.headers.get('content-type') || '').toLowerCase();
        const found = r.ok && !type.includes('text/html');
        if (alive) setPresent(found);
      })
      .catch(() => {
        if (alive) setPresent(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  return present;
}

/* ------------------------------------------------------- the simulated outfit */

function Outfit({ preset, still, low }) {
  const { pieces, buttons, trims, links } = useMemo(() => buildOutfit(), []);
  const outfit = useMemo(() => createOutfit({ pieces, preset, links }), [pieces, links]);

  // The cloth on the stand is the shirt's cloth, and it also sets how heavy the
  // trousers move: the outfit is one wardrobe, not two.
  useEffect(() => outfit.setPreset(preset), [outfit, preset]);
  useEffect(() => () => outfit.dispose(), [outfit]);

  const fabric = useMemo(() => makeFabricMaps(256), []);
  useEffect(() => () => fabric.dispose(), [fabric]);

  const materials = useMemo(() => {
    const woven = makeFabricMaps(256);
    return {
      woven,
      shirt: new MeshPhysicalMaterial({
        color: new Color(preset.color),
        roughness: preset.roughness,
        sheen: preset.sheen,
        sheenColor: new Color(preset.sheenColor),
        sheenRoughness: preset.sheenRoughness,
        normalMap: fabric.normal,
        normalScale: new Vector2(preset.normalScale, preset.normalScale),
        roughnessMap: fabric.roughness,
        vertexColors: true,
        side: DoubleSide
      }),
      trouser: new MeshPhysicalMaterial({
        color: new Color(TROUSER_CLOTH.color),
        roughness: TROUSER_CLOTH.roughness,
        sheen: TROUSER_CLOTH.sheen,
        sheenColor: new Color(TROUSER_CLOTH.sheenColor),
        sheenRoughness: TROUSER_CLOTH.sheenRoughness,
        normalMap: woven.normal,
        normalScale: new Vector2(TROUSER_CLOTH.normalScale, TROUSER_CLOTH.normalScale),
        roughnessMap: woven.roughness,
        vertexColors: true,
        side: DoubleSide
      }),
      leather: new MeshPhysicalMaterial({ ...LEATHER, vertexColors: true, side: DoubleSide }),
      button: new MeshStandardMaterial({ ...BUTTON })
    };
  }, [fabric, preset]);

  useEffect(() => {
    const { woven, shirt, trouser, leather, button } = materials;
    fabric.setRepeat(preset.repeat);
    woven.setRepeat(TROUSER_CLOTH.repeat);
    return () => {
      woven.dispose();
      shirt.dispose();
      trouser.dispose();
      leather.dispose();
      button.dispose();
    };
  }, [materials, fabric, preset]);

  // buttons ride on the cloth they are sewn to
  const buttonMesh = useRef();
  const dummy = useMemo(() => new Object3D(), []);
  const buttonGeo = useMemo(() => new CylinderGeometry(0.019, 0.019, 0.006, 14), []);
  useEffect(() => () => buttonGeo.dispose(), [buttonGeo]);

  const seat = useMemo(
    () =>
      buttons.map((b) => ({
        cloth: outfit.cloths.find((c) => c.key === b.piece),
        index: b.index
      })),
    [buttons, outfit]
  );

  // trims that do not drape: they fasten
  const loopGeo = useMemo(() => new TorusGeometry(0.019, 0.0042, 6, 14), []);
  const buckleParts = useMemo(
    () => [
      { geo: new BoxGeometry(0.062, 0.009, 0.009), pos: [0, 0.023, 0] },
      { geo: new BoxGeometry(0.062, 0.009, 0.009), pos: [0, -0.023, 0] },
      { geo: new BoxGeometry(0.009, 0.038, 0.009), pos: [-0.027, 0, 0] },
      { geo: new BoxGeometry(0.009, 0.038, 0.009), pos: [0.027, 0, 0] },
      { geo: new BoxGeometry(0.006, 0.03, 0.006), pos: [0.004, 0, 0.004] }
    ],
    []
  );
  useEffect(
    () => () => {
      loopGeo.dispose();
      buckleParts.forEach((b) => b.geo.dispose());
    },
    [loopGeo, buckleParts]
  );

  const wind = useMemo(() => new Float32Array(3), []);
  const calm = useMemo(() => new Float32Array(3), []);
  const drift = useRef({ x: 0, y: 0 });
  const clock = useRef(0);
  // The solver runs at a fixed rate whatever the display is doing: Verlet only
  // behaves if the step is known. A slow machine gets a slower garment, not a
  // garment that explodes.
  const step = low ? 1 / 20 : 1 / 30;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 20);

    if (still) {
      // no air: let gravity resolve the drape, then hold the outfit as a lit object
      if (clock.current < 2.2) {
        outfit.step(step, calm, 0);
        clock.current += dt;
      }
      if (clock.current < 2.2) outfit.commit();
      return;
    }

    drift.current.x = MathUtils.lerp(drift.current.x, state.pointer.x, 0.05);
    drift.current.y = MathUtils.lerp(drift.current.y, state.pointer.y, 0.05);
    wind[0] = drift.current.x * 1.35 + Math.sin(t * 0.55) * 0.36 + Math.sin(t * 1.9) * 0.09;
    wind[1] = Math.sin(t * 0.83) * 0.14 - 0.06;
    wind[2] = -drift.current.y * 0.9 + Math.cos(t * 0.41) * 0.24;

    clock.current += dt;
    let guard = 0;
    while (clock.current >= step && guard < 3) {
      outfit.step(step, wind, 1);
      clock.current -= step;
      guard++;
    }
    if (guard === 3) clock.current = 0;

    outfit.commit();

    if (buttonMesh.current) {
      for (let i = 0; i < seat.length; i++) {
        const { cloth, index } = seat[i];
        const p = cloth.geometry.getAttribute('position').array;
        const n = cloth.geometry.getAttribute('normal').array;
        const i3 = index * 3;
        dummy.position.set(p[i3], p[i3 + 1], p[i3 + 2]);
        dummy.quaternion.setFromUnitVectors(UP, new Vector3(n[i3], n[i3 + 1], n[i3 + 2]).normalize());
        dummy.updateMatrix();
        buttonMesh.current.setMatrixAt(i, dummy.matrix);
      }
      buttonMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  const matOf = (kind) => (kind === 'shirt' ? materials.shirt : kind === 'leather' ? materials.leather : materials.trouser);

  return (
    <>
      {pieces.map((p) => (
        <mesh key={p.key} geometry={outfit.cloths.find((c) => c.key === p.key).geometry} material={matOf(p.material)} />
      ))}

      <instancedMesh ref={buttonMesh} args={[buttonGeo, materials.button, buttons.length]} />

      {trims.loops.map((l, i) => (
        <mesh key={i} geometry={loopGeo} material={materials.leather} position={l.p} quaternion={quatFor(l.n)} />
      ))}
      <group position={trims.buckle.p} quaternion={quatFor(trims.buckle.n)}>
        {buckleParts.map((b, i) => (
          <mesh key={i} geometry={b.geo} material={materials.button} position={b.pos} />
        ))}
      </group>
    </>
  );
}

const quatFor = (n) => {
  const o = new Object3D();
  o.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(n[0], n[1], n[2]).normalize());
  return o.quaternion;
};

/* ------------------------------------------------------------ the drop-in

   Frames itself to the same box as the outfit, then dresses its fabric panels
   as house cloth and lets the stand's selector recolour them.

   A plain GLB is a colour and a couple of maps; a premium garment is what the
   light does at the surface — a low sheen that only shows at grazing angles, a
   woven roughness and grist, and almost no plastic highlight — so the file is
   re-materialled rather than merely tinted. */

/* Drawn coarse, because a drop-in garment's uv sheet usually covers the whole
   piece in a single tile: a fine cell would dissolve into aliasing, not weave.
   Tiled at roughly the scale the file's own normal map asks for. */
const WEAVE_SIZE = 512;
const WEAVE_PERIOD = 128;
const WEAVE_REPEAT = 8;

/* How flat this cloth is: kept a little under the preset's own roughness, so
   the surface still reads as cloth under the lamp rather than as chalk. */
const MODEL_ROUGHNESS = 0.9;

const isCloth = (m) =>
  (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) &&
  (m.roughness === undefined || m.roughness > 0.35) &&
  (m.metalness === undefined || m.metalness < 0.5);

/* The cloth, in the terms a material understands — shared by the body panels
   and the neckband, so the two can never drift apart. */
function clothParams(preset, weave) {
  return {
    // the drawn weave rides both slots: as albedo it is the grist of the
    // threads, as roughness it is the same threads catching the lamp
    map: weave.tint,
    roughnessMap: weave.tint,
    aoMapIntensity: 1,
    roughness: preset.roughness * MODEL_ROUGHNESS,
    // the cloth's character, carried over from the stand: how soft its graze is,
    // and how warm
    sheen: preset.sheen,
    sheenColor: new Color(preset.sheenColor),
    sheenRoughness: preset.sheenRoughness,
    // a broad, dull highlight instead of a plastic point — cloth is a
    // dielectric with very little specular of its own
    specularIntensity: 0.45,
    envMapIntensity: 1.25,
    // fabric has no back face worth culling, and reflections are what separate
    // a garment from a cardboard cut-out
    side: DoubleSide
  };
}

function dressAsCloth(from, weave, preset) {
  const m = new MeshPhysicalMaterial({
    ...clothParams(preset, weave),
    name: `${from.name || 'cloth'}-noire`,
    color: new Color(HOUSE_DYE.body),
    // the file's own base colour, where it has one, is dyed rather than thrown
    // away: it is the cloth's figure, and the house colour goes over it
    map: from.map || weave.tint,
    normalMap: from.normalMap || null,
    aoMap: from.aoMap || null
  });
  // ink grazes bone, the way a dark cloth under this lamp actually does
  m.sheenColor.set(HOUSE_DYE.trim);
  if (from.normalScale) m.normalScale.copy(from.normalScale).multiplyScalar(1.15);
  return m;
}

function Model({ preset, still }) {
  const { scene } = useGLTF(MODEL_URL, true);

  const weave = useMemo(() => {
    const maps = makeFabricMaps(WEAVE_SIZE, WEAVE_PERIOD);
    // the neckband is a rib knit of its own, tiled once around the band
    const rib = makeRibNormal(256, 64);
    const mark = makeWordmark('NOIRÉ');
    return Object.assign(maps, { rib, mark });
  }, []);
  useEffect(() => {
    weave.setRepeat(WEAVE_REPEAT);
    return () => {
      weave.dispose();
      weave.rib.dispose();
      weave.mark.dispose();
    };
  }, [weave]);

  // the cloth the file was first dressed in, read once while building the clone
  const presetRef = useRef(preset);
  presetRef.current = preset;

  const clone = useMemo(() => {
    const root = scene.clone(true);
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const scale = MODEL_FRAME_HEIGHT / Math.max(size.y, 1e-3);
    root.scale.setScalar(scale);
    root.position.sub(centre.multiplyScalar(scale));
    // a floating garment sits close to centre, with a small drop so it reads
    // as hanging rather than pinned to the vertical middle of the frame
    root.position.y -= 0.08;

    // Collected first, then dressed: the tailor hangs the collar and the
    // topstitch off the mesh it trimmed, and a traversal that is being added to
    // as it walks would dress those trims in turn.
    const panels = [];
    root.traverse((o) => {
      if (o.isMesh && o.material) panels.push(o);
    });

    const cut = [];
    const made = [];
    for (const o of panels) {
      const source = Array.isArray(o.material) ? o.material : [o.material];
      const dressed = source.map((m) => {
        if (!isCloth(m)) return m;
        const cloth = dressAsCloth(m, weave, presetRef.current);
        cut.push({ m: cloth, bump: INK_SHEEN, cloth: true });
        made.push(cloth);
        return cloth;
      });
      if (dressed.some((m, i) => m !== source[i])) o.material = Array.isArray(o.material) ? dressed : dressed[0];

      // The file's own geometry is the cache's to keep, so it is copied before
      // it is re-cut; the collar and the topstitch are then built on the
      // openings of that cut and parented to the mesh they belong to.
      if (o.geometry) {
        const geometry = relaxCut(o.geometry.clone());
        const trimmed = tailor(geometry, geometry.boundingBox.getSize(new Vector3()).y);
        o.geometry = geometry;
        made.push(geometry);
        if (trimmed) {
          // The trims are the contrast: bone against the ink body, the one
          // place the house's light cloth shows on the garment.
          const collar = new MeshPhysicalMaterial({
            ...clothParams(presetRef.current, weave),
            name: 'collar-noire',
            color: new Color(HOUSE_DYE.trim),
            // a neckband is its own knit: ribbed, and matte with a harder graze
            // than the cloth it is sewn to
            map: null,
            roughnessMap: null,
            normalMap: weave.rib,
            normalScale: new Vector2(0.75, 0.3)
          });
          const thread = new MeshPhysicalMaterial({
            name: 'thread-noire',
            color: new Color(HOUSE_DYE.trim),
            roughness: 0.55,
            sheen: 0.35,
            sheenColor: new Color(HOUSE_DYE.trim),
            sheenRoughness: 0.4,
            envMapIntensity: 1.1,
            side: DoubleSide
          });
          made.push(collar, thread);
          cut.push({ m: collar, bump: 0.12, cloth: true });
          o.add(new Mesh(trimmed.collar, collar));
          for (const stitch of trimmed.stitches) {
            made.push(stitch);
            o.add(new Mesh(stitch, thread));
          }

          // the mark: a print on the chest, not a decal floating over it
          const image = weave.mark.image;
          const mark = chestMark(geometry, trimmed.neck, { across: 0.3, plate: image.width / image.height });
          if (mark) {
            const print = new MeshStandardMaterial({
              name: 'print-noire',
              color: new Color(HOUSE_DYE.trim),
              map: weave.mark,
              // cut out rather than blended, so the plate never sorts against
              // the cloth it is sitting on
              alphaTest: 0.5,
              roughness: 0.86,
              metalness: 0
            });
            const plate = new Mesh(mark.geometry, print);
            plate.position.copy(mark.position);
            plate.quaternion.copy(mark.quaternion);
            made.push(mark.geometry, print);
            o.add(plate);
          }
        }
      }
    }
    return { root, cut, made };
  }, [scene, weave]);

  // The glTF cache owns the source geometry and materials, so they are left
  // alone: only the cloth materials drawn here are ours to tear down.
  useEffect(
    () => () => {
      for (const thing of clone.made) thing.dispose();
    },
    [clone]
  );

  useFrame((_, delta) => {
    if (!RECOLOUR_MODEL || !clone.cut.length) return;
    const k = still ? 1 : 1 - Math.exp(-Math.min(delta, 1 / 20) * 3.2);
    for (const { m, bump = 0, cloth = true } of clone.cut) {
      // What travels from the stand is character, not colour: the dye is the
      // house's, but the cloth still tells you how heavy it is and how it
      // grazes the lamp.
      m.sheen = MathUtils.lerp(m.sheen, Math.min(1, preset.sheen + bump), k);
      m.sheenRoughness = MathUtils.lerp(m.sheenRoughness, preset.sheenRoughness, k);
      if (cloth) m.roughness = MathUtils.lerp(m.roughness, preset.roughness * MODEL_ROUGHNESS, k);
    }
  });

  return <primitive object={clone.root} />;
}

/* -------------------------------------------------------- the rig both wear */

/* Radians a second: one unhurried revolution every fifteen seconds or so. */
const TURN = 0.42;

function Garment({ preset, still, low, hasModel }) {
  const rig = useRef();
  const spin = useRef(0);
  const settled = useRef({ y: -0.02, scale: 1.02, roll: 0 });

  useFrame((_, delta) => {
    // Nothing on this rig answers the cursor. It has one job — to turn — and a
    // slow, centred product turntable is not the kind of motion
    // prefers-reduced-motion is meant to suppress, so it always turns.
    const dt = Math.min(delta, 1 / 20);
    const g = rig.current;
    if (!g) return;

    spin.current += dt * TURN;

    // as the hero scrolls away the garment turns a little further, lifts and
    // eases back — the camera does the rest
    const s = stage.scroll;
    settled.current.roll = MathUtils.lerp(settled.current.roll, s * 0.5, 0.06);
    settled.current.y = MathUtils.lerp(settled.current.y, -0.02 + s * 0.2, 0.08);
    settled.current.scale = MathUtils.lerp(settled.current.scale, 1.02 - s * 0.07, 0.08);

    g.rotation.y = spin.current + settled.current.roll;
    g.position.y = settled.current.y;
    g.scale.setScalar(settled.current.scale);
  });

  return (
    <group ref={rig} position={[0.16, -0.02, 0]} scale={1.02}>
      {hasModel ? (
        <Suspense fallback={null}>
          <Model preset={preset} still={still} />
        </Suspense>
      ) : (
        <Outfit preset={preset} still={still} low={low} />
      )}
    </group>
  );
}

/* ---------------------------------------------------------------- the studio */

/* The light the garment stands in, on paper. The studio defaults to the shop's
   own colour — daylight through a window, one warm lamp, a diffuse roof — and
   `tone="dark"` restores the black room for any surface that wants it. */
function Studio({ low, still, tone = 'light' }) {
  const light = tone === 'light';
  return (
    <>
      <ambientLight intensity={light ? 0.72 : 0.2} color={light ? '#ffffff' : '#c3cde0'} />
      {/* the lamp — the only warm light in the room */}
      <directionalLight position={[5.2, 4, 3.4]} intensity={light ? 1.5 : 2.4} color={light ? '#ffd9a8' : '#f0bd76'} />
      <directionalLight position={[-5, 1.6, 2.2]} intensity={light ? 0.8 : 0.85} color={light ? '#dde5f0' : '#8fa6c9'} />
      <directionalLight position={[0, -3.4, 1.6]} intensity={light ? 0.22 : 0.28} color={light ? '#f0d6ae' : '#c98f3f'} />
      {/* the rig turns: without a light behind it the garment would go dark
          halfway round */}
      <directionalLight position={[-2.6, 2.4, -4.6]} intensity={light ? 0.55 : 0.7} color={light ? '#cdd7e6' : '#8ea3c6'} />

      <Environment resolution={low ? 128 : 256} frames={1}>
        <color attach="background" args={[light ? '#f4f1ec' : '#05060a']} />
        <Lightformer form="rect" intensity={light ? 2.2 : 4} color={light ? '#ffe1b6' : '#f6c988'} scale={[2.6, 4.6, 1]} position={[4.2, 2.6, 3]} target={[0, -0.2, 0]} />
        <Lightformer form="rect" intensity={light ? 1.5 : 1.2} color={light ? '#eef2f8' : '#9fb8e0'} scale={[2, 6, 1]} position={[-4.6, 1.2, 1.2]} target={[0, -0.2, 0]} />
        <Lightformer form="rect" intensity={light ? 2.6 : 0.8} color={light ? '#fbf9f6' : '#f2eee4'} scale={[7, 2, 1]} rotation-x={Math.PI / 2} position={[0, 4.6, 0]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={light ? 0.5 : 0.6} color={light ? '#e8c79a' : '#c98f3f'} scale={2} position={[-1.4, 0.4, -3.4]} />
      </Environment>

      <ContactShadows position={[0, -1.84, 0]} opacity={light ? 0.3 : 0.7} scale={6} blur={3} far={3.4} resolution={low ? 256 : 512} color={light ? '#33343a' : '#000000'} />
      {!light && !low && !still && <Sparkles count={60} scale={[8, 6, 5]} size={1.2} speed={0.25} opacity={0.35} color="#e0ac63" noise={0.4} />}
    </>
  );
}

/* The camera: near still while the plate is centred — the garment turns, the
   room does not — and receding as the plate travels up and out of frame, so the
   garment stays put and the page leaves it behind. Progress is measured on the
   plate itself, not on the page, so the same rig behaves in a hero, a band or a
   product page without being told which one it is in. */
function Director({ host }) {
  const camera = useThree((s) => s.camera);
  const progress = useRef(0);

  useEffect(() => {
    const el = host?.current;
    const onScroll = () => {
      const box = el?.getBoundingClientRect();
      const p = box && box.height
        ? Math.min(Math.max(-box.top / box.height, 0), 1)
        : Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
      progress.current = p;
      stage.scroll = p;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [host]);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-delta * 2.4);
    const p = progress.current;
    // a hand's width of parallax, and no more: the cursor suggests the depth of
    // the room, it does not drag the garment around it
    const px = state.pointer.x * 0.18;
    const py = state.pointer.y * 0.1;

    camera.position.x += (0.16 + px - camera.position.x) * k;
    camera.position.z += (4.85 + p * 1.6 - px * 0.25 - camera.position.z) * k;
    camera.position.y += (-0.38 + p * 0.95 + py - camera.position.y) * k;
    camera.lookAt(0.16 + px * 0.35, -0.42 + py * 0.2, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ wrapper */

export default function Scene3D({ clothKey, tone = 'light', className = 'scene' }) {
  const host = useRef(null);
  const [active, setActive] = useState(true);
  const [low, setLow] = useState(false);
  const hasModel = useModelPresence();

  // Stop rendering the moment the hero leaves the viewport.
  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '160px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const preset = clothByKey(clothKey);
  const still = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  return (
    <div className={className} ref={host}>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, low ? 1.25 : 1.9]}
        camera={{ position: [0.16, -0.38, 4.85], fov: 34, near: 0.1, far: 60 }}
        gl={{
          antialias: !low,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.05
        }}
        fallback={<div className="scene__fallback" />}
      >
        <PerformanceMonitor onDecline={() => setLow(true)} />
        <Studio low={low} still={still} tone={tone} />
        <Garment preset={preset} still={still} low={low} hasModel={hasModel} />
        <Director host={host} />
      </Canvas>
    </div>
  );
}
