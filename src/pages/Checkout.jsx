import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FREE_SHIPPING, shippingFor, useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Field from '../components/Field.jsx';
import { money } from '../lib/format.js';
import { writeOrder } from '../lib/orders.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Malaysia'];
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot'];

const EMPTY = {
  email: '', first: '', last: '', address: '', city: 'Karachi', postcode: '', country: 'Pakistan',
  method: 'card', card: '', exp: '', cvc: '', name: '', phone: ''
};

const BLURB = {
  email: 'We send the tracking number here.',
  address: 'House, street and area.',
  postcode: 'Postal code, five digits.',
  phone: 'The courier calls this number before delivery.',
  card: 'Any 16 digits — this is a demonstration, nothing is charged.',
  exp: 'MM/YY',
  cvc: '3 digits, 4 for Amex'
};

/* Two steps, because a checkout that shows everything at once hides the one
   thing the buyer needs to check: what they are paying. Nothing is sent
   anywhere — there is no backend — so the order is written to this device and
   the confirmation and the account page both read it back. */
export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { toast } = useToast() || {};
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const missing = Math.max(0, FREE_SHIPPING - subtotal);

  useEffect(() => { document.title = 'Checkout | NOIRÉ'; return () => { document.title = 'NOIRÉ | Modern fashion'; }; }, []);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  };

  const check = (which) => {
    const e = {};
    const v = values;
    if (which >= 1) {
      if (!EMAIL.test(v.email.trim())) e.email = 'Enter an email we can send the tracking number to.';
      if (!v.first.trim()) e.first = 'Required.';
      if (!v.last.trim()) e.last = 'Required.';
      if (!v.address.trim()) e.address = 'Required.';
      if (!v.city.trim()) e.city = 'Required.';
      if (!/^[0-9\- ]{4,10}$/.test(v.postcode.trim())) e.postcode = 'Five digits, or your local format.';
      if (v.country === 'Pakistan' && !/^[0-9+\- ]{10,15}$/.test(v.phone.trim())) e.phone = 'The courier needs a number that answers.';
    }
    if (which >= 2 && v.method === 'card') {
      if (v.card.replace(/\D/g, '').length !== 16) e.card = 'Sixteen digits, spaces are fine.';
      if (!/^\d{2}\/\d{2}$/.test(v.exp.trim())) e.exp = 'Use MM/YY.';
      if (!/^\d{3,4}$/.test(v.cvc.trim())) e.cvc = 'Three digits.';
      if (!v.name.trim()) e.name = 'Required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = (e) => {
    e.preventDefault();
    if (!check(1)) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const place = (e) => {
    e.preventDefault();
    if (!check(2)) return;
    const order = {
      id: `NR${Date.now().toString(36).toUpperCase().slice(-6)}`,
      placed: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      placedISO: new Date().toISOString(),
      name: `${values.first} ${values.last}`,
      email: values.email,
      city: values.city,
      country: values.country,
      phone: values.phone,
      method: values.method === 'cod' ? 'Cash on delivery' : 'Card',
      items: items.map((i) => ({ name: i.name, size: i.size, color: i.color, qty: i.qty, price: i.price, image: i.image })),
      subtotal,
      shipping,
      total
    };
    writeOrder(order);
    clear();
    toast?.(`Order ${order.id} placed — confirmation sent to ${order.email}`);
    navigate('/confirmation');
  };

  const steps = ['Delivery', 'Payment'];
  const summary = useMemo(() => (
    <aside className="checkout__summary" aria-label="Order summary">
      <h2 className="checkout__subhead">Your bag</h2>
      <ul className="checkout__lines">
        {items.map((i) => (
          <li key={i.key} className="checkout__line">
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
        <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
        <div><dt>Delivery</dt><dd>{shipping ? money(shipping) : 'Free'}</dd></div>
        <div className="total"><dt>Total</dt><dd>{money(total)}</dd></div>
      </dl>
      {missing > 0 && <p className="checkout__nudge">Rs. {missing.toLocaleString('en-PK')} more for free delivery.</p>}
      <p className="checkout__note">Prices include GST. Delivery is a flat Rs. 300 under Rs. 5,000, free above it.</p>
    </aside>
  ), [items, subtotal, shipping, total, missing]);

  if (items.length === 0) {
    return (
      <div className="page wrap checkout">
        <div className="page__head">
          <h1 className="section__title">Your bag is empty</h1>
          <p className="page__lede">Nothing to settle yet — seventy-odd pieces are still in stock.</p>
          <Link className="btn btn--solid" to="/shop">Back to the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page wrap checkout">
      <div className="page__head checkout__head">
        <h1 className="section__title">Checkout</h1>
        <ol className="steps" aria-label="Checkout progress">
          {steps.map((s, i) => (
            <li key={s} className={`steps__item ${step === i + 1 ? 'is-on' : ''} ${step > i + 1 ? 'is-done' : ''}`}>
              <span className="steps__num">{step > i + 1 ? '✓' : i + 1}</span> {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="checkout__grid">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="delivery"
              className="checkout__form"
              onSubmit={next}
              noValidate
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <fieldset>
                <legend className="checkout__legend">Contact</legend>
                <div className="fields">
                  <Field label="Email" name="email" value={values.email} onChange={set} error={errors.email} type="email" autoComplete="email" hint={BLURB.email} wide />
                  <Field label="Mobile" name="phone" value={values.phone} onChange={set} error={errors.phone} type="tel" autoComplete="tel" hint={BLURB.phone} wide />
                </div>
              </fieldset>

              <fieldset>
                <legend className="checkout__legend">Delivery address</legend>
                <div className="fields">
                  <Field label="First name" name="first" value={values.first} onChange={set} error={errors.first} autoComplete="given-name" />
                  <Field label="Last name" name="last" value={values.last} onChange={set} error={errors.last} autoComplete="family-name" />
                  <Field label="Address" name="address" value={values.address} onChange={set} error={errors.address} autoComplete="street-address" hint={BLURB.address} wide />
                  <Field label="City" name="city" as="select" options={CITIES} value={values.city} onChange={set} error={errors.city} wide />
                  <Field label="Postcode" name="postcode" value={values.postcode} onChange={set} error={errors.postcode} autoComplete="postal-code" hint={BLURB.postcode} />
                  <Field label="Country" name="country" as="select" options={COUNTRIES} value={values.country} onChange={set} autoComplete="country-name" />
                </div>
              </fieldset>

              <div className="checkout__actions">
                <button type="submit" className="btn btn--solid">Continue to payment</button>
                <Link to="/shop" className="link-underline">Keep looking</Link>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="payment"
              className="checkout__form"
              onSubmit={place}
              noValidate
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <fieldset>
                <legend className="checkout__legend">Payment</legend>
                <div className="paymethods" role="radiogroup" aria-label="Payment method">
                  <label className={`paymethod ${values.method === 'card' ? 'is-on' : ''}`}>
                    <input type="radio" name="method" checked={values.method === 'card'} onChange={() => set('method', 'card')} />
                    <span>Card</span>
                    <em>Visa, Mastercard, wallet transfer</em>
                  </label>
                  <label className={`paymethod ${values.method === 'cod' ? 'is-on' : ''}`}>
                    <input type="radio" name="method" checked={values.method === 'cod'} onChange={() => set('method', 'cod')} />
                    <span>Cash on delivery</span>
                    <em>Pay the courier · orders up to Rs. 50,000</em>
                  </label>
                </div>

                {values.method === 'card' ? (
                  <>
                    <p className="checkout__demo">Demonstration only — no payment provider is wired up and no card is charged. Any sixteen digits will do.</p>
                    <div className="fields">
                      <Field label="Card number" name="card" value={values.card} onChange={set} error={errors.card} inputMode="numeric" autoComplete="cc-number" hint={BLURB.card} wide />
                      <Field label="Expiry" name="exp" value={values.exp} onChange={set} error={errors.exp} inputMode="numeric" autoComplete="cc-exp" hint={BLURB.exp} />
                      <Field label="CVC" name="cvc" value={values.cvc} onChange={set} error={errors.cvc} inputMode="numeric" autoComplete="cc-csc" hint={BLURB.cvc} />
                      <Field label="Name on card" name="name" value={values.name} onChange={set} error={errors.name} autoComplete="cc-name" wide />
                    </div>
                  </>
                ) : (
                  <p className="checkout__demo">Have Rs. {total.toLocaleString('en-PK')} ready for the courier. We call before we come.</p>
                )}
              </fieldset>

              <div className="checkout__actions">
                <button type="submit" className="btn btn--solid">Place order — {money(total)}</button>
                <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>Back to delivery</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {summary}
      </div>
    </div>
  );
}
