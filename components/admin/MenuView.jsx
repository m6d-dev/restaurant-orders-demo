'use client';

import { useState } from 'react';
import { updateStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/data';
import { money } from '@/lib/utils';
import { Chip, Switch } from '@/components/ui';
import { IconPlus } from '@/components/Icons';

const EMPTY = { name: '', cat: 'plov', price: '', weight: '', desc: '' };
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || id;

export default function MenuView({ state, flash }) {
  const [cat, setCat] = useState('all');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);

  const list = state.dishes.filter((d) => cat === 'all' || d.cat === cat);
  const stopCount = state.dishes.filter((d) => !d.on).length;

  const toggle = (d, on) => {
    updateStore((s) => {
      s.dishes.find((x) => x.id === d.id).on = on;
    });
    flash(on ? `«${d.name}» снова на сайте` : `«${d.name}» в стопе — пропало с сайта`);
  };

  const remove = (d) => {
    updateStore((s) => {
      s.dishes = s.dishes.filter((x) => x.id !== d.id);
    });
    flash(`«${d.name}» удалено`);
  };

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Меню и стоп-лист</h1>
          <p className="muted">Выключите «В наличии» — блюдо пропадёт с сайта, пока вы его не вернёте.</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={() => setAdding(true)} disabled={adding}>
          <IconPlus size={18} /> Добавить блюдо
        </button>
      </div>

      <div className="chips" role="group" aria-label="Категория">
        <Chip active={cat === 'all'} onClick={() => setCat('all')} count={state.dishes.length}>
          Все
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} count={state.dishes.filter((d) => d.cat === c.id).length}>
            {c.name}
          </Chip>
        ))}
      </div>

      {stopCount > 0 && <p className="note-warn">В стопе: {stopCount}. Эти блюда клиенты сейчас не видят.</p>}

      {adding && (
        <div className="card">
          <h2>Новое блюдо</h2>
          <DishForm
            initial={{ ...EMPTY, cat: cat === 'all' ? 'plov' : cat }}
            onCancel={() => setAdding(false)}
            onSave={(v) => {
              updateStore((s) => {
                s.dishes.push({ id: s.nextDishId++, ...v, on: true });
              });
              setAdding(false);
              flash(`«${v.name}» добавлено и уже на сайте`);
            }}
          />
        </div>
      )}

      <div className="card no-pad">
        <div className="table-wrap">
          <table className="table menu-table">
            <thead>
              <tr>
                <th>Блюдо</th>
                <th>Категория</th>
                <th className="num">Цена</th>
                <th>В наличии</th>
                <th className="num">Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) =>
                editId === d.id ? (
                  <tr key={d.id}>
                    <td colSpan={5}>
                      <DishForm
                        initial={{ ...d, price: String(d.price) }}
                        onCancel={() => setEditId(null)}
                        onSave={(v) => {
                          updateStore((s) => {
                            Object.assign(
                              s.dishes.find((x) => x.id === d.id),
                              v
                            );
                          });
                          setEditId(null);
                          flash('Блюдо сохранено');
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={d.id} className={d.on ? '' : 'row-off'}>
                    <td>
                      <div className="strong">{d.name}</div>
                      <div className="muted small">
                        {d.weight ? `${d.weight} · ` : ''}
                        {d.desc}
                      </div>
                    </td>
                    <td>{catName(d.cat)}</td>
                    <td className="num nowrap">{money(d.price)}</td>
                    <td>
                      <Switch checked={d.on} onChange={(v) => toggle(d, v)} label={d.on ? 'Да' : 'Стоп'} />
                    </td>
                    <td className="num">
                      <div className="row gap end">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditId(d.id)}>
                          Изменить
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={() => remove(d)}>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DishForm({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const id = initial.id || 'new';

  const save = (e) => {
    e.preventDefault();
    const price = parseInt(v.price, 10);
    if (!v.name.trim()) return setErr('Введите название');
    if (!price || price <= 0) return setErr('Укажите цену');
    onSave({ name: v.name.trim(), cat: v.cat, price, weight: v.weight.trim(), desc: v.desc.trim() });
  };

  return (
    <form className="dish-form" onSubmit={save}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`dn-${id}`}>Название</label>
          <input id={`dn-${id}`} value={v.name} onChange={set('name')} />
        </div>
        <div className="field">
          <label htmlFor={`dc-${id}`}>Категория</label>
          <select id={`dc-${id}`} value={v.cat} onChange={set('cat')}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`dp-${id}`}>Цена, смн</label>
          <input id={`dp-${id}`} inputMode="numeric" value={v.price} onChange={set('price')} />
        </div>
        <div className="field">
          <label htmlFor={`dw-${id}`}>Вес / объём</label>
          <input id={`dw-${id}`} value={v.weight} onChange={set('weight')} placeholder="350 г" />
        </div>
        <div className="field span-all">
          <label htmlFor={`dd-${id}`}>Описание</label>
          <input id={`dd-${id}`} value={v.desc} onChange={set('desc')} />
        </div>
      </div>
      {err && <p className="form-err">{err}</p>}
      <div className="row gap">
        <button type="submit" className="btn btn-accent">
          Сохранить блюдо
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
