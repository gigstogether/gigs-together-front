import { DEFAULT_LOCALE_ISO } from '@/lib/i18n/locale.constants';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export function getAdminCountryLabel(countryIso: string): string {
  return `${getCountryDisplayName(countryIso, DEFAULT_LOCALE_ISO)} (${countryIso})`;
}

export function getAdminLocalityLabel(name: string, qualifier?: string): string {
  return qualifier ? `${name} (${qualifier})` : name;
}
