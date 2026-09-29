/* ------------------------------------------------------------- photography

   Every picture on the site comes from this file. One shoot per piece of stock,
   and one place to look when a picture needs changing — no page can quietly
   reach for a stock image of its own.

   The shop photographs South Asian womenswear and menswear: kameez and trouser,
   lawn suits, embroidered formals, bridal, jutti and khussa, leather bags and
   gold-plated jewellery. The set is free to use and hotlinked straight from the
   photographer's CDN, so the shop carries no image weight of its own.

   `album('key')` returns the shot list for a piece, in gallery order: one to
   four frames, taken from the same sitting wherever the shoot had more than one
   angle, so a product page never mixes two different garments. */

const PX = (id, w = 1000) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const frames = (ids) => ids.map((id) => PX(id));

export const ALBUMS = {
  /* --- women: kameez, kurta and lawn ------------------------------------- */
  'kameez-amber': frames([22064197]),
  'kameez-slate': frames([22064198, 22064212]),
  'kameez-lilac': frames([22064227, 22064228]),
  'kameez-ivory': frames([22064230]),
  'kurti-mustard': frames([28213774]),
  'kameez-ink': frames([31323212]),
  'suit-sand': frames([20420569]),
  'suit-rose': frames([20593499]),
  'suit-teal': frames([20593500]),
  'suit-crimson': frames([20593516]),
  'suit-blush': frames([20614162]),
  'suit-lilac-net': frames([20629032]),
  'suit-marigold': frames([20702673]),
  'suit-pistachio': frames([20777204]),
  'suit-magenta': frames([20777205]),
  'kameez-pearl': frames([20788490]),
  'dupatta-crimson': frames([20788501]),
  'suit-smoke': frames([20791998]),
  'suit-silver': frames([25184951]),
  'suit-mint': frames([25185003]),
  'suit-floral-lilac': frames([25288439]),
  'kurti-cobalt': frames([13178920]),
  'kameez-sand': frames([6705270, 6705273]),
  'kameez-multicolour': frames([7200995]),
  'suit-sunflower': frames([8344486]),
  'suit-rosewood': frames([14027903]),
  'suit-coral': frames([14027977]),
  'kameez-emerald': frames([31861623]),
  'shawl-jade': frames([31374289]),

  /* --- women: formals and bridal ----------------------------------------- */
  'suit-navy': frames([27317244]),
  'formal-maroon': frames([27817076]),
  'formal-mint': frames([19956021]),
  'formal-black': frames([32633175, 32633202]),
  'formal-lemon': frames([19345934]),
  'formal-mustard': frames([26970931]),
  'formal-teal': frames([32347632]),
  'bridal-jade': frames([29460595]),
  'bridal-navy': frames([29460605]),
  'bridal-red': frames([29396109]),
  'bridal-scarlet': frames([32934704]),
  'bridal-silver': frames([3460676]),
  'bridal-peach': frames([15490163]),
  'bridal-grey': frames([7567935]),
  'bridal-plum': frames([7600067]),

  /* --- women: the studio shoot, one sitting, two frames each ------------- */
  'studio-ink': frames([31874430, 31874435]),
  'studio-blush': frames([31874433, 31874436]),
  'studio-slate': frames([31874434, 31874445]),
  'studio-indigo': frames([31874448, 31874456]),

  /* --- men: kurta, kameez and waistcoat ---------------------------------- */
  'kurta-ivory': frames([8217705]),
  'kurta-white-duo': frames([9142235]),
  'kurta-white-lawn': frames([16777497]),
  'kurta-white-stool': frames([17585737]),
  'kurta-maroon': frames([26984682]),
  'kurta-navy': frames([8692305]),
  'kurta-camel': frames([28758558]),
  'kurta-onyx': frames([14664890]),
  'kurta-camel-walk': frames([5938772]),
  'kurta-slate': frames([8217656]),
  'kurta-saffron': frames([7956933]),
  'kurta-multicolour': frames([15996630]),
  'kurta-steel': frames([8588636]),
  'kameez-white': frames([8565796]),
  'kameez-grey': frames([8802644]),
  'kameez-navy': frames([8692657]),
  'kameez-olive': frames([12165106]),
  'waistcoat-charcoal': frames([6766246]),

  /* --- childrenswear ------------------------------------------------------ */
  'kid-orange': frames([9323160, 9323161]),
  'kid-red': frames([18544791]),
  'kid-velvet': frames([12100636]),
  'kid-festive': frames([5274083]),
  'kid-father-son': frames([19341050]),

  /* --- footwear ----------------------------------------------------------- */
  'jutti-cream': frames([29761844]),
  'jutti-wine': frames([29761842]),
  'jutti-silver': frames([31551515]),
  'khussa-bridal': frames([6387629]),
  'khussa-ivory': frames([31906091]),
  'loafer-cobalt': frames([267301]),
  'sandal-silver': frames([9214975]),
  'sneaker-canvas': frames([537466]),
  'sneaker-arrow': frames([24702077]),
  'sneaker-court': frames([13536939]),

  /* --- bags and jewellery ------------------------------------------------- */
  'bag-crimson': frames([22434764]),
  'bag-ecru': frames([22434759]),
  'bag-cocoa': frames([22434757]),
  'bag-tan': frames([27204287]),
  'bag-croc': frames([27046143]),
  'bag-ink': frames([27174557]),
  'bag-jade': frames([22432991]),
  'bag-orange': frames([8801079]),
  'bag-studio': frames([21897141, 21897127]),
  'bag-flatlay': frames([167703]),
  'bag-atelier': frames([9327162]),
  'jewel-bangle': frames([12194309]),
  'jewel-hoops': frames([32874211]),
  'jewel-leaf': frames([29385411]),
  'jewel-emerald': frames([32988532]),
  'jewel-cuff': frames([10620805]),
  'jewel-ring': frames([17416764]),
  'jewel-bridal': frames([29169313]),

  /* --- hands, wear and the workshop: the house's own plates -------------- */
  'mehndi-quiet': frames([12584788]),
  'mehndi-dark': frames([12872530]),
  'mehndi-bangles': frames([12037060]),
  'mehndi-lamp': frames([8819837]),
  'market-juttis': frames([14972961]),
  'market-shoes': frames([14940419]),
  'market-pushkar': frames([14994016]),
  'market-jaipur': frames([12186179]),
  'market-board': frames([8477809]),
  'market-lahore': frames([31464539]),
  'atelier-shoemaker': frames([20989158]),
  'atelier-tailor': frames([6765649]),
  'atelier-thread': frames([4614227]),
  'atelier-mill': frames([8246480]),
  'atelier-sketch': frames([7763068]),
  'atelier-block': frames([6634449]),
  'atelier-swatches': frames([11585380]),
  'atelier-weave': frames([33210477])
};

