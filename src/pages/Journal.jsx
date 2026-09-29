import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { JOURNAL } from '../data/info.js';
import useParallax from '../hooks/useParallax.js';

/* The house writes when it has something worth saying — cloth, cuts, and the
   reasoning behind the runs. An index, not a grid: three pieces is not a feed. */
export default function Journal() {
  const ref = useRef(null);

  useEffect(() => { document.title = 'Journal | NOIRÉ'; return () => { document.title = 'NOIRÉ | Modern Fashion'; }; }, []);
  useParallax(ref);

  return (
    <div className="page journal" ref={ref}>
      <header className="page__head">
        <h1 className="section__title" data-reveal>
          <span className="mask"><span data-reveal-item>The journal</span></span>
        </h1>
        <p className="page__lede">Notes from the table in Lahore — what came off it, what went wrong, and why nothing is restocked.</p>
      </header>

      <RevealGroup className="journal__list" stagger={0.08}>
        {JOURNAL.map((post) => (
          <RevealItem as="article" className="post" key={post.slug}>
            <Link className="post__media" to={`/journal/${post.slug}`} tabIndex={-1} aria-hidden="true">
              <img src={post.image} alt="" width="1200" height="800" loading="lazy" />
            </Link>
            <div className="post__body">
              <p className="post__meta">{post.tag} · {post.date} · {post.read} read</p>
              <h2 className="post__title">
                <Link to={`/journal/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="post__excerpt">{post.excerpt}</p>
              <Link className="link-underline" to={`/journal/${post.slug}`}>Read the piece</Link>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
