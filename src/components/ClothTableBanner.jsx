import { Link } from 'react-router-dom';

/* The four cloths the shop buys the whole run of, laid out as a table the way a
   magazine runs a specification spread — one banner, one subject, no surrounding
   rail. The reader comes here to understand what the cloth actually is, not to
   compare prices. */

const CLOTHS = [
  {
    cloth: 'Handloom khaddar',
    composition: '100% handloom cotton',
    weight: '240 g/m²',
    mill: 'Faisalabad, Punjab',
    usedFor: 'Kurtas and everyday kameez'
  },
  {
    cloth: 'Combed cotton lawn',
    composition: '100% combed cotton',
    weight: '110 g/m²',
    mill: 'Lahore, Punjab',
    usedFor: 'Lawn suits and summer formals'
  },
  {
    cloth: 'Wool-silk pashmina',
    composition: '70% wool, 30% silk',
    weight: '260 g/m²',
    mill: 'Karachi, Sindh',
    usedFor: 'Shawls and winter kameez'
  },
  {
    cloth: 'Cotton cambric',
    composition: '100% cotton cambric',
    weight: '150 g/m²',
    mill: 'Faisalabad, Punjab',
    usedFor: 'Kurtas and everyday shalwar kameez'
  }
];

export default function ClothTableBanner({ title = 'Three cloths, held for two seasons.', body, to = '/shop', link = 'See the cloths' }) {
  return (
    <section className="cloth-table" aria-labelledby="cloth-table-title">
      <div className="cloth-table__inner wrap">
        <div className="cloth-table__note">
          {body && (
            <p className="cloth-table__lede">{body}</p>
          )}
          <table className="specs specs--cloth" aria-label="Cloth specifications">
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
              {CLOTHS.map((c) => (
                <tr key={c.cloth}>
                  <th>{c.cloth}</th>
                  <td>{c.composition}</td>
                  <td>{c.weight}</td>
                  <td>{c.mill}</td>
                  <td>{c.usedFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to={to} className="link-underline link-underline--flat">{link}</Link>
        </div>
      </div>
    </section>
  );
}
