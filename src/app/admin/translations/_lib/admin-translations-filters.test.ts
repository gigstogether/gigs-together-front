import {
  ADMIN_ALL_TRANSLATION_KINDS,
  ADMIN_ALL_TRANSLATION_STATUSES,
} from '@/app/admin/_lib/adminKeys';
import {
  filterAdminTranslationRecordsByMetadata,
  getAdminTranslationKindFilterLabel,
  getAdminTranslationStatusFilterLabel,
  isAdminTranslationKindFilter,
  isAdminTranslationLocaleFilter,
  isAdminTranslationNamespaceFilter,
  isAdminTranslationStatusFilter,
} from '@/app/admin/translations/_lib/admin-translations-filters';
import type { AdminTranslationRecord } from '@/app/admin/_lib/admin-api';

const sampleRecords: readonly AdminTranslationRecord[] = [
  {
    id: '1',
    namespace: 'about',
    locale: 'en',
    key: 'title',
    value: 'About',
    format: 'plain',
    kind: 'text',
    isActive: true,
  },
  {
    id: '2',
    namespace: 'about',
    locale: 'es',
    key: 'title',
    value: 'Acerca',
    format: 'plain',
    kind: 'template',
    isActive: false,
  },
];

describe('admin-translations-filters', () => {
  it('should return filter labels for known values', () => {
    expect(getAdminTranslationKindFilterLabel('template')).toBe('Template');
    expect(getAdminTranslationStatusFilterLabel('active')).toBe('Active');
  });

  it('should filter records by kind and status', () => {
    const filtered = filterAdminTranslationRecordsByMetadata(sampleRecords, {
      kindFilter: 'template',
      statusFilter: ADMIN_ALL_TRANSLATION_STATUSES,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.key).toBe('title');
    expect(filtered[0]?.locale).toBe('es');
  });

  it('should return active records only when status filter is active', () => {
    const filtered = filterAdminTranslationRecordsByMetadata(sampleRecords, {
      kindFilter: ADMIN_ALL_TRANSLATION_KINDS,
      statusFilter: 'active',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.locale).toBe('en');
  });

  it('should accept known kind and status filter values', () => {
    expect(isAdminTranslationKindFilter('text')).toBe(true);
    expect(isAdminTranslationKindFilter('unknown')).toBe(false);
    expect(isAdminTranslationStatusFilter('inactive')).toBe(true);
    expect(isAdminTranslationStatusFilter('draft')).toBe(false);
  });

  it('should accept known namespace and locale filter values', () => {
    expect(isAdminTranslationNamespaceFilter('__all__')).toBe(true);
    expect(isAdminTranslationNamespaceFilter('about')).toBe(true);
    expect(isAdminTranslationNamespaceFilter('bad_namespace')).toBe(false);
    expect(
      isAdminTranslationLocaleFilter('en', [
        { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
      ]),
    ).toBe(true);
    expect(
      isAdminTranslationLocaleFilter('fr', [
        { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
      ]),
    ).toBe(false);
  });
});
