import type { PointerEvent as ReactPointerEvent } from 'react';

const LANGUAGE_ITEM_SELECTOR = '[data-language-iso]';

function getElementsAtPoint(clientX: number, clientY: number): Element[] {
  if (typeof document.elementsFromPoint === 'function') {
    const elements = document.elementsFromPoint(clientX, clientY);
    if (elements && elements.length > 0) {
      return [...elements];
    }
  }

  const element = document.elementFromPoint(clientX, clientY);
  return element instanceof Element ? [element] : [];
}

export function getLanguageIsoFromPoint(
  clientX: number,
  clientY: number,
  excludedIso?: string | null,
): string | null {
  const roots = getElementsAtPoint(clientX, clientY);

  for (const element of roots) {
    const item = element.closest(LANGUAGE_ITEM_SELECTOR);
    if (!(item instanceof HTMLElement)) {
      continue;
    }

    const iso = item.dataset.languageIso ?? null;
    if (iso && iso !== excludedIso) {
      return iso;
    }
  }

  return null;
}

export interface AdminLanguagePointerReorderBindings {
  readonly onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  readonly onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  readonly onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  readonly onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}

interface BindAdminLanguagePointerReorderParams {
  readonly excludedIso: string;
  readonly isDisabled: boolean;
  readonly onStart: () => void;
  readonly onOver: (iso: string) => void;
  readonly onDropOn: (targetIso: string) => void;
  readonly onEnd: () => void;
}

export function bindAdminLanguagePointerReorder(
  params: BindAdminLanguagePointerReorderParams,
): AdminLanguagePointerReorderBindings {
  const finishReorder = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const targetIso = getLanguageIsoFromPoint(event.clientX, event.clientY, params.excludedIso);
    if (targetIso) {
      params.onDropOn(targetIso);
    }

    params.onEnd();
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return {
    onPointerDown(event) {
      if (params.isDisabled || !event.isPrimary) {
        return;
      }

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      params.onStart();
    },
    onPointerMove(event) {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }

      event.preventDefault();
      const overIso = getLanguageIsoFromPoint(event.clientX, event.clientY, params.excludedIso);
      if (overIso) {
        params.onOver(overIso);
      }
    },
    onPointerUp(event) {
      finishReorder(event);
    },
    onPointerCancel(event) {
      finishReorder(event);
    },
  };
}
