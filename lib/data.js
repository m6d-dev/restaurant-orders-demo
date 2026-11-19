// Название платформы — поменяйте на своё перед презентацией.
export const PLATFORM_NAME = 'ОнлайнЗаказ';

export const CATEGORIES = [
  { id: 'plov', name: 'Плов' },
  { id: 'kurutob', name: 'Курутоб' },
  { id: 'shashlik', name: 'Шашлык' },
  { id: 'soup', name: 'Супы' },
  { id: 'salad', name: 'Салаты' },
  { id: 'drinks', name: 'Напитки' },
];

export const CAT_TILE = {
  plov: '#F3E3C3',
  kurutob: '#E6EFE2',
  shashlik: '#F5D9CC',
  soup: '#F8E8C8',
  salad: '#DDEFD9',
  drinks: '#DCE9F2',
};

export const STATUS = {
  new: { label: 'Новый', bg: '#FFF1D6', fg: '#7A4800' },
  cooking: { label: 'Готовится', bg: '#E3EEF9', fg: '#1E4E8C', next: 'ready', nextLabel: 'Готово — на выдачу' },
  ready: { label: 'Готов', bg: '#FDEBD3', fg: '#8A4B00', next: 'way', nextLabel: 'Передать курьеру' },
  way: { label: 'В пути', bg: '#EDE6F7', fg: '#5A2F8C', next: 'done', nextLabel: 'Отметить «Доставлен»' },
  done: { label: 'Доставлен', bg: '#E4F2E9', fg: '#16533A' },
  cancelled: { label: 'Отклонён', bg: '#F7E1DE', fg: '#8C2B1E' },
};

export const ORDER_FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые' },
  { id: 'cooking', label: 'Готовятся' },
  { id: 'ready', label: 'Готовы' },
  { id: 'way', label: 'В пути' },
  { id: 'done', label: 'Доставлены' },
  { id: 'cancelled', label: 'Отклонены' },
];

export const REJECT_REASONS = [
  'Нет в наличии',
  'Кухня перегружена',
  'Не доставляем по этому адресу',
  'Ресторан закрывается',
];

export const PAY_METHODS = [
  { id: 'cash', label: 'Наличными курьеру', short: 'Наличными' },
  { id: 'wallet', label: 'Электронный кошелёк', short: 'Эл. кошелёк' },
  { id: 'card', label: 'Картой при получении', short: 'Картой курьеру' },
];

export const SWATCHES = [
  { c: '#1F6F4A', label: 'Зелёный' },
  { c: '#B4472B', label: 'Терракотовый' },
  { c: '#1E4E8C', label: 'Синий' },
  { c: '#6B3FA0', label: 'Фиолетовый' },
  { c: '#1C2420', label: 'Графитовый' },
];

export const DEMO_NAMES = ['Фарход', 'Мадина', 'Рустам', 'Нигина', 'Далер', 'Зарина', 'Сухроб', 'Шахноза', 'Парвиз', 'Манижа'];
export const DEMO_NOTES = ['', '', 'Без лука, пожалуйста', 'Позвонить в домофон', '', 'Нужна сдача со 200'];

const DISHES = [
  { id: 1, cat: 'plov', name: 'Оши палав', weight: '350 г', price: 35, desc: 'Плов с бараниной, жёлтой морковью и нутом', on: true },
  { id: 2, cat: 'plov', name: 'Плов тўйона', weight: '400 г', price: 45, desc: 'Праздничный плов с перепелиным яйцом и казы', on: true },
  { id: 3, cat: 'kurutob', name: 'Курутоб', weight: '450 г', price: 32, desc: 'Фатир, курут, свежие овощи и зелень', on: true },
  { id: 4, cat: 'kurutob', name: 'Курутоб с мясом', weight: '500 г', price: 40, desc: 'Классический курутоб с тушёной бараниной', on: false },
  { id: 5, cat: 'shashlik', name: 'Шашлык из баранины', weight: '200 г', price: 38, desc: 'На углях, с луком и лавашом', on: true },
  { id: 6, cat: 'shashlik', name: 'Шашлык из курицы', weight: '200 г', price: 28, desc: 'Маринад с зирой, подаётся с соусом', on: true },
  { id: 7, cat: 'shashlik', name: 'Люля-кебаб', weight: '200 г', price: 30, desc: 'Рубленая баранина со специями', on: true },
  { id: 8, cat: 'soup', name: 'Шурбо', weight: '400 мл', price: 22, desc: 'Наваристый суп с бараниной и овощами', on: true },
  { id: 9, cat: 'soup', name: 'Лагман', weight: '400 мл', price: 25, desc: 'Тянутая лапша, говядина, овощи', on: true },
  { id: 10, cat: 'salad', name: 'Ачичук', weight: '200 г', price: 12, desc: 'Томаты, лук, перец и зелень', on: true },
  { id: 11, cat: 'drinks', name: 'Зелёный чай', weight: 'чайник', price: 8, desc: 'Заваривается свежим к каждому заказу', on: true },
  { id: 12, cat: 'drinks', name: 'Компот домашний', weight: '1 л', price: 15, desc: 'Из сухофруктов, без консервантов', on: true },
];

