export function extractRoundIdentifier(
  value: string | string[] | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) {
    return undefined;
  }

  const text = String(raw).trim();
  if (!text) {
    return undefined;
  }

  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export function extractRoundNumber(
  value: string | string[] | undefined
): number | undefined {
  const identifier = extractRoundIdentifier(value);
  if (!identifier) {
    return undefined;
  }

  const normalized = identifier.toLowerCase();
  const roundPatternMatch = normalized.match(/round[-_]?(\d+)/);
  if (roundPatternMatch?.[1]) {
    const parsed = Number.parseInt(roundPatternMatch[1], 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const digitMatches = normalized.match(/\d+/g);
  if (digitMatches && digitMatches.length > 0) {
    const lastSegment = digitMatches[digitMatches.length - 1];
    const parsed = Number.parseInt(lastSegment, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}
