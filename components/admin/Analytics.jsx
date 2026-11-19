'use client';

import { useMemo, useState } from 'react';
import { computeAnalytics } from '@/lib/analytics';
import { cx } from '@/lib/utils';
import { BarList, Chip } from '@/components/ui';

const PERIODS = [
  ['today', 'Сегодня'],
  ['7', '7 дней'],
  ['30', '30 дней'],
];

export default function Analytics({ state }) {
  const [period, setPeriod] = useState('7');
  const a = useMemo(() => computeAnalytics(state, period), [state, period]);

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Аналитика</h1>
          <p className="muted">Демо-история + сегодняшние заказы (живые данные)</p>
        </div>
        <div className="chips" role="group" aria-label="Период">
          {PERIODS.map(([id, label]) => (
            <Chip key={id} active={period === id} onClick={() => setPeriod(id)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="kpi-row">
        {a.kpis.map((k) => (
          <div key={k.label} className="kpi">
            <span className="stat-label">{k.label}</span>
            <span className="kpi-value">{k.value}</span>
            <span className="small" style={{ color: k.d.fg }}>
              {k.d.text}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {a.showDays && (
          <section className="card span-2">
            <div className="card-head">
              <h2>Выручка по дням, смн</h2>
              <span className="muted small">Жёлтый столбец — сегодня</span>
            </div>
            <Bars bars={a.dayBars} hl="today" tall />
          </section>
        )}

        <section className="card">
          <div className="card-head">
            <h2>Заказы по часам</h2>
            <span className="muted small">Жёлтый — пиковый час</span>
          </div>
          <Bars bars={a.hourBars} hl="peak" />
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Воронка сайта</h2>
          </div>
          <BarList rows={a.funnel} />
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Топ блюд по выручке</h2>
          </div>
          {a.topDishes.length === 0 ? (
            <p className="muted">За этот период пока нет выполненных заказов.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Блюдо</th>
                  <th className="num">Продано</th>
                  <th className="num">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {a.topDishes.map((d) => (
                  <tr key={d.name}>
                    <td className="muted">{d.rank}</td>
                    <td>
                      <div>{d.name}</div>
                      <div className="mini-track">
                        <div className="mini-fill" style={{ width: `${d.w}%` }} />
                      </div>
                    </td>
                    <td className="num nowrap">{d.q}</td>
                    <td className="num nowrap">
                      {d.rev} <span className="muted small">{d.share}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Что стоит заметить</h2>
          </div>
          <ul className="insights">
            {a.insights.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>По районам</h2>
          </div>
          <BarList rows={a.zones} />
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Способы оплаты</h2>
          </div>
          <BarList rows={a.pays} />
        </section>

        <section className="card span-2">
          <div className="card-head">
            <h2>Причины отказов</h2>
          </div>
          {a.reasons.length === 0 ? <p className="muted">Отказов не было.</p> : <BarList rows={a.reasons} accent={false} />}
        </section>
      </div>
    </div>
  );
}

function Bars({ bars, hl, tall }) {
  return (
    <div className={cx('bars', tall && 'bars-tall')} role="img" aria-label={bars.map((b) => b.tip).join('; ')}>
      {bars.map((b, i) => (
        <div key={i} className="bar-col" title={b.tip}>
          {b.val && <span className="bar-val">{b.val}</span>}
          <div className="bar-area">
            <div className={cx('bar', b[hl] && 'bar-hl')} style={{ height: `${b.h}%` }} />
          </div>
          <span className="bar-label">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
