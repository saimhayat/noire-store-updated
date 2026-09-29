import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE, LINK, SETTLE } from '../lib/motion.js';

/* The panel under a department. Three columns of links, a promo plate on the
   right, and nothing else: a mega menu earns its width with organisation, not
   with decoration. Columns keep their headings so a category is never an
   unlabelled list.

   The panel opens as a sequence rather than as one block: the columns arrive
   first and their links follow inside each column, so a wide menu resolves from
   left to right instead of appearing all at once. The plate settles last. */

const PANEL = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE, staggerChildren: 0.05, delayChildren: 0.02 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: EASE } }
};

const COLUMN = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.022 } }
};

export default function MegaMenu({ item, onClose }) {
  if (!item) return null;

  return (
    <motion.div
      id="mega-panel"
      className="mega"
      variants={PANEL}
      initial="hidden"
      animate="show"
      exit="exit"
      role="region"
      aria-label={`${item.label} menu`}
    >
      <div className="mega__inner wrap">
        <div className="mega__cols">
          {item.columns.map((col) => (
            <motion.nav
              className="mega__col"
              key={col.title}
              variants={COLUMN}
              aria-label={`${item.label} — ${col.title}`}
            >
              <h3 className="mega__title">{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <motion.li key={l.label} variants={LINK}>
                    <Link to={l.to} className="mega__link" onClick={onClose}>
                      <span>{l.label}</span>
                      {l.note && <span className="mega__note">{l.note}</span>}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>

        {item.promo && (
          <Link to={item.promo.to} className="mega__promo" onClick={onClose}>
            <motion.span className="mega__promo-plate" variants={SETTLE}>
              <img src={item.promo.image} alt="" width="640" height="800" loading="lazy" />
            </motion.span>
            <span className="mega__promo-copy">
              <span className="eyebrow">{item.promo.eyebrow}</span>
              <strong>{item.promo.title}</strong>
              <em>{item.promo.cta}</em>
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
