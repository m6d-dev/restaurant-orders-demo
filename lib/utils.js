export const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const money = (n) => `${fmt(n)} смн`;
export const pad = (n) => String(n).padStart(2, '0');
export const timeOf = (ms) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const itemsSum = (items) => items.reduce((a, i) => a + i.q * i.price, 0);
export const pct = (a, b) => (b ? Math.round((a * 100) / b) : 0);

/** plural(5, ['позиция', 'позиции', 'позиций']) → 'позиций' */
export function plural(n, forms) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

export function deliveryFee(zone, subtotal) {
  if (!zone || subtotal === 0) return 0;
  if (zone.free !== '' && zone.free != null && subtotal >= Number(zone.free)) return 0;
  return Number(zone.fee) || 0;
}

/**
 * Маска телефона Таджикистана: '+992924562000' → '+992 92 456 20 00'.
 * Если ввели номер без кода страны (924562000) — код +992 подставится сам.
 */
export function formatPhone(value) {
  let d = String(value).replace(/\D/g, '');
  if (!d) return '';
  // Пока человек набирает сам код («9», «99») — не мешаем.
  if (!d.startsWith('992') && !'992'.startsWith(d)) d = '992' + d;
  d = d.slice(0, 12);
  const rest = d.slice(3);
  const parts = [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5, 7), rest.slice(7, 9)].filter(Boolean);
  return ['+' + d.slice(0, 3), ...parts].join(' ');
}

export const phoneDigits = (value) => String(value).replace(/\D/g, '');

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}
