import { Link } from 'react-router-dom';
import SectionHead from './SectionHead.jsx';
import ProductGrid from './ProductGrid.jsx';

/* A rail of pieces with a section head, and optionally one editorial tile
   closing the row — the way a magazine runs a picture beside a shop. The strip
   is used six times on the homepage and once per department page, so it carries
   the section rhythm the site is read in. */
export default function CollectionStrip({
  id,
  eyebrow,
  title,
  text,
  to,
  link,
  products,
  columns = 4,
  feature,
  revealOnScroll = true
}) {
  return (
    <section className="section" aria-labelledby={id} data-parallax-scope={revealOnScroll ? '' : undefined}>
      <SectionHead id={id} eyebrow={eyebrow} title={title} text={text} to={to} link={link} />
      <ProductGrid products={products} columns={columns} priorityCount={0} />
      {feature && (
        <div className="feature">
          <div className="feature__media">
            <img src={feature.image} alt="" width="1400" height="900" loading="lazy" decoding="async" data-parallax="0.07" />
          </div>
          <div className="feature__copy">
            <p className="eyebrow">{feature.eyebrow}</p>
            <h3 className="feature__title">{feature.title}</h3>
            <p className="feature__text">{feature.text}</p>
            <Link to={feature.to} className="link-underline">{feature.cta || 'Read it'}</Link>
          </div>
        </div>
      )}
    </section>
  );
}
