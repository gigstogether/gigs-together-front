export {};

const { bootstrapGetTelegramInitDataMock, bootstrapIsTelegramMiniAppMock, fetchApiJsonMock } =
  vi.hoisted(() => ({
    bootstrapGetTelegramInitDataMock: vi.fn<() => string>(),
    bootstrapIsTelegramMiniAppMock: vi.fn<() => boolean>(),
    fetchApiJsonMock: vi.fn(),
  }));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    appApiBaseUrl: 'https://api.example.com',
    telegramClientProfileStorageKey: 'gt_test_profile',
  },
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  getTelegramInitData: bootstrapGetTelegramInitDataMock,
  isTelegramMiniApp: bootstrapIsTelegramMiniAppMock,
}));

describe('bootstrapTelegramAuthFromWebApp', () => {
  beforeEach(() => {
    bootstrapIsTelegramMiniAppMock.mockReset();
    bootstrapIsTelegramMiniAppMock.mockReturnValue(true);
    bootstrapGetTelegramInitDataMock.mockReset();
    bootstrapGetTelegramInitDataMock.mockImplementation(() => {
      throw new Error('initData unavailable');
    });
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
