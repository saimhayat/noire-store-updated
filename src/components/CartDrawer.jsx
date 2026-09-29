import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Quantity from './Quantity.jsx';
import { FREE_SHIPPING, shippingFor, useCart } from '../context/CartContext.jsx';
import { money } from '../lib/format.js';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();
  const shipping = shippingFor(subtotal);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <header className="drawer__head">
              <h2>Your cart</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close cart">Close</button>
            </header>
            <ul className="drawer__list">
              {items.length === 0 && <li className="drawer__empty">Your cart is empty. Start with something from the new collection.</li>}
              {items.map((i, n) => (
                <motion.li key={i.key} className="line" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: n * 0.05 }}>
                  <img src={i.image} alt={i.name} width="80" height="100" />
                  <div>
                    <p className="line__name">{i.name}</p>
                    <p className="line__meta">{i.brand ? `${i.brand} · ` : ''}{i.size} · {i.color}</p>
                    <Quantity
                      value={i.qty}
                      onChange={(n) => setQty(i.key, n)}
                      label={`quantity of ${i.name}`}
                    />
                  </div>
                  <div className="line__side">
                    <p>{money(i.price * i.qty)}</p>
                    <button type="button" onClick={() => remove(i.key)}>Remove</button>
                  </div>
                </motion.li>
              ))}
            </ul>
            <footer className="drawer__foot">
              <dl>
                <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
                <div><dt>Delivery</dt><dd>{shipping ? money(shipping) : 'Free'}</dd></div>
                <div className="total"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div>
              </dl>
              {subtotal < FREE_SHIPPING && subtotal > 0 && (
                <p className="drawer__nudge">{money(FREE_SHIPPING - subtotal)} more for free delivery</p>
              )}
              <button
                type="button"
                className="btn btn--solid btn--block"
                disabled={items.length === 0}
                onClick={() => { setOpen(false); navigate('/checkout'); }}
              >
                Checkout
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
