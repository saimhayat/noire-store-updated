import { Link } from 'react-router-dom';

/* An editorial banner: a photograph wide enough to be the point of it, and a
   panel of type beside it. The image drifts a few pixels against the page as it
   crosses the screen — the only parallax on the site, and the only place a
   shopper is meant to stop and look rather than scan. */
export default function PromoBanner({ eyebrow, title, text, to, cta, image, imageAlt, reverse = false, meta, tone = 'paper' }) {
  return (
    <section className={`promo promo--${tone} ${reverse ? 'promo--reverse' : ''}`} data-parallax-scope>
      <div className="promo__inner wrap">
        <div className="promo__media">
          <img
            src={image}
            alt={imageAlt || ''}
            width="1400"
            height="1000"
            loading="lazy"
            decoding="async"
            data-parallax="0.1"
            data-parallax-scale="1.08"
          />
        </div>
        <div className="promo__copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="promo__title">{title}</h2>
          {text && <p className="promo__text">{text}</p>}
          {to && <Link to={to} className="btn btn--solid">{cta || 'Shop the edit'}</Link>}
          {meta && <p className="promo__meta">{meta}</p>}
        </div>
      </div>
    </section>
  );
}
