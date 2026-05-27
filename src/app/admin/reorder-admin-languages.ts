import type { AdminLanguage, AdminLanguageOrderUpdate } from '@/lib/admin-api';

function compareLanguages(a: AdminLanguage, b: AdminLanguage): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.iso.localeCompare(b.iso);
}

export function sortAdminLanguages(languages: readonly AdminLanguage[]): AdminLanguage[] {
  return [...languages].sort(compareLanguages);
}

export function reorderAdminLanguagesByIso(
  languages: readonly AdminLanguage[],
  draggedIso: string,
  targetIso: string,
): AdminLanguage[] {
  if (draggedIso === targetIso) {
    return sortAdminLanguages(languages);
  }

  const sorted = sortAdminLanguages(languages);
  const fromIndex = sorted.findIndex((language) => language.iso === draggedIso);
  const toIndex = sorted.findIndex((language) => language.iso === targetIso);
  if (fromIndex < 0 || toIndex < 0) {
    return sorted;
  }

  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((language, index) => ({
    ...language,
    order: index,
  }));
}

export function getAdminLanguageOrderUpdates(
  previous: readonly AdminLanguage[],
  next: readonly AdminLanguage[],
): AdminLanguageOrderUpdate[] {
  const previousByIso = new Map(previous.map((language) => [language.iso, language.order]));

  return next.flatMap((language) => {
    const previousOrder = previousByIso.get(language.iso);
    if (previousOrder === language.order) {
      return [];
    }
    return [{ iso: language.iso, order: language.order }];
  });
}
