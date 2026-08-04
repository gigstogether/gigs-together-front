/**
 * Maps a country ISO (uppercase in the countries collection / gigs, e.g. "ES")
 * to the lowercase translation key used under namespace `country` (e.g. "es").
 */
export function countryIsoToTranslationKey(iso: string): string {
  return iso.trim().toLowerCase();
}
