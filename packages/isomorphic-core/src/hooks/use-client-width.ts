'use client';
import { useState, useEffect } from 'react';

export function useClientWidth(): number {
  const [clientWidth, setClientWidth] = useState<number | null>(null);

  function handleClientWidth() {
    setClientWidth(document.body.clientWidth);
  }

  useEffect(() => {
    handleClientWidth();
    window.addEventListener('resize', handleClientWidth);
    return () => {
      window.removeEventListener('resize', handleClientWidth);
    };
  }, []);

  return Number(clientWidth);
}
