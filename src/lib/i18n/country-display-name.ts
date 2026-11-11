const COUNTRY_ISO_PATTERN = /^[A-Z]{2}$/;

export function getCountryDisplayName(iso: string, locale: string): string {
  const normalizedIso = iso.trim().toUpperCase();

  if (!COUNTRY_ISO_PATTERN.test(normalizedIso)) {
    throw new Error('Country ISO code must contain two Latin letters');
  }

  const displayNames = new Intl.DisplayNames([locale], {
    type: 'region',
    fallback: 'none',
  });

  return displayNames.of(normalizedIso) ?? normalizedIso;
}
