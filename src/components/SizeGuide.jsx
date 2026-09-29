import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SIZE_COLS, chartFor, sizeRows } from '../data/sizes.js';

/* The default chart is the shirt one — every other department passes its own, so
   a boot never gets a chest measurement. The table stays a table: this is
   genuinely tabular information. */
const DEFAULT_CHART = { cols: SIZE_COLS, rows: sizeRows, caption: 'Centimetres, measured flat on the garment', notes: [] };

export function SizeTable({ chart = DEFAULT_CHART }) {
  return (
    <table className="specs specs--size">
      <caption className="specs__caption">{chart.caption}</caption>
      <thead>
        <tr>
          <th scope="col">Size</th>
          {chart.cols.map((c) => <th key={c} scope="col">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {chart.rows.map((r) => (
          <tr key={r.size}>
            <th scope="row">{r.size}</th>
            {chart.cols.map((c) => <td key={c} className="specs__num">{r[c]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Notes({ notes }) {
  if (!notes?.length) return null;
  return (
    <dl className="facts facts--tight">
      {notes.map((f) => (
        <div className="facts__row" key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>
      ))}
    </dl>
  );
}

/* The chart as a sheet, opened from a product page so the fit question is
   answered where it is asked. */
export default function SizeGuide({ open, onClose, chart, department }) {
  const table = chart || chartFor(department) || DEFAULT_CHART;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={table.title || 'Size guide'}
            initial={{ opacity: 0, y: 26, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 18, x: '-50%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="sheet__head">
              <h2 className="sheet__title">{table.title || 'Size guide'}</h2>
              <button type="button" onClick={onClose} aria-label="Close size guide">Esc</button>
            </header>
            <div className="sheet__body">
              <SizeTable chart={table} />
              <Notes notes={table.notes} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
