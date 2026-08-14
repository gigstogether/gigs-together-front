// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';

import { useClearFeedLocationHash } from './useClearFeedLocationHash';

describe('useClearFeedLocationHash', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('should not replace history when hash is empty', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona?utm=1');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    expect(replaceStateSpy).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/feed/es/barcelona');
    expect(window.location.search).toBe('?utm=1');
    expect(window.location.hash).toBe('');
  });

  it('should clear hash and preserve search when both are present', () => {
    window.history.replaceState(null, '', '/feed/es/barcelona?utm=1#gig');

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    expect(window.location.pathname).toBe('/feed/es/barcelona');
    expect(window.location.search).toBe('?utm=1');
    expect(window.location.hash).toBe('');
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
  });

  it('should replace history once and preserve the existing history state', () => {
    const historyState = { key: 'next-router-state' };
    window.history.replaceState(historyState, '', '/feed/es/barcelona?ref=share#gig');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const { result } = renderHook(() => useClearFeedLocationHash());

    act(() => {
      result.current();
    });

    const expectedUrl = '/feed/es/barcelona?ref=share';
    expect(`${window.location.pathname}${window.location.search}`).toBe(expectedUrl);
    expect(replaceStateSpy).toHaveBeenCalledOnce();
    expect(replaceStateSpy).toHaveBeenCalledWith(historyState, '', expectedUrl);
    expect(window.history.state).toEqual(historyState);
  });
});
