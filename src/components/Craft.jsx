import { EDITORIAL } from '../data/photography.js';

const FACTS = [
  { term: 'Runs of forty', detail: 'Each cut is released in forty pieces per size run, then closed. No restocks, no second colourways.' },
  { term: 'Repairs, free', detail: 'Send anything back and we mend it — seams, linings, buttons, torn embroidery. You pay the postage one way.' },
  { term: 'Held cloth', detail: 'The cloths in the table below are bought whole and stored. If a piece sells out, its cloth is still on the shelf.' }
];

/* The section that answers "where does this come from", which is the real
   question a premium price has to answer. One plate, three facts, no cards. */
export default function Craft() {
  return (
    <section className="craft section" aria-labelledby="craft-title">
      <div className="craft__plate" data-parallax-scope>
        <img
          src={EDITORIAL.atelier}
          alt="A shoemaker at his bench, stitching a leather upper by hand in Sindh"
          loading="lazy"
          width="1200"
          height="1500"
          data-parallax="0.16"
          data-parallax-scale="1.14"
        />
      </div>

      <div className="craft__body">
        <h2 id="craft-title" className="section__title" data-reveal>
          <span className="mask"><span data-reveal-item>Cut in Lahore,</span></span>
          <span className="mask"><span data-reveal-item>stitched in Sialkot.</span></span>
        </h2>
        <p className="craft__lede" data-reveal>
          <span className="mask"><span data-reveal-item>The cutting table has been in the same Lahore room since 1974.</span></span>
          <span className="mask"><span data-reveal-item>Every pattern is cut there, tested on a body, and cut again.</span></span>
        </p>
        <dl className="facts">
          {FACTS.map((f) => (
            <div className="facts__row" key={f.term}>
              <dt>{f.term}</dt>
              <dd>{f.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
