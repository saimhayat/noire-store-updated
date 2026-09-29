import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { DEPARTMENTS, products } from '../data/products.js';
import { EDITORIAL } from '../data/photography.js';

const Scene3D = lazy(() => import('./Scene3D.jsx'));

/* ---------------------------------------------------------------- the plate

   The hero shows a campaign photograph. Set this to '3d' and the same slot
   renders the house model on the same paper, wearing the same shot list — no
   other change anywhere: the grid, the copy, the CTAs and the department jump
   are the stage, and the visual in the plate is the one swappable part. */
const HERO_VISUAL = 'image';

const LINES = ['The season,', 'cut down to', 'what gets worn.'];

export default function Hero() {
  const ref = useRef(null);

  // one orchestrated moment, on load only: the type arrives, the plate settles
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero__line > span', { yPercent: 112, duration: 1.2, stagger: 0.09 }, 0.05)
        .from('.hero__eyebrow', { opacity: 0, y: 14, duration: 0.9 }, 0)
        .from('.hero__lede', { opacity: 0, y: 16, duration: 1 }, 0.4)
        .from('.hero__actions > *', { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 }, 0.55)
        .from('.hero__facts span', { opacity: 0, y: 12, duration: 0.8, stagger: 0.06 }, 0.7)
        .from('.hero__plate', { opacity: 0, scale: 1.03, duration: 1.5, ease: 'power2.out' }, 0.1)
        .from('.hero__jump li', { opacity: 0, y: 12, duration: 0.8, stagger: 0.05 }, 0.8);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={ref} data-parallax-scope aria-labelledby="hero-title">
      <div className="hero__inner wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">Winter 26 — lawn, formals and bridal</p>
          <h1 id="hero-title" className="hero__title">
            {LINES.map((line) => (
              <span className="hero__line" key={line}><span>{line}</span></span>
            ))}
          </h1>
          <p className="hero__lede">
            {products.length} pieces across {DEPARTMENTS.length} departments: kameez and trouser,
            embroidered formals, hand-worked jutti and Sialkot leather, cut in Lahore and
            stitched within a day of it.
          </p>
          <div className="hero__actions">
            <Link to="/shop?sort=newest" className="btn btn--solid">Shop now</Link>
            <Link to="/shop?department=Women" className="btn btn--ghost">Shop women</Link>
          </div>
          <p className="hero__facts">
            <span>Free delivery over Rs. 5,000</span>
            <span>30-day returns</span>
            <span>Cash on delivery</span>
          </p>
        </div>

        <div className="hero__plate" data-parallax="0.05" data-parallax-scale="1.05">
          {HERO_VISUAL === '3d' ? (
            <Suspense fallback={<span className="plate__fallback" />}>
              <Scene3D clothKey="twill" />
            </Suspense>
          ) : (
            <img
              src={EDITORIAL.hero}
              alt="Winter 26 campaign: an embroidered kameez photographed against a plain ground"
              width="1200"
              height="1500"
              fetchpriority="high"
            />
          )}
        </div>
      </div>

      <nav className="hero__jump wrap" aria-label="Shop by department">
        <ul>
          {DEPARTMENTS.map((d) => (
            <li key={d.key}>
              <Link to={d.to}>
                <span>{d.title}</span>
                <em>{d.count}</em>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
