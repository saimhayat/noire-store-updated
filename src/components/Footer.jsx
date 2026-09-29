import { Link } from 'react-router-dom';
import Newsletter from './Newsletter.jsx';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import { BRANDS, DEPARTMENT_KEYS } from '../data/products.js';

/* Every link here goes somewhere. Four columns of links, a row of the houses
   the shop carries, the letter, the payment marks and the legal line — the
   shape of a shop that expects to be read from the bottom as well as the top. */

const COLS = [
  {
    title: 'Customer care',
    links: [
      { label: 'Contact us', to: '/contact' },
      { label: 'Shipping & delivery', to: '/shipping' },
      { label: 'Returns & exchanges', to: '/returns' },
      { label: 'Size guide', to: '/size-guide' },
      { label: 'Track your order', to: '/account' },
      { label: 'FAQ', to: '/faq' }
    ]
  },
  {
    title: 'Shop',
    links: [
      { label: 'New in', to: '/shop?sort=newest' },
      ...DEPARTMENT_KEYS.map((d) => ({ label: d, to: `/shop?department=${d}` })),
      { label: 'Sale', to: '/shop?sale=1' }
    ]
  },
  {
    title: 'The house',
    links: [
      { label: 'About NOIRÉ', to: '/about' },
      { label: 'Our story', to: '/story' },
      { label: 'Journal', to: '/journal' },
      { label: 'Careers', to: '/careers' }
    ]
  },
  {
    title: 'Information',
    links: [
      { label: 'Terms of service', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Size guide', to: '/size-guide' },
      { label: 'Care & repairs', to: '/faq' }
    ]
  }
];

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'Pinterest', href: 'https://pinterest.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'YouTube', href: 'https://youtube.com' }
];

const PAY = ['Visa', 'Mastercard', 'Easypaisa', 'JazzCash', 'Cash on delivery'];

/* The footer's columns are read as a row of signposts, so they arrive with a
   shorter travel than a full plate would. */
const SIGNPOST = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <p className="footer__logo">NOIRÉ</p>
            <p className="footer__blurb">
              A Pakistani garments house and the shops around it: kameez, kurta and lawn, bridal
              formals, jutti, Sialkot leather — cut in small runs and kept in stock until the run closes.
            </p>
            <ul className="footer__social">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer noopener" className="link-underline">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <Newsletter />
        </div>

        <RevealGroup className="footer__grid" stagger={0.06}>
          {COLS.map(({ title, links }) => (
            <RevealItem as="nav" key={title} aria-label={title} variants={SIGNPOST}>
              <h2>{title}</h2>
              <ul>
                {links.map((l) => (
                  <li key={l.label}><Link to={l.to} className="footer__link">{l.label}</Link></li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="footer__brands">
          <h2 className="footer__subhead">Shop by house</h2>
          <ul>
            {BRANDS.map((b) => (
              <li key={b.name}><Link to={b.to} className="footer__link">{b.name}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer__legal">
          <p className="footer__copy">© 2026 NOIRÉ. All rights reserved. Prices include GST.</p>
          <ul className="footer__pay">
            {PAY.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="footer__links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/faq">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
