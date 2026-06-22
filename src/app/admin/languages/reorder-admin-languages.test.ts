import {
  getAdminLanguageOrderUpdates,
  reorderAdminLanguagesByIso,
} from '@/app/admin/languages/reorder-admin-languages';
import type { AdminLanguage } from '@/lib/admin-api';

const languages: AdminLanguage[] = [
  { iso: 'en', name: 'English', isActive: true, order: 0 },
  { iso: 'es', name: 'Español', isActive: true, order: 1 },
  { iso: 'ru', name: 'Русский', isActive: true, order: 2 },
];

describe('reorderAdminLanguagesByIso', () => {
  it('should move dragged language before target and reindex orders', () => {
    expect(reorderAdminLanguagesByIso(languages, 'ru', 'en')).toEqual([
      { iso: 'ru', name: 'Русский', isActive: true, order: 0 },
      { iso: 'en', name: 'English', isActive: true, order: 1 },
      { iso: 'es', name: 'Español', isActive: true, order: 2 },
    ]);
  });
});

describe('getAdminLanguageOrderUpdates', () => {
  it('should return only languages whose order changed', () => {
    const next = reorderAdminLanguagesByIso(languages, 'ru', 'en');

    expect(getAdminLanguageOrderUpdates(languages, next)).toEqual([
      { iso: 'ru', order: 0 },
      { iso: 'en', order: 1 },
      { iso: 'es', order: 2 },
    ]);
  });
});
