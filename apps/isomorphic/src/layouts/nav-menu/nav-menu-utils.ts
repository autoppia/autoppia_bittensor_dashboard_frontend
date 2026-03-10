import { Dispatch } from 'react';
import { InitialState } from './nav-menu-types';

/** Ref type with mutable current (avoids deprecated MutableRefObject in Sonar) */
type MutableRef<T> = { current: T };

export function navMenuReducer(prev: InitialState, next: InitialState) {
  return { ...prev, ...next };
}

export function handleMouseEnter({
  index,
  el,
  set,
  contentRefs,
}: Readonly<{
  index: number;
  el: HTMLElement;
  set: Dispatch<unknown>;
  contentRefs: MutableRef<(HTMLElement | null)[]>;
}>) {
  set({
    hovering: index,
    popoverLeft: el.offsetLeft,
    hoveringWidth: el.offsetWidth,
    hoveringElRect: el.getBoundingClientRect(),
  });
  const contentElement = contentRefs.current[index];
  if (contentElement) {
    set({
      popoverHeight: contentElement.offsetHeight,
      popoverWidth: contentElement.offsetWidth,
    });
  }
}
