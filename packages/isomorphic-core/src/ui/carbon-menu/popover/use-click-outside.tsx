import { useEffect, useRef } from 'react';

const DEFAULT_EVENTS = ['mousedown', 'touchstart'];

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  events: string[] = DEFAULT_EVENTS,
  nodes?: (HTMLElement | null)[]
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event?.target as Node | null;
      if (Array.isArray(nodes)) {
        const shouldIgnore =
          target &&
          'hasAttribute' in target &&
          (target.hasAttribute('data-ignore-outside-clicks') ||
            (!document.body.contains(target) && (target as Element).tagName !== 'HTML'));
        const shouldTrigger = nodes.every(
          (node) => !!node && !event.composedPath().includes(node)
        );
        shouldTrigger && !shouldIgnore && handler();
      } else if (ref.current && !ref.current.contains(target)) {
        handler();
      }
    };

    (events || DEFAULT_EVENTS).forEach((fn) =>
      document.addEventListener(fn, listener)
    );

    return () => {
      (events || DEFAULT_EVENTS).forEach((fn) =>
        document.removeEventListener(fn, listener)
      );
    };
  }, [ref, handler, nodes, events]);

  return ref;
}
