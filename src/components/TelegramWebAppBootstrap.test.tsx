import { act, render } from '@testing-library/react';

import TelegramWebAppBootstrap from '@/components/TelegramWebAppBootstrap';

interface ScriptMockProps {
  src: string;
  strategy: string;
  onReady: () => void;
  onError: (e: Error) => void;
}

const { clearTelegramLaunchParamsFromUrlMock, miniAppEnvMock, scriptMock } = vi.hoisted(() => ({
  clearTelegramLaunchParamsFromUrlMock: vi.fn<() => boolean>(),
  miniAppEnvMock: vi.fn<() => 'browser' | 'mini' | 'unknown'>(),
  scriptMock: vi.fn<(props: ScriptMockProps) => null>(),
}));

vi.mock('next/script', () => ({
  default: scriptMock,
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: miniAppEnvMock,
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  clearTelegramLaunchParamsFromUrl: clearTelegramLaunchParamsFromUrlMock,
}));

function getScriptProps(): ScriptMockProps {
  const props = scriptMock.mock.calls[0]?.[0];
  if (!props) {
    throw new Error('Telegram Web App script was not rendered.');
  }

  return props;
}

describe('TelegramWebAppBootstrap', () => {
  beforeEach(() => {
    clearTelegramLaunchParamsFromUrlMock.mockReset();
    miniAppEnvMock.mockReset();
    scriptMock.mockReset();
    delete window.Telegram;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not load the SDK outside a Telegram Mini App', () => {
    miniAppEnvMock.mockReturnValue('browser');

    render(<TelegramWebAppBootstrap />);

    expect(scriptMock).not.toHaveBeenCalled();
  });

  it('should clear launch params after the Mini App SDK is ready', () => {
    miniAppEnvMock.mockReturnValue('mini');
    window.Telegram = {
      WebApp: {
        version: '9.6',
        isVersionAtLeast: vi.fn().mockReturnValue(true),
        requestWriteAccess: vi.fn(),
      },
    };

    render(<TelegramWebAppBootstrap />);
    const scriptProps = getScriptProps();
    act(() => scriptProps.onReady());

    expect(scriptProps.src).toBe('https://telegram.org/js/telegram-web-app.js?64');
    expect(scriptProps.strategy).toBe('afterInteractive');
    expect(clearTelegramLaunchParamsFromUrlMock).toHaveBeenCalledTimes(1);
  });

  it('should keep launch params when the loaded SDK is unavailable', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    miniAppEnvMock.mockReturnValue('mini');

    render(<TelegramWebAppBootstrap />);
    act(() => getScriptProps().onReady());

    expect(clearTelegramLaunchParamsFromUrlMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      '[Telegram.WebApp] SDK loaded without exposing Telegram.WebApp.',
    );
  });

  it('should report an SDK loading failure', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sdkError = new Error('Network error');
    miniAppEnvMock.mockReturnValue('mini');

    render(<TelegramWebAppBootstrap />);
    act(() => getScriptProps().onError(sdkError));

    expect(consoleError).toHaveBeenCalledWith(
      '[Telegram.WebApp] Failed to load the SDK.',
      sdkError,
    );
  });
});
