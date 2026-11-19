'use client';

import { useState } from 'react';
import { cx } from '@/lib/utils';
import { STATUS } from '@/lib/data';

export function Switch({ checked, onChange, label, hideLabel = false }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      <span className={cx(hideLabel && 'sr-only')}>{label}</span>
    </label>
  );
}

export function Chip({ active, onClick, children, count }) {
  return (
    <button type="button" className={cx('chip', active && 'chip-active')} aria-pressed={active} onClick={onClick}>
      {children}
      {count != null && <span className="chip-count">{count}</span>}
    </button>
  );
}

export function StatusBadge({ st }) {
  const s = STATUS[st];
  return (
    <span className="badge" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

export function Toast({ message }) {
  return (
    <div className={cx('toast', message && 'toast-show')} role="status" aria-live="polite">
      {message}
    </div>
  );
}

export function Loading() {
  return (
    <div className="loading" aria-busy="true">
      <div className="spinner" />
    </div>
  );
}

export function Field({ label, htmlFor, children, hint }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

const STAR_PATH = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z';

function Star({ fill, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR_PATH} fill={fill ? '#E8A317' : '#DDD6C8'} />
    </svg>
  );
}

/** Звёзды рейтинга только для показа. */
export function Stars({ value, size = 16 }) {
  return (
    <span className="stars" role="img" aria-label={`Оценка ${Number(value).toFixed(1).replace('.', ',')} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} fill={n <= Math.round(value)} size={size} />
      ))}
    </span>
  );
}

const RATING_WORDS = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'];

/** Выбор оценки 1–5 (радиокнопки, работает с клавиатуры). */
export function StarInput({ value, onChange, name = 'rating' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset className="star-input">
      <legend className="sr-only">Оценка</legend>
      <div className="star-input-row" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="star-input-star" onMouseEnter={() => setHover(n)}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
            <Star fill={n <= shown} size={32} />
            <span className="sr-only">
              {n} — {RATING_WORDS[n]}
            </span>
          </label>
        ))}
        <span className="star-input-word">{RATING_WORDS[shown]}</span>
      </div>
    </fieldset>
  );
}

export function relDay(ms) {
  const days = Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function BarList({ rows, accent = true }) {
  return (
    <div className="barlist">
      {rows.map((r) => (
        <div key={r.name} className="barlist-row">
          <div className="barlist-top">
            <span>{r.name}</span>
            <span className="barlist-val">
              {r.value}
              {r.share && <span className="muted"> · {r.share}</span>}
            </span>
          </div>
          <div className="barlist-track">
            <div className={cx('barlist-fill', !accent && 'barlist-fill-warn')} style={{ width: `${r.w}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
