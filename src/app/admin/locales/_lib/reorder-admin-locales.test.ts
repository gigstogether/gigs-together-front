import {
  getAdminLocaleOrderUpdates,
  reorderAdminLocalesByIso,
} from '@/app/admin/locales/_lib/reorder-admin-locales';
import type { SupportedLocale } from '@/app/admin/_lib/admin-api';

const locales: SupportedLocale[] = [
  { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
  { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
  { iso: 'ru', nativeName: 'Русский', isActive: true, order: 2 },
];

describe('reorderAdminLocalesByIso', () => {
  it('should move dragged locale before target and reindex orders', () => {
    expect(reorderAdminLocalesByIso(locales, 'ru', 'en')).toEqual([
      { iso: 'ru', nativeName: 'Русский', isActive: true, order: 0 },
      { iso: 'en', nativeName: 'English', isActive: true, order: 1 },
      { iso: 'es', nativeName: 'Español', isActive: true, order: 2 },
    ]);
  });
});

describe('getAdminLocaleOrderUpdates', () => {
  it('should return only locales whose order changed', () => {
    const next = reorderAdminLocalesByIso(locales, 'ru', 'en');

    expect(getAdminLocaleOrderUpdates(locales, next)).toEqual([
      { iso: 'ru', order: 0 },
      { iso: 'en', order: 1 },
      { iso: 'es', order: 2 },
    ]);
  });
});
