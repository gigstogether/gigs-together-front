import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export const ADMIN_LOCATION_LOCALE = 'en';

export function getAdminCountryLabel(countryIso: string): string {
  return `${getCountryDisplayName(countryIso, ADMIN_LOCATION_LOCALE)} (${countryIso})`;
}

export function getAdminLocalityLabel(name: string, qualifier?: string): string {
  return qualifier ? `${name} (${qualifier})` : name;
}
