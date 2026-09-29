import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
/* v2: product ids changed with the new catalogue, so an old list of ids would
   point at pieces the shopper never saved. */
const KEY = 'noire-wishlist-v2';
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(read);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const toggle = useCallback((id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])), []);
  const value = useMemo(() => ({ ids, toggle, has: (id) => ids.includes(id), count: ids.length }), [ids, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
