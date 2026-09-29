/* --------------------------------------------------------------- the catalogue

   The shop is written as rows, not as forty-key objects: a house with forty-odd
   pieces should be readable a department at a time, and the builder below is the
   only place that decides what a piece *is* — slug, images, run, ratings, stock.

   Row order, in full:

     0 name   1 brand   2 category   3 price   4 was (or 0)   5 sizes
     6 colours (space separated palette keys, '' for none)
     7 cloth preset key, or the material once it is not cloth at all
     8 rating  9 flags  10 blurb  11 photography album

   Flags: new · excl · best · trend. Nothing here is invented at render time, so
   every rail, chip and filter on the site agrees with every other one.

   The last column names a shoot in data/photography.js. One album, one piece:
   no two products share a picture, and every picture is a kameez, a kurta, a
   pair of juttis or a piece of leather — photographed for this shop. */

import { album } from './photography.js';

const PRESETS = ['twill', 'poplin', 'knit', 'jersey'];

const SIZE_SETS = {
  AX: ['XS', 'S', 'M', 'L', 'XL'],
  SXL: ['S', 'M', 'L', 'XL', 'XXL'],
  KID: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
  SHOE: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
  ONE: ['One Size']
};

/* The palette the whole site draws from — swatch dots, filter chips and the
   colourway names on a product page all read this one list. */
export const COLOURS = {
  ink: { name: 'Ink', hex: '#14161a' },
  onyx: { name: 'Onyx', hex: '#23262b' },
  charcoal: { name: 'Charcoal', hex: '#3a3d42' },
  olive: { name: 'Olive', hex: '#55593f' },
  emerald: { name: 'Emerald', hex: '#1f5c45' },
  cobalt: { name: 'Cobalt', hex: '#2f4a7c' },
  rust: { name: 'Rust', hex: '#8d4a30' },
  mustard: { name: 'Mustard', hex: '#c9971f' },
  clay: { name: 'Clay', hex: '#b7745c' },
  crimson: { name: 'Crimson', hex: '#b8384c' },
  wine: { name: 'Wine', hex: '#5a2431' },
  rose: { name: 'Rose', hex: '#d3a49f' },
  sand: { name: 'Sand', hex: '#d9cbb2' },
  ecru: { name: 'Ecru', hex: '#e6dfd0' },
  bone: { name: 'Bone', hex: '#efe7d8' },
  ivory: { name: 'Ivory', hex: '#f5f1e8' },
  white: { name: 'White', hex: '#f7f6f4' },
  gold: { name: 'Gold', hex: '#c2a35a' },
  silver: { name: 'Silver', hex: '#c4c8cc' }
};

export const colourName = (key) => COLOURS[key]?.name || key;

/* Fictional houses. NOIRÉ is the label the shop belongs to; the rest are the
   labels it carries — one cutting room each, named for the place it works. */
export const BRAND_INFO = {
  'NOIRÉ': { blurb: 'The house label. Kurtas and kameez cut in small runs.', since: 2016 },
  'GULMOHAR': { blurb: 'Embroidered lawn and everyday kameez, cut in Lahore.', since: 2009 },
  'NAKSHI': { blurb: 'Chikankari and hand embroidery on cotton cambric.', since: 2015 },
  'MOTIA': { blurb: 'Printed lawn suits, the print drawn and screens made in-house.', since: 2011 },
  'MEHR ATELIER': { blurb: 'Formals in chiffon, organza and velvet, hand finished.', since: 2004 },
  'ZARINA': { blurb: 'Bridal and festive wear, made to order in six weeks.', since: 1998 },
  'SOHNI': { blurb: 'Shawls, sandals and childrenswear in short runs.', since: 2017 },
  'RAVI & LOOM': { blurb: 'Khaddar and block print, woven on handloom in Faisalabad.', since: 2013 },
  'CHENAB SUPPLY': { blurb: 'Everyday shalwar kameez, waistcoats and leather shoes.', since: 2012 },
  'TILLA': { blurb: 'Juttis, khussa and gold-plated jewellery, made by hand.', since: 2019 },
  'KAIRA': { blurb: 'Children\'s festive cotton, cut generous and handed down twice.', since: 2018 },
  'KARAKORAM LEATHER': { blurb: 'Leather bags cut and stitched in Sialkot.', since: 2001 }
};

