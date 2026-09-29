# Garment model

Drop a glTF binary in here to take over the live plate:

```
public/models/shirt.glb    →    /models/shirt.glb
```

The page probes for that path on load. If it exists, the model is framed, lit
and turned by the rig in `src/components/Scene3D.jsx` — a slow turntable, a
hand's width of cursor parallax, and a camera that recedes as the plate scrolls
away — and it is re-cut and re-dressed by `src/lib/garment.js` (see *House
tailoring* below), so a plain file arrives looking like a house piece. If the
file is absent, the simulated outfit stands in instead.

## Where it is used

The model is currently the campaign plate on the homepage
(`src/components/GarmentBand.jsx`), standing in a light studio on paper, with
the cloth selector and the spec caption beside it. Small or frugal devices get
a still plate at the same size instead of a canvas.

The hero is a photograph, but the slot is built for this scene: set
`HERO_VISUAL = '3d'` at the top of `src/components/Hero.jsx` and the same
component renders in the hero's plate, with the same grid, copy and CTAs around
it. Nothing else needs changing.

The studio itself has two tones — `tone="light"` (default, the paper room) and
`tone="dark"` (the original black room) — passed to `<Scene3D>` from whichever
section hosts it.

## What the file needs

- **glTF 2.0 binary** (`.glb`) — the path can be changed in one place:
  `MODEL_URL` at the top of `src/components/Scene3D.jsx`.
- **Y-up, centred origin.** The scene recentres the model itself, but a file
  that is already centred and scaled in metres behaves predictably.
- **Height anywhere from 0.2 m to 3 m** — the scene rescales it to fill the
  hero frame (`FRAME_HEIGHT` in the same file), so a 1.7 m shirt and a 30 cm
  swatch land in the same place.
- **PBR materials.** Albedo/base colour, normal, roughness and (if you have
  them) occlusion and metallic maps. Fabric reads best with roughness above
  0.5 and a subtle sheen; that is what separates cloth from plastic.
- **Keep it under ~10 MB.** Draco compression is supported on load
  (`useGLTF(MODEL_URL, true)`); Meshopt is not enabled by default.
- **Dye and cloth.** The garment is dyed in one house colourway
  (`HOUSE_DYE` in `src/components/Scene3D.jsx`: ink body, bone trims and mark)
  rather than in the colour of the cloth on the stand — Winter 26 goes to the
  floor in a dye, not in swatches of raw stock. The stand's selector therefore
  changes the model's *cloth*: its weave grist, its sheen, its roughness. The
  file's own base-colour map, where it has one, is dyed rather than discarded.
  Set `RECOLOUR_MODEL` to `false` to show the file exactly as authored — the
  cut and the collar are skipped with it.
- **Open or welded, it does not matter.** Trim is read from openings after
  welding, so a file with split seams is trimmed the same as a clean one.
- **A file with no front** — one whose neckline does not dip — falls back to
  `+Z`, so the mark may land on the back. Orient such a file before exporting
  it, or drop the `chestMark` call in `Scene3D.jsx`.
- **Per-frame cost.** The model's fabric panels are re-materialled as
  `MeshPhysicalMaterial` (for sheen), so a file with many separate fabric
  materials costs a little more; the drawn weave is a single shared set of
  maps reused by all of them.

## House tailoring

A dropped-in file is treated as cut cloth, not as a finished garment. On load
`src/lib/garment.js`:

- **Welds the mesh by position**, then reads its openings back out — the edges
  that belong to one triangle only. A shirt has four: the neck, two cuffs and
  the hem. Exporters leave seams unwelded, which is why the weld comes first.
- **Relieves the cut** (`relaxCut`): the body is carried wider as it falls and
  the hem dropped, so a fitted file reads as an oversized longline piece. Tune
  `shoulder` / `splay` / `length` there; set them to `1` for the file as cut.
- **Stands a rib collar** on the neckline ring, with its own rib normal map.
- **Runs a topstitch** parallel to every opening, offset in from the edge along
  the surface, so the garment reads as sewn.
- **Lays the house wordmark on the chest** (`chestMark`): the front is read off
  the neckline (a neckline dips at the front), a ray finds the chest, and the
  plate's grid is then pushed onto the surface so the print wraps the body.

None of this needs to know which file it was handed, and none of it touches the
glTF cache: the geometry is copied before it is re-cut, and the materials and
trims built here are disposed on unmount. To take the file exactly as authored,
skip the `relaxCut` / `tailor` calls in `Scene3D.jsx`.

## Current file

`shirt.glb` is a placeholder t-shirt mesh (~10.5k verts, baked normal +
occlusion maps, no base-colour texture) pulled from the open
`adrianhajdin/project_threejs_ai` tutorial repo so the hero has a real GLB to
render instead of the procedural stand-in. That repo ships no explicit
license file — fine for prototyping, but swap in a properly licensed or
commissioned garment (see the sources noted in chat) before a real launch.
The frame size for a standalone garment like this is `MODEL_FRAME_HEIGHT` in
`Scene3D.jsx` (separate from `FRAME_HEIGHT`, which sizes the full simulated
outfit) — nudge that number if the shirt reads too big or too small in the
hero. Its colour and mark come from the house, not the file (see above), so a
replacement garment lands in the same look with nothing to re-dye.
