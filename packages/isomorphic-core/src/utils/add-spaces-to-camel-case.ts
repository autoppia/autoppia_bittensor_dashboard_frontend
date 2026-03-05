export function addSpacesToCamelCase(str: string) {
  return str.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
}
