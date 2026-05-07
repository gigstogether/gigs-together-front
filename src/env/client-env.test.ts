import { captureRejectedError, expectZodIssue } from '@/env/env-test-helpers';

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

  describe('auth config', () => {
    it('should set isAuthEnabled to true when NEXT_PUBLIC_AUTH_ENABLED=true and telegram bot username is set', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'true');
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', 'gigs_together_bot');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.isAuthEnabled).toBe(true);
    });

    it('should set isAuthEnabled to false when NEXT_PUBLIC_AUTH_ENABLED is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.isAuthEnabled).toBe(false);
    });

    it('should throw when auth is enabled and telegram bot username is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', 'true');
      vi.stubEnv('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME', undefined);

      const error = await captureRejectedError(() => importClientEnv());

      expectZodIssue(error, {
        code: 'custom',
        message:
          'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is required when NEXT_PUBLIC_AUTH_ENABLED is true',
        path: ['NEXT_PUBLIC_TELEGRAM_BOT_USERNAME'],
      });
    });
  });

  describe('defaults', () => {
    it('should use default admin api base url when NEXT_PUBLIC_ADMIN_API_BASE_URL is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_ADMIN_API_BASE_URL', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.adminApiBaseUrl).toBe('/api/admin');
    });
  });

  describe('FEED_PAGE_SIZE', () => {
    it('should use default feed page size when env var is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedPageSize).toBe(10);
    });

    it('should parse feed page size when env var is a positive integer', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', '25');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedPageSize).toBe(25);
    });

    it('should throw when feed page size env var is not a positive integer', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_PAGE_SIZE', '0');

      const error = await captureRejectedError(() => importClientEnv());

      expectZodIssue(error, {
        code: 'custom',
        message: 'NEXT_PUBLIC_FEED_PAGE_SIZE must be a positive integer (got "0")',
        path: ['NEXT_PUBLIC_FEED_PAGE_SIZE'],
      });
    });
  });

  describe('FEED_CALENDAR_DATES_STALE_TIME_MS', () => {
    it('should use default feed calendar dates stale time when env var is missing', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', undefined);

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedCalendarDatesStaleTimeMs).toBe(600_000);
    });

    it('should parse feed calendar dates stale time when env var is a positive integer', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', '120000');

      const clientEnvModule = await importClientEnv();

      expect(clientEnvModule.clientEnv.feedCalendarDatesStaleTimeMs).toBe(120_000);
    });

    it('should throw when feed calendar dates stale time env var is not a positive integer', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS', '0');

      const error = await captureRejectedError(() => importClientEnv());

      expectZodIssue(error, {
        code: 'custom',
        message:
          'NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS must be a positive integer (got "0")',
        path: ['NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS'],
      });
    });
  });
});
