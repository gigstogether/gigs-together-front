import { DEFAULT_LOCALE_ISO } from '@/lib/i18n/locale.constants';
import { toSearchKey } from '@/lib/search-text';

export type LocationCatalogKind = 'locality' | 'venue';

export const LOCATION_CATALOG_KINDS = ['locality', 'venue'] satisfies LocationCatalogKind[];

export interface AdminLocationCatalogProps {
  activeCatalog: LocationCatalogKind;
  onCatalogChange: (catalog: LocationCatalogKind) => void;
}

export function getCatalogLabel(kind: LocationCatalogKind): string {
  switch (kind) {
    case 'locality':
      return 'Locality';
    case 'venue':
      return 'Venue';
  }
}

export function getCatalogPluralLabel(kind: LocationCatalogKind): string {
  return kind === 'locality' ? 'Localities' : `${getCatalogLabel(kind)}s`;
}

export function matchesLocationSearch(values: string[], search: string): boolean {
  const normalizedSearch = toSearchKey(search, DEFAULT_LOCALE_ISO);
  if (normalizedSearch.length === 0) {
    return true;
  }

  return values.some((value) => toSearchKey(value, DEFAULT_LOCALE_ISO).includes(normalizedSearch));
}

export function getAdminLocationOperationError(e: unknown): string {
  return e instanceof Error ? e.message : 'The location operation failed.';
}
