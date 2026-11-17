export function toSearchKey(value: string, locale?: string): string {
  return value.trim().normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase(locale);
}
