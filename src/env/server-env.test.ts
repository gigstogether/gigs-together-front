import {
  captureRejectedError,
  captureThrownErrorInstance,
  expectZodIssue,
} from '@/env/env-test-helpers';

vi.mock('server-only', () => ({}));

async function importServerEnv() {
  return import('@/env/server-env');
}

describe('env/server', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('TRANSLATIONS_REVALIDATE_SECONDS', () => {
    it('should parse translations revalidate seconds when env var is a positive integer', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('TRANSLATIONS_REVALIDATE_SECONDS', '120');

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.serverEnv.translationsRevalidateSeconds).toBe(120);
    });

    it('should use default translations revalidate seconds when env var is missing', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('TRANSLATIONS_REVALIDATE_SECONDS', undefined);

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.serverEnv.translationsRevalidateSeconds).toBe(3_600);
    });

    it('should throw when translations revalidate seconds env var is not a positive integer', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('TRANSLATIONS_REVALIDATE_SECONDS', '0');

      const error = await captureRejectedError(() => importServerEnv());

      expectZodIssue(error, {
        code: 'custom',
        message: 'TRANSLATIONS_REVALIDATE_SECONDS must be a positive integer (got "0")',
        path: ['TRANSLATIONS_REVALIDATE_SECONDS'],
      });
    });
  });

  describe('isStaging', () => {
    it('should be true when app base url hostname contains stg label', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('APP_BASE_URL', 'https://stg.example.com');

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.serverEnv.isStaging).toBe(true);
    });

    it('should be true when app base url hostname contains staging label', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('APP_BASE_URL', 'https://api.staging.example.com');

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.serverEnv.isStaging).toBe(true);
    });

    it('should be false when app base url hostname does not contain staging labels', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('APP_BASE_URL', 'https://example.com');

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.serverEnv.isStaging).toBe(false);
    });
  });

  describe('getFeedRevalidateSecretOrThrow', () => {
    it('should return trimmed feed revalidate secret when env var is set', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('FEED_REVALIDATE_SECRET', ' top-secret ');

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.getFeedRevalidateSecretOrThrow()).toBe('top-secret');
    });

    it('should throw when FEED_REVALIDATE_SECRET is missing', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('FEED_REVALIDATE_SECRET', undefined);

      const serverEnvModule = await importServerEnv();
      const error = captureThrownErrorInstance(() =>
        serverEnvModule.getFeedRevalidateSecretOrThrow(),
      );

      expect(error.message).toBe('Missing FEED_REVALIDATE_SECRET');
    });
  });

  describe('getAppBaseUrlOrThrow', () => {
    it('should return normalized app base url when env var has trailing slash', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('APP_BASE_URL', 'https://example.com/');

      const serverEnvModule = await importServerEnv();

      expect(serverEnvModule.getAppBaseUrlOrThrow()).toBe('https://example.com');
    });

    it('should throw when app base url env var is missing', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.stubEnv('APP_BASE_URL', undefined);

      const serverEnvModule = await importServerEnv();
      const error = captureThrownErrorInstance(() => serverEnvModule.getAppBaseUrlOrThrow());

      expect(error.message).toBe('Missing APP_BASE_URL');
    });
  });
});
