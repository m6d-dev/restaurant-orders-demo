// Демо-аналитика: стабильная «история» за 60 дней (генерируется по seed)
// + живые сегодняшние заказы из хранилища.

import { fmt, itemsSum, pad, pct } from './utils';

const CATALOG = [
  ['Оши палав', 35, 9], ['Плов тўйона', 45, 4], ['Курутоб', 32, 6], ['Курутоб с мясом', 40, 3],
  ['Шашлык из баранины', 38, 7], ['Шашлык из курицы', 28, 5], ['Люля-кебаб', 30, 4], ['Шурбо', 22, 3],
  ['Лагман', 25, 5], ['Ачичук', 12, 6], ['Зелёный чай', 8, 7], ['Компот домашний', 15, 4],
];
const ZONE_W = [['Центр', 10, 6], ['Фирдавси', 15, 3], ['Пригород', 30, 1]];
const PAY_W = [['Наличными', 5], ['Эл. кошелёк', 3], ['Картой курьеру', 2]];
const REASONS = ['Нет в наличии', 'Кухня перегружена', 'Не доставляем по этому адресу'];
const HOUR_W = { 9: 1, 10: 1, 11: 2, 12: 5, 13: 6, 14: 4, 15: 2, 16: 2, 17: 3, 18: 6, 19: 8, 20: 7, 21: 4, 22: 2 };
const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const GOOD = '#16533A';
const BAD = '#8C2B1E';
const MUTED = '#5B6560';

function makeRng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function pickW(r, arr, wi) {
  const tot = arr.reduce((a, x) => a + x[wi], 0);
  let v = r() * tot;
  for (const x of arr) {
    v -= x[wi];
    if (v <= 0) return x;
  }
  return arr[arr.length - 1];
}

let HISTORY = null;
function history() {
  if (HISTORY) return HISTORY;
  const r = makeRng(20261119);
  const hours = Object.keys(HOUR_W).map((h) => [+h, HOUR_W[h]]);
  const days = [];
  for (let ago = 60; ago >= 1; ago--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - ago);
    const wd = d.getDay();
    const base = wd === 5 || wd === 6 ? 26 : wd === 0 ? 22 : 16;
    const n = Math.round(base * (0.8 + r() * 0.4) * (1 + (60 - ago) * 0.004));
    const orders = [];
    for (let k = 0; k < n; k++) {
      const items = [];
      const cnt = 1 + Math.floor(r() * 3);
      for (let j = 0; j < cnt; j++) {
        const c = pickW(r, CATALOG, 2);
        items.push({ name: c[0], q: 1 + Math.floor(r() * 2), price: c[1] });
      }
      const z = pickW(r, ZONE_W, 2);
      const sub = itemsSum(items);
      const cancelled = r() < 0.07;
      orders.push({
        hour: pickW(r, hours, 1)[0],
        items,
        zone: z[0],
        fee: sub >= 150 ? 0 : z[1],
        pay: pickW(r, PAY_W, 1)[0],
        client: 'c' + Math.floor(r() * 500),
        st: cancelled ? 'cancelled' : 'done',
        reason: cancelled ? REASONS[Math.floor(r() * REASONS.length)] : '',
      });
    }
    days.push({ date: d, ago, orders, visits: Math.round(n * (5 + r() * 2)), carts: Math.round(n * (1.6 + r() * 0.4)) });
  }
  HISTORY = days;
  return days;
}

function delta(cur, prev) {
  if (!prev) return { text: '—', fg: MUTED };
  const p = Math.round(((cur - prev) * 100) / prev);
  return { text: `${p > 0 ? '▲ +' : p < 0 ? '▼ ' : ''}${p}% к прошлому периоду`, fg: p >= 0 ? GOOD : BAD };
}

function summarize(days) {
  let orders = [];
  let visits = 0;
  let carts = 0;
  days.forEach((d) => {
    orders = orders.concat(d.orders);
    visits += d.visits;
    carts += d.carts;
  });
  const ok = orders.filter((o) => o.st !== 'cancelled');
  const rev = ok.reduce((a, o) => a + itemsSum(o.items) + o.fee, 0);
  const byClient = {};
  ok.forEach((o) => {
    byClient[o.client] = (byClient[o.client] || 0) + 1;
  });
  const clients = Object.keys(byClient);
  const rep = clients.filter((c) => byClient[c] > 1).length;
  return {
    orders, ok, rev, n: ok.length,
    avg: ok.length ? Math.round(rev / ok.length) : 0,
    cancel: pct(orders.length - ok.length, orders.length),
    repeat: pct(rep, clients.length),
    visits, carts,
  };
}

