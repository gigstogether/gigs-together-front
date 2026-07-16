import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface UseDismissOnPointerDownOutsideParams {
  readonly isOpen: boolean;
  readonly onDismiss: () => void;
}

export function useDismissOnPointerDownOutside(
  params: UseDismissOnPointerDownOutsideParams,
): RefObject<HTMLDivElement | null> {
  const { isOpen, onDismiss } = params;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current?.contains(target)) {
        return;
      }

      onDismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onDismiss]);

  return containerRef;
}
