import ProductCard from './ProductCard.jsx';
import { RevealGroup } from './Reveal.jsx';

/* Four across on a wide screen, three on a laptop, two on a phone — the same
   grid everywhere, so a shopper learns one rhythm and the shop keeps it.

   The grid is also where a rail arrives: the cards are told to come in one
   after another as the row reaches the fold, 55ms apart. It is the parent that
   times it and the cards that place themselves, which is why a card is only a
   card — it does not know how many of it there are. */
export default function ProductGrid({ products, columns = 4, className = '', priorityCount = 0, label, stagger = 0.055 }) {
  return (
    <RevealGroup className={`pgrid pgrid--${columns} ${className}`} aria-label={label} stagger={stagger}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </RevealGroup>
  );
}
