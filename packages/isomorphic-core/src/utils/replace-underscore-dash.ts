export function replaceUnderscoreDash(str: string) {
  return str.split(/[_-]/).join(" ");
}
