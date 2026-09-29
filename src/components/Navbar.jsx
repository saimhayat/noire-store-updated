import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { NAV } from '../data/nav.js';
import AnnouncementBar from './AnnouncementBar.jsx';
import MegaMenu from './MegaMenu.jsx';
import MobileTabBar from './MobileTabBar.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import { EASE } from '../lib/motion.js';

/* The drawer's list arrives in order: the departments walk in under each other
   rather than the whole sheet appearing at once. */
const DRAWER = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, staggerChildren: 0.035, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } }
};
const DRAWER_ROW = {
  hidden: { opacity: 0, y: 9 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.12 } }
};

/* Small line icons, drawn once here so the header carries no icon dependency
   and no image requests. */
const Icon = ({ name }) => {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true };
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>;
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8.5" r="3.75" /><path d="M4.75 20c.9-3.7 3.8-5.5 7.25-5.5S18.35 16.3 19.25 20" strokeLinecap="round" /></svg>;
  if (name === 'heart') return <svg {...common}><path d="M12 19.5S4.5 15.2 4.5 10.2A3.7 3.7 0 0 1 12 8.3a3.7 3.7 0 0 1 7.5 1.9c0 5-7.5 9.3-7.5 9.3Z" strokeLinejoin="round" /></svg>;
  return <svg {...common}><path d="M5.5 8h13l-1 12h-11l-1-12Z" strokeLinejoin="round" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" /></svg>;
};

