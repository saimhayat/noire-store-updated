import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { JOURNAL, journalPost } from '../data/info.js';
import useParallax from '../hooks/useParallax.js';

/* One entry, read end to end: the piece, the author line the house uses, and
   whichever entry comes next — a journal you can only enter, not leave, is a
   dead end with nicer type. */
export default function JournalPost() {
  const { slug } = useParams();
  const ref = useRef(null);
  const post = journalPost(slug);
  const at = JOURNAL.findIndex((p) => p.slug === slug);
  const next = post ? JOURNAL[(at + 1) % JOURNAL.length] : null;

  useEffect(() => {
    document.title = post ? `${post.title} | NOIRÉ Journal` : 'Journal | NOIRÉ';
    return () => { document.title = 'NOIRÉ | Modern Fashion'; };
  }, [post]);

  useParallax(ref, [slug]);

  if (!post) {
    return (
      <div className="page" ref={ref}>
        <div className="page__head">
          <h1 className="section__title">That piece has been filed</h1>
          <p className="page__lede">The entry you asked for is not on this shelf.</p>
          <Link className="btn btn--solid" to="/journal">Back to the journal</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="page post-page" ref={ref}>
      <header className="page__head post-page__head">
        <p className="post__meta">{post.tag} · {post.date} · {post.read} read</p>
        <h1 className="section__title" data-reveal>
          <span className="mask"><span data-reveal-item>{post.title}</span></span>
        </h1>
        <p className="page__lede">{post.excerpt}</p>
      </header>

      <figure className="post-page__plate" data-parallax-scope>
        <img
          src={post.image}
          alt={post.title}
          width="1600"
          height="1067"
          data-parallax="0.14"
          data-parallax-scale="1.12"
        />
      </figure>

      <div className="prose post-page__body">
        {post.body.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
      </div>

      <footer className="post-page__foot">
        <Link className="link-underline" to="/journal">All entries</Link>
        {next && next.slug !== post.slug && (
          <Link className="post-page__next" to={`/journal/${next.slug}`}>
            <span className="post__meta">Next</span>
            <span className="post__title">{next.title}</span>
          </Link>
        )}
      </footer>
    </article>
  );
}
