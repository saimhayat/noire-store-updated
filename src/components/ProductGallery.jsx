import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { discountOf } from '../lib/format.js';
import { DUR, EASE } from '../lib/motion.js';

/* The gallery: one large plate, four views, and a markdown flag in the corner.

   Images cross-fade rather than slide, because a garment should not appear to
   travel across the page when a shopper changes their mind about the angle —
   but the one underneath settles by a hair as it arrives, which is what stops
   the change reading as a flicker.

   The border on the thumbnails is a single element that moves from view to
   view: the row shows where you are without ever showing two answers at once.
   On a touch screen the plate itself can be pushed sideways, because reaching
   for a 4rem thumbnail with a thumb is the wrong gesture. */
const SWIPE = 56;

export default function ProductGallery({ product, shot, setShot }) {
  const off = discountOf(product);
  const still = useReducedMotion();
  const last = product.images.length - 1;

  const step = (n) => setShot(Math.min(last, Math.max(0, shot + n)));

  const onDragEnd = (_e, info) => {
    if (info.offset.x < -SWIPE) step(1);
    else if (info.offset.x > SWIPE) step(-1);
  };

  return (
    <div className="gal">
      <div className="gal__stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={shot}
            src={product.images[shot]}
            alt={`${product.brand} ${product.name}, view ${shot + 1}`}
            width="900"
            height="1125"
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
            drag={still ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            dragDirectionLock
            style={still ? undefined : { touchAction: 'pan-y' }}
            onDragEnd={onDragEnd}
          />
        </AnimatePresence>

        <div className="gal__flags">
          {off > 0 && <span className="flag flag--sale">-{off}%</span>}
          {product.isNew && <span className="flag">New</span>}
          {product.stock === 0 && <span className="flag flag--out">Sold out</span>}
        </div>
      </div>

      <div className="gal__thumbs">
        {product.images.map((src, i) => (
          <button
            key={src}
            type="button"
            className={`gal__thumb ${i === shot ? 'is-on' : ''} ${still ? '' : 'has-mark'}`}
            onClick={() => setShot(i)}
            aria-label={`View image ${i + 1} of ${product.images.length}`}
            aria-pressed={i === shot}
          >
            <img src={src} alt="" width="120" height="150" loading="lazy" />
            {/* the border that travels. Without it — a reduced-motion visitor —
                the thumbnail's own border marks the view instead. */}
            {!still && i === shot && (
              <motion.span
                className="gal__mark"
                layoutId="gal-mark"
                transition={{ duration: 0.34, ease: EASE }}
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
