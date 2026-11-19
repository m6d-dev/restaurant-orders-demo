'use client';

import { useEffect, useState } from 'react';

/** Текущее время, обновляется каждые `ms` миллисекунд (для таймеров). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function elapsed(from, now) {
  const s = Math.max(0, Math.floor((now - from) / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