export default function Navbar() {
  const bar = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [searching, setSearching] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const wishlist = useWishlist();
  const { pathname, search } = useLocation();
  const still = useReducedMotion();

  /* How far down the page the reader is, drawn as the header's own hairline:
     the rule under the bar fills from the left as the page is read. It follows
     the scroll directly, so it is not an animation and it is not switched off
     with the rest of them — only the easing of it is. */
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, { stiffness: 260, damping: 42, mass: 0.4 });
  const read = still ? scrollYProgress : smoothed;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* The header is fixed, so every page has to start below it — and the
     announcement bar can be dismissed, which changes its height. Measuring it
     once into a custom property keeps the pages honest without a magic number. */
  useEffect(() => {
    const el = bar.current;
    if (!el) return undefined;
    const set = () => document.documentElement.style.setProperty('--hdr-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(set);
    ro?.observe(el);
    window.addEventListener('resize', set);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', set);
    };
  }, [drawer]);

  // a route change closes whatever was open
  useEffect(() => { setDrawer(false); setOpen(null); }, [pathname, search]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawer);
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setDrawer(false);
      setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  // `/` opens search from anywhere, unless something is being typed into
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || searching) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      setSearching(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searching]);

  /* A panel that shuts the instant the pointer leaves the word is unusable on
     the way down to it, so closing is scheduled and any approach cancels it. */
  const closeTimer = useRef(null);
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openMenu = (label) => { cancelClose(); setOpen(label); };
  const closeMenu = () => { cancelClose(); setOpen(null); };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(null), 180);
  };
  useEffect(() => cancelClose, []);

  // a click anywhere outside the header, or focus leaving it, closes the panel
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!bar.current?.contains(e.target)) closeMenu(); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const active = NAV.find((n) => n.label === open);

  return (
    <>
      <header
        ref={bar}
        className={`hdr ${scrolled ? 'hdr--stuck' : ''} ${open ? 'hdr--mega' : ''}`}
        onMouseLeave={scheduleClose}
        onFocus={cancelClose}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null); }}
      >
        <AnnouncementBar />

        <div className="hdr__bar">
          <div className="hdr__inner wrap">
            <button
              type="button"
              className="hdr__burger"
              onClick={() => setDrawer((d) => !d)}
              aria-expanded={drawer}
              aria-controls="mobile-nav"
              aria-label={drawer ? 'Close menu' : 'Open menu'}
            >
              <span /><span />
            </button>

            <Link to="/" className="hdr__logo" aria-label="NOIRÉ — home">NOIRÉ</Link>

            <nav className="hdr__nav" aria-label="Primary">
              {NAV.map((item) => (item.columns ? (
                <div
                  key={item.label}
                  className={`hdr__item ${open === item.label ? 'is-open' : ''}`}
                  onMouseEnter={() => openMenu(item.label)}
                >
                  <span className="hdr__row">
                    <Link
                      to={item.to}
                      className="hdr__link"
                      onFocus={() => openMenu(item.label)}
                      aria-expanded={open === item.label}
                    >
                      {item.label}
                    </Link>
                    {/* the panel without the trip to the shop page */}
                    <button
                      type="button"
                      className="hdr__toggle"
                      aria-label={`${open === item.label ? 'Hide' : 'Show'} the ${item.label} menu`}
                      aria-expanded={open === item.label}
                      aria-controls="mega-panel"
                      onClick={() => (open === item.label ? closeMenu() : openMenu(item.label))}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="m5 9 7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </span>
                </div>
              ) : (
                <Link key={item.label} to={item.to} className={`hdr__link ${item.label === 'Sale' ? 'hdr__link--sale' : ''}`} onMouseEnter={scheduleClose}>
                  {item.label}
                </Link>
              )))}
            </nav>

            {/* Hidden while a department panel is open: a half-drawn rule across
                the top of the panel would read as a mistake, not a measurement. */}
            {!open && (
              <motion.span className="hdr__progress" style={{ scaleX: read }} aria-hidden="true" />
            )}

            <div className="hdr__tools">
              <button type="button" className="hdr__tool" onClick={() => setSearching(true)} aria-label="Search the shop">
                <Icon name="search" />
                <span className="hdr__tool-text">Search</span>
              </button>
              <Link to="/account" className="hdr__tool">
                <Icon name="user" />
                <span className="hdr__tool-text">Account</span>
              </Link>
              <Link to="/shop?wishlist=1" className="hdr__tool" aria-label={`Wishlist, ${wishlist.count} saved`}>
                <Icon name="heart" />
                <span className="hdr__tool-text">Wishlist</span>
                {wishlist.count > 0 && <span className="badge">{wishlist.count}</span>}
              </Link>
              <button type="button" className="hdr__tool" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${count} items`}>
                <Icon name="bag" />
                <span className="hdr__tool-text">Bag</span>
                {count > 0 && <motion.span key={count} className="badge" initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{count}</motion.span>}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {active && <MegaMenu item={active} onClose={closeMenu} key={active.label} />}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {drawer && (
          <motion.nav
            id="mobile-nav"
            className="mdrawer"
            aria-label="Mobile"
            variants={DRAWER}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="mdrawer__scroll">
              <ul className="mdrawer__list">
                {NAV.map((item) => (
                  <motion.li key={item.label} className="mdrawer__item" variants={DRAWER_ROW}>
                    {item.columns ? (
                      <>
                        <button
                          type="button"
                          className={`mdrawer__row ${expanded === item.label ? 'is-open' : ''}`}
                          onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                          aria-expanded={expanded === item.label}
                        >
                          <span>{item.label}</span>
                          <span className="mdrawer__sign" aria-hidden="true" />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded === item.label && (
                            <motion.div
                              className="mdrawer__sub"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <div className="mdrawer__sub-in">
                                <Link to={item.to} className="mdrawer__all">Shop all {item.label}</Link>
                                {item.columns.map((col) => (
                                  <div key={col.title} className="mdrawer__group">
                                    <p className="eyebrow">{col.title}</p>
                                    <ul>
                                      {col.links.map((l) => (
                                        <li key={l.label}><Link to={l.to} className="mdrawer__link">{l.label}</Link></li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link to={item.to} className="mdrawer__row">{item.label}</Link>
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="mdrawer__foot">
                <Link to="/journal" className="mdrawer__link">Journal</Link>
                <Link to="/about" className="mdrawer__link">About the house</Link>
                <Link to="/contact" className="mdrawer__link">Contact</Link>
                <Link to="/account" className="mdrawer__link">Account &amp; orders</Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <SearchOverlay open={searching} onClose={() => setSearching(false)} />
      <MobileTabBar onSearch={() => setSearching(true)} />
    </>
  );
}
