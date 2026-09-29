import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Disclosure } from './Accordion.jsx';
import { COLOURS } from '../data/products.js';
import { figure } from '../lib/format.js';

/* One set of filter groups, printed twice: in the sidebar on a wide screen and
   in the bottom sheet on a phone. The markup is written once so the two can
   never disagree about what the shop offers. */

const OFF = [10, 25, 40];

/* The groups open and shut with the same motion as the FAQ, so a filter does
   not arrive more abruptly than a written answer. */
function Group({ title, children, open = true }) {
  return (
    <Disclosure title={title} className="fgroup" open={open}>
      {children}
    </Disclosure>
  );
}

const inList = (list, value) => list.includes(value);

export function FilterGroups({ facets, state, patch }) {
  const toggle = (key, value) => {
    const next = inList(state[key], value) ? state[key].filter((v) => v !== value) : [...state[key], value];
    patch({ [key]: next });
  };

  return (
    <div className="fgroups">
      <Group title="Department">
        <ul className="fopts">
          <li>
            <label className="fopt">
              <input type="radio" name="department" checked={!state.department} onChange={() => patch({ department: '' })} />
              <span>Everything</span>
              <em>{figure(facets.total)}</em>
            </label>
          </li>
          {facets.departments.map((d) => (
            <li key={d.key}>
              <label className="fopt">
                <input type="radio" name="department" checked={state.department === d.key} onChange={() => patch({ department: d.key })} />
                <span>{d.key}</span>
                <em>{figure(d.count)}</em>
              </label>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Category">
        <ul className="fopts fopts--long">
          {facets.categories.map((c) => (
            <li key={c.key}>
              <label className="fopt">
                <input type="checkbox" checked={inList(state.category, c.key)} onChange={() => toggle('category', c.key)} />
                <span>{c.key}</span>
                <em>{figure(c.count)}</em>
              </label>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Brand">
        <ul className="fopts fopts--long">
          {facets.brands.map((b) => (
            <li key={b.key}>
              <label className="fopt">
                <input type="checkbox" checked={inList(state.brand, b.key)} onChange={() => toggle('brand', b.key)} />
                <span>{b.key}</span>
                <em>{figure(b.count)}</em>
              </label>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Size">
        <div className="fchips">
          {facets.sizes.map((s) => (
            <button
              key={s}
              type="button"
              className={`fchip ${inList(state.size, s) ? 'is-on' : ''}`}
              onClick={() => toggle('size', s)}
              aria-pressed={inList(state.size, s)}
            >
              {s}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Colour">
        <div className="fchips">
          {facets.colours.map((c) => (
            <button
              key={c}
              type="button"
              className={`fchip fchip--swatch ${inList(state.colour, c) ? 'is-on' : ''}`}
              onClick={() => toggle('colour', c)}
              aria-pressed={inList(state.colour, c)}
              aria-label={COLOURS[c]?.name || c}
              title={COLOURS[c]?.name || c}
            >
              <span className={`dot dot--${c}`} aria-hidden="true" />
              <span className="fchip__name">{COLOURS[c]?.name || c}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Price">
        <label className="frange">
          <span className="frange__label">Up to Rs. {figure(state.max)}</span>
          <input
            type="range"
            min="2000"
            max={facets.max}
            step="500"
            value={state.max}
            onChange={(e) => patch({ max: Number(e.target.value) })}
          />
        </label>
        <p className="frange__hint">Everything in the shop sits between Rs. 2,999 and Rs. {figure(facets.max)}.</p>
      </Group>

      <Group title="Availability">
        <ul className="fopts">
          <li>
            <label className="fopt">
              <input type="radio" name="stock" checked={!state.stock} onChange={() => patch({ stock: '' })} />
              <span>Everything, including sold out</span>
            </label>
          </li>
          <li>
            <label className="fopt">
              <input type="radio" name="stock" checked={state.stock === '1'} onChange={() => patch({ stock: '1' })} />
              <span>In stock only</span>
            </label>
          </li>
        </ul>
      </Group>

      <Group title="Discount">
        <ul className="fopts">
          <li>
            <label className="fopt">
              <input type="radio" name="off" checked={!state.off} onChange={() => patch({ off: '' })} />
              <span>Any price</span>
            </label>
          </li>
          {OFF.map((o) => (
            <li key={o}>
              <label className="fopt">
                <input type="radio" name="off" checked={state.off === String(o)} onChange={() => patch({ off: String(o) })} />
                <span>{o}% off or more</span>
              </label>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  );
}

/* The sidebar. Sticky, so the filters stay put while the grid is scrolled —
   which is the whole reason a shopper uses a sidebar instead of a sheet. */
export default function FilterBar({ facets, state, patch, clear, activeCount, count }) {
  return (
    <div className="fbar">
      <div className="fbar__head">
        <h2 className="fbar__title">Filters</h2>
        <button type="button" className="fbar__clear" onClick={clear} disabled={!activeCount}>
          Clear all{activeCount ? ` (${activeCount})` : ''}
        </button>
      </div>
      <FilterGroups facets={facets} state={state} patch={patch} />
      <p className="fbar__foot" aria-live="polite">{figure(count)} pieces</p>
    </div>
  );
}

/* The sheet: a phone gets the same controls, in a drawer it can thumb through,
   with the count on the button that closes it. */
export function FilterSheet({ open, onClose, count, facets, state, patch, clear, activeCount }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.body.classList.add('no-scroll');
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="bottomsheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="bottomsheet__head">
              <h2>Filters</h2>
              <div className="bottomsheet__tools">
                <button type="button" className="fbar__clear" onClick={clear} disabled={!activeCount}>Clear{activeCount ? ` (${activeCount})` : ''}</button>
                <button type="button" className="bottomsheet__close" onClick={onClose} aria-label="Close filters">Close</button>
              </div>
            </header>
            <div className="bottomsheet__body">
              <FilterGroups facets={facets} state={state} patch={patch} />
            </div>
            <footer className="bottomsheet__foot">
              <button type="button" className="btn btn--solid btn--block" onClick={onClose}>Show {figure(count)} pieces</button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
