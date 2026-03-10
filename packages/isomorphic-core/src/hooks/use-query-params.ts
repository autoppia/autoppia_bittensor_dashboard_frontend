'use client';

import { atom, useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const queryAtom = atom('');

function getParams(url: string | URL = globalThis.location.href): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  new URL(url).searchParams.forEach((val: string, key: string) => {
    if (params[key] === undefined) {
      params[key] = val;
    } else {
      const existing = params[key];
      params[key] = Array.isArray(existing)
        ? [...existing, val]
        : [existing, val];
    }
  });
  return params;
}

export function createQueryString(queryObj: any) {
  let path = [];
  for (const [key, value] of Object.entries(queryObj)) {
    path.push(`${key}=${value}`);
  }
  return path.join('&').toString();
}

export default function useQueryParams(pathname: string = '/') {
  const [query, setQuery] = useAtom(queryAtom);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const l = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(l);
  }, [query]);

  const clearQueryParam = (key: string[]) => {
    let url = new URL(location.href);
    key.forEach((item) => url.searchParams.delete(item));
    setQuery(url.search);
    router.push(`${pathname}${url.search}`);
  };

  const setQueryParams = (data: any) => {
    let queryString = '';
    if (typeof data !== 'string') {
      queryString = createQueryString(data);
    }
    setQuery(queryString);
  };

  const updateQueryParams = (key: string, value: string | number | boolean) => {
    if (!value) {
      clearQueryParam([key]);
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set(key, value.toString());
    setQuery(url.search);
    router.push(`${pathname}${url.search}`);
  };

  return {
    query,
    loading,
    getParams,
    setQueryParams,
    updateQueryParams,
    clearQueryParam,
  };
}
