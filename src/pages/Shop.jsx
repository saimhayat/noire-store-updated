import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '../lib/motion.js';
import FilterBar, { FilterSheet } from '../components/FilterBar.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import useParallax from '../hooks/useParallax.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { COLOURS, DEPARTMENTS, PRICE_MAX, products } from '../data/products.js';
import { discountOf, figure } from '../lib/format.js';

/* The collection page. Every filter lives in the query string, so a filtered
   view is a URL a shopper can send to someone else — and so the back button
   undoes a filter instead of leaving the page. */

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  newest: { label: 'New in', fn: (a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id },
  best: { label: 'Best selling', fn: (a, b) => b.sold - a.sold },
  popular: { label: 'Top rated', fn: (a, b) => b.rating - a.rating },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  off: { label: 'Biggest discount', fn: (a, b) => discountOf(b) - discountOf(a) }
};

const PAGE = 12;

const list = (v) => (v ? v.split(',').filter(Boolean) : []);
const join = (arr) => arr.join(',');

const TITLES = {
  Sale: 'The end-of-run sale',
  Exclusive: 'The exclusive edit',
  Saved: 'Pieces you kept',
  Everything: 'The shop'
};

const LEDES = {
  Sale: 'Markdowns taken off the same price list as everything else — no invented before-prices, and no piece marked down twice.',
  Exclusive: 'Pieces bought whole and cut once for this shop. When the run closes, the pattern is filed.',
  Saved: 'Everything you have saved, in one place. It stays on this device until you take it off the list.',
  Everything: `${products.length} pieces across ${DEPARTMENTS.length} departments, kept in stock until the run closes.`
};

const matches = (p, q) => [p.name, p.brand, p.category, p.department].join(' ').toLowerCase().includes(q);

