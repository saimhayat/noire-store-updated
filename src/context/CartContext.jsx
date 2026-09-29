import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
/* v2: the catalogue and the currency both changed, so a bag written by the old
   shop is not read by this one. */
const KEY = 'noire-cart-v2';

/* Free delivery over Rs. 5,000, and a flat Rs. 300 under it — the same number in
   the drawer, the checkout form and the confirmation, because a total that moves
   between pages is a total nobody trusts. */
export const FREE_SHIPPING = 5000;
export const FLAT_SHIPPING = 300;
export const shippingFor = (subtotal) => (subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : FLAT_SHIPPING);
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add = useCallback((p, size = p.sizes[0], color = p.colours[0], qty = 1) => {
    const key = `${p.id}-${size}-${color}`;
    setItems((prev) => prev.some((i) => i.key === key)
      ? prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      : [...prev, { key, id: p.id, slug: p.slug, brand: p.brand, name: p.name, image: p.image, price: p.price, size, color, qty }]);
    setOpen(true);
  }, []);

  const setQty = useCallback((key, qty) => setItems((prev) => (qty < 1
    ? prev.filter((i) => i.key !== key)
    : prev.map((i) => (i.key === key ? { ...i, qty } : i)))), []);

  const remove = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, open, setOpen, add, setQty, remove, clear,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.price, 0)
  }), [items, open, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
