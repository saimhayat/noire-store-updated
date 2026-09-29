import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Accordion from '../components/Accordion.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import ProductGallery from '../components/ProductGallery.jsx';
import ProductInfo from '../components/ProductInfo.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import SectionHead from '../components/SectionHead.jsx';
import SizeGuide, { SizeTable } from '../components/SizeGuide.jsx';
import { chartFor } from '../data/sizes.js';
import Stars from '../components/Stars.jsx';
import useParallax from '../hooks/useParallax.js';
import useRecentlyViewed from '../hooks/useRecentlyViewed.js';
import { bySlug, colourName, products } from '../data/products.js';
import { clothByKey } from '../data/cloth.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RATING_COPY, reviewCount, reviewsFor } from '../data/reviews.js';

/* How a piece is looked after, per cloth — the answer to the question the
   specifications raise. Non-cloth goods carry their own line. */
const CARE = {
  twill: 'Cold gentle wash, inside out, or dry clean. Line dry in shade and press on the reverse while damp.',
  poplin: 'Machine cold on a gentle cycle, inside out. Line dry in shade; iron damp on the reverse.',
  knit: 'Dry clean, or hand wash cold in a bag and dry flat. Never wring — and never hang a pashmina.',
  jersey: 'Machine cold with like colours. Line dry in shade; a warm iron takes the creases out.'
};

const CARE_BY_DEPARTMENT = {
  Women: 'Cold gentle wash, inside out, line dried in shade. Spot-clean embroidery; do not soak a hand-worked piece.',
  Men: 'Machine cold, inside out, line dried in shade. Press on the reverse so the collar keeps its edge.',
  Kids: 'Machine cold with like colours, inside out. Line dry in shade; the velvet front should be steamed, not pressed.',
  Footwear: 'Brush the upper after wear and treat with a neutral cream once a season. Juttis soften to the foot — never soak them.',
  Accessories: 'Store bags stuffed and away from direct sun. Keep juttis and jewellery dry, and polish gold plate with a soft cloth.'
};

const SHIPPING_ROWS = [
  { q: 'Delivery', a: 'Dispatched within one working day, tracked, and free on orders over Rs. 5,000. Under that, a flat Rs. 300 countrywide.' },
  { q: 'Returns', a: 'Thirty days from delivery, unworn with the tag attached. Start it from your order email and we send the label.' },
  { q: 'Exchanges', a: 'Free — we reserve your size while the return is in transit, so a sold-out run does not catch you out.' },
  { q: 'Cash on delivery', a: 'Available on every order up to Rs. 50,000. Have the amount ready for the courier.' }
];

