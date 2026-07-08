import {
  buildTranslationNamespaceCacheTag,
  isValidTranslationNamespace,
} from '@/lib/translation-identifiers';

describe('isValidTranslationNamespace', () => {
  it('should accept camelCase namespaces', () => {
    expect(isValidTranslationNamespace('country')).toBe(true);
    expect(isValidTranslationNamespace('feedFilters')).toBe(true);
    expect(isValidTranslationNamespace('common')).toBe(true);
  });

  it('should reject invalid namespace casing and separators', () => {
    expect(isValidTranslationNamespace('Country')).toBe(false);
    expect(isValidTranslationNamespace('feed_filters')).toBe(false);
    expect(isValidTranslationNamespace('feed-filters')).toBe(false);
  });
});

describe('buildTranslationNamespaceCacheTag', () => {
  it('should preserve camelCase namespace in tag', () => {
    expect(buildTranslationNamespaceCacheTag('feedFilters')).toBe('translations:ns:feedFilters');
  });
});
