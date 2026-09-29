import { Link } from 'react-router-dom';
import SectionHead from './SectionHead.jsx';
import { DEPARTMENTS } from '../data/products.js';
import { pieceCount } from '../lib/format.js';

/* The departments, as six plates. Labels sit under the photograph rather than
   over it: on a white page a caption does not need a scrim to be read. */
export default function CategorySection() {
  return (
    <section className="section" aria-labelledby="cat-title" data-parallax-scope>
      <SectionHead
        id="cat-title"
        eyebrow="Departments"
        title="Shop by department"
        to="/shop"
        link="Browse everything"
      />
      <div className="catgrid">
        {DEPARTMENTS.map((d, i) => (
          <Link key={d.key} to={d.to} className="catgrid__tile">
            <span className="catgrid__media">
              <img
                src={d.image}
                alt={`${d.title} department`}
                width="900"
                height="1125"
                loading={i < 3 ? 'eager' : 'lazy'}
                decoding="async"
                data-parallax="0.045"
                data-parallax-scale="1.05"
              />
            </span>
            <span className="catgrid__label">
              <span className="catgrid__title">{d.title}</span>
              <span className="catgrid__count">{pieceCount(d.count)}</span>
            </span>
            <span className="catgrid__text">{d.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
