// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  captureTelegramLaunchParamsFromUrl,
  clearTelegramLaunchParamsFromUrl,
  getTelegramInitData,
  getTelegramLaunchParamsSnapshot,
  getTelegramStartParam,
  isTelegramMiniApp,
} from './telegram-webapp';

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('captureTelegramLaunchParamsFromUrl', () => {
  it('should store initData in sessionStorage and clear telegram hash from the url', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );

    captureTelegramLaunchParamsFromUrl();

    expect(window.location.hash).toBe('');
    expect(getTelegramLaunchParamsSnapshot()?.initData).toBe('user=test');
    expect(getTelegramInitData()).toBe('user=test');
  });

  it('should restore launch params from sessionStorage after the url is cleared', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );
    captureTelegramLaunchParamsFromUrl();

    const snapshot = getTelegramLaunchParamsSnapshot();

    expect(snapshot).toEqual({ initData: 'user=test' });
  });

  it('should replace a stored snapshot when fresh launch params are available', () => {
    sessionStorage.setItem('gt_tg_launch_params', JSON.stringify({ initData: 'user=old' }));
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dnew&tgWebAppPlatform=tdesktop',
    );

    captureTelegramLaunchParamsFromUrl();

    expect(getTelegramLaunchParamsSnapshot()).toEqual({ initData: 'user=new' });
  });

  it('should remove a stored snapshot when a fresh launch has no usable data', () => {
    sessionStorage.setItem('gt_tg_launch_params', JSON.stringify({ initData: 'user=old' }));
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppVersion=9.1&tgWebAppPlatform=tdesktop',
    );

    captureTelegramLaunchParamsFromUrl();

    expect(getTelegramLaunchParamsSnapshot()).toBeUndefined();
  });

  it('should keep the stored snapshot unchanged when capture runs again', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );
    captureTelegramLaunchParamsFromUrl();
    window.history.replaceState(null, '', '/feed/es/barcelona#khjkh');

    captureTelegramLaunchParamsFromUrl();

    expect(window.location.hash).toBe('#khjkh');
    expect(getTelegramLaunchParamsSnapshot()).toEqual({ initData: 'user=test' });
  });

  it('should clear telegram hash when sessionStorage persistence fails', () => {
    const storageFailure = new DOMException('Storage is unavailable.', 'SecurityError');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw storageFailure;
    });
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );

    expect(() => captureTelegramLaunchParamsFromUrl()).toThrow(
      'Failed to persist Telegram launch params in sessionStorage.',
    );
    expect(window.location.hash).toBe('');
  });

  it('should reject an invalid snapshot stored in sessionStorage', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sessionStorage.setItem('gt_tg_launch_params', JSON.stringify({ initData: 123 }));

    const snapshot = getTelegramLaunchParamsSnapshot();

    expect(snapshot).toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      'Invalid Telegram launch params snapshot in sessionStorage.',
    );
  });

  it('should keep gig deep-link hash and not treat it as telegram launch data', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona#khjkh');

    captureTelegramLaunchParamsFromUrl();

    expect(window.location.hash).toBe('#khjkh');
    expect(getTelegramLaunchParamsSnapshot()).toBeUndefined();
  });

  it('should preserve unrelated query params and the gig hash when clearing launch data', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona?view=calendar&tgWebAppData=user%3Dtest#khjkh',
    );

    captureTelegramLaunchParamsFromUrl();

    expect(`${window.location.search}${window.location.hash}`).toBe('?view=calendar#khjkh');
  });

  it('should keep returning true after telegram launch params were cleared from the url', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );

    captureTelegramLaunchParamsFromUrl();

    expect(isTelegramMiniApp()).toBe(true);
    expect(window.location.hash).toBe('');
    expect(isTelegramMiniApp()).toBe(true);
  });
});

describe('clearTelegramLaunchParamsFromUrl', () => {
  it('should clear hash when it only contains telegram launch params', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=abc&tgWebAppPlatform=tdesktop',
    );

    const changed = clearTelegramLaunchParamsFromUrl();

    expect(changed).toBe(true);
    expect(window.location.hash).toBe('');
  });

  it('should store startapp query param in the launch snapshot when captured early', () => {
    window.history.replaceState(null, '', '/admin/gigs/new?startapp=edit-token');

    captureTelegramLaunchParamsFromUrl();

    expect(window.location.pathname).toBe('/admin/gigs/new');
    expect(window.location.search).toBe('');
    expect(getTelegramStartParam()).toBe('edit-token');
  });
});

describe('isTelegramMiniApp', () => {
  it('should return true from the captured launch snapshot', () => {
    sessionStorage.setItem('gt_tg_launch_params', JSON.stringify({ initData: 'user=test' }));
    window.history.replaceState(null, '', '/feed/es/barcelona');

    expect(isTelegramMiniApp()).toBe(true);
  });
});

describe('getTelegramInitData', () => {
  it('should return captured initData from sessionStorage', () => {
    sessionStorage.setItem('gt_tg_launch_params', JSON.stringify({ initData: 'user=captured' }));

    expect(getTelegramInitData()).toBe('user=captured');
  });

  it('should not read initData directly from an uncaptured url', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );

    expect(getTelegramInitData()).toBe('');
  });
});

describe('getTelegramStartParam', () => {
  it('should not read startParam directly from an uncaptured url', () => {
    window.history.replaceState(null, '', '/admin/telegram?startapp=edit-token');

    expect(getTelegramStartParam()).toBe('');
  });
});
