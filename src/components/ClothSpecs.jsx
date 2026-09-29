import { CLOTH_PRESETS } from '../data/cloth.js';

/* What the season is actually made of, stated the way a mill states it.
   A table, because this is genuinely tabular — not a row of cards. */
export default function ClothSpecs() {
  return (
    <section className="cloth section" id="cloth" aria-labelledby="cloth-title">
      <header className="cloth__head">
        <h2 id="cloth-title" className="section__title" data-reveal>
          <span className="mask"><span data-reveal-item>Three cloths,</span></span>
          <span className="mask"><span data-reveal-item>held for two seasons.</span></span>
        </h2>
        <p className="cloth__note" data-reveal>
          <span className="mask"><span data-reveal-item>We buy the whole run up front and keep it.</span></span>
          <span className="mask"><span data-reveal-item>Nothing here is re-cut in a cheaper cloth later.</span></span>
        </p>
      </header>

      <table className="specs">
        <caption className="specs__caption">Winter 26 cloth</caption>
        <thead>
          <tr>
            <th scope="col">Cloth</th>
            <th scope="col">Composition</th>
            <th scope="col">Weight</th>
            <th scope="col">Mill</th>
            <th scope="col">Used for</th>
          </tr>
        </thead>
        <tbody>
          {CLOTH_PRESETS.map((c) => (
            <tr key={c.key}>
              <th scope="row">{c.label}</th>
              <td>{c.composition}</td>
              <td className="specs__num">{c.weight}</td>
              <td>{c.mill}</td>
              <td>{c.used}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
