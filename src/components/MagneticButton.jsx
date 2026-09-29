import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* A button that leans toward the cursor and springs back when it leaves.
   The transform is applied imperatively, so the markup carries no inline
   styles, and it stands down when the visitor asks for reduced motion. */
export default function MagneticButton({ as = 'button', children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });
    const pull = 0.25;

    const move = (e) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * pull);
      yTo((e.clientY - (r.top + r.height / 2)) * pull);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
    };
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
}
