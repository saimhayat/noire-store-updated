import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ANNOUNCEMENTS } from '../data/nav.js';

/* The strip above the header: one line of shop news at a time, walking through
   the list every few seconds. Dismissible, and it stays dismissed for the
   session — a bar that comes back on every route is an advert you cannot close. */
export default function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [closed, setClosed] = useState(() => {
    try { return sessionStorage.getItem('noire-ann') === 'off'; } catch { return false; }
  });

  useEffect(() => {
    if (closed) return undefined;
    const id = window.setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), 5200);
    return () => window.clearInterval(id);
  }, [closed]);

  const close = () => {
    setClosed(true);
    try { sessionStorage.setItem('noire-ann', 'off'); } catch { /* private mode */ }
  };

  if (closed) return null;
  const item = ANNOUNCEMENTS[i];

  return (
    <div className="ann">
      <div className="ann__inner">
        {/* no `mode="wait"`: the old line leaves as the new one arrives, so the
            bar is never empty between two messages */}
        <AnimatePresence initial={false}>
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={item.to} className="ann__msg">{item.text}</Link>
          </motion.div>
        </AnimatePresence>
        <button type="button" className="ann__close" onClick={close} aria-label="Dismiss announcement">Close</button>
      </div>
    </div>
  );
}
