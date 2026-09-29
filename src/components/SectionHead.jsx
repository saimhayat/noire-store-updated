import { Link } from 'react-router-dom';

/* Every rail on the site opens the same way: a small label, a heading, an
   optional line of copy, and one link to the rest of it. Section heads are the
   rhythm of the homepage, so they are one component rather than six. */
export default function SectionHead({ eyebrow, title, text, to, link = 'View all', id, align = 'row' }) {
  return (
    <header className={`shead shead--${align}`}>
      <div className="shead__main">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="shead__title" id={id} data-reveal>
          <span className="mask"><span data-reveal-item>{title}</span></span>
        </h2>
        {text && <p className="shead__text">{text}</p>}
      </div>
      {to && <Link to={to} className="shead__link link-underline">{link}</Link>}
    </header>
  );
}
