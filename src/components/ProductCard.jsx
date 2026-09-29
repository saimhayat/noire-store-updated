import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { discountOf, money } from '../lib/format.js';
import { COLOURS } from '../data/products.js';
import { EASE, ITEM } from '../lib/motion.js';

/* The card, which is most of this shop. Photograph first: a 4:5 plate, a second
   photograph on hover, a markdown badge, and four lines of type underneath that
   never move between cards. No shadow, no rounded container, no furniture — the
   only thing on the card that is not the product or its price is the heart.

   The card is the shop's unit of movement. It carries a variant, so the grid it
   sits in decides when it arrives; on its own it simply is. Hover is still CSS
   (it belongs to the pointer, not to JavaScript) — what Framer adds here is the
   heart, which pops when it is pressed, and the one-pixel give of a button
   being pressed. */
function ProductCard({ product, priority = false }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast() || {};
  const [peek, setPeek] = useState(false);
  const liked = has(product.id);
  const off = discountOf(product);
  const out = product.stock === 0;
  const href = `/product/${product.slug}`;

  const onAdd = (e) => {
    e.preventDefault();
    add(product);
    toast?.(`${product.name} added to your bag`);
  };

  const onSave = (e) => {
    e.preventDefault();
    toggle(product.id);
    toast?.(liked ? `Removed ${product.name} from your wishlist` : `Saved ${product.name} to your wishlist`);
  };

  return (
    <motion.article className="card" variants={ITEM} onMouseEnter={() => setPeek(true)}>
      <div className="card__media">
        <img
          className="card__img"
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          width="900"
          height="1125"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
        {/* The second photograph is only fetched once a pointer has been on the
            card: a grid of twelve should cost twelve images, not twenty-four. */}
        {peek && !out && product.hoverImage && (
          <img className="card__img card__img--peek" src={product.hoverImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        )}

        <Link className="card__hit" to={href} aria-label={`${product.brand} ${product.name}, ${money(product.price)}`} />

        {(off > 0 || product.isNew) && (
          <div className="card__flags">
            {off > 0 && <span className="flag flag--sale">-{off}%</span>}
            {product.isNew && <span className="flag">New</span>}
          </div>
        )}

        <button
          type="button"
          className={`card__heart ${liked ? 'is-on' : ''}`}
          onClick={onSave}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          {/* re-keyed on the answer, so the glyph lands rather than flips */}
          <motion.span
            key={liked ? 'on' : 'off'}
            initial={{ scale: 1.32 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.36, ease: EASE }}
          >
            {liked ? '♥' : '♡'}
          </motion.span>
        </button>

        <div className="card__hover">
          <motion.button
            type="button"
            className="card__add"
            onClick={onAdd}
            disabled={out}
            whileTap={out ? undefined : { scale: 0.985 }}
          >
            {out ? 'Sold out' : 'Add to bag'}
          </motion.button>
        </div>
      </div>

      <div className="card__body">
        <p className="card__brand">{product.brand}</p>
        <h3 className="card__name"><Link to={href}>{product.name}</Link></h3>
        <p className="card__price">
          <span className="card__now">{money(product.price)}</span>
          {product.oldPrice && <s>{money(product.oldPrice)}</s>}
          {off > 0 && <em className="card__off">-{off}%</em>}
        </p>
        {product.colours.length > 0 && (
          <p className="card__dots" aria-label={`${product.colours.length} colourways`}>
            {product.colours.slice(0, 5).map((c) => (
              <span key={c} className={`dot dot--${c}`} title={COLOURS[c]?.name || c} />
            ))}
            {product.colours.length > 5 && <span className="card__dots-more">+{product.colours.length - 5}</span>}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default memo(ProductCard);
