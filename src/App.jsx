import { lazy, Suspense, useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Toasts from './components/Toasts.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import { DUR, EASE } from './lib/motion.js';

const Shop = lazy(() => import('./pages/Shop.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Confirmation = lazy(() => import('./pages/Confirmation.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Journal = lazy(() => import('./pages/Journal.jsx'));
const JournalPost = lazy(() => import('./pages/JournalPost.jsx'));
const Info = lazy(() => import('./pages/Info.jsx'));

gsap.registerPlugin(ScrollTrigger);

/* Every written page shares one component and one data entry; the path is the
   name the footer and the help links already used. */
const WRITTEN = [
  ['/faq', 'faq'],
  ['/shipping', 'shipping'],
  ['/returns', 'returns'],
  ['/size-guide', 'sizeguide'],
  ['/about', 'about'],
  ['/story', 'story'],
  ['/careers', 'careers'],
  ['/terms', 'terms'],
  ['/privacy', 'privacy'],
  ['*', 'notfound']
];

export default function App() {
  const { pathname } = useLocation();
  const lenisRef = useRef(null);
  const still = useReducedMotion();

  /* One smooth-scroll instance for the whole site, driven off the same ticker as
     the scroll triggers so the two never disagree about where the page is. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    // a new page starts at the top, without the smooth scroll animating it there
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  /* In-page anchors — “Read the cloth specs”, the skip link, anything that points
     at #main — glide like the rest of the page rather than jumping. */
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target?.closest?.('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -96, duration: 1.1 });
      else target.scrollIntoView();
      history.replaceState(null, '', link.getAttribute('href'));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    /* One configuration for every animation on the site: a visitor who has
       asked for reduced motion gets no transforms anywhere — the panels,
       the drawers and the menus all open in place instead of travelling. */
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <CartDrawer />
      <Toasts />
      <main id="main">
        {/* the whole page fades up by a few pixels on a route change, and nothing
            else moves: a shop should feel like one continuous read */}
        <motion.div
          className="route"
          key={pathname}
          initial={still ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base + 0.14, ease: EASE }}
        >
          <Suspense fallback={<div className="page-loading">NOIRÉ</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<Product />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/journal/:slug" element={<JournalPost />} />
              {WRITTEN.map(([path, page]) => (
                <Route key={page} path={path} element={<Info page={page} />} />
              ))}
            </Routes>
          </Suspense>
        </motion.div>
      </main>
      <Footer />
    </MotionConfig>
  );
}
