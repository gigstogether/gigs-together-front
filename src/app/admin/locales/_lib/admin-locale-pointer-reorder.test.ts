// @vitest-environment jsdom

import type { PointerEvent as ReactPointerEvent } from 'react';

import {
  bindAdminLocalePointerReorder,
  getLocaleIsoFromPoint,
} from '@/app/admin/locales/_lib/admin-locale-pointer-reorder';

describe('getLocaleIsoFromPoint', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return iso when pointer is over a locale item', () => {
    const item = document.createElement('li');
    item.dataset.localeIso = 'es';
    const child = document.createElement('span');
    item.append(child);

    document.elementFromPoint = vi.fn().mockReturnValue(child);

    expect(getLocaleIsoFromPoint(10, 20)).toBe('es');
  });

  it('should return null when pointer is not over a locale item', () => {
    document.elementFromPoint = vi.fn().mockReturnValue(document.createElement('div'));

    expect(getLocaleIsoFromPoint(0, 0)).toBeNull();
  });

  it('should skip excluded iso when resolving pointer target', () => {
    const dragged = document.createElement('li');
    dragged.dataset.localeIso = 'es';
    const target = document.createElement('li');
    target.dataset.localeIso = 'en';

    document.elementsFromPoint = vi.fn().mockReturnValue([dragged, target]);

    expect(getLocaleIsoFromPoint(10, 20, 'es')).toBe('en');
  });
});

describe('bindAdminLocalePointerReorder', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start reorder on touch pointer down', () => {
    const onStart = vi.fn();
    const onOver = vi.fn();
    const onDropOn = vi.fn();
    const onEnd = vi.fn();

    const button = document.createElement('button');
    const capturedPointerIds = new Set<number>();
    button.setPointerCapture = vi.fn((pointerId: number) => {
      capturedPointerIds.add(pointerId);
    });
    button.releasePointerCapture = vi.fn((pointerId: number) => {
      capturedPointerIds.delete(pointerId);
    });
    button.hasPointerCapture = vi.fn((pointerId: number) => capturedPointerIds.has(pointerId));

    const { onPointerDown } = bindAdminLocalePointerReorder({
      excludedIso: 'es',
      isDisabled: false,
      onStart,
      onOver,
      onDropOn,
      onEnd,
    });

    onPointerDown({
      isPrimary: true,
      pointerType: 'touch',
      button: -1,
      pointerId: 2,
      preventDefault: vi.fn(),
      currentTarget: button,
    } as unknown as ReactPointerEvent<HTMLButtonElement>);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(button.setPointerCapture).toHaveBeenCalledWith(2);
  });

  it('should call reorder callbacks when pointer ends over another item', () => {
    const onStart = vi.fn();
    const onOver = vi.fn();
    const onDropOn = vi.fn();
    const onEnd = vi.fn();

    const item = document.createElement('li');
    item.dataset.localeIso = 'en';
    document.elementFromPoint = vi.fn().mockReturnValue(item);

    const button = document.createElement('button');
    const capturedPointerIds = new Set<number>();
    button.setPointerCapture = vi.fn((pointerId: number) => {
      capturedPointerIds.add(pointerId);
    });
    button.releasePointerCapture = vi.fn((pointerId: number) => {
      capturedPointerIds.delete(pointerId);
    });
    button.hasPointerCapture = vi.fn((pointerId: number) => capturedPointerIds.has(pointerId));

    const { onPointerDown, onPointerMove, onPointerUp } = bindAdminLocalePointerReorder({
      excludedIso: 'es',
      isDisabled: false,
      onStart,
      onOver,
      onDropOn,
      onEnd,
    });

    const pointerId = 1;

    onPointerDown({
      isPrimary: true,
      button: 0,
      pointerId,
      clientX: 0,
      clientY: 0,
      preventDefault: vi.fn(),
      currentTarget: button,
    } as unknown as ReactPointerEvent<HTMLButtonElement>);

    onPointerMove({
      pointerId,
      clientX: 5,
      clientY: 5,
      preventDefault: vi.fn(),
      currentTarget: button,
    } as unknown as ReactPointerEvent<HTMLButtonElement>);

    onPointerUp({
      pointerId,
      clientX: 5,
      clientY: 5,
      currentTarget: button,
    } as unknown as ReactPointerEvent<HTMLButtonElement>);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onOver).toHaveBeenCalledWith('en');
    expect(onDropOn).toHaveBeenCalledWith('en');
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(button.releasePointerCapture).toHaveBeenCalledWith(pointerId);
  });
});
