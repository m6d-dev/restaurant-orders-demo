'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore, updateStore } from '@/lib/store';
import { useSessionState } from '@/lib/useSessionState';
import { CATEGORIES, CAT_TILE, PAY_METHODS, PLATFORM_NAME, STATUS } from '@/lib/data';
import { cx, deliveryFee, formatPhone, money, phoneDigits, plural, timeOf, itemsSum } from '@/lib/utils';
import DishArt from '@/components/DishArt';
import { Loading, Stars, StarInput, relDay } from '@/components/ui';
import { IconCart, IconCheck, IconClock, IconMinus, IconPlus, IconTruck, IconX, IconArrowLeft } from '@/components/Icons';

export default function Shop() {
  const state = useStore();
  const [cart, setCart] = useSessionState('shop-cart', { 1: 1, 5: 2 });
  const [cat, setCat] = useState('all');
  const [zoneId, setZoneId] = useSessionState('shop-zone', 1);
  const [myOrder, setMyOrder] = useSessionState('shop-my-order', null);

  if (!state) return <Loading />;

  const { settings, dishes, zones, accepting } = state;
  const zone = zones.find((z) => z.id === zoneId) || zones[0];
  const available = dishes.filter((d) => d.on);
  const visible = available.filter((d) => cat === 'all' || d.cat === cat);
  const usedCats = CATEGORIES.filter((c) => available.some((d) => d.cat === c.id));

  const lines = available
    .filter((d) => cart[d.id] > 0)
    .map((d) => ({ id: d.id, name: d.name, q: cart[d.id], price: d.price }));
  const removedFromCart = dishes.filter((d) => !d.on && cart[d.id] > 0);
  const count = lines.reduce((a, l) => a + l.q, 0);
  const subtotal = itemsSum(lines);
  const fee = deliveryFee(zone, subtotal);
  const total = subtotal + fee;

  const setQty = (id, q) =>
    setCart((c) => {
      const next = { ...c };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

  const order = myOrder ? state.orders.find((o) => o.num === myOrder) : null;
  const reviews = [...(state.reviews || [])].sort((a, b) => b.at - a.at);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  return (
    <div className="shop" style={{ '--accent': settings.accent }}>
      <header className="shop-header">
        <div className="container shop-header-row">
          <div className="brand">
            <div className="brand-logo">{settings.name.slice(0, 1)}</div>
            <div className="brand-text">
              <span className="brand-name">{settings.name}</span>
              <span className="brand-sub">
                {settings.tagline} · {settings.address}
              </span>
            </div>
          </div>
          <nav aria-label="Информация" className="shop-meta">
            {reviews.length > 0 && (
              <a href="#reviews" className="meta-item meta-rating">
                <Stars value={avg} size={16} />
                <span className="strong">{avg.toFixed(1).replace('.', ',')}</span>
                <span>
                  · {reviews.length} {plural(reviews.length, ['отзыв', 'отзыва', 'отзывов'])}
                </span>
              </a>
            )}
            <span className="meta-item">
              <IconClock size={18} /> {settings.open}–{settings.close}
            </span>
            <span className="meta-item">
              <IconTruck size={18} /> {zone ? zone.time : '—'}
            </span>
            <a href="#cart" className="btn btn-accent btn-pill">
              <IconCart size={18} /> Корзина · {count}
            </a>
          </nav>
        </div>
      </header>

      {!accepting && (
        <div className="container">
          <div className="paused-banner" role="alert">
            Ресторан временно не принимает онлайн-заказы. Меню можно посмотреть, а оформить заказ — чуть позже.
          </div>
        </div>
      )}

      <section className="container">
        <div className="hero">
          <div className="hero-text">
            <h1>Закажите онлайн — без звонков</h1>
            <p>
              Выберите блюда и оставьте адрес. Ресторан подтвердит заказ в течение нескольких минут, а статус вы увидите прямо
              здесь.
            </p>
          </div>
          <div className="hero-tags">
            {zone && <span className="tag tag-light">Доставка от {money(zone.fee)}</span>}
            {zone && zone.free !== '' && <span className="tag tag-gold">Бесплатно от {money(zone.free)}</span>}
          </div>
        </div>
      </section>

      <div className="container shop-body">
        <main className="shop-main">
          <div className="cat-tabs" role="tablist" aria-label="Категории меню">
            {[{ id: 'all', name: 'Всё меню' }, ...usedCats].map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                className={cx('chip chip-lg', cat === c.id && 'chip-active')}
                onClick={() => setCat(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="dish-grid">
            {visible.map((d) => {
              const q = cart[d.id] || 0;
              return (
                <article key={d.id} className="dish-card">
                  <div className="dish-art" style={{ background: CAT_TILE[d.cat] }}>
                    <DishArt cat={d.cat} />
                  </div>
                  <div className="dish-body">
                    <div className="dish-title">
                      <h3>{d.name}</h3>
                      <span className="muted small nowrap">{d.weight}</span>
                    </div>
                    <p className="dish-desc">{d.desc}</p>
                    <div className="dish-foot">
                      <span className="dish-price">{money(d.price)}</span>
                      {q === 0 ? (
                        <button type="button" className="btn btn-accent" onClick={() => setQty(d.id, 1)}>
                          Добавить
                        </button>
                      ) : (
                        <Stepper q={q} onDec={() => setQty(d.id, q - 1)} onInc={() => setQty(d.id, q + 1)} />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            {visible.length === 0 && <p className="muted">В этой категории сейчас ничего нет.</p>}
          </div>

          {reviews.length > 0 && (
            <section id="reviews" className="reviews-block" aria-label="Отзывы">
              <div className="reviews-head">
                <h2>Отзывы</h2>
                <span className="reviews-score">
                  <Stars value={avg} size={20} />
                  <span className="strong">{avg.toFixed(1).replace('.', ',')}</span>
                  <span className="muted">из 5 · {reviews.length} {plural(reviews.length, ['отзыв', 'отзыва', 'отзывов'])}</span>
                </span>
              </div>
              <div className="review-grid">
                {reviews.slice(0, 6).map((r) => (
                  <article key={r.id} className="review-card">
                    <div className="review-top">
                      <span className="strong">{r.client}</span>
                      <span className="muted small">{relDay(r.at)}</span>
                    </div>
                    <Stars value={r.rating} />
                    {r.text && <p>{r.text}</p>}
                    {r.reply && (
                      <div className="review-reply">
                        <span className="small strong">Ответ ресторана</span>
                        <p>{r.reply}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside id="cart" className="cart" aria-label="Корзина и оформление">
          {order ? (
            <Tracker order={order} review={reviews.find((r) => r.orderNum === order.num)} onNew={() => setMyOrder(null)} />
          ) : (
            <Checkout
              state={state}
              lines={lines}
              removed={removedFromCart}
              zone={zone}
              zones={zones}
              setZoneId={setZoneId}
              subtotal={subtotal}
              fee={fee}
              total={total}
              onDone={(num) => {
                setMyOrder(num);
                setCart({});
              }}
            />
          )}
        </aside>
      </div>

      {!order && count > 0 && (
        <a href="#cart" className="mobile-cart-bar">
          <span>
            {count} {plural(count, ['позиция', 'позиции', 'позиций'])} · Корзина
          </span>
          <span>{money(total)}</span>
        </a>
      )}

      <footer className="shop-footer">
        <div className="container shop-footer-row">
          <span>
            © {settings.name}, {new Date().getFullYear()}
          </span>
          <span>
            Сайт работает на платформе {PLATFORM_NAME} · <Link href="/">Подключить свой ресторан</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

function Stepper({ q, onDec, onInc }) {
  return (
    <div className="stepper">
      <button type="button" aria-label="Убрать одну порцию" className="stepper-btn" onClick={onDec}>
        <IconMinus size={18} />
      </button>
      <span className="stepper-q">{q}</span>
      <button type="button" aria-label="Добавить ещё порцию" className="stepper-btn stepper-plus" onClick={onInc}>
        <IconPlus size={18} />
      </button>
    </div>
  );
}

function Checkout({ state, lines, removed, zone, zones, setZoneId, subtotal, fee, total, onDone }) {
  const { settings, accepting } = state;
  const pays = PAY_METHODS.filter((p) => settings.pays?.[p.id] !== false);
  const [form, setForm] = useState({ name: '', phone: '', addr: '', note: '', pay: pays[0]?.id || 'cash' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const belowMin = zone && subtotal > 0 && subtotal < Number(zone.min);
  const freeLeft = zone && zone.free !== '' && subtotal < Number(zone.free) ? Number(zone.free) - subtotal : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!accepting) return setErr('Ресторан сейчас не принимает заказы.');
    if (lines.length === 0) return setErr('Добавьте блюда из меню.');
    if (belowMin) return setErr(`Минимальный заказ в этот район — ${money(zone.min)}.`);
    if (!form.name.trim() || !form.phone.trim() || !form.addr.trim()) return setErr('Заполните имя, телефон и адрес.');
    if (phoneDigits(form.phone).length !== 12) return setErr('Введите номер полностью: +992 __ ___ __ __');
    setErr('');
    const pay = PAY_METHODS.find((p) => p.id === form.pay);
    const num = updateStore((s) => {
      const n = s.nextNum++;
      s.orders.unshift({
        num: n,
        createdAt: Date.now(),
        client: form.name.trim(),
        phone: form.phone.trim(),
        addr: form.addr.trim(),
        zoneId: zone.id,
        zone: zone.short || zone.name,
        pay: pay ? pay.short : 'Наличными',
        note: form.note.trim(),
        fee,
        st: 'new',
        items: lines.map((l) => ({ ...l })),
      });
      return n;
    });
    onDone(num);
  };

  return (
    <form className="checkout" onSubmit={submit} noValidate>
      <h2 className="cart-title">Ваш заказ</h2>

      {removed.length > 0 && (
        <p className="note-warn">
          {removed.map((d) => d.name).join(', ')} — сейчас нет в наличии, убрано из заказа.
        </p>
      )}

      {lines.length === 0 ? (
        <p className="muted">Корзина пуста — добавьте блюда из меню.</p>
      ) : (
        <div className="cart-lines">
          {lines.map((l) => (
            <div key={l.id} className="cart-line">
              <span>
                {l.name} × {l.q}
              </span>
              <span className="strong nowrap">{money(l.price * l.q)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="field">
        <label htmlFor="f-zone">Район доставки</label>
        <select id="f-zone" value={zone?.id} onChange={(e) => setZoneId(Number(e.target.value))}>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} — {z.time}
            </option>
          ))}
        </select>
      </div>

      {lines.length > 0 && (
        <div className="cart-sum">
          <div className="sum-row">
            <span>Блюда</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Доставка</span>
            <span>{fee === 0 ? 'Бесплатно' : money(fee)}</span>
          </div>
          {freeLeft > 0 && <span className="muted small">Ещё {money(freeLeft)} до бесплатной доставки</span>}
          {belowMin && <span className="note-warn small">Минимальный заказ в этот район — {money(zone.min)}</span>}
          <div className="sum-row sum-total">
            <span>Итого</span>
            <span>{money(total)}</span>
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="f-name">Имя</label>
        <input id="f-name" value={form.name} onChange={set('name')} placeholder="Как к вам обращаться" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="f-phone">Телефон</label>
        <input
          id="f-phone"
          type="tel"
          inputMode="tel"
          maxLength={17}
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
          onFocus={() => {
            if (!form.phone) setForm((f) => ({ ...f, phone: '+992' }));
          }}
          onBlur={() => {
            if (phoneDigits(form.phone).length <= 3) setForm((f) => ({ ...f, phone: '' }));
          }}
          placeholder="+992 __ ___ __ __"
          autoComplete="tel"
        />
      </div>
      <div className="field">
        <label htmlFor="f-addr">Адрес доставки</label>
        <input id="f-addr" value={form.addr} onChange={set('addr')} placeholder="Улица, дом, подъезд, квартира" autoComplete="street-address" />
      </div>
      <fieldset className="field radios">
        <legend>Оплата</legend>
        {pays.map((p) => (
          <label key={p.id} className="radio">
            <input type="radio" name="pay" value={p.id} checked={form.pay === p.id} onChange={set('pay')} />
            {p.label}
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor="f-note">Комментарий</label>
        <textarea id="f-note" rows={2} value={form.note} onChange={set('note')} placeholder="Например: без лука, позвонить в домофон" />
      </div>

      {err && (
        <p className="form-err" role="alert">
          {err}
        </p>
      )}

      <button type="submit" className="btn btn-accent btn-xl" disabled={!accepting || lines.length === 0}>
        Оформить заказ · {money(total)}
      </button>
      <span className="muted small center">Без звонка в ресторан — заказ сразу уходит на кухню</span>
    </form>
  );
}

const STEPS = [
  { st: 'new', label: 'Отправлен в ресторан' },
  { st: 'cooking', label: 'Принят, готовится' },
  { st: 'ready', label: 'Готов, передаём курьеру' },
  { st: 'way', label: 'Курьер в пути' },
  { st: 'done', label: 'Доставлен' },
];

function ReviewForm({ order }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return setErr('Поставьте оценку от 1 до 5');
    updateStore((s) => {
      s.reviews = s.reviews || [];
      s.reviews.push({
        id: s.nextReviewId++,
        orderNum: order.num,
        client: order.client,
        rating,
        text: text.trim(),
        at: Date.now(),
        reply: '',
      });
    });
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <span className="strong">Как вам заказ?</span>
      <StarInput value={rating} onChange={(n) => { setRating(n); setErr(''); }} name={`rate-${order.num}`} />
      <div className="field">
        <label htmlFor="rv-text">Комментарий (необязательно)</label>
        <textarea id="rv-text" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Что понравилось, что улучшить" />
      </div>
      {err && <p className="form-err">{err}</p>}
      <button type="submit" className="btn btn-accent">
        Отправить отзыв
      </button>
    </form>
  );
}

function Tracker({ order, review, onNew }) {
  const idx = STEPS.findIndex((s) => s.st === order.st);
  const cancelled = order.st === 'cancelled';
  const subtotal = itemsSum(order.items);
  const hint = {
    new: 'Ресторан получил заказ и подтвердит его в течение 5 минут. Звонить не нужно — статус обновится здесь.',
    cooking: 'Ресторан принял заказ, кухня уже готовит.',
    ready: 'Заказ готов и упакован — передаём курьеру.',
    way: 'Курьер выехал. Держите телефон рядом.',
    done: 'Приятного аппетита! Спасибо за заказ.',
  }[order.st];

  return (
    <div className="tracker">
      <h2 className="cart-title">Заказ №{order.num}</h2>
      <span className="muted small">
        Оформлен в {timeOf(order.createdAt)} · {STATUS[order.st].label}
      </span>

      {cancelled ? (
        <div className="tracker-box tracker-cancel">
          <span className="tracker-head">
            <IconX size={20} /> Ресторан отклонил заказ
          </span>
          <span>Причина: {order.reason || 'не указана'}</span>
        </div>
      ) : (
        <div className="tracker-box">
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.st} className={cx('step', i < idx && 'step-done', i === idx && 'step-current')}>
                <span className="step-dot" aria-hidden="true">
                  {i <= idx ? <IconCheck size={14} /> : null}
                </span>
                <span>{s.label}</span>
              </li>
            ))}
          </ol>
          <p className="tracker-hint">{hint}</p>
        </div>
      )}

      {order.st === 'done' &&
        (review ? (
          <div className="review-thanks">
            <span className="strong">Спасибо за отзыв!</span>
            <Stars value={review.rating} size={20} />
            {review.text && <p className="small">{review.text}</p>}
          </div>
        ) : (
          <ReviewForm order={order} />
        ))}

      <div className="cart-lines">
        {order.items.map((l) => (
          <div key={l.name} className="cart-line">
            <span>
              {l.name} × {l.q}
            </span>
            <span className="nowrap">{money(l.q * l.price)}</span>
          </div>
        ))}
        <div className="sum-row">
          <span>Доставка</span>
          <span>{order.fee ? money(order.fee) : 'Бесплатно'}</span>
        </div>
        <div className="sum-row sum-total">
          <span>Итого</span>
          <span>{money(subtotal + order.fee)}</span>
        </div>
      </div>

      <button type="button" className="btn btn-outline btn-lg" onClick={onNew}>
        <IconArrowLeft size={18} /> Новый заказ
      </button>
    </div>
  );
}
