/* The size chart, in centimetres — the same figures the size-guide sheet, the
   product page and /size-guide all print. Measured flat on the garment, not on
   a body: NOIRÉ cuts oversized, so the chest number is the finished garment. */
export const SIZE_COLS = ['Chest', 'Shoulder', 'Length', 'Sleeve'];

export const sizeRows = [
  { size: 'S', Chest: 106, Shoulder: 51, Length: 68, Sleeve: 21 },
  { size: 'M', Chest: 112, Shoulder: 54, Length: 70, Sleeve: 22 },
  { size: 'L', Chest: 118, Shoulder: 57, Length: 72, Sleeve: 23 },
  { size: 'XL', Chest: 124, Shoulder: 60, Length: 74, Sleeve: 24 }
];

/* How a size sits, and what to take when in doubt — the two things a chart
   cannot say. */
export const FIT_NOTES = [
  { term: 'Cut', detail: 'Oversized through the body with a dropped shoulder. If you want it close, take one size down.' },
  { term: 'Between sizes', detail: 'Take the smaller for a shaped look, the larger the way the pattern was drawn.' },
  { term: 'Shrinkage', detail: 'The cotton cloths relax about 2% lengthways on the first wash. The wool does not.' }
];

/* ---------------------------------------------------------------- footwear

   Shoes are not measured in chests: the chart a boot needs is the last it is
   built on, so each department carries its own table and the product page asks
   for the one that belongs to the piece. */
export const FOOTWEAR_COLS = ['EU', 'UK', 'US', 'Foot (cm)'];

export const footwearRows = [
  { size: '36', EU: 36, UK: 3, US: 4, 'Foot (cm)': 22.5 },
  { size: '37', EU: 37, UK: 4, US: 5, 'Foot (cm)': 23.2 },
  { size: '38', EU: 38, UK: 5, US: 6, 'Foot (cm)': 24.0 },
  { size: '39', EU: 39, UK: 5.5, US: 6.5, 'Foot (cm)': 24.7 },
  { size: '40', EU: 40, UK: 6, US: 7, 'Foot (cm)': 25.4 },
  { size: '41', EU: 41, UK: 7, US: 8, 'Foot (cm)': 26.0 },
  { size: '42', EU: 42, UK: 8, US: 9, 'Foot (cm)': 26.7 },
  { size: '43', EU: 43, UK: 9, US: 10, 'Foot (cm)': 27.4 },
  { size: '44', EU: 44, UK: 9.5, US: 10.5, 'Foot (cm)': 28.1 },
  { size: '45', EU: 45, UK: 10, US: 11, 'Foot (cm)': 28.8 }
];

export const FOOTWEAR_NOTES = [
  { term: 'Fit', detail: 'Leather soles and uppers give about half a size over the first month. Buy your usual size unless you wear thick socks.' },
  { term: 'Wide feet', detail: 'Take the larger size and let the leather take the shape rather than stretch it.' },
  { term: 'Resoling', detail: 'Welted pairs can be resoled twice; send them back and we arrange it.' }
];

/* --------------------------------------------------------------- children */
export const KID_COLS = ['Age', 'Height (cm)', 'Chest (cm)', 'Waist (cm)'];

export const kidRows = [
  { size: '2-3Y', Age: '2–3 years', 'Height (cm)': '92–98', 'Chest (cm)': 54, 'Waist (cm)': 52 },
  { size: '4-5Y', Age: '4–5 years', 'Height (cm)': '104–110', 'Chest (cm)': 58, 'Waist (cm)': 55 },
  { size: '6-7Y', Age: '6–7 years', 'Height (cm)': '116–122', 'Chest (cm)': 62, 'Waist (cm)': 57 },
  { size: '8-9Y', Age: '8–9 years', 'Height (cm)': '128–134', 'Chest (cm)': 66, 'Waist (cm)': 59 },
  { size: '10-11Y', Age: '10–11 years', 'Height (cm)': '140–146', 'Chest (cm)': 70, 'Waist (cm)': 62 }
];

export const KID_NOTES = [
  { term: 'Room to grow', detail: 'Cut with a little extra length in the body and sleeve, because they will need it by spring.' },
  { term: 'When between sizes', detail: 'Take the larger — the hems and cuffs can be turned up and let down again.' },
  { term: 'Shrinkage', detail: 'Cotton cloths relax about 2% on the first wash. Wash cold and it stays put.' }
];

/* Clothing, shoes and children are measured differently, so the product page asks
   which table it needs instead of printing the shirt chart on a boot. */
export const chartFor = (department) => {
  if (department === 'Footwear') {
    return { cols: FOOTWEAR_COLS, rows: footwearRows, caption: 'EU sizing, and the foot it is built for', notes: FOOTWEAR_NOTES, title: 'Shoe size guide' };
  }
  if (department === 'Kids') {
    return { cols: KID_COLS, rows: kidRows, caption: 'By age, with the body it is cut for', notes: KID_NOTES, title: 'Children\'s size guide' };
  }
  if (department === 'Accessories') return null;
  return { cols: SIZE_COLS, rows: sizeRows, caption: 'Centimetres, measured flat on the garment', notes: [...FIT_NOTES, ...HOW_TO_MEASURE], title: 'Size guide' };
};

export const HOW_TO_MEASURE = [
  { term: 'Chest', detail: 'Garment laid flat, measured 2cm below the armhole, doubled.' },
  { term: 'Shoulder', detail: 'Seam to seam across the back, at the shoulder point.' },
  { term: 'Length', detail: 'High point of the shoulder seam straight down to the hem.' },
  { term: 'Sleeve', detail: 'Shoulder seam to the end of the cuff, following the sleeve.' }
];