export default function Product() {
  const { slug } = useParams();
  const ref = useRef(null);
  const navigate = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast() || {};

  const product = bySlug(slug);
  const [shot, setShot] = useState(0);
  const [size, setSize] = useState(product?.sizes[0] || 'M');
  const [colour, setColour] = useState(product?.colours[0] || '');
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);

  // a new product is a fresh decision
  useEffect(() => {
    setShot(0);
    setQty(1);
    setSize(product?.sizes[0] || 'M');
    setColour(product?.colours[0] || '');
  }, [slug, product]);

  useEffect(() => {
    document.title = product ? `${product.name} — ${product.brand} | NOIRÉ` : 'Not found | NOIRÉ';
    return () => { document.title = 'NOIRÉ | Modern fashion'; };
  }, [product]);

  const seen = useRecentlyViewed(product?.id);

  useParallax(ref, [slug]);

  const reviews = useMemo(() => (product ? reviewsFor(product) : []), [product]);
  const related = useMemo(() => {
    if (!product) return [];
    const near = products.filter((p) => p.id !== product.id && p.category === product.category);
    const same = products.filter((p) => p.id !== product.id && p.department === product.department && p.category !== product.category);
    const rest = products.filter((p) => p.id !== product.id && p.department !== product.department);
    return [...near, ...same, ...rest].slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="page wrap" ref={ref}>
        <div className="page__head">
          <h1 className="section__title">That piece is not in the shop</h1>
          <p className="page__lede">The link may be old, or the run may have closed. Everything still open is in the shop.</p>
          <Link className="btn btn--solid" to="/shop">Back to the shop</Link>
        </div>
      </div>
    );
  }

  const cloth = product.cloth ? clothByKey(product.cloth) : null;
  // shoes, children and clothing are measured differently: the page asks for the
  // chart that belongs to this department, and leather goods and jewellery have none
  const chart = chartFor(product.department);
  const isGoods = product.department === 'Accessories';
  const liked = has(product.id);
  const saved = reviewCount(product);
  const care = cloth ? CARE[product.cloth] : CARE_BY_DEPARTMENT[product.department];

  const onAdd = () => {
    add(product, size, colour || 'One Size', qty);
    toast?.(`${product.name} · ${size}${colour ? ` / ${colourName(colour)}` : ''} added to your bag`);
  };
  const onBuy = () => {
    add(product, size, colour || 'One Size', qty);
    navigate('/checkout');
  };
  const onSave = () => {
    toggle(product.id);
    toast?.(liked ? `Removed ${product.name} from your wishlist` : `Saved ${product.name} to your wishlist`);
  };

  const specs = [
    ['House', product.brand],
    ['Department', product.department],
    ['Category', product.category],
    product.colours.length ? ['Colourways', product.colours.map(colourName).join(', ')] : null,
    ['Sizes', product.sizes.join(' · ')],
    cloth ? ['Cloth', `${cloth.label}, ${cloth.weight} — ${cloth.mill}`] : ['Material', product.material],
    ['Care', care],
    ['Dispatch', 'Within one working day, tracked, from our own stock']
  ].filter(Boolean);

  return (
    <div className="pdp" ref={ref}>
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop?department=${product.department}`}>{product.department}</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop?department=${product.department}&category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="pdp__grid">
          <ProductGallery product={product} shot={shot} setShot={setShot} />
          <ProductInfo
            product={product}
            size={size}
            setSize={setSize}
            colour={colour}
            setColour={setColour}
            qty={qty}
            setQty={setQty}
            onAdd={onAdd}
            onBuy={onBuy}
            onSave={onSave}
            liked={liked}
            onGuide={chart ? () => setGuide(true) : null}
            sizeLabel={isGoods ? 'Format' : 'Size'}
            returnCopy={isGoods ? '30 days, unopened and sealed · returns are free' : undefined}
          />
        </div>
      </div>

      <section className="pdp__details wrap" aria-label="Description and specifications">
        <Reveal className="pdp__desc">
          <h2 className="pdp__subhead">Description</h2>
          <p>{product.blurb}</p>
          <p>
            {cloth
              ? `Cut in ${cloth.label.toLowerCase()} woven in ${cloth.city}, from a run the house bought whole. ${cloth.composition}, ${cloth.weight}: ${cloth.used.toLowerCase()}, and heavy enough to fall from the shoulder rather than flutter.`
              : `Held in our own stock in ${product.department.toLowerCase()}, dispatched within one working day and covered by the same thirty-day returns as everything else in the shop.`}
          </p>
          <p>
            Fit is generous through the body — if you want it close, take the smaller size. The
            measurements under “Size guide” are taken flat on the garment, not on a body.
          </p>
        </Reveal>

        <Reveal as="dl" className="pdp__specs" delay={0.08} y={14}>
          {specs.map(([term, detail]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      <RevealGroup className="pdp__split wrap" as="section" aria-label="Material, sizing and shipping" stagger={0.07}>
        <RevealItem className="pdp__block">
          <h2 className="pdp__subhead">Material &amp; care</h2>
          <dl className="facts facts--tight">
            {cloth ? (
              <>
                <div className="facts__row"><dt>{cloth.label}</dt><dd>{cloth.composition}</dd></div>
                <div className="facts__row"><dt>Weight</dt><dd>{cloth.weight}</dd></div>
                <div className="facts__row"><dt>Mill</dt><dd>{cloth.mill}</dd></div>
              </>
            ) : (
              <div className="facts__row"><dt>Material</dt><dd>{product.material}</dd></div>
            )}
            <div className="facts__row"><dt>Care</dt><dd>{care}</dd></div>
            <div className="facts__row"><dt>Origin</dt><dd>Cut and stitched in Lahore; leather in Sialkot; juttis and jewellery worked by hand in Karachi.</dd></div>
          </dl>
        </RevealItem>

        <RevealItem className="pdp__block">
          <h2 className="pdp__subhead">Shipping &amp; returns</h2>
          <Accordion items={SHIPPING_ROWS} />
        </RevealItem>

        {chart ? (
          <RevealItem className="pdp__block">
            <h2 className="pdp__subhead">{chart.title || 'Size guide'}</h2>
            <SizeTable chart={chart} />
            <button type="button" className="link-underline pdp__guide" onClick={() => setGuide(true)}>
              {chart.notes.length > 1 ? 'How to measure, and what to do between sizes' : 'Fit notes and how to measure'}
            </button>
          </RevealItem>
        ) : (
          <RevealItem className="pdp__block">
            <h2 className="pdp__subhead">Delivery &amp; payment</h2>
            <dl className="facts facts--tight">
              <div className="facts__row"><dt>Dispatch</dt><dd>Within one working day from our own stock, tracked.</dd></div>
              <div className="facts__row"><dt>Delivery</dt><dd>Free over Rs. 5,000, otherwise a flat Rs. 300.</dd></div>
              <div className="facts__row"><dt>Payment</dt><dd>Card, wallet transfer or cash on delivery.</dd></div>
              <div className="facts__row"><dt>Returns</dt><dd>Thirty days, unopened for skin and scent.</dd></div>
            </dl>
          </RevealItem>
        )}
      </RevealGroup>

      <section className="section" id="reviews" aria-labelledby="reviews-title">
        <div className="wrap">
          <SectionHead
            id="reviews-title"
            eyebrow="Reviews"
            title="Worn and reported"
            text={`${product.rating.toFixed(1)} average · ${RATING_COPY[Math.round(product.rating)]} · ${saved} reviews for this piece`}
          />
          <RevealGroup className="reviews__list" stagger={0.06}>
            {reviews.map((r) => (
              <RevealItem as="article" className="review" key={r.name}>
                <Stars rating={5} />
                <h3 className="review__title">{r.title}</h3>
                <p className="review__body">{r.body}</p>
                <p className="review__who">
                  {r.name} · {r.city} <span className="text-steel">— {r.size}, {r.fit} · {r.date}</span>
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section" aria-labelledby="related-title">
        <div className="wrap">
          <SectionHead
            id="related-title"
            eyebrow="Goes with it"
            title="Related pieces"
            to={`/shop?department=${product.department}`}
            link={`More ${product.department.toLowerCase()}`}
          />
          <ProductGrid products={related} columns={4} />
        </div>
      </section>

      {seen.length > 0 && (
        <section className="section" aria-labelledby="seen-title">
          <div className="wrap">
            <SectionHead id="seen-title" eyebrow="Your visit" title="Recently viewed" to="/shop" link="Back to the shop" />
            <ProductGrid products={seen} columns={4} />
          </div>
        </section>
      )}

      <SizeGuide open={guide} onClose={() => setGuide(false)} chart={chart} />
    </div>
  );
}
