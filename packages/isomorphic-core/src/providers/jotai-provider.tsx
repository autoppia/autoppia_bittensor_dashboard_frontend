'use client';

import { Provider } from 'jotai';
export function JotaiProvider({
  children,
}: Readonly<React.PropsWithChildren<{}>>) {
  return <Provider>{children}</Provider>;
}
