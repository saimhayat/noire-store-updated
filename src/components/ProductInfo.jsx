import { Link } from 'react-router-dom';
import { money, discountOf } from '../lib/format.js';
import { colourName } from '../data/products.js';
import { RATING_COPY, reviewCount } from '../data/reviews.js';
import Quantity from './Quantity.jsx';
import Stars from './Stars.jsx';

/* The panel beside the gallery: brand, name, rating, price, the two choices a
   shopper has to make (colour, size), the two decisions they can take (add, buy
   now), and the three answers they will want before either — when it ships, what
   it costs to send back, and how many are left. */
export default function ProductInfo({ product, size, setSize, colour, setColour, qty, setQty, onAdd, onBuy, onSave, liked, onGuide, sizeLabel = 'Size', returnCopy }) {
  const off = discountOf(product);
  const sold = reviewCount(product);
  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock <= 6;
  const brand = { name: product.brand, to: `/shop?brand=${encodeURIComponent(product.brand)}` };

  return (
    <div className="pinfo">
      <p className="pinfo__brand">
        <Link to={brand.to}>{product.brand}</Link>
      </p>
      <h1 className="pinfo__title">{product.name}</h1>

      <div className="pinfo__rating">
        <Stars rating={product.rating} />
        <a className="pinfo__ratingcopy" href="#reviews">
          {product.rating.toFixed(1)} — {RATING_COPY[Math.round(product.rating)]} · {sold} reviews
        </a>
      </div>

      <div className="pinfo__price">
        <span className="pinfo__now">{money(product.price)}</span>
        {product.oldPrice && <s>{money(product.oldPrice)}</s>}
        {off > 0 && <em className="pinfo__off">-{off}%</em>}
      </div>
      <p className="pinfo__tax">Inclusive of GST · free delivery over Rs. 5,000</p>

      <p className="pinfo__lede">{product.blurb}</p>

      {product.colours.length > 0 && (
        <div className="pinfo__field">
          <span className="pinfo__label" id="colour-label">
            Colour — <b>{colourName(colour)}</b>
          </span>
          <div className="swatches" role="radiogroup" aria-labelledby="colour-label">
            {product.colours.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={c === colour}
                className={`swatch ${c === colour ? 'is-on' : ''}`}
                onClick={() => setColour(c)}
                title={colourName(c)}
              >
                <span className={`dot dot--${c}`} aria-hidden="true" />
                {colourName(c)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pinfo__field">
        <span className="pinfo__label" id="size-label">{sizeLabel}</span>
        <div className="sizes" role="radiogroup" aria-labelledby="size-label">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === size}
              className={`size ${s === size ? 'is-on' : ''}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
          {onGuide && <button type="button" className="size size--guide" onClick={onGuide}>Size guide</button>}
        </div>
      </div>

      <div className="pinfo__field pinfo__field--qty">
        <span className="pinfo__label">Quantity</span>
        <Quantity big value={qty} onChange={setQty} min={1} max={10} />
        <p className={`pinfo__stock ${low ? 'is-low' : ''} ${out ? 'is-out' : ''}`}>
          {out ? 'Sold out for this run' : low ? `Only ${product.stock} left in this size run` : `${product.stock} in stock`}
        </p>
      </div>

      <div className="pinfo__actions">
        <button type="button" className="btn btn--solid btn--block" onClick={onAdd} disabled={out}>
          {out ? 'Sold out' : `Add to bag — ${money(product.price * qty)}`}
        </button>
        <button type="button" className="btn btn--ghost btn--block" onClick={onBuy} disabled={out}>
          Buy now
        </button>
        <button
          type="button"
          className={`btn btn--ghost pinfo__save ${liked ? 'is-on' : ''}`}
          onClick={onSave}
          aria-pressed={liked}
        >
          {liked ? 'Saved ♥' : 'Save ♡'}
        </button>
      </div>

      <dl className="pinfo__notes">
        <div><dt>Delivery</dt><dd>Free over Rs. 5,000 · 2–4 working days, tracked</dd></div>
        <div><dt>Returns</dt><dd>{returnCopy || '30 days, unworn with the tag attached · exchanges free'}</dd></div>
        <div><dt>Payment</dt><dd>Card, wallet transfer, or cash on delivery</dd></div>
      </dl>
    </div>
  );
}
