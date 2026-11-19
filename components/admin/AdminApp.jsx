'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore, updateStore, resetStore } from '@/lib/store';
import { cx } from '@/lib/utils';
import { beep } from '@/lib/beep';
import { Loading, Switch, Toast } from '@/components/ui';
import { IconBook, IconChart, IconExternal, IconList, IconMap, IconRefresh, IconSettings, IconStar, IconChef } from '@/components/Icons';
import Orders from './Orders';
import Analytics from './Analytics';
import MenuView from './MenuView';
import Zones from './Zones';
import Settings from './Settings';
import Reviews from './Reviews';

export default function AdminApp() {
  const state = useStore();
  const [tab, setTab] = useState('orders');
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const timer = useRef(null);
  const maxSeen = useRef(null);

  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  // Новый заказ пришёл с сайта (из другой вкладки) — звук и уведомление.
  useEffect(() => {
    if (!state) return;
    const top = state.orders.reduce((m, o) => Math.max(m, o.num), 0);
    if (maxSeen.current != null && top > maxSeen.current) {
      const o = state.orders.find((x) => x.num === top);
      if (o && o.st === 'new' && !o.test) {
        beep();
        flash(`Новый заказ №${o.num} — ${o.client}`);
        setSelected(o.num);
      }
    }
    maxSeen.current = top;
  }, [state, flash]);

  // Новый отзыв с сайта — уведомление.
  const reviewsSeen = useRef(null);
  useEffect(() => {
    if (!state) return;
    const n = (state.reviews || []).length;
    if (reviewsSeen.current != null && n > reviewsSeen.current) {
      const r = [...state.reviews].sort((a, b) => b.at - a.at)[0];
      flash(`Новый отзыв: ${r.client}, ${r.rating} из 5`);
    }
    reviewsSeen.current = n;
  }, [state, flash]);

  const newCount = state ? state.orders.filter((o) => o.st === 'new').length : 0;
  useEffect(() => {
    if (!state) return;
    document.title = newCount ? `(${newCount}) Панель — ${state.settings.name}` : `Панель — ${state.settings.name}`;
  }, [newCount, state]);

  if (!state) return <Loading />;

  const { settings } = state;
  const noReply = (state.reviews || []).filter((r) => !r.reply).length;
  const stopCount = state.dishes.filter((d) => !d.on).length;
  const nav = [
    { id: 'orders', label: 'Заказы', icon: IconList, badge: newCount || null },
    { id: 'analytics', label: 'Аналитика', icon: IconChart },
    { id: 'reviews', label: 'Отзывы', icon: IconStar, badge: noReply || null, muted: true },
    { id: 'menu', label: 'Меню и стоп-лист', icon: IconBook, badge: stopCount ? `${stopCount} в стопе` : null, muted: true },
    { id: 'zones', label: 'Зоны доставки', icon: IconMap },
    { id: 'settings', label: 'Настройки сайта', icon: IconSettings },
  ];

  return (
    <div className="admin" style={{ '--accent': settings.accent }}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">{settings.name.slice(0, 1)}</div>
          <div className="brand-text">
            <span className="brand-name">{settings.name}</span>
            <span className="brand-sub">Панель ресторана</span>
          </div>
        </div>

        <div className={cx('accepting', state.accepting ? 'accepting-on' : 'accepting-off')}>
          <Switch
            checked={state.accepting}
            onChange={(v) => {
              updateStore((s) => {
                s.accepting = v;
              });
              flash(v ? 'Сайт снова принимает заказы' : 'Приём заказов на паузе');
            }}
            label={
              <>
                <span className="accepting-label-long">{state.accepting ? 'Принимаем заказы' : 'Пауза — заказы не принимаются'}</span>
                <span className="accepting-label-short">{state.accepting ? 'Принимаем' : 'Пауза'}</span>
              </>
            }
          />
        </div>

        <nav className="side-nav" aria-label="Разделы панели">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cx('side-link', tab === n.id && 'side-link-active')}
              aria-current={tab === n.id ? 'page' : undefined}
              onClick={() => setTab(n.id)}
            >
              <n.icon size={20} />
              <span className="side-label">{n.label}</span>
              {n.badge && <span className={cx('side-badge', n.muted && 'side-badge-muted')}>{n.badge}</span>}
            </button>
          ))}
          <Link href="/kitchen" target="_blank" className="side-link">
            <IconChef size={20} />
            <span className="side-label">Экран кухни</span>
            <IconExternal size={16} />
          </Link>
        </nav>

        <div className="sidebar-foot">
          <Link href="/shop" target="_blank" className="side-link">
            <IconExternal size={20} />
            <span className="side-label">Открыть сайт</span>
          </Link>
          <button
            type="button"
            className="side-link"
            onClick={() => {
              resetStore();
              setSelected(null);
              flash('Демо-данные сброшены');
            }}
          >
            <IconRefresh size={20} />
            <span className="side-label">Сбросить демо</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'orders' && <Orders state={state} flash={flash} selected={selected} setSelected={setSelected} />}
        {tab === 'analytics' && <Analytics state={state} />}
        {tab === 'reviews' && <Reviews state={state} flash={flash} />}
        {tab === 'menu' && <MenuView state={state} flash={flash} />}
        {tab === 'zones' && <Zones state={state} flash={flash} />}
        {tab === 'settings' && <Settings state={state} flash={flash} />}
      </main>

      <Toast message={toast} />
    </div>
  );
}
