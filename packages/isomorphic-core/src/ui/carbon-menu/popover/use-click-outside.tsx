import { useEffect, useRef } from 'react';

const DEFAULT_EVENTS: (keyof DocumentEventMap)[] = ['mousedown', 'touchstart'];

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  events: (keyof DocumentEventMap)[] = DEFAULT_EVENTS,
  nodes?: (HTMLElement | null)[]
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const target = event.target as Node | null;

      if (Array.isArray(nodes)) {
        const htmlTarget = target instanceof HTMLElement ? target : null;

        const shouldIgnore =
          htmlTarget &&
          (htmlTarget.dataset.ignoreOutsideClicks !== undefined ||
            (!document.body.contains(htmlTarget) &&
              htmlTarget.tagName !== 'HTML'));

        const shouldTrigger = nodes.every(
          (node) => !!node && !event.composedPath().includes(node)
        );

        shouldTrigger && !shouldIgnore && handler();
      } else if (ref.current && target && !ref.current.contains(target)) {
        handler();
      }
    };

    (events || DEFAULT_EVENTS).forEach((eventName) =>
      document.addEventListener(eventName, listener)
    );

    return () => {
      (events || DEFAULT_EVENTS).forEach((eventName) =>
        document.removeEventListener(eventName, listener)
      );
    };
  }, [ref, handler, nodes, events]);

  return ref;
}
