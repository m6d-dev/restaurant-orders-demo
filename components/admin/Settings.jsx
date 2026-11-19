'use client';

import { useState } from 'react';
import { updateStore } from '@/lib/store';
import { PAY_METHODS, PLATFORM_NAME, SWATCHES } from '@/lib/data';
import { cx } from '@/lib/utils';
import { Field, Switch } from '@/components/ui';
import { IconCart, IconClock } from '@/components/Icons';

export default function Settings({ state, flash }) {
  const [v, setV] = useState(() => structuredClone(state.settings));
  const [dirty, setDirty] = useState(false);
  const upd = (patch) => {
    setV((x) => ({ ...x, ...patch }));
    setDirty(true);
  };
  const set = (k) => (e) => upd({ [k]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    if (!v.name.trim()) return flash('Введите название ресторана');
    updateStore((s) => {
      s.settings = { ...v, name: v.name.trim(), sub: v.sub.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') };
    });
    setDirty(false);
    flash('Настройки сохранены — сайт обновился');
  };

  const siteUrl = v.domain.trim() || `${v.sub || 'restaurant'}.${PLATFORM_NAME.toLowerCase()}.tj`;

  return (
    <form className="view" onSubmit={save}>
      <div className="view-head">
        <div>
          <h1>Настройки сайта</h1>
          <p className="muted">
            Ваш сайт: <span className="strong">{siteUrl}</span>
          </p>
        </div>
        <button type="submit" className="btn btn-accent" disabled={!dirty}>
          Сохранить настройки
        </button>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Так клиент увидит шапку сайта</h2>
        </div>
        <div className="preview" style={{ '--accent': v.accent }}>
          <div className="brand">
            <div className="brand-logo">{(v.name || '?').slice(0, 1)}</div>
            <div className="brand-text">
              <span className="brand-name">{v.name || 'Название'}</span>
              <span className="brand-sub">
                {v.tagline} · {v.address}
              </span>
            </div>
          </div>
          <div className="row gap wrap center-y">
            <span className="meta-item">
              <IconClock size={18} /> {v.open}–{v.close}
            </span>
            <span className="btn btn-accent btn-pill" aria-hidden="true">
              <IconCart size={18} /> Корзина
            </span>
          </div>
        </div>
      </section>

      <div className="grid-2 settings-grid">
        <section className="card">
          <div className="card-head">
            <h2>Ресторан</h2>
          </div>
          <div className="form-stack">
            <Field label="Название" htmlFor="s-name">
              <input id="s-name" value={v.name} onChange={set('name')} />
            </Field>
            <Field label="Подзаголовок" htmlFor="s-tag">
              <input id="s-tag" value={v.tagline} onChange={set('tagline')} />
            </Field>
            <Field label="Адрес" htmlFor="s-addr">
              <input id="s-addr" value={v.address} onChange={set('address')} />
            </Field>
            <Field label="Телефон ресторана" htmlFor="s-phone">
              <input id="s-phone" type="tel" value={v.phone} onChange={set('phone')} />
            </Field>
            <div className="form-grid">
              <Field label="Открытие" htmlFor="s-open">
                <input id="s-open" type="time" value={v.open} onChange={set('open')} />
              </Field>
              <Field label="Закрытие" htmlFor="s-close">
                <input id="s-close" type="time" value={v.close} onChange={set('close')} />
              </Field>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Внешний вид и адрес</h2>
          </div>
          <div className="form-stack">
            <fieldset className="field">
              <legend>Цвет бренда</legend>
              <div className="swatches">
                {SWATCHES.map((s) => (
                  <button
                    key={s.c}
                    type="button"
                    className={cx('swatch', v.accent === s.c && 'swatch-active')}
                    style={{ background: s.c }}
                    aria-label={s.label}
                    aria-pressed={v.accent === s.c}
                    onClick={() => upd({ accent: s.c })}
                  />
                ))}
              </div>
            </fieldset>
            <Field label="Поддомен на платформе" htmlFor="s-sub" hint={`${v.sub || '…'}.${PLATFORM_NAME.toLowerCase()}.tj`}>
              <input id="s-sub" value={v.sub} onChange={set('sub')} />
            </Field>
            <Field label="Свой домен (необязательно)" htmlFor="s-domain">
              <input id="s-domain" value={v.domain} onChange={set('domain')} placeholder="dastarkhon.tj" />
            </Field>
            <fieldset className="field">
              <legend>Способы оплаты на сайте</legend>
              <div className="form-stack tight">
                {PAY_METHODS.map((p) => (
                  <Switch
                    key={p.id}
                    checked={v.pays?.[p.id] !== false}
                    onChange={(on) => upd({ pays: { ...v.pays, [p.id]: on } })}
                    label={p.label}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="card span-2">
          <div className="card-head">
            <h2>Уведомления в Telegram</h2>
          </div>
          <div className="form-stack">
            <Field label="ID чата или группы кухни" htmlFor="s-tg" hint="В демо уведомления не отправляются — показан только интерфейс.">
              <input id="s-tg" value={v.tg} onChange={set('tg')} placeholder="@kitchen_dastarkhon" />
            </Field>
            <Switch checked={v.tgNew} onChange={(on) => upd({ tgNew: on })} label="Сообщать о новых заказах" />
            <Switch checked={v.tgCancel} onChange={(on) => upd({ tgCancel: on })} label="Сообщать об отменах" />
          </div>
        </section>
      </div>
    </form>
  );
}
