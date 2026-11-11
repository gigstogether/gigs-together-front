const COUNTRY_ISO_PATTERN = /^[A-Z]{2}$/;
const countryDisplayNamesByLocale = new Map<string, Intl.DisplayNames>();

export type CountryDisplayNameResolver = (iso: string) => string;

export interface CountryDisplayOption {
  iso: string;
  name: string;
}

function resolveCountryDisplayName(iso: string, displayNames: Intl.DisplayNames): string {
  const normalizedIso = iso.trim().toUpperCase();

  if (!COUNTRY_ISO_PATTERN.test(normalizedIso)) {
    throw new Error('Country ISO code must contain two Latin letters');
  }

  return displayNames.of(normalizedIso) ?? normalizedIso;
}

function getCountryDisplayNames(locale: string): Intl.DisplayNames {
  const cachedDisplayNames = countryDisplayNamesByLocale.get(locale);
  if (cachedDisplayNames !== undefined) {
    return cachedDisplayNames;
  }

  const displayNames = new Intl.DisplayNames([locale], {
    type: 'region',
    fallback: 'none',
  });

  countryDisplayNamesByLocale.set(locale, displayNames);

  return displayNames;
}

export function createCountryDisplayNameResolver(locale: string): CountryDisplayNameResolver {
  const displayNames = getCountryDisplayNames(locale);

  return (iso) => resolveCountryDisplayName(iso, displayNames);
}

export function getCountryDisplayName(iso: string, locale: string): string {
  return resolveCountryDisplayName(iso, getCountryDisplayNames(locale));
}

export function createCountryDisplayOptions(
  countryIsos: string[],
  locale: string,
): CountryDisplayOption[] {
  const resolveCountryDisplayName = createCountryDisplayNameResolver(locale);
  const collator = new Intl.Collator(locale);

  return countryIsos
    .map((iso) => ({ iso, name: resolveCountryDisplayName(iso) }))
    .sort((left, right) => collator.compare(left.name, right.name));
}
