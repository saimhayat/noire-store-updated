import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib/motion.js';

/* ---------------------------------------------------------------
   The stepper, in one place: the bag line, the product page, and anything else
   that needs a count. Two buttons and a number.

   The number is the part worth animating. It is what changes when you press a
   button, so it rolls in the direction you pressed rather than being replaced:
   up for a larger count, down for a smaller one. The digits themselves are
   hidden from assistive technology and one plain sentence behind them carries
   the value, because a number that exists twice mid-animation would otherwise
   be read twice.
   --------------------------------------------------------------- */

export default function Quantity({ value, onChange, min = 0, max = 99, big = false, label = 'quantity' }) {
  const still = useReducedMotion();
  const clamp = (n) => Math.max(min, Math.min(max, n));

  return (
    <div className={`qty ${big ? 'qty--big' : ''}`}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>

      <span className="qty__num" aria-hidden="true">
        {still ? (
          value
        ) : (
          <AnimatePresence initial={false}>
            <motion.span
              key={value}
              className="qty__digit"
              initial={{ y: '0.85em', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-0.85em', opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
      <span className="sr-only" aria-live="polite">{`${value} ${value === 1 ? 'item' : 'items'}`}</span>

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
