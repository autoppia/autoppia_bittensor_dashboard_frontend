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
