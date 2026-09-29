/* Stars, rounded to the nearest half. The fill is set by a data attribute and a
   handful of rules in the stylesheet rather than by a computed inline width —
   the rating is data, so it belongs in an attribute. */
const snap = (rating) => Math.min(5, Math.max(0.5, Math.round(Number(rating) * 2) / 2));

export default function Stars({ rating, className = '' }) {
  const value = snap(rating);
  return (
    <span className={`stars ${className}`} data-rating={value} role="img" aria-label={`${Number(rating).toFixed(1)} out of 5`}>
      <span className="stars__row" aria-hidden="true">★★★★★</span>
      <span className="stars__row stars__row--on" aria-hidden="true">★★★★★</span>
    </span>
  );
}
