// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchApiJsonMock, getTelegramInitDataMock, isTelegramMiniAppMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
  getTelegramInitDataMock: vi.fn<() => string>(),
  isTelegramMiniAppMock: vi.fn<() => boolean>(),
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramClientProfileStorageKey: 'gt_test_profile',
  },
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  getTelegramInitData: getTelegramInitDataMock,
  isTelegramMiniApp: isTelegramMiniAppMock,
}));

import {
  clearExplicitTelegramSignIn,
  exchangeTelegramAuthFromOidc,
  exchangeTelegramAuthFromWebApp,
  hasExplicitTelegramSignIn,
  signInWithTelegram,
  subscribeTelegramSignInRequest,
} from '@/lib/telegram/telegram-auth';

const authExchangeResponse = {
  profile: {
    displayLabel: '@user',
    isAdmin: false,
  },
};

describe('signInWithTelegram', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchApiJsonMock.mockReset();
    fetchApiJsonMock.mockResolvedValue(authExchangeResponse);
    getTelegramInitDataMock.mockReset();
    getTelegramInitDataMock.mockReturnValue('init-data');
    isTelegramMiniAppMock.mockReset();
  });

  it('should exchange captured initData once for concurrent explicit Mini App sign-ins', async () => {
    isTelegramMiniAppMock.mockReturnValue(true);

    await Promise.all([signInWithTelegram(), signInWithTelegram()]);

    expect(fetchApiJsonMock).toHaveBeenCalledTimes(1);
    expect(fetchApiJsonMock).toHaveBeenCalledWith(
      'v1/auth/telegram/web-app',
      'POST',
      { initData: 'init-data' },
      { credentials: 'include' },
    );
    expect(hasExplicitTelegramSignIn()).toBe(true);
  });

  it('should request the browser flow without exchanging Mini App initData', async () => {
    isTelegramMiniAppMock.mockReturnValue(false);
    const listener = vi.fn();
    const unsubscribe = subscribeTelegramSignInRequest(listener);

    await signInWithTelegram();
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(fetchApiJsonMock).not.toHaveBeenCalled();
    expect(hasExplicitTelegramSignIn()).toBe(false);
  });

  it('should allow retry and keep explicit sign-in state unset after a failed Mini App exchange', async () => {
    isTelegramMiniAppMock.mockReturnValue(true);
    fetchApiJsonMock.mockRejectedValueOnce(new Error('Exchange failed'));

    await expect(signInWithTelegram()).rejects.toThrow('Exchange failed');

    expect(hasExplicitTelegramSignIn()).toBe(false);

    await signInWithTelegram();

    expect(fetchApiJsonMock).toHaveBeenCalledTimes(2);
    expect(hasExplicitTelegramSignIn()).toBe(true);
  });
});

describe('explicit Telegram sign-in state', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchApiJsonMock.mockReset();
    fetchApiJsonMock.mockResolvedValue(authExchangeResponse);
  });

  it('should persist explicit sign-in state after a successful browser exchange', async () => {
    await exchangeTelegramAuthFromOidc({ idToken: 'id-token' });

    expect(hasExplicitTelegramSignIn()).toBe(true);
  });

  it('should not persist explicit sign-in state for a low-level Mini App exchange', async () => {
    await exchangeTelegramAuthFromWebApp('init-data');

    expect(hasExplicitTelegramSignIn()).toBe(false);
  });

  it('should clear explicit sign-in state on logout', async () => {
    await exchangeTelegramAuthFromOidc({ idToken: 'id-token' });

    clearExplicitTelegramSignIn();

    expect(hasExplicitTelegramSignIn()).toBe(false);
  });
});
