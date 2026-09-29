import { useEffect, useRef, useState } from 'react';
import Field from '../components/Field.jsx';
import { CONTACT } from '../data/info.js';
import { useToast } from '../context/ToastContext.jsx';
import useParallax from '../hooks/useParallax.js';

const TOPICS = ['An order', 'A return or exchange', 'Fit and sizing', 'The cloth', 'Press and wholesale', 'Something else'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* A letter rather than a ticket: one field set, a real check on every line,
   and an honest answer about what happens next (a person replies, within a
   working day). There is no server, so the confirmation is the whole
   transaction — the copy says so plainly. */
export default function Contact() {
  const ref = useRef(null);
  const { toast } = useToast() || {};
  const [values, setValues] = useState({ name: '', email: '', topic: TOPICS[0], message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { document.title = 'Contact | NOIRÉ'; return () => { document.title = 'NOIRÉ | Modern Fashion'; }; }, []);
  useParallax(ref);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!values.name.trim()) err.name = 'Tell us who you are.';
    if (!EMAIL.test(values.email.trim())) err.email = 'We need a reply address.';
    if (values.message.trim().length < 12) err.message = 'A sentence or two, so we can answer properly.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setValues({ name: '', email: '', topic: TOPICS[0], message: '' });
    toast?.('Message sent — a reply lands within one working day.');
  };

  return (
    <div className="page contact" ref={ref}>
      <header className="page__head">
        <h1 className="section__title" data-reveal>
          <span className="mask"><span data-reveal-item>Write to us</span></span>
        </h1>
        <p className="page__lede">{CONTACT.lede}</p>
      </header>

      <div className="contact__grid">
        <form className="contact__form" onSubmit={submit} noValidate>
          <div className="fields">
            <Field label="Your name" name="name" value={values.name} onChange={set} error={errors.name} autoComplete="name" />
            <Field label="Email" name="email" value={values.email} onChange={set} error={errors.email} type="email" autoComplete="email" hint="you@example.com" />
            <Field label="What is it about" name="topic" as="select" options={TOPICS} value={values.topic} onChange={set} wide />
            <Field label="Message" name="message" as="textarea" value={values.message} onChange={set} error={errors.message} hint="Order number if you have one, and your size if it is a fit question." wide />
          </div>
          <div className="checkout__actions">
            <button type="submit" className="btn btn--solid">Send it</button>
            <span className="text-steel">We reply within a working day, Pakistan time.</span>
          </div>
        </form>

        <aside className="contact__aside" aria-label="Other ways to reach us">
          <h2 className="checkout__subhead">Direct</h2>
          <dl className="facts facts--tight">
            {CONTACT.rows.map((r) => (
              <div className="facts__row" key={r.term}><dt>{r.term}</dt><dd>{r.detail}</dd></div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
