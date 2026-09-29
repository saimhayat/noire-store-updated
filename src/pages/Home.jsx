import { useRef, useState } from 'react';
import Hero from '../components/Hero.jsx';
import GarmentBand from '../components/GarmentBand.jsx';
import Band from '../components/Band.jsx';
import CategorySection from '../components/CategorySection.jsx';
import CollectionStrip from '../components/CollectionStrip.jsx';
import BrandSection from '../components/BrandSection.jsx';
import PromoBanner from '../components/PromoBanner.jsx';
import ClothSpecs from '../components/ClothSpecs.jsx';
import Craft from '../components/Craft.jsx';
import Newsletter from '../components/Newsletter.jsx';
import useParallax from '../hooks/useParallax.js';
import {
  BRANDS,
  bestSellers,
  inDepartment,
  newIn,
  salePicks
} from '../data/products.js';
import { MAX_DISCOUNT } from '../data/nav.js';
import { EDITORIAL } from '../data/photography.js';

/* The rails are chosen once, outside the component, because none of them depend
   on anything a shopper does. Six rails, not twelve: a homepage a shopper can
   read to the end of. */
const NEW_IN = newIn(4);
const SALE = salePicks(4);
const BEST = bestSellers(4);
const WOMEN = inDepartment('Women').slice(0, 4);
const MEN = inDepartment('Men').slice(0, 4);
const ACCESSORIES = inDepartment('Accessories').slice(0, 4);
const ALSO = [...inDepartment('Footwear').slice(0, 3), ...inDepartment('Kids').slice(0, 3)];

/* The homepage reads as one magazine: a campaign, the departments, then rails
   separated by whitespace and a rule rather than by boxes. */
export default function Home() {
  const ref = useRef(null);
  useParallax(ref);

  return (
    <div className="home" ref={ref}>
      <Hero />
      <Band />
      <CategorySection />

      <CollectionStrip
        id="new"
        eyebrow="Just in"
        title="Winter 26, first cuts"
        text="Lawn still on the roll last week, formals cut to order, and one block print that took three screens."
        to="/shop?sort=newest"
        link="See everything new"
        products={NEW_IN}
      />

      <PromoBanner
        eyebrow="End of run"
        title={`Up to ${MAX_DISCOUNT}% off — while the sizes last.`}
        text="Markdowns come off the same price list as everything else: no invented before-prices, no countdown clocks. When the run closes, the piece goes back to full price or it goes."
        to="/shop?sale=1"
        cta="Shop the sale"
        meta="Markdowns end when the run closes"
        image={EDITORIAL.sale}
        imageAlt="A white kameez with a tie-dye dupatta from the end-of-run sale"
      />

      <CollectionStrip
        id="reduced"
        eyebrow="Reduced"
        title="Marked down this week"
        to="/shop?sale=1"
        link="All markdowns"
        products={SALE}
      />

      <CollectionStrip
        id="best"
        eyebrow="Best sellers"
        title="Bought again and again"
        text="The pieces the shop reorders every season — because they keep selling out first."
        to="/shop?sort=popular"
        products={BEST}
      />

      <CollectionStrip
        id="women"
        eyebrow="Women"
        title="Kameez, lawn and formal cloth"
        to="/shop?department=Women"
        products={WOMEN}
      />

      <CollectionStrip
        id="men"
        eyebrow="Men"
        title="Kurtas, shalwar kameez, waistcoats"
        to="/shop?department=Men"
        products={MEN}
      />

      <PromoBanner
        reverse
        tone="ink"
        eyebrow="Sialkot leather"
        title="Bags, juttis and hand-finished gold."
        text="Leather cut and stitched in Sialkot, juttis worked by hand, and gold-plated jewellery sold as sets so the stones match."
        to="/shop?department=Accessories"
        cta="Shop accessories"
        image={EDITORIAL.accessories}
        imageAlt="A pair of croc-embossed leather handbags on a plain ground"
      />

      <CollectionStrip
        id="accessories"
        eyebrow="Accessories"
        title="Leather, silver and gold plate"
        to="/shop?department=Accessories"
        products={ACCESSORIES}
      />

      <CollectionStrip
        id="also"
        eyebrow="Also in store"
        title="Footwear and childrenswear"
        to="/shop?department=Footwear"
        link="Shop footwear"
        columns={3}
        products={ALSO}
      />

      <Craft />
      <GarmentBand />
      <ClothSpecs />

      <BrandSection
        id="brands-all"
        variant="grid"
        eyebrow="Featured houses"
        title="The labels we carry"
        text={`${BRANDS.length} houses, chosen for what they cut rather than for what they advertise.`}
        brands={BRANDS.slice(0, 12)}
        to="/shop"
        link="Browse the shop"
      />

      <section className="letter" aria-labelledby="letter-title">
        <div className="wrap">
          <Newsletter variant="band" />
        </div>
      </section>
    </div>
  );
}
