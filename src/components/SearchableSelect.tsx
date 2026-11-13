'use client';

import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FocusEventHandler, Ref } from 'react';

import type { SelectOption } from '@/components/Select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDismissOnPointerDownOutside } from '@/hooks/use-dismiss-on-pointer-down-outside';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  ariaLabelledBy: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  name?: string;
  triggerRef?: Ref<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onValueChange: (value: string) => void;
}

function SearchableSelect(props: SearchableSelectProps) {
  const {
    id,
    value,
    options,
    placeholder,
    searchPlaceholder,
    emptyText,
    ariaLabelledBy,
    isDisabled = false,
    isRequired = false,
    isInvalid = false,
    name,
    triggerRef,
    onBlur,
    onValueChange,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useDismissOnPointerDownOutside({
    isOpen,
    onDismiss: () => {
      setIsOpen(false);
      setSearch('');
    },
  });
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredOptions = useMemo(() => {
    if (normalizedSearch.length === 0) {
      return options;
    }

    return options.filter((option) => {
      const normalizedLabel = option.label.toLocaleLowerCase();
      const normalizedValue = option.value.toLocaleLowerCase();
      return (
        normalizedLabel.includes(normalizedSearch) || normalizedValue.includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, options]);
  const listboxId = `${id}-listbox`;
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;
  const selectedOption = options.find((option) => option.value === value);

  const handleToggle = () => {
    if (isOpen) {
      setSearch('');
    }

    setIsOpen((current) => !current);
  };

  const handleSelect = (option: SelectOption) => {
    if (option.isDisabled) {
      return;
    }

    onValueChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <Button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        variant="outline"
        disabled={isDisabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={ariaLabelledBy}
        aria-required={isRequired}
        aria-invalid={isInvalid}
        className="h-9 w-full justify-between bg-transparent px-3 font-normal shadow-sm"
        onBlur={onBlur}
        onClick={handleToggle}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronIcon
          className="size-4 shrink-0 opacity-50"
          aria-hidden
        />
      </Button>
      {isOpen ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="relative border-b p-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              autoFocus
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              className="h-8 border-0 pl-8 shadow-none focus-visible:ring-0"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setIsOpen(false);
                  setSearch('');
                }
              }}
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={ariaLabelledBy}
            className="max-h-48 space-y-0.5 overflow-y-auto p-1"
          >
            {filteredOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <li
                  key={option.value}
                  role="presentation"
                >
                  <button
                    type="button"
                    role="option"
                    disabled={option.isDisabled}
                    aria-selected={isSelected}
                    aria-disabled={option.isDisabled}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-muted',
                      option.isDisabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Check
                      className={cn('size-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
            {filteredOptions.length === 0 ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">{emptyText}</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export { SearchableSelect };
