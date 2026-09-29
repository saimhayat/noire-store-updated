/* Reviews, written once and handed out by product id — the same product always
   gets the same voices, so a page never reshuffles between visits. */

const POOL = [
  { name: 'Ayesha Siddiqui', city: 'Lahore', size: 'M', fit: 'True to size', date: '12 Jan', title: 'The lawn is the real thing', body: 'Washed it twice before wearing and the embroidery has not puckered once. The trouser is cut properly, not skimped — that is usually where a set like this gives itself away.' },
  { name: 'Bilal Chaudhry', city: 'Karachi', size: 'L', fit: 'Runs large', date: '04 Jan', title: 'Generous, in a good way', body: 'Ordered my usual size and it is genuinely roomy — went down one. Swapped without a fuss. The side seams are flat and straight, which you notice on a kurta because you sit in it all day.' },
  { name: 'Hina Qureshi', city: 'Islamabad', size: 'S', fit: 'True to size', date: '28 Dec', title: 'Deeper in person', body: 'The screen made it look lighter. In daylight it is a proper mustard with a warm edge under a lamp. Wore it to a mehndi and got asked about it three times.' },
  { name: 'Mariam Tariq', city: 'Faisalabad', size: 'M', fit: 'True to size', date: '19 Dec', title: 'Second order, same quality', body: 'This is my third piece from the shop. Delivery took three days across the country, the packaging is a card sleeve rather than plastic, and it arrived pressed.' },
  { name: 'Usman Raza', city: 'Rawalpindi', size: 'XL', fit: 'True to size', date: '11 Dec', title: 'Cut for the shoulder', body: 'Broad across the back without needing to size up, which never happens to me off the rack. The kurta length is right too — it does not ride up when you sit.' },
  { name: 'Sana Yousuf', city: 'Multan', size: 'S', fit: 'Runs small', date: '02 Dec', title: 'Take a size up if you are tall', body: 'The kameez is generous in the body but the shoulder line sat high on me, so I sized up and it drapes much better. Very glad I did.' },
  { name: 'Fatima Noor', city: 'Peshawar', size: 'L', fit: 'True to size', date: '24 Nov', title: 'Survived the wash', body: 'Three machine washes on cold, line dried, no shrinkage worth measuring and no fade in the print. The care label instructions are not decoration.' },
  { name: 'Priya Raman', city: 'Bengaluru', size: 'M', fit: 'True to size', date: '15 Nov', title: 'Quietly excellent', body: 'Nothing shouts on it. No logo, no branded hardware — the only mark is the woven label inside, and the stitching has not cracked anywhere.' },
  { name: 'Zainab Haider', city: 'Sialkot', size: '38', fit: 'True to size', date: '06 Nov', title: 'Softened to my foot in a week', body: 'No rubbing at the heel from day one, which juttis usually take a fortnight to reach. The sole is proper leather, so it can be repaired rather than thrown away.' },
  { name: 'Hannah Wolfe', city: 'Manchester', size: 'M', fit: 'Runs large', date: '27 Oct', title: 'Exactly the cut I wanted', body: 'Boxy without being a sack. I wear it over a long kameez and there is room without it reading as a parachute.' },
  { name: 'Yusuf Demir', city: 'Istanbul', size: 'XL', fit: 'True to size', date: '18 Oct', title: 'The collar holds', body: 'The stand collar is the part that always gives up first on a kurta. This one is still standing after a full season of wear.' },
  { name: 'Nadia Iqbal', city: 'Dubai', size: 'M', fit: 'True to size', date: '09 Oct', title: 'Repaired free, no receipt needed', body: 'I caught the hem on a door and tore the embroidery. They mended it and sent it back in nine days, pressed. That is the whole review.' }
];

/* The voices a product gets: picked from the id, so the page is stable. */
export function reviewsFor(product, count = 3) {
  const start = (product.id * 5) % POOL.length;
  return Array.from({ length: count }, (_, i) => POOL[(start + i * 4) % POOL.length]);
}

/* A stable count to sit under the star rating — twenty-odd reviews for a piece
   in a run of forty, never a thousand. */
export function reviewCount(product) {
  return 11 + ((product.id * 7) % 18);
}

export const RATING_COPY = {
  5: 'Exceptional',
  4: 'Very good',
  3: 'Fine',
  2: 'Not for me',
  1: 'Poor'
};
