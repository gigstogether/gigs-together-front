import {
  createCountryDisplayOptions,
  createCountryDisplayNameResolver,
  getCountryDisplayName,
} from '@/lib/i18n/country-display-name';

describe('createCountryDisplayNameResolver', () => {
  it('should localize a country ISO code for the requested locale', () => {
    const resolveCountryDisplayName = createCountryDisplayNameResolver('es');

    expect(resolveCountryDisplayName('ES')).toBe('España');
  });

  it('should normalize a lowercase country ISO code', () => {
    const resolveCountryDisplayName = createCountryDisplayNameResolver('en');

    expect(resolveCountryDisplayName(' fr ')).toBe('France');
  });

  it('should reject an invalid country ISO code', () => {
    const resolveCountryDisplayName = createCountryDisplayNameResolver('en');

    expect(() => resolveCountryDisplayName('ESP')).toThrow(
      'Country ISO code must contain two Latin letters',
    );
  });

  it('should resolve multiple country names for one locale', () => {
    const resolveCountryDisplayName = createCountryDisplayNameResolver('en');

    expect([resolveCountryDisplayName('ES'), resolveCountryDisplayName('FR')]).toEqual([
      'Spain',
      'France',
    ]);
  });
});

describe('createCountryDisplayOptions', () => {
  it('should localize country options while preserving their source order', () => {
    expect(createCountryDisplayOptions(['ES', 'DE', 'FR'], 'en')).toEqual([
      { iso: 'ES', name: 'Spain' },
      { iso: 'DE', name: 'Germany' },
      { iso: 'FR', name: 'France' },
    ]);
  });
});

describe('getCountryDisplayName', () => {
  it('should localize a country ISO code for the requested locale', () => {
    expect(getCountryDisplayName('ES', 'en')).toBe('Spain');
  });
});