export const album = (key) => ALBUMS[key] || [];
export const shot = (key, n = 0) => album(key)[n] || null;

/* The lead frame of a shoot, asked for large — campaign plates are wider than a
   card, and a card is the only place the 1000px files are ever shown. */
const big = (key, n = 0) => (shot(key, n) || '').replace('w=1000', 'w=1400');

/* The house's own campaign pictures — a garment, framed like a look book plate.
   Pages read these rather than inventing an image of their own. */
export const EDITORIAL = {
  hero: big('kameez-amber'),
  heroAlt: big('suit-crimson'),
  feature: big('suit-crimson'),
  featureAlt: big('kameez-emerald'),
  sale: big('dupatta-crimson'),
  bestSellers: big('kurta-ivory'),
  newIn: big('kurti-mustard'),
  accessories: big('bag-croc'),
  jewellery: big('jewel-bangle'),
  shawl: big('shawl-jade'),
  kids: big('kid-orange'),
  formals: big('formal-maroon'),
  bridal: big('bridal-scarlet'),
  market: big('market-juttis'),
  story: big('atelier-shoemaker'),
  atelier: big('atelier-shoemaker'),
  atelierAlt: big('atelier-tailor'),
  mill: big('atelier-mill'),
  /* The still that stands in for the 3D garment on small screens. */
  band: {
    twill: shot('kurta-ivory', 0),
    poplin: shot('kurta-white-stool', 0),
    knit: shot('kurta-slate', 0),
    jersey: shot('kurta-saffron', 0)
  },
  /* One plate per journal story, matched to what the piece of writing is about. */
  journal: [big('atelier-shoemaker'), big('atelier-tailor'), big('mehndi-quiet')]
};
