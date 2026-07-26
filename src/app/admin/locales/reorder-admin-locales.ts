import type { LocaleOrderUpdate, SupportedLocale } from '@/lib/admin-api';

function compareLocales(a: SupportedLocale, b: SupportedLocale): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.iso.localeCompare(b.iso);
}

export function sortAdminLocales(locales: readonly SupportedLocale[]): SupportedLocale[] {
  return [...locales].sort(compareLocales);
}

export function reorderAdminLocalesByIso(
  locales: readonly SupportedLocale[],
  draggedIso: string,
  targetIso: string,
): SupportedLocale[] {
  if (draggedIso === targetIso) {
    return sortAdminLocales(locales);
  }

  const sorted = sortAdminLocales(locales);
  const fromIndex = sorted.findIndex((locale) => locale.iso === draggedIso);
  const toIndex = sorted.findIndex((locale) => locale.iso === targetIso);
  if (fromIndex < 0 || toIndex < 0) {
    return sorted;
  }

  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((locale, index) => ({
    ...locale,
    order: index,
  }));
}

export function getAdminLocaleOrderUpdates(
  previous: readonly SupportedLocale[],
  next: readonly SupportedLocale[],
): LocaleOrderUpdate[] {
  const previousByIso = new Map(previous.map((locale) => [locale.iso, locale.order]));

  return next.flatMap((locale) => {
    const previousOrder = previousByIso.get(locale.iso);
    if (previousOrder === locale.order) {
      return [];
    }
    return [{ iso: locale.iso, order: locale.order }];
  });
}
