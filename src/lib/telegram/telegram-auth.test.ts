export {};

const { loggerErrorFromUnknownMock } = vi.hoisted(() => ({
  loggerErrorFromUnknownMock: vi.fn(),
}));

const { bootstrapIsTelegramMiniAppMock, bootstrapWaitForTelegramInitDataMock } = vi.hoisted(() => ({
  bootstrapIsTelegramMiniAppMock: vi.fn<() => boolean>(),
  bootstrapWaitForTelegramInitDataMock: vi.fn<() => Promise<string>>(),
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    appApiBaseUrl: 'https://api.example.com',
    telegramClientProfileStorageKey: 'gt_test_profile',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: loggerErrorFromUnknownMock,
  },
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  isTelegramMiniApp: bootstrapIsTelegramMiniAppMock,
  waitForTelegramInitData: bootstrapWaitForTelegramInitDataMock,
}));

describe('bootstrapTelegramAuthFromWebApp', () => {
  beforeEach(() => {
    loggerErrorFromUnknownMock.mockReset();
    bootstrapIsTelegramMiniAppMock.mockReset();
    bootstrapIsTelegramMiniAppMock.mockReturnValue(true);
    bootstrapWaitForTelegramInitDataMock.mockReset();
    bootstrapWaitForTelegramInitDataMock.mockRejectedValue(new Error('initData unavailable'));
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should log and return explicit failure when Mini App bootstrap fails', async () => {
    const { bootstrapTelegramAuthFromWebApp } = await import('@/lib/telegram/telegram-auth');

    const result = await bootstrapTelegramAuthFromWebApp();

    expect(result).toBe('failed');
    expect(loggerErrorFromUnknownMock).toHaveBeenCalledWith(
      'telegram_mini_app_bootstrap_failed',
      expect.objectContaining({ message: 'initData unavailable' }),
    );
  });
});
