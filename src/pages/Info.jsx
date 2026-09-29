import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { INFO } from '../data/info.js';
import Accordion from '../components/Accordion.jsx';
import { SizeTable } from '../components/SizeGuide.jsx';
import { chartFor } from '../data/sizes.js';
import useParallax from '../hooks/useParallax.js';

/* One component behind every written page — /faq, /shipping, /returns,
   /about, /story, /careers and /size-guide are this file reading one entry out
   of src/data/info.js. Content lives there; this decides how a block renders. */
function Block({ block }) {
  if (block.kind === 'sizechart') {
    /* every chart the shop uses, in one page: clothing, shoes and children are
       measured differently and a shopper should not have to guess which is which */
    const charts = [chartFor('Women'), chartFor('Footwear'), chartFor('Kids')].filter(Boolean);
    return (
      <section className="prose sizechart">
        {charts.map((chart) => (
          <div className="sizechart__block" key={chart.title}>
            <h3 className="prose__head">{chart.title}</h3>
            <SizeTable chart={chart} />
            <dl className="facts facts--tight">
              {chart.notes.map((f) => <div className="facts__row" key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>)}
            </dl>
          </div>
        ))}
      </section>
    );
  }

  if (block.kind === 'table') {
    return (
      <section className="prose">
        <h3 className="prose__head">{block.heading}</h3>
        <table className="specs">
          <thead><tr>{block.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (j === 0
                  ? <th key={j} scope="row">{cell}</th>
                  : <td key={j} className={j === 1 ? 'specs__num' : undefined}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  if (block.kind === 'list') {
    return (
      <section className="prose">
        <h3 className="prose__head">{block.heading}</h3>
        <dl className="facts facts--tight">
          {block.items.map((f) => <div className="facts__row" key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>)}
        </dl>
      </section>
    );
  }

  if (block.kind === 'accordion') {
    return (
      <section className="prose">
        <h3 className="prose__head">{block.heading}</h3>
        <Accordion
          items={block.items}
          defaultOpen={block.heading === 'Orders and sizing' ? 0 : -1}
        />
      </section>
    );
  }

  return (
    <section className="prose">
      {block.heading && <h3 className="prose__head">{block.heading}</h3>}
      {block.body.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
    </section>
  );
}

export default function Info({ page }) {
  const ref = useRef(null);
  const data = INFO[page];

  useEffect(() => {
    if (!data) return undefined;
    document.title = `${data.title} | NOIRÉ`;
    return () => { document.title = 'NOIRÉ | Modern Fashion'; };
  }, [data]);

  useParallax(ref, [page]);

  if (!data) return null;

  return (
    <div className="page" ref={ref}>
      <header className="page__head">
        <h1 className="section__title" data-reveal>
          <span className="mask"><span data-reveal-item>{data.title}</span></span>
        </h1>
        <p className="page__lede">{data.lede}</p>
        {data.cta && <Link className="btn btn--solid" to={data.cta.to}>{data.cta.label}</Link>}
      </header>
      <div className="page__body">
        {data.blocks.map((b, i) => <Block block={b} key={i} />)}
      </div>
    </div>
  );
}