export default function Shop() {
  const ref = useRef(null);
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const { ids } = useWishlist();

  const state = useMemo(() => ({
    department: params.get('department') || '',
    category: list(params.get('category')),
    brand: list(params.get('brand')),
    size: list(params.get('size')),
    colour: list(params.get('colour')),
    max: Number(params.get('max')) || PRICE_MAX,
    stock: params.get('stock') || '',
    off: params.get('off') || '',
    sort: SORTS[params.get('sort')] ? params.get('sort') : 'featured',
    sale: params.get('sale') === '1',
    exclusive: params.get('view') === 'exclusive',
    wishlist: params.get('wishlist') === '1',
    q: params.get('q') || ''
  }), [params]);

  const patch = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      const value = Array.isArray(v) ? join(v) : v;
      if (value === '' || value == null) p.delete(k);
      else p.set(k, String(value));
    });
    setParams(p, { replace: true });
  };

  const clear = () => {
    const p = new URLSearchParams(params);
    ['category', 'brand', 'size', 'colour', 'max', 'stock', 'off', 'q'].forEach((k) => p.delete(k));
    setParams(p, { replace: true });
  };

  const refineKeys = ['category', 'brand', 'size', 'colour', 'stock', 'off', 'q'];
  const activeCount = refineKeys.reduce((n, k) => {
    const v = state[k];
    if (Array.isArray(v)) return n + v.length;
    if (k === 'max') return n;
    return n + (v ? 1 : 0);
  }, 0) + (state.max < PRICE_MAX ? 1 : 0);

  // the context the facet counts are taken against: the collection, before the
  // refinements are applied to the grid
  const base = useMemo(() => products.filter((p) => (
    (!state.department || p.department === state.department)
    && (!state.sale || p.isSale)
    && (!state.exclusive || p.isExclusive)
    && (!state.wishlist || ids.includes(p.id))
    && (!state.q || matches(p, state.q))
  )), [state.department, state.sale, state.exclusive, state.wishlist, state.q, ids]);

  const counts = (predicate) => base.filter(predicate).length;

  const facets = useMemo(() => ({
    total: products.length,
    departments: DEPARTMENTS.map((d) => ({ key: d.key, count: products.filter((p) => p.department === d.key).length })),
    categories: [...new Set(base.map((p) => p.category))].map((key) => ({ key, count: counts((p) => p.category === key) })),
    brands: [...new Set(base.map((p) => p.brand))].sort().map((key) => ({ key, count: counts((p) => p.brand === key) })),
    sizes: [...new Set(base.flatMap((p) => p.sizes))],
    colours: [...new Set(base.flatMap((p) => p.colours))],
    max: PRICE_MAX
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [base]);

  const found = useMemo(() => base
    .filter((p) => !state.category.length || state.category.includes(p.category))
    .filter((p) => !state.brand.length || state.brand.includes(p.brand))
    .filter((p) => !state.size.length || p.sizes.some((s) => state.size.includes(s)))
    .filter((p) => !state.colour.length || p.colours.some((c) => state.colour.includes(c)))
    .filter((p) => p.price <= state.max)
    .filter((p) => state.stock !== '1' || p.stock > 0)
    .filter((p) => !state.off || discountOf(p) >= Number(state.off))
    .sort(SORTS[state.sort].fn), [base, state]);

  // a new question shows its first page
  useEffect(() => setVisible(PAGE), [params]);

  useParallax(ref, [found.length]);

  const department = DEPARTMENTS.find((d) => d.key === state.department);
  const heading = state.category.length === 1 ? state.category[0]
    : state.sale ? TITLES.Sale
      : state.exclusive ? TITLES.Exclusive
        : state.wishlist ? TITLES.Saved
          : department ? department.title
            : state.q ? `“${state.q}”` : TITLES.Everything;

  const lede = state.category.length === 1
    ? `${state.category[0]} in ${department ? department.title.toLowerCase() : 'every department'}, kept in stock until the run closes.`
    : state.sale ? LEDES.Sale
      : state.exclusive ? LEDES.Exclusive
        : state.wishlist ? LEDES.Saved
          : department ? department.text
            : state.q ? `Everything in the shop that matches that word.` : LEDES.Everything;

  useEffect(() => {
    document.title = `${heading} | NOIRÉ`;
    return () => { document.title = 'NOIRÉ | Modern fashion'; };
  }, [heading]);

  const chips = [
    ...state.category.map((c) => ({ key: `category:${c}`, label: c, remove: () => patch({ category: state.category.filter((v) => v !== c) }) })),
    ...state.brand.map((b) => ({ key: `brand:${b}`, label: b, remove: () => patch({ brand: state.brand.filter((v) => v !== b) }) })),
    ...state.size.map((s) => ({ key: `size:${s}`, label: s, remove: () => patch({ size: state.size.filter((v) => v !== s) }) })),
    ...state.colour.map((c) => ({ key: `colour:${c}`, label: COLOURS[c]?.name || c, remove: () => patch({ colour: state.colour.filter((v) => v !== c) }) })),
    ...(state.max < PRICE_MAX ? [{ key: 'max', label: `Under Rs. ${figure(state.max)}`, remove: () => patch({ max: '' }) }] : []),
    ...(state.stock === '1' ? [{ key: 'stock', label: 'In stock', remove: () => patch({ stock: '' }) }] : []),
    ...(state.off ? [{ key: 'off', label: `${state.off}% off or more`, remove: () => patch({ off: '' }) }] : []),
    ...(state.q ? [{ key: 'q', label: `“${state.q}”`, remove: () => patch({ q: '' }) }] : [])
  ];

  const shown = found.slice(0, visible);

  return (
    <div className="shop" ref={ref}>
      <div className="shop__head wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          {department && department.title !== heading ? (
            <>
              <Link to={`/shop?department=${department.key}`}>{department.title}</Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span aria-current="page">{heading}</span>
        </nav>

        <div className="shop__title">
          <h1 className="section__title">{heading}</h1>
          <p className="shop__lede">{lede}</p>
        </div>

        <div className="chipsbar">
          <Link to="/shop" className={`chip ${!state.department ? 'is-on' : ''}`}>All</Link>
          {DEPARTMENTS.map((d) => (
            <Link key={d.key} to={`/shop?department=${d.key}`} className={`chip ${state.department === d.key ? 'is-on' : ''}`}>{d.title}</Link>
          ))}
          <Link to="/shop?sale=1" className={`chip ${state.sale ? 'is-on' : ''}`}>Sale</Link>
          <Link to="/shop?view=exclusive" className={`chip ${state.exclusive ? 'is-on' : ''}`}>Exclusive</Link>
        </div>
      </div>

      {department && (
        <div className="cathead wrap" data-parallax-scope>
          <div className="cathead__media">
            <img src={department.image} alt="" width="900" height="1125" loading="lazy" data-parallax="0.06" />
          </div>
          <div className="cathead__copy">
            <p className="eyebrow">{department.title} — Winter 26</p>
            <p className="cathead__text">{department.text} Everything here ships from our own stock, and every piece can be returned within thirty days.</p>
            <ul className="cathead__list">
              {[...new Set(base.map((p) => p.category))].slice(0, 6).map((c) => (
                <li key={c}>
                  <Link to={`/shop?department=${department.key}&category=${encodeURIComponent(c)}`} className="link-underline">{c}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="shop__body wrap">
        <aside className="shop__side" aria-label="Filters">
          <FilterBar
            facets={facets}
            state={state}
            patch={patch}
            clear={clear}
            activeCount={activeCount}
            count={found.length}
          />
        </aside>

        <div className="shop__main">
          <div className="toolbar">
            <button type="button" className="toolbar__filters" onClick={() => setSheet(true)}>
              Filters{activeCount ? ` (${activeCount})` : ''}
            </button>
            <p className="toolbar__count" aria-live="polite">
              {figure(found.length)} {found.length === 1 ? 'piece' : 'pieces'}
            </p>
            <label className="toolbar__sort">
              <span className="eyebrow">Sort</span>
              <select value={state.sort} onChange={(e) => patch({ sort: e.target.value })}>
                {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="activechips">
              {/* A markdown a shopper takes back should leave the row it was in,
                  and the rest should close up behind it. */}
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((c) => (
                  <motion.button
                    key={c.key}
                    layout
                    type="button"
                    className="activechip"
                    onClick={c.remove}
                    initial={{ opacity: 0, scale: 0.86 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.86 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    {c.label}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove filter</span>
                  </motion.button>
                ))}
              </AnimatePresence>
              <button type="button" className="activechips__clear link-underline" onClick={clear}>Clear all</button>
            </div>
          )}

          {shown.length > 0 ? (
            <>
              {/* keyed on the question, so a new set of answers arrives rather
                  than quietly replacing the last one */}
              <ProductGrid key={params.toString()} products={shown} columns={3} priorityCount={3} />
              {visible < found.length && (
                <div className="loadmore">
                  <button type="button" className="btn btn--ghost" onClick={() => setVisible((v) => v + PAGE)}>
                    Load more
                  </button>
                  <p className="loadmore__note">
                    Showing {figure(shown.length)} of {figure(found.length)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <h2 className="empty__title">Nothing matches those filters</h2>
              <p className="empty__text">
                The shop holds seventy-odd pieces, so it is usually one filter too many. Widen the
                price, or clear the list and start again.
              </p>
              <button type="button" className="btn btn--solid" onClick={clear}>Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      <FilterSheet
        open={sheet}
        onClose={() => setSheet(false)}
        count={found.length}
        facets={facets}
        state={state}
        patch={patch}
        clear={clear}
        activeCount={activeCount}
      />
    </div>
  );
}
