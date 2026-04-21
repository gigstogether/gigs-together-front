import { describe, expect, it } from 'vitest';
import {
  parseCountries,
  parseLanguageGetTranslationsResponseBody,
} from '@/lib/api-boundary-schemas';

describe('parseCountries', () => {
  it('should return countries when payload is valid', () => {
    const payload = [{ iso: 'ES' }, { iso: 'US' }];
    const parsed = parseCountries(payload);
    expect(parsed).toEqual([{ iso: 'ES' }, { iso: 'US' }]);
  });

  it('should throw when countries payload shape is invalid', () => {
    const payload = [{ code: 'ES' }];
    expect(() => parseCountries(payload)).toThrow();
  });
});

describe('parseLanguageGetTranslationsResponseBody', () => {
  it('should return translations response when payload is valid', () => {
    const payload = {
      locale: 'en',
      translations: {
        country: {
          es: {
            value: 'Spain',
            format: 'plain',
          },
        },
      },
    };
    const parsed = parseLanguageGetTranslationsResponseBody(payload);
    expect(parsed).toEqual(payload);
  });

  it('should throw when translation format is invalid', () => {
    const payload = {
      locale: 'en',
      translations: {
        country: {
          es: {
            value: 'Spain',
            format: 'markdown',
          },
        },
      },
    };
    expect(() => parseLanguageGetTranslationsResponseBody(payload)).toThrow();
  });

  it('should throw when locale is empty', () => {
    const payload = {
      locale: '',
      translations: {},
    };
    expect(() => parseLanguageGetTranslationsResponseBody(payload)).toThrow();
  });
});
