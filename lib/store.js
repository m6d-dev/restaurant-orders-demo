'use client';

// Общее «демо-хранилище» в localStorage. Сайт и панель открываются в разных
// вкладках одного браузера и видят изменения друг друга сразу (событие storage).
// Бэкенда нет — это только для презентации.

import { useSyncExternalStore } from 'react';
import { defaultState, STATUS_TIME_KEY } from './data';

const KEY = 'restaurant-orders-demo-v1';
const listeners = new Set();
let cacheRaw = null;
let cacheVal = null;

function read() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (!raw) {
    const fresh = defaultState();
    raw = JSON.stringify(fresh);
    try {
      localStorage.setItem(KEY, raw);
    } catch {}
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      // Подмешиваем новые поля (например, reviews) в данные, сохранённые старой версией демо.
      cacheVal = { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      cacheVal = defaultState();
    }
  }
  return cacheVal;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function getState() {
  return read();
}

/** updateStore(s => { s.accepting = false }) — мутируйте копию, она сохранится. */
export function updateStore(fn) {
  const next = structuredClone(read());
  const result = fn(next);
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, raw);
  } catch {}
  cacheRaw = raw;
  cacheVal = next;
  emit();
  return result;
}

/** Меняет статус заказа и запоминает время перехода (нужно для таймеров кухни). */
export function setOrderStatus(num, st, extra = {}) {
  updateStore((s) => {
    const o = s.orders.find((x) => x.num === num);
    if (!o) return;
    o.st = st;
    const key = STATUS_TIME_KEY[st];
    if (key) o[key] = Date.now();
    Object.assign(o, extra);
  });
}

export function resetStore() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  cacheRaw = null;
  cacheVal = null;
  read();
  emit();
}

/** null на сервере и до гидратации — рендерим заглушку. */
export function useStore() {
  return useSyncExternalStore(subscribe, read, () => null);
}
