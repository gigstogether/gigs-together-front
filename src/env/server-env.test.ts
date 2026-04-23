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

  it('should use translations revalidate seconds when env var is a positive integer', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('TRANSLATIONS_REVALIDATE_SECONDS', '120');

    const serverEnvModule = await importServerEnv();

    expect(serverEnvModule.serverEnv.translationsRevalidateSeconds).toBe(120);
  });

  it('should default translations revalidate seconds when env var is missing', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('TRANSLATIONS_REVALIDATE_SECONDS', undefined);

    const serverEnvModule = await importServerEnv();

    expect(serverEnvModule.serverEnv.translationsRevalidateSeconds).toBe(3_600);
  });

  it('should default translations revalidate seconds when env var is blank', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('TRANSLATIONS_REVALIDATE_SECONDS', '   ');

    const serverEnvModule = await importServerEnv();

    expect(serverEnvModule.serverEnv.translationsRevalidateSeconds).toBe(3_600);
  });

  it('should return trimmed feed revalidate secret when env var is set', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('FEED_REVALIDATE_SECRET', ' top-secret ');

    const serverEnvModule = await importServerEnv();

    expect(serverEnvModule.getFeedRevalidateSecretOrThrow()).toBe('top-secret');
  });
});
