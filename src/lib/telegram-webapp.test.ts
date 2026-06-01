// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import {
  captureTelegramLaunchParamsFromUrl,
  clearTelegramLaunchParamsFromUrl,
  getTelegramInitData,
  getTelegramLaunchParamsSnapshot,
  getTelegramStartParam,
  resetTelegramLaunchParamsCaptureForTests,
} from './telegram-webapp';

describe('captureTelegramLaunchParamsFromUrl', () => {
  afterEach(() => {
    resetTelegramLaunchParamsCaptureForTests();
  });

  it('should store initData in memory and clear telegram hash from the url', () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );

    const changed = captureTelegramLaunchParamsFromUrl();

    expect(changed).toBe(true);
    expect(window.location.hash).toBe('');
    expect(getTelegramLaunchParamsSnapshot()?.initData).toBe('user=test');
    expect(getTelegramInitData()).toBe('user=test');
  });

  it('should keep gig deep-link hash and not treat it as telegram launch data', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona#khjkh');

    captureTelegramLaunchParamsFromUrl();

    expect(window.location.hash).toBe('#khjkh');
    expect(getTelegramLaunchParamsSnapshot()).toBeUndefined();
  });
});

describe('clearTelegramLaunchParamsFromUrl', () => {
  afterEach(() => {
    resetTelegramLaunchParamsCaptureForTests();
  });

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

  it('should store startapp query param in memory when captured early', () => {
    window.history.replaceState(null, '', '/admin/gigs/new?startapp=edit-token');

    captureTelegramLaunchParamsFromUrl();

    expect(window.location.pathname).toBe('/admin/gigs/new');
    expect(window.location.search).toBe('');
    expect(getTelegramStartParam()).toBe('edit-token');
  });
});
