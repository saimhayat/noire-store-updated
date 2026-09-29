/* One field for every form on the site — checkout, contact, newsletter — so a
   label, an error and an aria reference are wired the same way each time.
   `as` picks the control; the value always travels as (name, value). */
export default function Field({
  label,
  name,
  value,
  onChange,
  error,
  as = 'input',
  type = 'text',
  options = [],
  rows = 6,
  hint,
  wide,
  ...rest
}) {
  const id = `f-${name}`;
  const common = {
    id,
    name,
    value,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? `err-${name}` : undefined,
    onChange: (e) => onChange(name, e.target.value)
  };

  return (
    <label className={`field ${wide ? 'field--wide' : ''} ${error ? 'is-error' : ''}`} htmlFor={id}>
      <span className="field__label">{label}</span>
      {as === 'select' ? (
        <select {...common} {...rest}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea {...common} rows={rows} placeholder={hint} {...rest} />
      ) : (
        <input {...common} type={type} placeholder={hint} {...rest} />
      )}
      {error && <span className="field__error" id={`err-${name}`} role="alert">{error}</span>}
    </label>
  );
}
