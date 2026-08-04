import { describe, expect, it } from 'vitest';

import { countryIsoToTranslationKey } from './country-iso-to-translation-key';

describe('countryIsoToTranslationKey', () => {
  it('should lowercase an uppercase ISO code', () => {
    expect(countryIsoToTranslationKey('ES')).toBe('es');
  });

  it('should leave an already-lowercase ISO code unchanged', () => {
    expect(countryIsoToTranslationKey('us')).toBe('us');
  });

  it('should trim surrounding whitespace before lowercasing', () => {
    expect(countryIsoToTranslationKey('  FR  ')).toBe('fr');
  });
});
