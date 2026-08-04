const { getTranslationsApiPublicRequestMock } = vi.hoisted(() => ({
  getTranslationsApiPublicRequestMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: getTranslationsApiPublicRequestMock,
}));

vi.mock('@/env/server-env', () => ({
  serverEnv: {
    translationsRevalidateSeconds: 3_600, // 1 hour (60 minutes)
  },
}));

describe('getTranslations', () => {
  beforeEach(() => {
    getTranslationsApiPublicRequestMock.mockReset();
    getTranslationsApiPublicRequestMock.mockResolvedValue({
      locale: 'en',
      translations: {},
    });
  });

  it('should throw GetTranslationsError when namespaces are omitted', async () => {
    const { GetTranslationsError, getTranslations } = await import(
      '@/lib/i18n/translations.server'
    );

    await expect(getTranslations('en', [])).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof GetTranslationsError &&
        error.message === 'getTranslations requires at least one namespace.',
    );
    expect(getTranslationsApiPublicRequestMock).not.toHaveBeenCalled();
  });

  it('should throw GetTranslationsError when namespace is invalid', async () => {
    const { GetTranslationsError, getTranslations } = await import(
      '@/lib/i18n/translations.server'
    );

    await expect(getTranslations('en', ['$invalid'])).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof GetTranslationsError &&
        error.message === 'Invalid translation namespace "$invalid".',
    );
    expect(getTranslationsApiPublicRequestMock).not.toHaveBeenCalled();
  });

  it('should tag fetch with per-namespace tags when namespaces are requested', async () => {
    const { getTranslations } = await import('@/lib/i18n/translations.server');

    await getTranslations('en', ['about', 'country']);

    expect(getTranslationsApiPublicRequestMock).toHaveBeenCalledWith(
      '/v1/locale/translations?namespaces=about%2Ccountry',
      'GET',
      undefined,
      expect.objectContaining({
        next: {
          revalidate: 3_600,
          tags: ['translations:ns:about', 'translations:ns:country'],
        },
      }),
    );
  });

  it('should dedupe repeated namespaces before fetch', async () => {
    const { getTranslations } = await import('@/lib/i18n/translations.server');

    await getTranslations('en', ['about', 'about']);

    expect(getTranslationsApiPublicRequestMock).toHaveBeenCalledWith(
      '/v1/locale/translations?namespaces=about',
      'GET',
      undefined,
      expect.objectContaining({
        next: {
          revalidate: 3_600,
          tags: ['translations:ns:about'],
        },
      }),
    );
  });
});
