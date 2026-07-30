// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';

import { useClearFeedLocationHash } from './useClearFeedLocationHash';

const { routerReplaceMock, usePathnameMock, useSearchParamsMock } = vi.hoisted(() => ({
  routerReplaceMock: vi.fn(),
  usePathnameMock: vi.fn(() => '/feed/es/barcelona'),
  useSearchParamsMock: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceMock,
  }),
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

describe('useClearFeedLocationHash', () => {
  beforeEach(() => {
    routerReplaceMock.mockReset();
    usePathnameMock.mockReturnValue('/feed/es/barcelona');
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    window.history.replaceState(null, '', '/');
  });

  it('should not call replace when hash is empty', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona?utm=1');
    useSearchParamsMock.mockReturnValue(new URLSearchParams('utm=1'));

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    expect(routerReplaceMock).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/feed/es/barcelona');
    expect(window.location.search).toBe('?utm=1');
    expect(window.location.hash).toBe('');
  });

  it('should clear hash and preserve search when both are present', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona?utm=1#gig');
    useSearchParamsMock.mockReturnValue(new URLSearchParams('utm=1'));

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    expect(window.location.pathname).toBe('/feed/es/barcelona');
    expect(window.location.search).toBe('?utm=1');
    expect(window.location.hash).toBe('');
    expect(routerReplaceMock).toHaveBeenCalledWith('/feed/es/barcelona?utm=1');
  });

  it('should clear hash when search is empty', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona#gig');

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    expect(window.location.pathname).toBe('/feed/es/barcelona');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
    expect(routerReplaceMock).toHaveBeenCalledWith('/feed/es/barcelona');
  });

  it('should call replace with the same url written by history.replaceState', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona?ref=share#gig');
    useSearchParamsMock.mockReturnValue(new URLSearchParams('ref=share'));

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    const expectedUrl = '/feed/es/barcelona?ref=share';
    expect(`${window.location.pathname}${window.location.search}`).toBe(expectedUrl);
    expect(routerReplaceMock).toHaveBeenCalledTimes(1);
    expect(routerReplaceMock).toHaveBeenCalledWith(expectedUrl);
  });
});
