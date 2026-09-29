import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* One letter a month: what came in, what is left of the run, and the one thing
   worth buying before the season turns. Two shapes — the wide band the homepage
   closes on, and the small form in the footer — one form, one validation. */
export default function Newsletter({ variant = 'footer' }) {
  const { toast } = useToast() || {};
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const band = variant === 'band';

  const submit = (e) => {
    e.preventDefault();
    if (!VALID.test(email.trim())) {
      setError('That address does not look right.');
      return;
    }
    setError('');
    setEmail('');
    toast?.('You are on the list — the next letter goes out on the first.');
  };

  return (
    <form className={`sign sign--${variant}`} onSubmit={submit} noValidate>
      {band ? (
        <h2 className="sign__title">The letter</h2>
      ) : (
        <h2 className="sign__label">Join the list</h2>
      )}
      <p className="sign__note">
        {band
          ? 'One note a month: what came off the table, and what is left of the run. No restock alerts, no discount codes, unsubscribe in one click.'
          : 'One note a month, and first look at each new arrival.'}
      </p>
      <div className="sign__row">
        <label className="sign__field">
          <span className="sign__sr">Email address</span>
          <input
            id={`sign-email-${variant}`}
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `sign-error-${variant}` : undefined}
          />
        </label>
        <button className="btn btn--solid" type="submit">Sign up</button>
      </div>
      {error && <p className="sign__error" id={`sign-error-${variant}`} role="alert">{error}</p>}
    </form>
  );
}
