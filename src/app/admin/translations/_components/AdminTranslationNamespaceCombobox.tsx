'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AdminTranslationNamespaceComboboxProps {
  readonly id: string;
  readonly value: string;
  readonly namespaces: readonly string[];
  readonly isDisabled: boolean;
  readonly onChange: (value: string) => void;
}

interface UseDismissOnPointerDownOutsideParams {
  readonly isOpen: boolean;
  readonly onDismiss: () => void;
}

function useDismissOnPointerDownOutside(
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

function filterNamespaces(namespaces: readonly string[], query: string): readonly string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return namespaces;
  }

  return namespaces.filter((namespace) => namespace.toLowerCase().includes(normalizedQuery));
}

export default function AdminTranslationNamespaceCombobox(
  props: AdminTranslationNamespaceComboboxProps,
) {
  const { id, value, namespaces, isDisabled, onChange } = props;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useDismissOnPointerDownOutside({
    isOpen,
    onDismiss: () => setIsOpen(false),
  });
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;
  const labelId = `${id}-label`;

  const trimmedValue = value.trim();
  const filteredNamespaces = useMemo(
    () => filterNamespaces(namespaces, value),
    [namespaces, value],
  );
  const hasExactNamespaceMatch = namespaces.some((namespace) => namespace === trimmedValue);
  const shouldShowCreateOption = trimmedValue.length > 0 && !hasExactNamespaceMatch;

  const handleSelectNamespace = (namespace: string) => {
    onChange(namespace);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <Input
        id={id}
        value={value}
        disabled={isDisabled}
        placeholder="about"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="translation-form-namespace-listbox"
        aria-labelledby={labelId}
        className="pr-9"
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isDisabled}
        aria-label="Show namespace suggestions"
        className="absolute top-0 right-0 h-10 w-9 rounded-l-none hover:bg-transparent"
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((current) => !current);
        }}
      >
        <ChevronIcon
          className="size-4 opacity-60"
          aria-hidden
        />
      </Button>
      {isOpen ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul
            id="translation-form-namespace-listbox"
            role="listbox"
            aria-label="Namespace suggestions"
            className="max-h-48 space-y-0.5 overflow-y-auto p-1"
          >
            {filteredNamespaces.map((namespace) => {
              const isSelected = namespace === trimmedValue;

              return (
                <li
                  key={namespace}
                  role="presentation"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectNamespace(namespace)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Check
                      className={cn('size-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                    <span>{namespace}</span>
                  </button>
                </li>
              );
            })}
            {shouldShowCreateOption ? (
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelectNamespace(trimmedValue)}
                  className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <span>Use &quot;{trimmedValue}&quot;</span>
                </button>
              </li>
            ) : null}
            {filteredNamespaces.length === 0 && !shouldShowCreateOption ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">Type a new namespace.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
