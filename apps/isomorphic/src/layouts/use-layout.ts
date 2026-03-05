'use client';

import { LAYOUT_OPTIONS } from '@/config/enums';
import { atom, useAtom } from 'jotai';

// 1. set initial atom for isomorphic layout
const isomorphicLayoutAtom = atom(
  globalThis.window === undefined
    ? LAYOUT_OPTIONS.HYDROGEN
    : globalThis.localStorage.getItem('isomorphic-layout')
);

const isomorphicLayoutAtomWithPersistence = atom(
  (get) => get(isomorphicLayoutAtom),
  (get, set, newStorage: string) => {
    set(isomorphicLayoutAtom, newStorage);
    globalThis.localStorage.setItem('isomorphic-layout', newStorage);
  }
);

// 2. useLayout hook to check which layout is available
export function useLayout() {
  const [layout, setLayout] = useAtom(isomorphicLayoutAtomWithPersistence);
  return {
    layout: layout ?? LAYOUT_OPTIONS.HYDROGEN,
    setLayout,
  };
}
