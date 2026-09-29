import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const num = (value, fallback) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

/* One place where scroll behaviour is defined. Elements opt in with attributes:

     data-parallax="0.4"        travels 0.4 × viewport as it crosses the screen
                                (positive rises — foreground; negative lags — background)
     data-parallax-axis="x"     travel sideways instead
     data-parallax-scale="1.12" a plate that settles into place as it arrives
     data-parallax-scope        marks the element that drives its children's travel
     data-reveal                masks its [data-reveal-item] children, once

   Everything here is skipped when the visitor asks for reduced motion: the page
   still reads, because every element's resting state is its final state. */
export default function useParallax(scopeRef, deps = []) {
  useLayoutEffect(() => {
    const scope = scopeRef?.current;
    if (!scope) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-parallax]', scope).forEach((el) => {
          const speed = num(el.dataset.parallax, 0.2);
          const axis = el.dataset.axis === 'x' ? 'x' : 'y';
          const travel = () => (axis === 'x' ? (speed * window.innerWidth) / 2 : (speed * window.innerHeight) / 2);
          gsap.fromTo(
            el,
            { [axis]: () => travel() },
            {
              [axis]: () => -travel(),
              ease: 'none',
              scrollTrigger: {
                trigger: el.closest('[data-parallax-scope]') || el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true
              }
            }
          );
        });

        gsap.utils.toArray('[data-parallax-scale]', scope).forEach((el) => {
          const scale = num(el.dataset.parallaxScale, 1.12);
          gsap.fromTo(
            el,
            { scale },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el.closest('[data-parallax-scope]') || el.parentElement,
                start: 'top bottom',
                end: 'center center',
                scrub: true
              }
            }
          );
        });

        gsap.utils.toArray('[data-reveal]', scope).forEach((el) => {
          const items = el.querySelectorAll('[data-reveal-item]');
          if (!items.length) return;
          gsap.from(items, {
            yPercent: 108,
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.075,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
        });
      });
    }, scope);

    // images and webfonts land after the triggers are measured
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    const t = window.setTimeout(refresh, 1200);

    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
