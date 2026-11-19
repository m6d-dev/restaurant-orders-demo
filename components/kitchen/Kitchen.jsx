'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore, setOrderStatus } from '@/lib/store';
import { useNow, elapsed } from '@/lib/useNow';
import { beep } from '@/lib/beep';
import { cx, pad } from '@/lib/utils';
import { Loading, Toast } from '@/components/ui';
import { IconArrowLeft, IconBell, IconCheck } from '@/components/Icons';

// Колонки доски и пороги таймера (в минутах): после warn — жёлтый, после late — красный.
const COLUMNS = [
  { st: 'new', title: 'Новые', hint: 'Примите заказ', from: 'createdAt', warn: 3, late: 5, action: 'Принять в работу', next: 'cooking' },
  { st: 'cooking', title: 'Готовятся', hint: 'Отметьте, когда готово', from: 'acceptedAt', warn: 15, late: 25, action: 'Готово', next: 'ready' },
  { st: 'ready', title: 'Готовы к выдаче', hint: 'Ждут курьера', from: 'readyAt', warn: 5, late: 10, action: 'Отдан курьеру', next: 'way' },
];

export default function Kitchen() {
  const state = useStore();
  const now = useNow(1000);
  const [sound, setSound] = useState(false);
  const [toast, setToast] = useState('');
  const [checked, setChecked] = useState({});
  const maxSeen = useRef(null);
  const timer = useRef(null);

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3000);
  };

  // Новый заказ с сайта — сигнал (если звук включён) и уведомление.
  useEffect(() => {
    if (!state) return;
    const top = state.orders.reduce((m, o) => Math.max(m, o.num), 0);
    if (maxSeen.current != null && top > maxSeen.current) {
      const o = state.orders.find((x) => x.num === top);
      if (o && o.st === 'new') {
        if (sound) beep();
        flash(`Новый заказ №${o.num}`);
      }
    }
    maxSeen.current = top;
  }, [state, sound]);

  if (!state) return <Loading />;

  const { settings } = state;
  const d = new Date(now);
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const doneToday = state.orders.filter((o) => ['way', 'done'].includes(o.st)).length;

  const toggleItem = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="kitchen" style={{ '--accent': settings.accent }}>
      <header className="k-header">
        <div className="k-brand">
          <Link href="/admin" className="k-back" aria-label="Вернуться в панель">
            <IconArrowLeft size={20} />
          </Link>
          <div>
            <div className="k-title">Кухня · {settings.name}</div>
            <div className="k-sub">Отдано сегодня: {doneToday}</div>
          </div>
        </div>
        <div className="k-tools">
          {!state.accepting && <span className="k-paused">Приём заказов на паузе</span>}
          <button
            type="button"
            className={cx('k-btn', sound && 'k-btn-on')}
            aria-pressed={sound}
            onClick={() => {
              const next = !sound;
              setSound(next);
              if (next) beep();
            }}
          >
            <IconBell size={18} /> {sound ? 'Звук включён' : 'Включить звук'}
          </button>
          <button
            type="button"
            className="k-btn"
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen?.();
              else document.documentElement.requestFullscreen?.();
            }}
          >
            На весь экран
          </button>
          <span className="k-clock">{clock}</span>
        </div>
      </header>

      <div className="k-board">
        {COLUMNS.map((col) => {
          const list = state.orders
            .filter((o) => o.st === col.st)
            .sort((a, b) => (a[col.from] || a.createdAt) - (b[col.from] || b.createdAt));
          return (
            <section key={col.st} className={cx('k-col', `k-col-${col.st}`)} aria-label={col.title}>
              <div className="k-col-head">
                <h2>{col.title}</h2>
                <span className="k-count">{list.length}</span>
              </div>
              <div className="k-col-body">
                {list.length === 0 && <p className="k-empty">{col.st === 'new' ? 'Новых заказов нет' : 'Пусто'}</p>}
                {list.map((o) => {
                  const from = o[col.from] || o.createdAt;
                  const mins = (now - from) / 60000;
                  const level = mins >= col.late ? 'late' : mins >= col.warn ? 'warn' : 'ok';
                  const qty = o.items.reduce((a, i) => a + i.q, 0);
                  return (
                    <article key={o.num} className={cx('k-card', `k-card-${level}`, col.st === 'new' && 'k-card-new')}>
                      <div className="k-card-head">
                        <span className="k-num">№{o.num}</span>
                        <span className={cx('k-timer', `k-timer-${level}`)} title="Время в этой колонке">
                          {elapsed(from, now)}
                        </span>
                      </div>
                      <div className="k-meta">
                        {o.zone} · {qty} поз. · {o.client}
                      </div>
                      <ul className="k-items">
                        {o.items.map((i, idx) => {
                          const key = `${o.num}-${idx}`;
                          const on = !!checked[key];
                          return (
                            <li key={key}>
                              <button type="button" className={cx('k-item', on && 'k-item-done')} aria-pressed={on} onClick={() => toggleItem(key)}>
                                <span className="k-qty">{i.q}×</span>
                                <span className="k-name">{i.name}</span>
                                <span className="k-check" aria-hidden="true">
                                  {on && <IconCheck size={16} />}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {o.note && <div className="k-note">{o.note}</div>}
                      <button
                        type="button"
                        className="k-action"
                        onClick={() => {
                          setOrderStatus(o.num, col.next);
                          flash(`№${o.num}: ${col.action.toLowerCase()}`);
                        }}
                      >
                        {col.action}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <Toast message={toast} />
    </div>
  );
}
