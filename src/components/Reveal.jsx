import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE, ITEM, STACK, VIEWPORT } from '../lib/motion.js';

/* ---------------------------------------------------------------
   Turning the motion language into three components.

   <Reveal>       one element that rises once, as it comes into view.
   <RevealGroup>  a rail or a list, whose <RevealItem> children arrive in order.
   <RevealItem>   one thing in that order.

   Every one of them reads `prefers-reduced-motion` itself and, when it is set,
   renders the plain element with no initial state at all — not a faster
   animation, no animation. That is why the site can be read start to finish
   with motion switched off.
   --------------------------------------------------------------- */

const MOTION = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  dl: motion.dl,
  p: motion.p,
  span: motion.span,
  figure: motion.figure
};

export default function Reveal({ as = 'div', children, className, y = 18, delay = 0, duration = DUR.slow, ...rest }) {
  const still = useReducedMotion();
  if (still) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const Tag = MOTION[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* A rail: the parent holds the timing, the items hold their own place in it.
   Children inherit the variant state from here, which is why a card only has to
   say `variants={ITEM}` to take part. */
export function RevealGroup({ as = 'div', children, className, stagger = 0.055, delay = 0.05, ...rest }) {
  const still = useReducedMotion();
  if (still) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const Tag = MOTION[as] || motion.div;
  return (
    <Tag
      className={className}
      variants={STACK(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as = 'div', children, className, variants = ITEM, ...rest }) {
  const still = useReducedMotion();
  if (still) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const Tag = MOTION[as] || motion.div;
  return <Tag className={className} variants={variants} {...rest}>{children}</Tag>;
}
