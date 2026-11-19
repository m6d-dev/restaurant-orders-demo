'use client';

import { useState } from 'react';
import { updateStore } from '@/lib/store';
import { pct, plural } from '@/lib/utils';
import { Chip, Stars, relDay } from '@/components/ui';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'noreply', label: 'Без ответа' },
  { id: 'bad', label: 'Оценка 3 и ниже' },
];

export default function Reviews({ state, flash }) {
  const [filter, setFilter] = useState('all');
  const all = [...(state.reviews || [])].sort((a, b) => b.at - a.at);
  const avg = all.length ? all.reduce((a, r) => a + r.rating, 0) / all.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: all.filter((r) => r.rating === n).length }));
  const maxC = Math.max(1, ...dist.map((d) => d.c));
  const noReply = all.filter((r) => !r.reply).length;

  const list = all.filter((r) => (filter === 'noreply' ? !r.reply : filter === 'bad' ? r.rating <= 3 : true));
  const counts = { all: all.length, noreply: noReply, bad: all.filter((r) => r.rating <= 3).length };

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Отзывы</h1>
          <p className="muted">Клиент оставляет отзыв на сайте после доставки. Ответ ресторана видят все посетители сайта.</p>
        </div>
      </div>

      <div className="reviews-summary">
        <div className="card rating-card">
          <span className="stat-label">Средняя оценка</span>
          <span className="rating-big">{avg.toFixed(1).replace('.', ',')}</span>
          <Stars value={avg} size={22} />
          <span className="muted small">
            {all.length} {plural(all.length, ['отзыв', 'отзыва', 'отзывов'])}
          </span>
        </div>
        <div className="card">
          <span className="stat-label">Распределение оценок</span>
          <div className="dist">
            {dist.map((d) => (
              <div key={d.n} className="dist-row">
                <span className="dist-label">{d.n} ★</span>
                <div className="barlist-track">
                  <div className="barlist-fill dist-fill" style={{ width: `${Math.max(2, (d.c / maxC) * 100)}%` }} />
                </div>
                <span className="dist-val">
                  {d.c} <span className="muted">· {pct(d.c, all.length)}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <span className="stat-label">Ждут ответа</span>
          <span className="rating-big">{noReply}</span>
          <span className="muted small">Ответ на отзыв повышает доверие новых клиентов — особенно на негативный.</span>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Фильтр отзывов">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={counts[f.id]}>
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="review-list">
        {list.length === 0 && <p className="muted">Здесь пока пусто.</p>}
        {list.map((r) => (
          <ReviewItem key={r.id} r={r} flash={flash} />
        ))}
      </div>
    </div>
  );
}

function ReviewItem({ r, flash }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(r.reply || '');

  const save = (e) => {
    e.preventDefault();
    updateStore((s) => {
      const x = s.reviews.find((v) => v.id === r.id);
      if (x) x.reply = text.trim();
    });
    setEditing(false);
    flash(text.trim() ? 'Ответ опубликован на сайте' : 'Ответ удалён');
  };

  return (
    <article className={'card review-item' + (r.rating <= 3 ? ' review-item-bad' : '')}>
      <div className="review-top">
        <div className="row gap wrap">
          <span className="strong">{r.client}</span>
          <Stars value={r.rating} />
        </div>
        <span className="muted small">
          {relDay(r.at)}
          {r.orderNum ? ` · заказ №${r.orderNum}` : ''}
        </span>
      </div>
      {r.text ? <p>{r.text}</p> : <p className="muted">Без комментария</p>}

      {editing ? (
        <form className="reply-form" onSubmit={save}>
          <label htmlFor={`reply-${r.id}`} className="small strong">
            Ответ ресторана
          </label>
          <textarea id={`reply-${r.id}`} rows={2} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          <div className="row gap">
            <button type="submit" className="btn btn-accent btn-sm">
              Опубликовать
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
        </form>
      ) : r.reply ? (
        <div className="review-reply">
          <div className="review-top">
            <span className="small strong">Ответ ресторана</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
              Изменить
            </button>
          </div>
          <p>{r.reply}</p>
        </div>
      ) : (
        <div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
            Ответить
          </button>
        </div>
      )}
    </article>
  );
}
