import {
  buildTranslationNamespaceCacheTag,
  isValidTranslationKey,
  isValidTranslationNamespace,
} from '@/lib/i18n/translation-identifiers';

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

describe('isValidTranslationKey', () => {
  it('should accept dot-separated camelCase keys', () => {
    expect(isValidTranslationKey('title')).toBe(true);
    expect(isValidTranslationKey('mainGig.withLink')).toBe(true);
    expect(isValidTranslationKey('weeklyDigest.gigLine.html')).toBe(true);
  });

  it('should reject invalid key casing and separators', () => {
    expect(isValidTranslationKey('MainGig.withLink')).toBe(false);
    expect(isValidTranslationKey('main_gig_post.with_link')).toBe(false);
    expect(isValidTranslationKey('weeklyDigest.gig-line')).toBe(false);
  });
});

describe('buildTranslationNamespaceCacheTag', () => {
  it('should preserve camelCase namespace in tag', () => {
    expect(buildTranslationNamespaceCacheTag('feedFilters')).toBe('translations:ns:feedFilters');
  });
});
