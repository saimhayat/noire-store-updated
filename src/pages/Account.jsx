import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import SectionHead from '../components/SectionHead.jsx';
import useParallax from '../hooks/useParallax.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { products } from '../data/products.js';
import { money, figure } from '../lib/format.js';
import { orderStatus, readOrders } from '../lib/orders.js';

const VIEWED = 'noire-viewed';

const readViewed = () => {
  try { return JSON.parse(localStorage.getItem(VIEWED)) || []; } catch { return []; }
};

/* The account, as far as a shop without accounts can have one: what this device
   has ordered, what it has saved, and what it has looked at. It says plainly
   where all of that lives, because the honest answer is more useful than a
   sign-in form that leads nowhere. */
export default function Account() {
  const ref = useRef(null);
  const { ids } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setOrders(readOrders());
    document.title = 'Your account | NOIRÉ';
    return () => { document.title = 'NOIRÉ | Modern fashion'; };
  }, []);

  useParallax(ref, [orders.length]);

  const saved = useMemo(() => products.filter((p) => ids.includes(p.id)).slice(0, 4), [ids]);
  const seen = useMemo(() => readViewed().map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4), []);

  return (
    <div className="page account wrap" ref={ref}>
      <header className="page__head">
        <p className="eyebrow">Your account</p>
        <h1 className="section__title">Orders, saved pieces and what you looked at</h1>
        <p className="page__lede">
          There is no sign-in here on purpose: the shop keeps your bag, your saved pieces and your
          receipts on this device and nowhere else. Clearing your browser data clears all of it.
        </p>
      </header>

      <section className="account__panel" aria-labelledby="orders-title">
        <h2 id="orders-title" className="pdp__subhead">Your orders</h2>
        {orders.length === 0 ? (
          <p className="account__empty">
            No orders on this device yet. <Link to="/shop" className="link-underline">Start in the shop</Link>.
          </p>
        ) : (
          <ul className="orders">
            {orders.map((o) => (
              <li className="orders__row" key={o.id}>
                <button type="button" className="orders__head" onClick={() => setOpen((v) => (v === o.id ? null : o.id))} aria-expanded={open === o.id}>
                  <span className="orders__id">{o.id}</span>
                  <span className="orders__date">{o.placed}</span>
                  <span className={`orders__status ${orderStatus(o) === 'Delivered' ? 'is-done' : ''}`}>{orderStatus(o)}</span>
                  <span className="orders__total">{money(o.total)}</span>
                  <span className="orders__sign" aria-hidden="true" />
                </button>
                {open === o.id && (
                  <div className="orders__body">
                    <ul className="checkout__lines">
                      {o.items.map((i, n) => (
                        <li className="checkout__line" key={`${o.id}-${n}`}>
                          <img src={i.image} alt="" width="64" height="80" loading="lazy" />
                          <div>
                            <p className="line__name">{i.name}</p>
                            <p className="line__meta">{i.size} · {i.color} · ×{i.qty}</p>
                          </div>
                          <p className="line__side">{money(i.price * i.qty)}</p>
                        </li>
                      ))}
                    </ul>
                    <dl className="checkout__totals">
                      <div><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
                      <div><dt>Delivery</dt><dd>{o.shipping ? money(o.shipping) : 'Free'}</dd></div>
                      <div className="total"><dt>Total</dt><dd>{money(o.total)}</dd></div>
                    </dl>
                    <p className="account__note">
                      Shipping to {o.name}, {o.city}, {o.country}. Sent to {o.email}.
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="account__panel" aria-labelledby="saved-title">
        <h2 id="saved-title" className="pdp__subhead">Saved pieces · {figure(ids.length)}</h2>
        {saved.length > 0 ? (
          <ProductGrid products={saved} columns={4} />
        ) : (
          <p className="account__empty">
            Nothing saved yet. The heart on any card keeps it here.{' '}
            <Link to="/shop" className="link-underline">Browse the shop</Link>.
          </p>
        )}
        {ids.length > 4 && <Link to="/shop?wishlist=1" className="link-underline account__more">See all {figure(ids.length)} saved pieces</Link>}
      </section>

      {seen.length > 0 && (
        <section className="account__panel" aria-labelledby="seen-title">
          <SectionHead id="seen-title" eyebrow="Your visit" title="Recently viewed" />
          <ProductGrid products={seen} columns={4} />
        </section>
      )}

      <section className="account__panel account__help" aria-labelledby="help-title">
        <h2 id="help-title" className="pdp__subhead">Need a hand?</h2>
        <ul className="account__links">
          <li><Link to="/shipping" className="link-underline">Where your order is</Link></li>
          <li><Link to="/returns" className="link-underline">Start a return or exchange</Link></li>
          <li><Link to="/size-guide" className="link-underline">Check a size</Link></li>
          <li><Link to="/contact" className="link-underline">Write to the shop</Link></li>
        </ul>
      </section>
    </div>
  );
}
