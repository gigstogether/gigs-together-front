const COUNTRY_ISO_PATTERN = /^[A-Z]{2}$/;

export type CountryDisplayNameResolver = (iso: string) => string;

function resolveCountryDisplayName(iso: string, displayNames: Intl.DisplayNames): string {
  const normalizedIso = iso.trim().toUpperCase();

  if (!COUNTRY_ISO_PATTERN.test(normalizedIso)) {
    throw new Error('Country ISO code must contain two Latin letters');
  }

  return displayNames.of(normalizedIso) ?? normalizedIso;
}

export function createCountryDisplayNameResolver(locale: string): CountryDisplayNameResolver {
  const displayNames = new Intl.DisplayNames([locale], {
    type: 'region',
    fallback: 'none',
  });

  return (iso) => resolveCountryDisplayName(iso, displayNames);
}

export function getCountryDisplayName(iso: string, locale: string): string {
  return createCountryDisplayNameResolver(locale)(iso);
}
