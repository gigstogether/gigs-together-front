async function importClientEnv() {
  return import('@/env/client-env');
}

describe('env/client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getPublicAppBaseUrlOrThrow', () => {
    it('should return normalized app base url when env var has trailing slash', async () => {
      vi.stubEnv('NEXT_PUBLIC_APP_BASE_URL', 'https://example.com/');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.getPublicAppBaseUrlOrThrow()).toBe('https://example.com');
    });

    it('should return app base url as is when it has no trailing slash', async () => {
      vi.stubEnv('NEXT_PUBLIC_APP_BASE_URL', 'https://example.com');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.getPublicAppBaseUrlOrThrow()).toBe('https://example.com');
    });

    it('should throw when app base url env var is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_APP_BASE_URL', undefined);

      const clientEnvModule = await importClientEnv();

      expect(() => clientEnvModule.getPublicAppBaseUrlOrThrow()).toThrow(
        'Missing NEXT_PUBLIC_APP_BASE_URL',
      );
    });

    it('should throw when app base url env var is blank', async () => {
      vi.stubEnv('NEXT_PUBLIC_APP_BASE_URL', '   ');

      const clientEnvModule = await importClientEnv();

      expect(() => clientEnvModule.getPublicAppBaseUrlOrThrow()).toThrow(
        'Missing NEXT_PUBLIC_APP_BASE_URL',
      );
    });
  });

  describe('auth config', () => {
    it.each([
      ['true', true],
      ['1', true],
      ['false', false],
      ['0', false],
    ])('should parse NEXT_PUBLIC_AUTH_ENABLED=%s', async (rawValue, expected) => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', rawValue);
      if (expected) {
        vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', 'gigs_together_bot');
      }

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.isAuthEnabled).toBe(expected);
    });

    it('should default auth flag to false when env var is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.isAuthEnabled).toBe(false);
    });

    it('should expose trimmed telegram bot username when auth is enabled and username is set', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'true');
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', ' gigs_together_bot ');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.telegramBotUsername).toBe('gigs_together_bot');
    });

    it('should expose trimmed telegram bot username even when auth is disabled', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'false');
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', ' gigs_together_bot ');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.telegramBotUsername).toBe('gigs_together_bot');
    });

    it('should throw when auth is enabled and telegram bot username is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'true');
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', undefined);

      await expect(importClientEnv()).rejects.toThrow(
        'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is required when NEXT_PUBLIC_AUTH_ENABLED is true',
      );
    });

    it('should throw when auth is enabled and telegram bot username is blank', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'true');
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', '   ');

      await expect(importClientEnv()).rejects.toThrow(
        'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is required when NEXT_PUBLIC_AUTH_ENABLED is true',
      );
    });

    it('should throw when auth flag is invalid', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'maybe');

      await expect(importClientEnv()).rejects.toThrow();
    });
  });

  describe('defaults', () => {
    it('should use default admin api base url when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_ADMIN_API_BASE_URL', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.adminApiBaseUrl).toBe('/api/admin');
    });

    it('should use default brand name when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_BRAND_NAME', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.brandName).toBe('Gigs Together');
    });

    it('should use default site preview title when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_SITE_PREVIEW_TITLE', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.sitePreviewTitle).toBe('Gigs Together!');
    });

    it('should use default site preview description when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.sitePreviewDescription).toBe(
        'Find gigs and company in your city.',
      );
    });

    it('should use default telegram client profile storage key when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.telegramClientProfileStorageKey).toBe(
        'gt_tg_client_profile',
      );
    });
  });

  describe('FEED_PAGE_SIZE', () => {
    it('should default to 10 when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedPageSize).toBe(10);
    });

    it('should use provided env var value when env var is a positive integer', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', '25');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedPageSize).toBe(25);
    });

    it('should use default value when env var is a blank string', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', '   ');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedPageSize).toBe(10);
    });

    it.each(['0', '-1', '1.5', 'abc'])(
      'should throw when env var is an invalid positive integer value (%s)',
      async (invalidValue) => {
        vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', invalidValue);

        await expect(importClientEnv()).rejects.toThrow(
          'NEXT_PUBLIC_FEED_PAGE_SIZE must be a positive integer',
        );
      },
    );
  });

  describe('FEED_CALENDAR_DATES_STALE_TIME_MS', () => {
    it('should default to 600000 when env var is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedCalendarDatesStaleTimeMs).toBe(600_000);
    });

    it('should use provided env var value when env var is a positive integer', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', '120000');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedCalendarDatesStaleTimeMs).toBe(120_000);
    });

    it('should use default value when env var is a blank string', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', '   ');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedCalendarDatesStaleTimeMs).toBe(600_000);
    });

    it.each(['0', '-1', '1.5', 'abc'])(
      'should throw when env var is an invalid positive integer value (%s)',
      async (invalidValue) => {
        vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', invalidValue);

        await expect(importClientEnv()).rejects.toThrow(
          'NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS must be a positive integer',
        );
      },
    );
  });
});
