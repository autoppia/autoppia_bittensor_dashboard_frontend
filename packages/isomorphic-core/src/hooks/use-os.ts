import { useState } from 'react';
import { useIsomorphicEffect } from '../hooks/use-event-listener';

export type OS =
  | 'undetermined'
  | 'macos'
  | 'ios'
  | 'windows'
  | 'android'
  | 'linux';

function getOS(): OS {
  if (globalThis.window === undefined) {
    return 'undetermined';
  }

  const { userAgent } = globalThis.navigator;
  const macosPlatforms = /(Macintosh)|(MacIntel)|(MacPPC)|(Mac68K)/i;
  const windowsPlatforms = /(Win32)|(Win64)|(Windows)|(WinCE)/i;
  const iosPlatforms = /(iPhone)|(iPad)|(iPod)/i;

  if (macosPlatforms.test(userAgent)) {
    return 'macos';
  }
  if (iosPlatforms.test(userAgent)) {
    return 'ios';
  }
  if (windowsPlatforms.test(userAgent)) {
    return 'windows';
  }
  if (/Android/i.test(userAgent)) {
    return 'android';
  }
  if (/Linux/i.test(userAgent)) {
    return 'linux';
  }

  return 'undetermined';
}

interface UseOsOptions {
  getValueInEffect: boolean;
}

const DEFAULT_USE_OS_OPTIONS: UseOsOptions = { getValueInEffect: true };

export function useOs(options: UseOsOptions = DEFAULT_USE_OS_OPTIONS): OS {
  const [value, setValue] = useState<OS>(
    options.getValueInEffect ? 'undetermined' : getOS()
  );

  useIsomorphicEffect(() => {
    if (options.getValueInEffect) {
      setValue(getOS);
    }
  }, []);

  return value;
}
