export function toSearchKey(value: string, locale?: string): string {
  return value
    .trim()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[\p{P}\s]+/gu, '')
    .toLocaleLowerCase(locale);
}
