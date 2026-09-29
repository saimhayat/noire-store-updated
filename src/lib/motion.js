/* ---------------------------------------------------------------
   NOIRÉ — the motion language

   One place where the shop's movement is described, so a drawer, a plate and a
   rail of cards arrive the same way. Two rules hold everywhere:

   1. Nothing travels further than it has to. Type rises a few pixels, a panel
      is a panel, and nothing bounces or overshoots its resting place.
   2. Nothing moves at all when the visitor has asked for stillness. Anything
      built from these values is skipped by <Reveal>, and <MotionConfig> in
      App.jsx removes the transforms from every other motion component, so each
      element's resting state is also its final state.

   GSAP keeps the scroll work (parallax, the masked headings) because that is
   tied to the Lenis ticker; everything the pointer and the router do lives here.
   --------------------------------------------------------------- */

/* The same curve the CSS uses (--ease), so a hover and an entrance agree. */
export const EASE = [0.22, 1, 0.36, 1];

export const DUR = {
  quick: 0.2, // a state change: a chip, a digit
  base: 0.32, // a panel opening
  slow: 0.6, // a plate arriving
  veil: 1.1 // a whole page turning over
};

/* A rail starts moving a little before it reaches the fold, so the arrival has
   finished by the time the eye lands on it — and it only ever happens once. */
export const VIEWPORT = { once: true, margin: '-6% 0px -8% 0px' };

/* --- a list arriving in order --------------------------------------------- */

export const STACK = (stagger = 0.055, delayChildren = 0.05) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } }
});

export const ITEM = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE } }
};

/* --- a link inside a panel: shorter travel, because there are many --------- */

export const LINK = {
  hidden: { opacity: 0, y: 7 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } }
};

/* --- a plate settling: it arrives just barely larger than rest ------------- */

export const SETTLE = {
  hidden: { opacity: 0, scale: 1.02 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.veil, ease: EASE } }
};
