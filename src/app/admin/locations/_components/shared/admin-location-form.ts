import { getAdminCountryLabel } from './admin-location-display';

export function parseAdminLocationAliases(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0);
}

function normalizeComparableName(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}

export function getAdminLocationAliasesError(name: string, aliases: string[]): string | null {
  const canonicalName = normalizeComparableName(name);
  const seenAliases = new Set<string>();

  for (const alias of aliases) {
    const normalizedAlias = normalizeComparableName(alias);
    if (normalizedAlias === canonicalName) {
      return 'Aliases must be different from the canonical name.';
    }
    if (seenAliases.has(normalizedAlias)) {
      return 'Aliases must be unique.';
    }
    seenAliases.add(normalizedAlias);
  }

  return null;
}

export function getAdminLocationSaveError(e: unknown): string {
  return e instanceof Error ? e.message : 'Could not save location.';
}

export function getAdminCountryOptionLabel(countryIso: string): string {
  return getAdminCountryLabel(countryIso);
}