const ROWS = {
  Women: [
    ['Embroidered Lawn Kameez & Trouser', 'GULMOHAR', 'Kameez & Trouser', 9499, 11999, 'AX', 'ivory sand', 'poplin', 4.7, 'best', 'A three-piece lawn suit with the embroidery worked on the front panel, so the shirt reads plain from the back.', 'kameez-ivory'],
    ['Cream Kurta & Trouser', 'GULMOHAR', 'Kurta', 11999, 0, 'AX', 'sand ecru', 'lawn', 4.6, 'new', 'A straight kurta with a self belt and a trouser cut to match: one cloth, dyed in one lot.', 'kameez-sand'],
    ['Ajrak Block-Print Kurta', 'RAVI & LOOM', 'Kurta', 6499, 0, 'AX', 'mustard rust', 'twill', 4.8, 'best excl', 'Block printed by hand in Bhit Shah, so the register shifts a hair from piece to piece. That is the point.', 'kurti-mustard'],
    ['Chikankari Cotton Kameez', 'NAKSHI', 'Kurta', 7499, 8999, 'AX', 'ivory', 'cambric', 4.7, 'best', 'Chikankari worked in one thread colour over a fine cambric that keeps its shape after a wash.', 'kameez-pearl'],
    ['Printed Lawn Suit with Dupatta', 'MOTIA', 'Kameez & Trouser', 8499, 0, 'AX', 'mustard olive', 'poplin', 4.6, 'trend', 'A two-piece lawn suit with a gauze dupatta, printed in a scale that reads from across a room.', 'suit-sunflower'],
    ['Tie-Dye Kameez & Dupatta', 'MOTIA', 'Kameez & Trouser', 7999, 9999, 'AX', 'crimson ivory', 'lawn', 4.5, 'new', 'Dyed by hand in bands, then washed twice, so the colour sits soft rather than flat.', 'dupatta-crimson'],
    ['Organza Formal Kameez', 'MEHR ATELIER', 'Formal', 18999, 23999, 'SXL', 'rose ivory', 'organza', 4.8, 'best excl', 'An organza shirt on a raw-silk lining, with the dupatta finished by hand at the edge.', 'suit-blush'],
    ['Velvet Embroidered Formal', 'MEHR ATELIER', 'Formal', 27999, 0, 'SXL', 'wine', 'velvet', 4.9, 'best', 'Hand-worked maroon velvet with a bead border: one seam down the back and nothing else.', 'formal-maroon'],
    ['Embroidered Chiffon Formal', 'MEHR ATELIER', 'Formal', 21999, 26999, 'SXL', 'ink onyx', 'chiffon', 4.7, 'trend', 'Black chiffon over a bone lining, so the embroidery shows and the cloth still falls.', 'studio-ink'],
    ['Silk Sharara Set', 'ZARINA', 'Bridal', 44999, 56999, 'SXL', 'crimson gold', 'raw silk', 4.9, 'excl best', 'A short kameez with a sharara and dupatta, worked in gold thread over four weeks.', 'bridal-scarlet'],
    ['Chiffon Bridal Kameez', 'ZARINA', 'Bridal', 38999, 0, 'SXL', 'clay gold', 'chiffon', 4.8, 'new excl', 'Peach chiffon with a hand-worked neckline and a dupatta cut long enough to drape twice.', 'bridal-peach'],
    ['Pashmina Shawl', 'SOHNI', 'Shawl', 12999, 15999, 'ONE', 'emerald', 'knit', 4.7, 'best', 'Woven wool-silk pashmina, wide enough to fold double and light enough to carry all evening.', 'shawl-jade']
  ],
  Men: [
    ['Cotton Kurta', 'NOIRÉ', 'Kurta', 5499, 0, 'SXL', 'ivory', 'jersey', 4.7, 'best', 'The plain one: a straight kurta in combed cotton, side vents cut high so it does not pull when you sit.', 'kurta-ivory'],
    ['Embroidered Kurta & Waistcoat', 'NOIRÉ', 'Kurta', 12999, 15999, 'SXL', 'onyx', 'cotton silk', 4.8, 'best excl', 'A black kurta on a wool waistcoat: the two cut in the same room so the shoulders agree.', 'kurta-onyx'],
    ['Two-Piece Shalwar Kameez', 'RAVI & LOOM', 'Shalwar Kameez', 8999, 0, 'SXL', 'white', 'wash-and-wear', 4.6, 'best', 'White shalwar kameez in a wash-and-wear cloth: it comes out of the bag creased and hangs straight by the time you arrive.', 'kameez-white'],
    ['Washed Khaddar Kurta', 'CHENAB SUPPLY', 'Kurta', 6499, 7999, 'SXL', 'olive', 'twill', 4.5, 'trend', 'Heavy khaddar, washed twice before it is cut, so it goes soft where it folds and stays put everywhere else.', 'kameez-olive'],
    ['Silk-Blend Kurta', 'NOIRÉ', 'Kurta', 8499, 0, 'SXL', 'sand', 'cotton silk', 4.6, 'new', 'Cotton silk with a low sheen: dressy enough for a mehndi, plain enough for a Tuesday.', 'kurta-camel'],
    ['Festive Embroidered Kurta', 'ZARINA', 'Kurta', 10999, 13499, 'SXL', 'mustard', 'cotton silk', 4.7, 'trend', 'Mustard with a worked placket and cuffs, cut longer at the back so it sits well over a shalwar.', 'kurta-saffron'],
    ['Waistcoat, Wool Blend', 'CHENAB SUPPLY', 'Waistcoat', 7999, 0, 'SXL', 'charcoal', 'wool blend', 4.5, 'excl', 'A five-button waistcoat with a plain back, cut narrow enough to wear under a kurta collar.', 'waistcoat-charcoal'],
    ['Blue Cotton Kurta', 'NOIRÉ', 'Kurta', 6999, 0, 'SXL', 'cobalt', 'cambric', 4.6, 'new', 'Indigo-dyed cambric, a stand collar and a placket that stops at the chest.', 'kurta-navy']
  ],
  Kids: [
    ['Festive Sharara Set', 'SOHNI', 'Girls', 7499, 8999, 'KID', 'mustard', 'raw silk', 4.7, 'best', 'A short kameez with a gathered sharara, lined so it does not itch and cut to survive a full evening.', 'kid-orange'],
    ['Embroidered Kameez', 'SOHNI', 'Girls', 4999, 0, 'KID', 'crimson', 'cotton', 4.6, 'new', 'A red kameez with a worked yoke, hem left generous so it still fits after the growth spurt.', 'kid-red'],
    ['Velvet Party Frock', 'KAIRA', 'Girls', 6499, 0, 'KID', 'emerald', 'velvet', 4.5, 'excl', 'Emerald velvet over a cotton lining, with a border that can be taken down a size.', 'kid-velvet'],
    ['Kurta & Shalwar Set', 'CHENAB SUPPLY', 'Boys', 5499, 6499, 'KID', 'bone ecru', 'cotton', 4.6, 'best', 'A bone kurta with a matching shalwar, both machine washable and both cut a little long.', 'kid-father-son']
  ],
  Footwear: [
    ['Embroidered Leather Jutti', 'TILLA', 'Juttis & Khussa', 5999, 0, 'SHOE', 'bone', 'Leather, cotton thread embroidery', 4.7, 'best', 'Cut from one piece of leather and stitched by hand, so the jutti softens to the foot rather than rubbing.', 'jutti-cream'],
    ['Velvet Jutti', 'TILLA', 'Juttis & Khussa', 6499, 7999, 'SHOE', 'wine', 'Velvet upper, leather sole', 4.6, 'trend', 'Wine velvet over a leather sole, with the embroidery worked in a thread two shades darker.', 'jutti-wine'],
    ['Bridal Khussa', 'TILLA', 'Juttis & Khussa', 8999, 0, 'SHOE', 'silver', 'Hand-embroidered leather, leather sole', 4.8, 'new excl', 'A flat khussa worked in silver and gold thread: made for a long night on your feet.', 'khussa-bridal'],
    ['Leather Loafer', 'CHENAB SUPPLY', 'Loafers', 11999, 13999, 'SHOE', 'cobalt', 'Full-grain leather, rubber sole', 4.5, 'best', 'A soft loafer on a rubber sole, with the vamp lined in leather so it holds its shape.', 'loafer-cobalt'],
    ['Leather Sandal', 'SOHNI', 'Sandals', 7999, 0, 'SHOE', 'bone', 'Nappa leather, leather lining', 4.4, 'excl', 'A single strap over a low wedge, cut for a long day on marble.', 'sandal-silver'],
    ['Court Sneaker', 'NOIRÉ', 'Sneakers', 12999, 0, 'SHOE', 'white', 'Leather and canvas, stitched cup sole', 4.6, 'trend', 'A plain court shape in leather and canvas, on a sole stitched rather than glued.', 'sneaker-court']
  ],
  Accessories: [
    ['Boxed Leather Handbag', 'KARAKORAM LEATHER', 'Bags', 14999, 18999, 'ONE', 'crimson', 'Full-grain leather, cotton twill lining', 4.8, 'best excl', 'A squared body that stands up when it is put down: panelled sides, one magnetic closure, no visible hardware.', 'bag-crimson'],
    ['Leather Shoulder Bag', 'KARAKORAM LEATHER', 'Bags', 16999, 0, 'ONE', 'clay', 'Grained leather, brass hardware', 4.7, 'new', 'Slouched by design in a grained leather that softens further with wear.', 'bag-cocoa'],
    ['Textured Leather Tote', 'KARAKORAM LEATHER', 'Bags', 18999, 22999, 'ONE', 'ink', 'Textured calf leather, suede lining', 4.6, 'trend', 'Croc-embossed calf with a short top handle and a long strap in the bag.', 'bag-ink'],
    ['Mini Structured Bag', 'KARAKORAM LEATHER', 'Bags', 12999, 0, 'ONE', 'emerald', 'Leather, twill lining', 4.5, 'new', 'Holds a phone, a card case and a lipstick, and nothing else — which is the whole idea.', 'bag-jade'],
    ['Gold-Plated Bangle', 'TILLA', 'Jewellery', 4999, 6499, 'ONE', 'gold', 'Gold-plated brass', 4.7, 'best', 'A slim gold-plated bangle, sized to sit with a watch or stack three deep.', 'jewel-bangle'],
    ['Silver Hoop Earring', 'TILLA', 'Jewellery', 3999, 0, 'ONE', 'silver', 'Sterling silver', 4.6, 'trend', 'A plain hoop in sterling silver, weighted so it hangs straight and does not lift as you move.', 'jewel-hoops'],
    ['Emerald Bangle Set', 'TILLA', 'Jewellery', 12999, 15999, 'ONE', 'emerald gold', 'Gold-plated brass, glass stone', 4.8, 'best excl', 'Two bangles, one set with glass emerald, sold as a pair so the stones match.', 'jewel-emerald'],
    ['Bridal Jewellery Set', 'ZARINA', 'Jewellery', 24999, 29999, 'ONE', 'gold', 'Gold-plated brass, kundan work', 4.9, 'best', 'Necklace with matched earrings, kundan set on a frame built to sit flat against the collar bone.', 'jewel-bridal']
  ]
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

let seq = 0;
const build = (row, department) => {
  const [name, brand, category, price, was, sizeKey, colourStr, clothish, rating, flags, blurb, shoot] = row;
  seq += 1;
  const slug = slugify(`${brand}-${name}`);
  const preset = PRESETS.includes(clothish) ? clothish : null;
  const images = album(shoot);
  return {
    id: seq,
    slug,
    name,
    brand,
    department,
    category,
    price,
    oldPrice: was || null,
    sizes: SIZE_SETS[sizeKey],
    colours: colourStr ? colourStr.split(' ') : [],
    cloth: preset,
    material: preset ? null : clothish,
    rating,
    reviewCount: 9 + ((seq * 7) % 24),
    // A run of forty leaves gaps: everything is finite, and the shop says so.
    stock: seq % 19 === 0 ? 0 : 3 + ((seq * 13) % 38),
    sold: 40 + ((seq * 37) % 460),
    isNew: flags.includes('new'),
    isExclusive: flags.includes('excl'),
    isBestSeller: flags.includes('best'),
    trending: flags.includes('trend'),
    isSale: Boolean(was),
    blurb,
    shoot,
    images,
    image: images[0],
    // A second angle where the shoot has one; the card falls back to the first.
    hoverImage: images[1] || null
  };
};

export const products = Object.entries(ROWS).flatMap(([department, rows]) => rows.map((r) => build(r, department)));

/* ---------------------------------------------------------------- the shop ---- */

export const DEPARTMENTS = [
  { key: 'Women', title: 'Women', text: 'Kameez, kurta, lawn suits and formals.', image: 'kameez-emerald' },
  { key: 'Men', title: 'Men', text: 'Kurtas, shalwar kameez and waistcoats.', image: 'kurta-navy' },
  { key: 'Kids', title: 'Kids', text: 'Festive cotton, cut to be handed down.', image: 'kid-orange' },
  { key: 'Footwear', title: 'Footwear', text: 'Jutti, khussa and everyday leather.', image: 'market-juttis' },
  { key: 'Accessories', title: 'Accessories', text: 'Leather bags and hand-finished jewellery.', image: 'bag-tan' }
].map((d) => ({ ...d, image: album(d.image)[0], to: `/shop?department=${d.key}`, count: products.filter((p) => p.department === d.key).length }));

export const DEPARTMENT_KEYS = DEPARTMENTS.map((d) => d.key);

export const bySlug = (slug) => products.find((p) => p.slug === slug);

export const inDepartment = (department) => products.filter((p) => p.department === department);

export const categoriesIn = (department) => [...new Set(inDepartment(department).map((p) => p.category))];

export const brandsIn = (department) => [...new Set(inDepartment(department).map((p) => p.brand))];

export const ALL_BRANDS = [...new Set(products.map((p) => p.brand))].sort();

export const ALL_CATEGORIES = [...new Set(products.map((p) => p.category))];

export const ALL_COLOUR_KEYS = [...new Set(products.flatMap((p) => p.colours))];

export const ALL_SIZES = [...new Set(products.flatMap((p) => p.sizes))];

export const PRICE_MIN = 0;
export const PRICE_MAX = Math.max(...products.map((p) => p.price));

/* A brand, with the number of pieces the shop actually holds of it. */
export const brandRecord = (name) => ({
  name,
  slug: slugify(name),
  to: `/shop?brand=${encodeURIComponent(name)}`,
  count: products.filter((p) => p.brand === name).length,
  ...(BRAND_INFO[name] || {})
});

export const BRANDS = ALL_BRANDS.map(brandRecord);

/* --- the rails the homepage and the shop both draw from ---------------------- */

const bySold = (a, b) => b.sold - a.sold;
const byRating = (a, b) => b.rating - a.rating;
const byFresh = (a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id;

export const newIn = (n = 8) => [...products].sort(byFresh).slice(0, n);
export const trendingPicks = (n = 8) => products.filter((p) => p.trending).sort(byRating).slice(0, n);
export const bestSellers = (n = 8) => [...products].sort(bySold).slice(0, n);
export const salePicks = (n = 8) => products.filter((p) => p.isSale).sort((a, b) => (b.oldPrice - b.price) / b.oldPrice - (a.oldPrice - a.price) / a.oldPrice).slice(0, n);
export const exclusivePicks = (n = 6) => products.filter((p) => p.isExclusive).slice(0, n);
export const trendingBrands = (n = 8) => [...BRANDS].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, n);
