'use client';

import { useState } from 'react';
import { resetStore } from '@/lib/store';

export default function ResetDemoButton() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => {
        resetStore();
        try {
          sessionStorage.clear();
        } catch {}
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? 'Данные сброшены' : 'Сбросить демо-данные'}
    </button>
  );
}
