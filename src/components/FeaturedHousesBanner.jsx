import { Link } from 'react-router-dom';

/* The labels the shop carries, stated as a panel the way a magazine names its
   contributors. Twelve houses, chosen for what they cut rather than for what
   they advertise — the same copy as the BrandSection, kept here so the banner
   reads on its own if it ever stands apart from the rest of the page. */

const HOUSES = [
  { name: 'CHENAB SUPPLY', count: 4, blurb: 'Everyday shalwar kameez, waistcoats and leather shoes.' },
  { name: 'GULMOHAR', count: 2, blurb: 'Embroidered lawn and everyday kameez, cut in Lahore.' },
  { name: 'KAIRA', count: 1, blurb: "Children's festive cotton, cut generous and handed down twice." },
  { name: 'KARAKORAM LEATHER', count: 4, blurb: 'Leather bags cut and stitched in Sialkot.' },
  { name: 'MEHR ATELIER', count: 3, blurb: 'Formals in chiffon, organza and velvet, hand finished.' },
  { name: 'MOTIA', count: 2, blurb: 'Printed lawn suits, the print drawn and screens made in-house.' },
  { name: 'NAKSHI', count: 1, blurb: 'Chikankari and hand embroidery on cotton cambric.' },
  { name: 'NOIRÉ', count: 5, blurb: 'The house label. Kurtas and kameez cut in small runs.' },
  { name: 'RAVI & LOOM', count: 2, blurb: 'Khaddar and block print, woven on handloom looms.' },
  { name: 'SOHNI', count: 4, blurb: 'Shawls, sandals and childrenswear in short runs.' },
  { name: 'TILLA', count: 6, blurb: 'Juttis, khussa and gold-plated jewellery, made by hand.' },
  { name: 'ZARINA', count: 4, blurb: 'Bridal and festive wear, made to order in two weeks.' }
];

export default function FeaturedHousesBanner({ title = 'The labels we carry', body, to = '/shop', link = 'Browse the shop' }) {
  return (
    <section className="houses-banner" aria-labelledby="houses-title">
      <div className="houses-banner__inner wrap">
        <div className="houses-banner__left">
          <p className="eyebrow">Featured houses</p>
          <h2 className="houses-banner__title" id="houses-title">{title}</h2>
          {body && <p className="houses-banner__body">{body}</p>}
          <Link to={to} className="link-underline link-underline--flat">{link}</Link>
        </div>
        <ul className="houses-banner__list" aria-label="Featured houses">
          {HOUSES.map((h) => (
            <li key={h.name} className="houses-banner__row">
              <span className="houses-banner__name">{h.name}</span>
              <span className="houses-banner__count">{h.count} piece{h.count !== 1 ? 's' : ''}</span>
              <span className="houses-banner__blurb">{h.blurb}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
