'use client';

import { useSearchParams } from 'next/navigation';

export default function hasSearchedParams() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const searchParams = useSearchParams();
  const parsedSearchParams = Object.fromEntries(
    Array.from(searchParams.entries())
  ) as Record<string, string>;
  const paramsLength = Object.values(parsedSearchParams).length;
  return Boolean(paramsLength);
}
