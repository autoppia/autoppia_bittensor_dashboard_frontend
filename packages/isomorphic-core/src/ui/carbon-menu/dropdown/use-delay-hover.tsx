import { useEffect, useRef } from 'react';

interface UseDelayedHoverProps {
  open: () => void;
  close: () => void;
  openDelay: number | undefined;
  closeDelay: number | undefined;
}

export function useDelayedHover({
  open,
  close,
  openDelay,
  closeDelay,
}: UseDelayedHoverProps) {
  const openTimeout = useRef<ReturnType<typeof globalThis.setTimeout> | undefined>(
    undefined
  );
  const closeTimeout = useRef<ReturnType<typeof globalThis.setTimeout> | undefined>(
    undefined
  );

  const clearTimeouts = () => {
    globalThis.clearTimeout(openTimeout.current);
    globalThis.clearTimeout(closeTimeout.current);
  };

  const openDropdown = () => {
    clearTimeouts();

    if (openDelay === 0 || openDelay === undefined) {
      open();
    } else {
      openTimeout.current = globalThis.setTimeout(open, openDelay);
    }
  };

  const closeDropdown = () => {
    clearTimeouts();

    if (closeDelay === 0 || closeDelay === undefined) {
      close();
    } else {
      closeTimeout.current = globalThis.setTimeout(close, closeDelay);
    }
  };

  useEffect(() => clearTimeouts, []);

  return { openDropdown, closeDropdown };
}
