/* There is no backend, so an order is written to the device that placed it and
   read back by the confirmation and the account page. The list is capped: this
   is a receipt drawer, not a database. */

const KEY = 'noire-orders';
const LAST = 'noire-order';

export const readOrders = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch { return []; }
};

export const lastOrder = () => readOrders()[0] || null;

export const writeOrder = (order) => {
  try {
    const list = [order, ...readOrders().filter((o) => o.id !== order.id)].slice(0, 12);
    localStorage.setItem(KEY, JSON.stringify(list));
    // the single-order key is kept so older receipts on this device still open
    localStorage.setItem(LAST, JSON.stringify(order));
  } catch { /* private mode */ }
  return order;
};

/* An order is "on its way" for four days and then it is delivered; the shop has
   no carrier feed to ask, so it says so honestly rather than pretending. */
export const orderStatus = (order) => {
  const placed = Date.parse(order.placedISO || '') || 0;
  if (!placed) return 'Placed';
  const days = (Date.now() - placed) / 864e5;
  if (days < 1) return 'Being packed';
  if (days < 4) return 'On its way';
  return 'Delivered';
};