export function computeAnalytics(state, period) {
  const len = period === 'today' ? 1 : +period;
  const live = state.orders.map((o) => ({
    hour: new Date(o.createdAt).getHours(),
    items: o.items,
    zone: o.zone,
    fee: o.fee,
    pay: o.pay,
    client: o.client,
    st: o.st,
    reason: o.reason || '',
  }));
  const today = { date: new Date(), ago: 0, orders: live, visits: 40 + live.length * 6, carts: 9 + Math.round(live.length * 1.8) };
  const all = history().concat([today]);
  const curDays = all.slice(all.length - len);
  const prevDays = period === 'today' ? [all[all.length - 8]] : all.slice(all.length - 2 * len, all.length - len);
  const c = summarize(curDays);
  const p = summarize(prevDays);

  const kpis = [
    { label: 'Выручка', value: `${fmt(c.rev)} смн`, d: delta(c.rev, p.rev) },
    { label: 'Заказов', value: fmt(c.n), d: delta(c.n, p.n) },
    { label: 'Средний чек', value: `${c.avg} смн`, d: delta(c.avg, p.avg) },
    { label: 'Отказы', value: `${c.cancel}%`, d: { text: `было ${p.cancel}%`, fg: c.cancel <= p.cancel ? GOOD : BAD } },
    { label: 'Повторные клиенты', value: `${c.repeat}%`, d: { text: `было ${p.repeat}%`, fg: c.repeat >= p.repeat ? GOOD : BAD } },
  ];

  const dayVals = curDays.map((d) => summarize([d]).rev);
  const dayMax = Math.max(...dayVals, 1);
  const dayBars = curDays.map((d, i) => {
    const v = dayVals[i];
    const show = len <= 7 || i % 5 === 0 || i === curDays.length - 1;
    const lbl = d.ago === 0 ? 'Сегодня' : len <= 7 ? WD[d.date.getDay()] : `${pad(d.date.getDate())}.${pad(d.date.getMonth() + 1)}`;
    return { h: Math.max(2, Math.round((v / dayMax) * 100)), tip: `${lbl}: ${fmt(v)} смн`, label: show ? lbl : '', val: len <= 7 ? fmt(v) : '', today: d.ago === 0 };
  });

  const hc = {};
  c.ok.forEach((o) => {
    hc[o.hour] = (hc[o.hour] || 0) + 1;
  });
  let hMax = 1;
  let peak = 19;
  for (let h = 9; h <= 22; h++) {
    if ((hc[h] || 0) > hMax) {
      hMax = hc[h];
      peak = h;
    }
  }
  const hourBars = [];
  for (let h = 9; h <= 22; h++) {
    const v = hc[h] || 0;
    hourBars.push({ h: Math.max(2, Math.round((v / hMax) * 100)), tip: `${pad(h)}:00 — ${v} заказов`, label: h % 2 === 1 ? pad(h) : '', peak: h === peak });
  }

  const dish = {};
  c.ok.forEach((o) =>
    o.items.forEach((i) => {
      const x = dish[i.name] || (dish[i.name] = { q: 0, rev: 0 });
      x.q += i.q;
      x.rev += i.q * i.price;
    })
  );
  const dishArr = Object.keys(dish).map((k) => ({ name: k, ...dish[k] })).sort((a, b) => b.rev - a.rev);
  const dTot = dishArr.reduce((a, x) => a + x.rev, 0) || 1;
  const dTop = dishArr.length ? dishArr[0].rev : 1;
  const topDishes = dishArr.slice(0, 7).map((x, i) => ({
    rank: i + 1, name: x.name, q: `${x.q} порц.`, rev: `${fmt(x.rev)} смн`, share: `${pct(x.rev, dTot)}%`, w: Math.max(3, Math.round((x.rev * 100) / dTop)),
  }));

  const split = (key) => {
    const m = {};
    c.ok.forEach((o) => {
      m[o[key]] = (m[o[key]] || 0) + itemsSum(o.items) + o.fee;
    });
    const tot = Object.values(m).reduce((a, v) => a + v, 0) || 1;
    return Object.keys(m)
      .sort((a, b) => m[b] - m[a])
      .map((k) => ({ name: k, value: `${fmt(m[k])} смн`, share: `${pct(m[k], tot)}%`, w: Math.max(3, pct(m[k], tot)) }));
  };

  const rc = {};
  let cancelledN = 0;
  c.orders.forEach((o) => {
    if (o.st === 'cancelled') {
      cancelledN++;
      const k = o.reason || 'Без причины';
      rc[k] = (rc[k] || 0) + 1;
    }
  });
  const reasons = Object.keys(rc)
    .sort((a, b) => rc[b] - rc[a])
    .map((k) => ({ name: k, value: `${rc[k]} шт.`, w: Math.max(3, pct(rc[k], cancelledN)) }));

  const funnel = [
    ['Открыли сайт', c.visits],
    ['Добавили в корзину', c.carts],
    ['Оформили заказ', c.orders.length],
    ['Получили заказ', c.n],
  ].map(([name, v]) => ({ name, value: fmt(v), share: `${pct(v, c.visits)}%`, w: Math.max(3, pct(v, c.visits)) }));

  const stopped = state.dishes.filter((d) => !d.on).map((d) => d.name);
  const insights = [`Пик заказов — ${pad(peak)}:00–${pad(peak + 1)}:00. Держите в это время больше поваров и курьеров.`];
  if (dishArr.length) insights.push(`Больше всего приносит «${dishArr[0].name}» — ${pct(dishArr[0].rev, dTot)}% выручки. Хороший кандидат для баннера на сайте.`);
  if (reasons.length) insights.push(`Чаще всего отказываете по причине «${reasons[0].name}». Обновляйте стоп-лист, чтобы клиенты не заказывали то, чего нет.`);
  if (stopped.length) insights.push(`Сейчас в стопе: ${stopped.join(', ')}. Пока блюдо в стопе, его нельзя заказать.`);
  insights.push(`Из ${fmt(c.carts)} корзин оформлено ${pct(c.orders.length, c.carts)}%. Остальные бросили — им можно напомнить в Telegram.`);

  return { kpis, showDays: len > 1, dayBars, hourBars, topDishes, zones: split('zone'), pays: split('pay'), reasons, funnel, insights };
}
