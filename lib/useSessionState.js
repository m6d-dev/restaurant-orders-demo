'use client';

import { useEffect, useState } from 'react';

/** Состояние, которое живёт в sessionStorage (своё у каждой вкладки). */
export function useSessionState(key, initial) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, loaded]);

  return [value, setValue];
}
