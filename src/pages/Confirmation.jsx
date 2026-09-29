import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../lib/format.js';
import { lastOrder } from '../lib/orders.js';

/* The receipt. The order lives on this device (there is nowhere else for it to
   live), so arriving without one is a state we handle rather than an error. */
export default function Confirmation() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    setOrder(lastOrder());
    document.title = 'Order placed | NOIRÉ';
    return () => { document.title = 'NOIRÉ | Modern fashion'; };
  }, []);

  if (!order) {
    return (
      <div className="page wrap confirm">
        <div className="page__head">
          <h1 className="section__title">No order to show</h1>
          <p className="page__lede">
            This device has no receipt on it. If you have just placed one, check the email we sent
            to the address you used, or open your account to see what this device does have.
          </p>
          <Link className="btn btn--solid" to="/shop">Back to the shop</Link>
        </div>
      </div>
    );
  }

  const eta = new Date(Date.now() + 3 * 864e5).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <div className="page wrap confirm">
      <header className="page__head confirm__head">
        <p className="confirm__mark" aria-hidden="true">✓</p>
        <h1 className="section__title">Order placed</h1>
        <p className="page__lede">
          Thank you, {order.name.split(' ')[0]}. We have emailed the receipt to {order.email}, and the
          tracking number follows as soon as the parcel is handed to the courier.
        </p>
        <dl className="confirm__meta">
          <div><dt>Order</dt><dd>{order.id}</dd></div>
          <div><dt>Placed</dt><dd>{order.placed}</dd></div>
          <div><dt>Estimated</dt><dd>{eta}</dd></div>
          <div><dt>Payment</dt><dd>{order.method || 'Card'}</dd></div>
          <div><dt>Shipping to</dt><dd>{order.city}, {order.country}</dd></div>
        </dl>
      </header>

      <section className="confirm__grid" aria-label="What you ordered">
        <ul className="confirm__lines">
          {order.items.map((i, n) => (
            <li className="checkout__line" key={`${i.name}-${n}`}>
              <img src={i.image} alt="" width="72" height="90" loading="lazy" />
              <div>
                <p className="line__name">{i.name}</p>
                <p className="line__meta">{i.size} · {i.color} · ×{i.qty}</p>
              </div>
              <p className="line__side">{money(i.price * i.qty)}</p>
            </li>
          ))}
        </ul>
        <aside className="confirm__totals" aria-label="Paid">
          <dl className="checkout__totals">
            <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{order.shipping ? money(order.shipping) : 'Free'}</dd></div>
            <div className="total"><dt>Paid</dt><dd>{money(order.total)}</dd></div>
          </dl>
          <p className="checkout__note">
            Changed your mind? Thirty days, unworn with the tag attached — start it from the receipt
            email and we send the label.
          </p>
          <div className="confirm__actions">
            <Link className="btn btn--solid" to="/shop">Continue shopping</Link>
            <Link className="btn btn--ghost" to="/account">See your orders</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
