const PROMISES = [
  { term: 'Free delivery', detail: 'On every order over Rs. 5,000, countrywide' },
  { term: '30-day returns', detail: 'Unworn, with the tag attached — exchanges free' },
  { term: 'Cash on delivery', detail: 'Card, wallet transfer or cash at the door' },
  { term: 'Free repairs', detail: 'Seams, linings, buttons and moth holes, for the life of the piece' }
];

/* The promises, stated once, without a single icon or shadow. A shop that has
   four real things to say does not need to animate them. */
export default function Band() {
  return (
    <section className="band" aria-label="Shop promises">
      <div className="band__inner wrap">
        {PROMISES.map((p) => (
          <div className="band__item" key={p.term}>
            <h3>{p.term}</h3>
            <p>{p.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
