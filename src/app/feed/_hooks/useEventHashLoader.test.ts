// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';

import { useEventHashLoader } from './useEventHashLoader';

interface TestHookParams {
  resolveAnchorYmdByEventId: ReturnType<typeof vi.fn<(eventId: string) => Promise<string>>>;
  loadAroundAndReplace: ReturnType<typeof vi.fn<(anchorYmd: string) => Promise<void>>>;
}

function renderTestHook(params: TestHookParams): void {
  renderHook(() =>
    useEventHashLoader({
      isEnabled: true,
      isBusyRef: { current: false },
      setIsBusy: vi.fn(),
      dispatchLoading: vi.fn(),
      setError: vi.fn(),
      bumpInfiniteScrollResetKey: vi.fn(),
      resolveAnchorYmdByEventId: params.resolveAnchorYmdByEventId,
      loadAroundAndReplace: params.loadAroundAndReplace,
    }),
  );
}

describe('useEventHashLoader', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    window.history.replaceState(null, '', '/feed/es/barcelona');
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should not resolve an anchor when the hash is not a valid gig public id', async () => {
    window.history.replaceState(
      null,
      '',
      '/feed/es/barcelona#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
    );
    const resolveAnchorYmdByEventId = vi.fn<(eventId: string) => Promise<string>>();

    renderTestHook({
      resolveAnchorYmdByEventId,
      loadAroundAndReplace: vi.fn<(anchorYmd: string) => Promise<void>>(),
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(resolveAnchorYmdByEventId).not.toHaveBeenCalled();
  });

  it('should resolve an anchor when the hash is a valid gig public id', async () => {
    const publicId = 'ist-ist-2026-10-13';
    window.history.replaceState(null, '', `/feed/es/barcelona#${publicId}`);
    const resolveAnchorYmdByEventId = vi
      .fn<(eventId: string) => Promise<string>>()
      .mockResolvedValue('2999-10-13');
    const loadAroundAndReplace = vi
      .fn<(anchorYmd: string) => Promise<void>>()
      .mockImplementation(() => {
        const anchor = document.createElement('div');
        anchor.id = publicId;
        document.body.appendChild(anchor);
        return Promise.resolve();
      });

    renderTestHook({ resolveAnchorYmdByEventId, loadAroundAndReplace });

    await waitFor(() => {
      expect(resolveAnchorYmdByEventId).toHaveBeenCalledWith(publicId);
    });
  });
});
