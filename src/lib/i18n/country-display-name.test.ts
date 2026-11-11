import {
  createCountryDisplayNameResolver,
  getCountryDisplayName,
} from '@/lib/i18n/country-display-name';

describe('getCountryDisplayName', () => {
  it('should localize a country ISO code for the requested locale', () => {
    expect(getCountryDisplayName('ES', 'es')).toBe('España');
  });

  it('should normalize a lowercase country ISO code', () => {
    expect(getCountryDisplayName(' fr ', 'en')).toBe('France');
  });

  it('should reject an invalid country ISO code', () => {
    expect(() => getCountryDisplayName('ESP', 'en')).toThrow(
      'Country ISO code must contain two Latin letters',
    );
  });
});

describe('createCountryDisplayNameResolver', () => {
  it('should resolve multiple country names for one locale', () => {
    const resolveCountryDisplayName = createCountryDisplayNameResolver('en');

    expect([resolveCountryDisplayName('ES'), resolveCountryDisplayName('FR')]).toEqual([
      'Spain',
      'France',
    ]);
  });
});
