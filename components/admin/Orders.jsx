'use client';

import { useRef, useState } from 'react';
import { setOrderStatus, updateStore } from '@/lib/store';
import { DEMO_NAMES, DEMO_NOTES, ORDER_FILTERS, REJECT_REASONS, STATUS } from '@/lib/data';
import { cx, deliveryFee, itemsSum, money, timeOf } from '@/lib/utils';
import { Chip, StatusBadge } from '@/components/ui';
import { IconArrowLeft, IconCheck, IconPhone, IconPlus, IconX } from '@/components/Icons';

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Orders({ state, flash, selected, setSelected }) {
  const [filter, setFilter] = useState('all');
  // На узких экранах показываем либо список, либо карточку заказа.
  const [showDetail, setShowDetail] = useState(false);
  const layoutRef = useRef(null);
  const scrollToLayout = () =>
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 1100px)').matches) layoutRef.current?.scrollIntoView({ block: 'start' });
    });
  const orders = [...state.orders].sort((a, b) => b.createdAt - a.createdAt);
  const shown = orders.filter((o) => filter === 'all' || o.st === filter);
  const counts = Object.fromEntries(ORDER_FILTERS.map((f) => [f.id, f.id === 'all' ? orders.length : orders.filter((o) => o.st === f.id).length]));

  const sel = orders.find((o) => o.num === selected) || shown[0] || null;

  const revenue = orders.filter((o) => o.st === 'done').reduce((a, o) => a + itemsSum(o.items) + o.fee, 0);

  const addTest = () => {
    const avail = state.dishes.filter((d) => d.on);
    if (!avail.length) return flash('Нет блюд в наличии');
    const n = 1 + Math.floor(Math.random() * 3);
    const items = [];
    for (let i = 0; i < n; i++) {
      const d = rand(avail);
      const ex = items.find((x) => x.id === d.id);
      if (ex) ex.q++;
      else items.push({ id: d.id, name: d.name, q: 1 + Math.floor(Math.random() * 2), price: d.price });
    }
    const zone = rand(state.zones);
    const num = updateStore((s) => {
      const num = s.nextNum++;
      s.orders.unshift({
        num,
        test: true,
        createdAt: Date.now(),
        client: rand(DEMO_NAMES),
        phone: `+992 90 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)}`,
        addr: `ул. [АДРЕС], ${Math.floor(Math.random() * 90) + 1}`,
        zoneId: zone.id,
        zone: zone.short || zone.name,
        pay: rand(['Наличными', 'Эл. кошелёк', 'Картой курьеру']),
        note: rand(DEMO_NOTES),
        fee: deliveryFee(zone, itemsSum(items)),
        st: 'new',
        items,
      });
      return num;
    });
    setFilter('all');
    setSelected(num);
    flash(`Тестовый заказ №${num} добавлен`);
  };

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Заказы</h1>
          <p className="muted">Новые заказы с сайта появляются здесь сразу — со звуком.</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={addTest}>
          <IconPlus size={18} /> Тестовый заказ
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">Ждут подтверждения</span>
          <span className={cx('stat-value', counts.new > 0 && 'stat-alert')}>{counts.new}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Заказов за смену</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Выручка (доставленные)</span>
          <span className="stat-value">{money(revenue)}</span>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Фильтр по статусу">
        {ORDER_FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={counts[f.id]}>
            {f.label}
          </Chip>
        ))}
      </div>

      <div ref={layoutRef} className={cx('orders-layout', showDetail && sel && 'show-detail')}>
        <div className="order-list">
          {shown.length === 0 && <p className="muted pad">Здесь пока пусто. Нажмите «Тестовый заказ».</p>}
          {shown.map((o) => (
            <button
              key={o.num}
              type="button"
              className={cx('order-item', sel && sel.num === o.num && 'order-item-active', o.st === 'new' && 'order-item-new')}
              onClick={() => {
                setSelected(o.num);
                setShowDetail(true);
                scrollToLayout();
              }}
            >
              <div className="order-item-top">
                <span className="strong">№{o.num}</span>
                <StatusBadge st={o.st} />
              </div>
              <div className="order-item-mid">
                <span>{o.client}</span>
                <span className="strong">{money(itemsSum(o.items) + o.fee)}</span>
              </div>
              <div className="muted small">
                {timeOf(o.createdAt)} · {o.zone} · {o.items.reduce((a, i) => a + i.q, 0)} поз.
              </div>
            </button>
          ))}
        </div>

        <div className="order-detail">
          <button type="button" className="btn btn-ghost btn-sm back-btn" onClick={() => {
              setShowDetail(false);
              scrollToLayout();
            }}>
            <IconArrowLeft size={18} /> Все заказы
          </button>
          {sel ? <OrderDetail key={sel.num} order={sel} flash={flash} /> : <p className="muted">Выберите заказ слева, чтобы увидеть детали.</p>}
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order, flash }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const subtotal = itemsSum(order.items);
  const meta = STATUS[order.st];

  const patch = ({ st, ...extra }, msg) => {
    setOrderStatus(order.num, st, extra);
    setRejecting(false);
    if (msg) flash(msg);
  };

  return (
    <div className="detail">
      <div className="detail-head">
        <div>
          <h2>Заказ №{order.num}</h2>
          <span className="muted">Поступил в {timeOf(order.createdAt)}</span>
        </div>
        <StatusBadge st={order.st} />
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Клиент</dt>
          <dd>{order.client}</dd>
        </div>
        <div>
          <dt>Телефон</dt>
          <dd>{order.phone}</dd>
        </div>
        <div>
          <dt>Адрес</dt>
          <dd>{order.addr}</dd>
        </div>
        <div>
          <dt>Район</dt>
          <dd>{order.zone}</dd>
        </div>
        <div>
          <dt>Оплата</dt>
          <dd>{order.pay}</dd>
        </div>
        {order.note && (
          <div className="detail-note">
            <dt>Комментарий</dt>
            <dd>{order.note}</dd>
          </div>
        )}
      </dl>

      <table className="table">
        <thead>
          <tr>
            <th>Блюдо</th>
            <th className="num">Кол-во</th>
            <th className="num">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.name}>
              <td>{i.name}</td>
              <td className="num">{i.q}</td>
              <td className="num">{money(i.q * i.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Доставка</td>
            <td className="num">{order.fee ? money(order.fee) : 'Бесплатно'}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>Итого</td>
            <td className="num">{money(subtotal + order.fee)}</td>
          </tr>
        </tfoot>
      </table>

      {order.st === 'cancelled' && <p className="note-warn">Причина отказа: {order.reason}</p>}

      <div className="detail-actions">
        {order.st === 'new' && !rejecting && (
          <>
            <button type="button" className="btn btn-accent btn-lg" onClick={() => patch({ st: 'cooking' }, `Заказ №${order.num} принят — клиент видит «Готовится»`)}>
              <IconCheck size={18} /> Принять
            </button>
            <button type="button" className="btn btn-danger-outline btn-lg" onClick={() => setRejecting(true)}>
              <IconX size={18} /> Отклонить
            </button>
          </>
        )}
        {meta.next && (
          <button type="button" className="btn btn-accent btn-lg" onClick={() => patch({ st: meta.next }, `Заказ №${order.num}: ${STATUS[meta.next].label}`)}>
            {meta.nextLabel}
          </button>
        )}
        <a className="btn btn-outline btn-lg" href={`tel:${order.phone.replace(/\s/g, '')}`}>
          <IconPhone size={18} /> Позвонить клиенту
        </a>
      </div>

      {rejecting && (
        <div className="reject-box">
          <div className="field">
            <label htmlFor="reject-reason">Причина отказа (клиент увидит её)</label>
            <select id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REJECT_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="row gap">
            <button type="button" className="btn btn-danger" onClick={() => patch({ st: 'cancelled', reason }, `Заказ №${order.num} отклонён`)}>
              Отклонить заказ
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRejecting(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
