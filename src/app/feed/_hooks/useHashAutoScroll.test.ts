// @vitest-environment jsdom

import { StrictMode } from 'react';

import { act, renderHook } from '@testing-library/react';

import type { Event } from '@/lib/types';

import { useHashAutoScroll } from './useHashAutoScroll';

function makeEvent(id: string): Event {
  return {
    id,
    date: '2026-05-01',
    title: 't',
    venue: 'v',
    city: { code: 'c', name: 'City' },
    country: { iso: 'es', name: 'Spain' },
  };
}

describe('useHashAutoScroll', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    window.history.replaceState(null, '', '/');
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  it('should not scroll again when events update and the hash is unchanged', async () => {
    window.history.replaceState(null, '', '/#e1');
    const anchor = document.createElement('div');
    anchor.id = 'e1';
    document.body.appendChild(anchor);

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const events1 = [makeEvent('e1')];
    const events2 = [makeEvent('e1'), makeEvent('e2')];

    const { rerender } = renderHook(
      ({ events }: { events: Event[] }) =>
        useHashAutoScroll({ events, headerOffsetPx: 0, extraOffsetPx: 0 }),
      { initialProps: { events: events1 } },
    );

    await act(async () => {});

    expect(scrollTo).toHaveBeenCalledTimes(1);

    rerender({ events: events2 });

    await act(async () => {});

    expect(scrollTo).toHaveBeenCalledTimes(1);

    anchor.remove();
  });

  it('should scroll again after hashchange to a different target', async () => {
    window.history.replaceState(null, '', '/#e1');
    const a1 = document.createElement('div');
    a1.id = 'e1';
    const a2 = document.createElement('div');
    a2.id = 'e2';
    document.body.append(a1, a2);

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const events = [makeEvent('e1'), makeEvent('e2')];

    renderHook(() => useHashAutoScroll({ events, headerOffsetPx: 0, extraOffsetPx: 0 }));

    await act(async () => {});
    expect(scrollTo).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.history.replaceState(null, '', '/#e2');
      window.dispatchEvent(new Event('hashchange'));
    });

    await act(async () => {});
    expect(scrollTo).toHaveBeenCalledTimes(2);

    a1.remove();
    a2.remove();
  });

  it('should scroll once initial hash resolves after events grow (deep-link style)', async () => {
    window.history.replaceState(null, '', '/#late');
    const late = document.createElement('div');
    late.id = 'late';

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { rerender } = renderHook(
      ({ events }: { events: Event[] }) =>
        useHashAutoScroll({ events, headerOffsetPx: 0, extraOffsetPx: 0 }),
      { initialProps: { events: [makeEvent('only')] } },
    );

    await act(async () => {});
    expect(scrollTo).not.toHaveBeenCalled();

    document.body.appendChild(late);

    rerender({ events: [makeEvent('only'), makeEvent('late')] });

    await act(async () => {});
    expect(scrollTo).toHaveBeenCalledTimes(1);

    rerender({ events: [makeEvent('only'), makeEvent('late'), makeEvent('more')] });

    await act(async () => {});
    expect(scrollTo).toHaveBeenCalledTimes(1);

    late.remove();
  });

  it('in StrictMode should not cause extra scrolls on events-only updates after mount', async () => {
    window.history.replaceState(null, '', '/#e1');
    const anchor = document.createElement('div');
    anchor.id = 'e1';
    document.body.appendChild(anchor);

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const events1 = [makeEvent('e1')];
    const events2 = [makeEvent('e1'), makeEvent('e2')];

    const { rerender } = renderHook(
      ({ events }: { events: Event[] }) =>
        useHashAutoScroll({ events, headerOffsetPx: 0, extraOffsetPx: 0 }),
      {
        initialProps: { events: events1 },
        wrapper: StrictMode,
      },
    );

    await act(async () => {});

    const afterMountCalls = scrollTo.mock.calls.length;
    expect(afterMountCalls).toBeGreaterThanOrEqual(1);

    rerender({ events: events2 });

    await act(async () => {});

    expect(scrollTo.mock.calls.length).toStrictEqual(afterMountCalls);

    anchor.remove();
  });
});
