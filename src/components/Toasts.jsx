import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../context/ToastContext.jsx';

/* The stack itself. Bottom-left, because the cart occupies the right of the
   screen — a confirmation that slid out from under the drawer it caused would
   be worse than none. Reads as a strip of card with a hairline, not a floating
   blob with a shadow. */
export default function Toasts() {
  const ctx = useToast();
  if (!ctx) return null;
  const { toasts } = ctx;

  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.p
            key={t.id}
            className={`toast ${t.tone === 'warn' ? 'toast--warn' : ''}`}
            initial={{ opacity: 0, y: 14, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="status"
          >
            <span className="toast__mark" aria-hidden="true" />
            {t.message}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
}