const ZONES = [
  { id: 1, name: 'Центр (Сино, Шохмансур)', short: 'Центр', fee: 10, min: 40, free: 150, time: '30–45 мин' },
  { id: 2, name: 'Фирдавси, Исмоили Сомони', short: 'Фирдавси', fee: 15, min: 50, free: 200, time: '40–60 мин' },
  { id: 3, name: 'Пригород (Гиссар, Вахдат)', short: 'Пригород', fee: 30, min: 100, free: '', time: '60–90 мин' },
];

// Когда заказ перешёл в статус — для таймеров на кухне.
export const STATUS_TIME_KEY = { cooking: 'acceptedAt', ready: 'readyAt', way: 'sentAt', done: 'doneAt', cancelled: 'cancelledAt' };

const DAY = 24 * 60 * 60 * 1000;
const DEMO_REVIEWS = [
  { client: 'Зарина', rating: 5, text: 'Плов как дома, привезли горячим за 35 минут. Спасибо!', ago: 0.05, orderNum: 1020 },
  { client: 'Далер', rating: 5, text: 'Шашлык из баранины — лучший в городе. Курьер вежливый.', ago: 1.2 },
  { client: 'Шахноза', rating: 4, text: 'Всё вкусно, но доставка заняла почти час. Курутоб отличный.', ago: 2.4, reply: 'Спасибо! Вечером была большая нагрузка — добавили курьеров.' },
  { client: 'Парвиз', rating: 5, text: 'Удобно, что не надо звонить. Видно, когда заказ уже в пути.', ago: 3.1 },
  { client: 'Манижа', rating: 3, text: 'Лагман остыл, пока везли. Вкус хороший.', ago: 4.6 },
  { client: 'Сухроб', rating: 5, text: 'Заказываем всем офисом по пятницам. Ни разу не подвели.', ago: 6.3, reply: 'Будем рады видеть вас каждую пятницу!' },
  { client: 'Нигина', rating: 4, text: 'Ачичук свежий, компот вкусный. Хотелось бы больше острого соуса.', ago: 8.0 },
];

function item(id, q) {
  const d = DISHES.find((x) => x.id === id);
  return { id, name: d.name, q, price: d.price };
}

export function defaultState() {
  const now = Date.now();
  const min = 60 * 1000;
  return {
    version: 1,
    accepting: true,
    nextNum: 1025,
    nextDishId: 100,
    nextZoneId: 10,
    dishes: DISHES.map((d) => ({ ...d })),
    zones: ZONES.map((z) => ({ ...z })),
    settings: {
      name: 'Дастархон',
      tagline: 'Национальная кухня',
      address: 'ул. [АДРЕС], Душанбе',
      phone: '+992 00 000 00 00',
      open: '09:00',
      close: '23:00',
      sub: 'dastarkhon',
      domain: '',
      accent: '#1F6F4A',
      tg: '',
      tgNew: true,
      tgCancel: true,
      pays: { cash: true, wallet: true, card: true },
    },
    orders: [
      { num: 1024, createdAt: now - 3 * min, client: 'Фарход', phone: '+992 90 000 00 01', addr: 'ул. [АДРЕС], 12, кв. 4', zoneId: 1, zone: 'Центр', pay: 'Наличными', note: 'Позвонить в домофон', fee: 10, st: 'new', items: [item(1, 1), item(5, 2)] },
      { num: 1023, createdAt: now - 7 * min, client: 'Мадина', phone: '+992 90 000 00 02', addr: 'ул. [АДРЕС], 5', zoneId: 2, zone: 'Фирдавси', pay: 'Эл. кошелёк', note: '', fee: 15, st: 'new', items: [item(3, 2), item(12, 1)] },
      { num: 1022, createdAt: now - 25 * min, acceptedAt: now - 22 * min, client: 'Рустам', phone: '+992 90 000 00 03', addr: 'ул. [АДРЕС], 40', zoneId: 1, zone: 'Центр', pay: 'Наличными', note: 'Без лука, пожалуйста', fee: 0, st: 'cooking', items: [item(2, 3), item(10, 2)] },
      { num: 1019, createdAt: now - 31 * min, acceptedAt: now - 29 * min, readyAt: now - 2 * min, client: 'Далер', phone: '+992 90 000 00 06', addr: 'ул. [АДРЕС], 18', zoneId: 2, zone: 'Фирдавси', pay: 'Эл. кошелёк', note: '', fee: 15, st: 'ready', items: [item(6, 2), item(8, 1)] },
      { num: 1021, createdAt: now - 40 * min, acceptedAt: now - 38 * min, readyAt: now - 15 * min, sentAt: now - 12 * min, client: 'Нигина', phone: '+992 90 000 00 04', addr: 'ул. [АДРЕС], 7', zoneId: 1, zone: 'Центр', pay: 'Картой курьеру', note: '', fee: 10, st: 'way', items: [item(9, 2), item(11, 1)] },
      { num: 1020, createdAt: now - 90 * min, acceptedAt: now - 88 * min, doneAt: now - 50 * min, client: 'Зарина', phone: '+992 90 000 00 05', addr: 'ул. [АДРЕС], 3', zoneId: 1, zone: 'Центр', pay: 'Наличными', note: '', fee: 0, st: 'done', items: [item(1, 4)] },
    ],
    nextReviewId: 100,
    reviews: DEMO_REVIEWS.map((r, i) => ({
      id: i + 1,
      orderNum: r.orderNum || null,
      client: r.client,
      rating: r.rating,
      text: r.text,
      at: now - r.ago * DAY,
      reply: r.reply || '',
    })),
  };
}
