/* The house cloths. They live here, apart from the solver, because the shop
   (cards, product pages, the campaign section) needs to read them without
   pulling three.js into the main bundle — `src/lib/cloth.js` imports this file
   and adds the physics on top. */

export const CLOTH_PRESETS = [
  {
    key: 'twill',
    label: 'Handloom khaddar',
    stand: true,
    city: 'Faisalabad',
    weight: '240 g/m²',
    mill: 'Faisalabad, Punjab',
    composition: '100% handloom cotton',
    used: 'Kurtas and everyday kameez',
    color: '#cdc7ba',
    roughness: 0.95,
    sheen: 0.25,
    sheenColor: '#ffffff',
    sheenRoughness: 0.85,
    repeat: 26,
    normalScale: 0.55,
    // heavy, dead in the hand, holds its own shape
    shear: 0.9,
    bend: 0.6,
    damp: 0.988,
    gravity: 2.6,
    gust: 0.85
  },
  {
    key: 'poplin',
    label: 'Combed cotton lawn',
    stand: true,
    city: 'Lahore',
    weight: '110 g/m²',
    mill: 'Lahore, Punjab',
    composition: '100% combed cotton',
    used: 'Lawn suits and summer formals',
    color: '#e8e4da',
    roughness: 0.68,
    sheen: 0.55,
    sheenColor: '#fffdf7',
    sheenRoughness: 0.45,
    repeat: 52,
    normalScale: 0.3,
    // light, quick, catches every draught
    shear: 0.85,
    bend: 0.5,
    damp: 0.995,
    gravity: 1.95,
    gust: 1.7
  },
  {
    key: 'knit',
    label: 'Wool-silk pashmina',
    stand: true,
    city: 'Karachi',
    weight: '260 g/m²',
    mill: 'Karachi, Sindh',
    composition: '70% wool, 30% silk',
    used: 'Shawls and winter kameez',
    color: '#b6afa2',
    roughness: 1,
    sheen: 0.9,
    sheenColor: '#fff2dc',
    sheenRoughness: 0.6,
    repeat: 34,
    normalScale: 0.8,
    // springy, soft, comes back to itself slowly
    shear: 1.15,
    bend: 0.8,
    damp: 0.993,
    gravity: 2.35,
    gust: 1.2
  },
  {
    key: 'jersey',
    label: 'Cotton cambric',
    stand: false,
    city: 'Faisalabad',
    weight: '150 g/m²',
    mill: 'Faisalabad, Punjab',
    composition: '100% cotton cambric',
    used: 'Kurtas and everyday shalwar kameez',
    color: '#ded9cd',
    roughness: 0.78,
    sheen: 0.45,
    sheenColor: '#fffdf7',
    sheenRoughness: 0.7,
    repeat: 60,
    normalScale: 0.28,
    shear: 1,
    bend: 0.62,
    damp: 0.993,
    gravity: 2.2,
    gust: 1.3
  }
];

// The cloths the shirt is cut in (the jersey is not cut for the stand)
export const STAND_CLOTHS = CLOTH_PRESETS.filter((c) => c.stand);

export const clothByKey = (key) => CLOTH_PRESETS.find((c) => c.key === key) || CLOTH_PRESETS[0];
