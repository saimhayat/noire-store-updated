import { Link } from 'react-router-dom';
import SectionHead from './SectionHead.jsx';
import { pieceCount } from '../lib/format.js';

/* The houses the shop carries, set as type rather than as logos: a name in the
   right letterspacing says more about a label than a downloaded mark, and it
   keeps the page free of other people's artwork. */
export default function BrandSection({ id, eyebrow, title, text, brands, to, link = 'All brands', variant = 'grid' }) {
  return (
    <section className="section" aria-labelledby={id}>
      <SectionHead id={id} eyebrow={eyebrow} title={title} text={text} to={to} link={link} />
      <ul className={`brands brands--${variant}`}>
        {brands.map((b) => (
          <li key={b.name}>
            <Link to={b.to} className="brands__card">
              <span className="brands__name">{b.name}</span>
              <span className="brands__meta">{pieceCount(b.count)}</span>
              {variant === 'grid' && b.blurb && <span className="brands__blurb">{b.blurb}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
