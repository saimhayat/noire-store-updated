/* One place where money and percentages are written, so a price in a card, a
   drawer, a cart line and a confirmation is always the same string.

   The house trades in rupees, grouped the way the region reads them:
   Rs. 12,999 — never Rs. 12999, never $129.99. */

const GROUP = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

export const money = (value) => `Rs. ${GROUP.format(Math.round(Number(value) || 0))}`;

/* Just the figure, for places that print the currency once (a column head, a
   filter bound) rather than on every row. */
export const figure = (value) => GROUP.format(Math.round(Number(value) || 0));

/* Whole-percent discount, floored so a 29.8% markdown never reads as 30%. */
export const discountOf = (product) => {
  const { price, oldPrice } = product || {};
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.floor(((oldPrice - price) / oldPrice) * 100);
};

export const discountLabel = (product) => {
  const off = discountOf(product);
  return off ? `-${off}%` : '';
};

export const savedAmount = (product) => (product?.oldPrice ? product.oldPrice - product.price : 0);

/* How many pieces the shop holds, said the way a shop says it. */
export const pieceCount = (n) => `${GROUP.format(n)} ${n === 1 ? 'piece' : 'pieces'}`;
