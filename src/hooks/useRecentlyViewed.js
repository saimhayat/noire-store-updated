import { useEffect, useState } from 'react';
import { products } from '../data/products.js';

const KEY = 'noire-viewed';

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

/* What a shopper has looked at, kept on their own device. The current product is
   written first, so the rail is always the four pieces before this one. */
export default function useRecentlyViewed(currentId) {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    if (!currentId) return;
    const next = [currentId, ...read().filter((id) => id !== currentId)].slice(0, 12);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
    setIds(next);
  }, [currentId]);

  return ids
    .filter((id) => id !== currentId)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);
}
