import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

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
