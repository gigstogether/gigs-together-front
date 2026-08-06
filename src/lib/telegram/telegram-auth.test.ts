export {};

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

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  isTelegramMiniApp: bootstrapIsTelegramMiniAppMock,
  waitForTelegramInitData: bootstrapWaitForTelegramInitDataMock,
}));

describe('bootstrapTelegramAuthFromWebApp', () => {
  beforeEach(() => {
    bootstrapIsTelegramMiniAppMock.mockReset();
    bootstrapIsTelegramMiniAppMock.mockReturnValue(true);
    bootstrapWaitForTelegramInitDataMock.mockReset();
    bootstrapWaitForTelegramInitDataMock.mockRejectedValue(new Error('initData unavailable'));
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should propagate error when Mini App bootstrap fails', async () => {
    const { bootstrapTelegramAuthFromWebApp } = await import('@/lib/telegram/telegram-auth');

    await expect(bootstrapTelegramAuthFromWebApp()).rejects.toThrow('initData unavailable');
  });
});
