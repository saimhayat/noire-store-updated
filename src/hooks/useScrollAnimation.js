import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Stacking cards: each sticky card recedes (scales down, dims) as the next one slides over it.
export default function useStackCards(scopeRef) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.stack__card', scopeRef.current);
      cards.slice(0, -1).forEach((card, i) => {
        const scrub = { trigger: cards[i + 1], start: 'top bottom', end: 'top 25%', scrub: true };
        gsap.to(card.querySelector('.stack__body'), { scale: 0.92, ease: 'none', scrollTrigger: scrub });
        gsap.to(card.querySelector('.stack__shade'), { opacity: 0.65, ease: 'none', scrollTrigger: scrub });
      });
    });
    return () => mm.revert();
  }, [scopeRef]);
}
