'use client';

import { useState } from 'react';
import { updateStore } from '@/lib/store';
import { IconPlus, IconX } from '@/components/Icons';

const num = (v) => {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
};

export default function Zones({ state, flash }) {
  const [rows, setRows] = useState(() => state.zones.map((z) => ({ ...z })));
  const [dirty, setDirty] = useState(false);

  const set = (id, k) => (e) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: e.target.value } : r)));
    setDirty(true);
  };

  const add = () => {
    const id = Date.now();
    setRows((rs) => [...rs, { id, name: '', short: '', fee: 20, min: 60, free: '', time: '45–60 мин', fresh: true }]);
    setDirty(true);
  };

  const remove = (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    setDirty(true);
  };

  const save = () => {
    const clean = rows
      .filter((r) => r.name.trim())
      .map(({ fresh, ...r }) => ({
        ...r,
        name: r.name.trim(),
        short: r.name.trim().split(/[,(]/)[0].trim(),
        fee: num(r.fee),
        min: num(r.min),
        free: String(r.free).trim() === '' ? '' : num(r.free),
      }));
    if (!clean.length) return flash('Нужен хотя бы один район');
    updateStore((s) => {
      s.zones = clean;
    });
    setRows(clean);
    setDirty(false);
    flash('Зоны доставки сохранены — сайт уже считает по-новому');
  };

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Зоны доставки</h1>
          <p className="muted">Клиент выбирает район при заказе — сайт сам считает доставку и минимальную сумму.</p>
        </div>
      </div>

      <div className="card no-pad">
        <div className="table-wrap">
          <table className="table zones-table">
            <thead>
              <tr>
                <th>Район</th>
                <th>Доставка, смн</th>
                <th>Мин. заказ, смн</th>
                <th>Бесплатно от, смн</th>
                <th>Время</th>
                <th>
                  <span className="sr-only">Удалить</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td data-label="Район">
                    <input aria-label="Название района" value={r.name} onChange={set(r.id, 'name')} placeholder="Название района" />
                  </td>
                  <td data-label="Доставка, смн">
                    <input aria-label="Стоимость доставки" inputMode="numeric" className="input-sm" value={r.fee} onChange={set(r.id, 'fee')} />
                  </td>
                  <td data-label="Мин. заказ, смн">
                    <input aria-label="Минимальный заказ" inputMode="numeric" className="input-sm" value={r.min} onChange={set(r.id, 'min')} />
                  </td>
                  <td data-label="Бесплатно от, смн">
                    <input aria-label="Бесплатная доставка от" inputMode="numeric" className="input-sm" value={r.free} onChange={set(r.id, 'free')} placeholder="—" />
                  </td>
                  <td data-label="Время">
                    <input aria-label="Время доставки" className="input-md" value={r.time} onChange={set(r.id, 'time')} />
                  </td>
                  <td>
                    <button type="button" className="icon-btn" aria-label={`Удалить район ${r.name}`} onClick={() => remove(r.id)}>
                      <IconX size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row gap wrap">
        <button type="button" className="btn btn-outline" onClick={add}>
          <IconPlus size={18} /> Добавить район
        </button>
        <button type="button" className="btn btn-accent" onClick={save} disabled={!dirty}>
          Сохранить зоны
        </button>
        {dirty && <span className="muted small">Есть несохранённые изменения</span>}
      </div>
    </div>
  );
}
