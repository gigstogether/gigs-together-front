import { ADMIN_LOCATION_LOCALE } from './admin-location-display';

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
  const normalizedSearch = search.trim().toLocaleLowerCase(ADMIN_LOCATION_LOCALE);
  if (normalizedSearch.length === 0) {
    return true;
  }

  return values.some((value) =>
    value.toLocaleLowerCase(ADMIN_LOCATION_LOCALE).includes(normalizedSearch),
  );
}

export function getAdminLocationOperationError(e: unknown): string {
  return e instanceof Error ? e.message : 'The location operation failed.';
}
