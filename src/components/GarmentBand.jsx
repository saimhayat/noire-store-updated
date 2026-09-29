import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { STAND_CLOTHS, clothByKey } from '../data/cloth.js';
import { EDITORIAL } from '../data/photography.js';

const Scene3D = lazy(() => import('./Scene3D.jsx'));

/* ------------------------------------------------------ the model on the stand

   The house garment, turning on a paper plate. It is the same rig the hero once
   wore, restyled as a campaign section: the copy on the left is the campaign,
   the plate on the right is the campaign photograph — except this photograph is
   a live model.

   Two things keep it from costing anything it should not: the canvas is not
   mounted until the plate is nearly in view, and small or frugal devices get a
   still plate at the same size, with the same cloth note under it. */

/* The still that stands in for the model: the same cloth, photographed. */
const stillPlate = (cloth) => EDITORIAL.band[cloth] || EDITORIAL.band.twill;

export default function GarmentBand() {
  const plate = useRef(null);
  const [near, setNear] = useState(false);
  const [lite, setLite] = useState(false);
  const [cloth, setCloth] = useState(STAND_CLOTHS[0].key);
  const active = clothByKey(cloth);

  /* A phone, a metered connection or a very low-memory device gets the still
     plate: WebGL is replaced, not merely reduced. Everything else mounts the
     model and lets the in-canvas performance monitor drop its resolution. */
  useEffect(() => {
    const nav = navigator;
    const small = window.matchMedia('(max-width: 860px)').matches;
    const frugal = nav.connection?.saveData === true || (nav.deviceMemory && nav.deviceMemory <= 2);
    setLite(Boolean(small || frugal));
  }, []);

  useEffect(() => {
    const el = plate.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); io.disconnect(); }
    }, { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="campaign" data-parallax-scope aria-labelledby="campaign-title">
      <div className="campaign__inner wrap">
        <div className="campaign__copy">
          <p className="eyebrow">The stand</p>
          <h2 id="campaign-title" className="campaign__title">
            Cut on a body, then left to fall on its own.
          </h2>
          <p className="campaign__lede">
            Every piece is patterned twice: once flat, once on the stand. What you are looking at
            is that second pattern, in the cloth it was cut from — turning slowly, in the room the
            photographs are taken in.
          </p>

          <fieldset className="stand">
            <legend className="stand__legend">Cloth on the stand</legend>
            <div className="stand__options">
              {STAND_CLOTHS.map((c) => (
                <label key={c.key} className={`chip ${c.key === cloth ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="campaign-cloth"
                    value={c.key}
                    checked={c.key === cloth}
                    onChange={() => setCloth(c.key)}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            <p className="stand__spec" aria-live="polite">
              {active.weight}, {active.city} — {active.used.toLowerCase()}
            </p>
          </fieldset>

          <div className="campaign__actions">
            <Link to="/shop?department=Women&category=Formal" className="btn btn--solid">Shop the formals</Link>
            <a className="btn btn--ghost" href="#cloth">Read the cloth specs</a>
          </div>
        </div>

        <div className="campaign__plate" ref={plate}>
          <div className="campaign__stage" data-parallax-scope data-parallax-scale="1.06">
            {lite || !near ? (
              <img
                src={stillPlate(cloth)}
                alt={`${active.label} on the stand`}
                width="1000"
                height="1250"
                loading="lazy"
              />
            ) : (
              <Suspense fallback={<img src={stillPlate(cloth)} alt="" width="1000" height="1250" />}>
                <Scene3D clothKey={cloth} />
              </Suspense>
            )}
          </div>
          <dl className="campaign__caption">
            <div><dt>Cloth</dt><dd>{active.label}</dd></div>
            <div><dt>Weight</dt><dd>{active.weight}</dd></div>
            <div><dt>Mill</dt><dd>{active.mill}</dd></div>
            <div><dt>Composition</dt><dd>{active.composition}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
