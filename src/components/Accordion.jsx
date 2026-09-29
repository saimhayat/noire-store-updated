import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE } from '../lib/motion.js';

/* ---------------------------------------------------------------
   The disclosure — the FAQ answers, the shipping terms on a product page, and
   the filter groups down the side of the shop.

   `<details>` cannot be animated: the browser shows and hides its content in a
   single frame and there is nothing to hold on to. So this is a button and a
   panel with an animated height, which is what makes an answer feel like it was
   under the question all along rather than swapped in.

   Two shapes, one panel underneath: `Accordion` takes a list of questions and
   answers, and `Disclosure` takes a title and whatever it should hold — which
   is how the filters arrive with the same motion as the FAQ.

   A reduced-motion visitor gets the same markup with no animation: the panel is
   simply there or not there.
   --------------------------------------------------------------- */

function Panel({ open, id, labelledBy, children, still }) {
  return (
    <AnimatePresence initial={false}>
      {open && (still ? (
        <div className="disc__panel" id={id} role="region" aria-labelledby={labelledBy}>{children}</div>
      ) : (
        <motion.div
          className="disc__panel"
          id={id}
          role="region"
          aria-labelledby={labelledBy}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE, opacity: { duration: DUR.quick } }}
        >
          {children}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/* A written page: questions above, answers underneath. Any number can be open
   at once, because more than one of these is usually the answer. */
export function Accordion({ items, defaultOpen = -1, className = '' }) {
  const still = useReducedMotion();
  const uid = useId();
  const [open, setOpen] = useState(() => (defaultOpen >= 0 ? [defaultOpen] : []));

  return (
    <div className={`accordion ${className}`}>
      {items.map((item, i) => {
        const shown = open.includes(i);
        const panelId = `${uid}-p-${i}`;
        const buttonId = `${uid}-q-${i}`;
        return (
          <div className={`accordion__item ${shown ? 'is-open' : ''}`} key={item.q}>
            <h3 className="accordion__heading">
              <button
                type="button"
                id={buttonId}
                className="accordion__q"
                aria-expanded={shown}
                aria-controls={panelId}
                onClick={() => setOpen((list) => (list.includes(i) ? list.filter((n) => n !== i) : [...list, i]))}
              >
                {item.q}
                <span className="accordion__sign" aria-hidden="true" />
              </button>
            </h3>
            <Panel open={shown} id={panelId} labelledBy={buttonId} still={still}>
              <div className="accordion__a">{item.a}</div>
            </Panel>
          </div>
        );
      })}
    </div>
  );
}

/* One group of controls that folds away — the shop's filter groups. Same
   motion, the shop's own type. */
export function Disclosure({ title, children, className = '', open: startOpen = true }) {
  const still = useReducedMotion();
  const uid = useId();
  const [open, setOpen] = useState(startOpen);
  const panelId = `${uid}-panel`;
  const buttonId = `${uid}-button`;

  return (
    <div className={`disc ${open ? 'is-open' : ''} ${className}`}>
      <button
        type="button"
        id={buttonId}
        className="disc__head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span className="disc__sign" aria-hidden="true" />
      </button>
      <Panel open={open} id={panelId} labelledBy={buttonId} still={still}>
        <div className="disc__body">{children}</div>
      </Panel>
    </div>
  );
}

export default Accordion;
