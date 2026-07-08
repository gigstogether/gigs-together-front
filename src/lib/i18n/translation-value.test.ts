import {
  interpolatePlainTemplate,
  resolveTranslationValue,
  TranslationValueResolutionError,
} from '@/lib/i18n/translation-value';

describe('resolveTranslationValue', () => {
  it('should return key when translation entry is missing', () => {
    expect(
      resolveTranslationValue({
        entry: undefined,
        namespace: 'country',
        key: 'es',
      }),
    ).toBe('es');
  });

  it('should return plain text value when params are not provided', () => {
    expect(
      resolveTranslationValue({
        entry: {
          value: 'Spain',
          format: 'plain',
          kind: 'text',
        },
        namespace: 'country',
        key: 'es',
      }),
    ).toBe('Spain');
  });

  it('should return raw template value when params are not provided', () => {
    expect(
      resolveTranslationValue({
        entry: {
          value: 'Hello {name}',
          format: 'plain',
          kind: 'template',
        },
        namespace: 'common',
        key: 'greeting',
      }),
    ).toBe('Hello {name}');
  });

  it('should interpolate plain template values when params are provided', () => {
    expect(
      resolveTranslationValue({
        entry: {
          value: 'Hello {name}',
          format: 'plain',
          kind: 'template',
        },
        namespace: 'common',
        key: 'greeting',
        params: { name: 'Ada' },
      }),
    ).toBe('Hello Ada');
  });

  it('should throw when params are provided for a text entry', () => {
    expect(() =>
      resolveTranslationValue({
        entry: {
          value: 'Spain',
          format: 'plain',
          kind: 'text',
        },
        namespace: 'country',
        key: 'es',
        params: { name: 'Ada' },
      }),
    ).toThrow(TranslationValueResolutionError);
  });

  it('should throw when entry format is icu', () => {
    expect(() =>
      resolveTranslationValue({
        entry: {
          value: 'Hello',
          format: 'icu',
          kind: 'text',
        },
        namespace: 'common',
        key: 'greeting',
      }),
    ).toThrow(/unsupported format "icu"/);
  });
});

describe('interpolatePlainTemplate', () => {
  it('should keep unmatched placeholders', () => {
    expect(interpolatePlainTemplate('Hello {name}', {})).toBe('Hello {name}');
  });
});
