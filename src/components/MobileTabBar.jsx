import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { EASE } from '../lib/motion.js';

/* The bar along the bottom of a phone: the four things a shopper reaches for
   without scrolling back to the top. Same line icons as the header, so one
   shop looks like one shop on every screen. */
const Icon = ({ name }) => {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true };
  if (name === 'shop') return <svg {...common}><path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>;
  if (name === 'heart') return <svg {...common}><path d="M12 19.5S4.5 15.2 4.5 10.2A3.7 3.7 0 0 1 12 8.3a3.7 3.7 0 0 1 7.5 1.9c0 5-7.5 9.3-7.5 9.3Z" strokeLinejoin="round" /></svg>;
  return <svg {...common}><path d="M5.5 8h13l-1 12h-11l-1-12Z" strokeLinejoin="round" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" /></svg>;
};

/* One mark, two places: when the bar's subject changes, the rule does not
   appear in the new position — it travels to it, so the bar reads as one strip
   rather than as four separate buttons. Only ever one of them is on. */
function Mark() {
  const still = useReducedMotion();
  return (
    <motion.span
      className="tabbar__mark"
      layoutId="tabbar-mark"
      transition={still ? { duration: 0 } : { duration: 0.34, ease: EASE }}
      aria-hidden="true"
    />
  );
}

export default function MobileTabBar({ onSearch }) {
  const { count, setOpen } = useCart();
  const wishlist = useWishlist();
  const { pathname, search } = useLocation();
  const onShop = pathname === '/shop' && !search.includes('wishlist');
  const onSaved = search.includes('wishlist');

  return (
    <nav className="tabbar" aria-label="Quick navigation">
      <Link to="/shop" className={`tabbar__item ${onShop ? 'is-on' : ''}`}>
        {onShop && <Mark />}
        <Icon name="shop" />
        Shop
      </Link>
      <button type="button" className="tabbar__item" onClick={onSearch}>
        <Icon name="search" />
        Search
      </button>
      <Link to="/shop?wishlist=1" className={`tabbar__item ${onSaved ? 'is-on' : ''}`}>
        {onSaved && <Mark />}
        <Icon name="heart" />
        Saved{wishlist.count > 0 && <span className="tabbar__count">{wishlist.count}</span>}
      </Link>
      <button type="button" className="tabbar__item" onClick={() => setOpen(true)}>
        <Icon name="bag" />
        Bag{count > 0 && <span className="tabbar__count">{count}</span>}
      </button>
    </nav>
  );
}
