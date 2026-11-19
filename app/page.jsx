import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/data';
import ResetDemoButton from '@/components/ResetDemoButton';

const STEPS = [
  { n: '1', title: 'Клиент заказывает на сайте', text: 'Меню, корзина, район доставки и оплата — без звонков и без приложений.' },
  { n: '2', title: 'Ресторан принимает в панели', text: 'Заказ приходит со звуком. Принять, отклонить с причиной, передать курьеру.' },
  { n: '3', title: 'Клиент видит статус', text: 'Статус на сайте обновляется сам: принят, готовится, в пути, доставлен.' },
];

const FEATURES = [
  ['Свой сайт за вечер', 'Название, цвет бренда, адрес, часы работы, поддомен или свой домен.'],
  ['Стоп-лист в один клик', 'Закончилось блюдо — выключили, и оно пропало с сайта.'],
  ['Зоны доставки', 'Стоимость, минимальная сумма и бесплатная доставка по районам.'],
  ['Аналитика', 'Выручка, средний чек, пиковые часы, топ блюд и причины отказов.'],
  ['Экран кухни', 'Повара видят заказы на планшете, таймер подсвечивает задержки.'],
  ['Отзывы', 'Клиент оценивает заказ после доставки, ресторан отвечает — рейтинг виден на сайте.'],
];

export default function Home() {
  return (
    <div className="landing">
      <header className="landing-header container">
        <span className="landing-logo">{PLATFORM_NAME}</span>
        <span className="tag tag-outline">Демо для презентации</span>
      </header>

      <section className="container landing-hero">
        <h1>Онлайн-заказы для ресторанов — без звонков и агрегаторов</h1>
        <p className="lead">
          Ресторан получает свой сайт с меню и корзиной и панель, где принимает заказы. Ниже — рабочее демо: всё кликается.
        </p>
        <div className="landing-ctas">
          <Link href="/shop" target="_blank" className="cta-card">
            <span className="cta-kicker">Для клиента</span>
            <span className="cta-title">Сайт ресторана</span>
            <span className="cta-text">Меню, корзина, оформление заказа и отслеживание статуса</span>
            <span className="cta-go">Открыть →</span>
          </Link>
          <Link href="/admin" target="_blank" className="cta-card cta-card-dark">
            <span className="cta-kicker">Для ресторана</span>
            <span className="cta-title">Панель ресторана</span>
            <span className="cta-text">Заказы, аналитика, стоп-лист, зоны доставки и настройки сайта</span>
            <span className="cta-go">Открыть →</span>
          </Link>
          <Link href="/kitchen" target="_blank" className="cta-card cta-card-kitchen">
            <span className="cta-kicker">Для кухни</span>
            <span className="cta-title">Экран кухни</span>
            <span className="cta-text">Доска заказов для планшета: таймеры, отметки блюд, «Готово» в одно касание</span>
            <span className="cta-go">Открыть →</span>
          </Link>
        </div>
        <p className="tip">
          Совет для показа: откройте сайт, панель и кухню в разных окнах рядом. Оформите заказ на сайте — он сразу появится в
          панели и на кухне, а каждое «Принять», «Готово», «Отдан курьеру» тут же обновит статус у клиента.
        </p>
      </section>

      <section className="container landing-section">
        <h2>Как это работает</h2>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card">
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container landing-section">
        <h2>Что получает ресторан</h2>
        <div className="feature-grid">
          {FEATURES.map(([t, d]) => (
            <div key={t} className="feature">
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="container landing-footer">
        <span>Демо работает без сервера: данные хранятся в браузере.</span>
        <ResetDemoButton />
      </footer>
    </div>
  );
}
