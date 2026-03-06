import { useRef } from 'react';
import { useUpdate } from './use-update';

interface UseFocusReturn {
  opened: boolean;
  shouldReturnFocus?: boolean;
}

/** Returns focus to last active element, used in Modal and Drawer */
export function useFocusReturn({
  opened,
  shouldReturnFocus = true,
}: UseFocusReturn) {
  const lastActiveElement = useRef<HTMLElement>(null);
  const returnFocus = () => {
    if (
      lastActiveElement.current &&
      'focus' in lastActiveElement.current &&
      typeof lastActiveElement.current.focus === 'function'
    ) {
      lastActiveElement.current?.focus({ preventScroll: true });
    }
  };

  useUpdate(() => {
    let timeout: ReturnType<typeof globalThis.setTimeout>;

    const clearFocusTimeout = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        globalThis.clearTimeout(timeout);
      }
    };

    document.addEventListener('keydown', clearFocusTimeout);

    if (opened) {
      lastActiveElement.current = document.activeElement as HTMLElement;
    } else if (shouldReturnFocus) {
      timeout = globalThis.setTimeout(returnFocus, 10);
    }

    return () => {
      globalThis.clearTimeout(timeout);
      document.removeEventListener('keydown', clearFocusTimeout);
    };
  }, [opened, shouldReturnFocus]);

  return returnFocus;
}
