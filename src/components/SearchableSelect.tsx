'use client';

import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FocusEventHandler, Ref } from 'react';

import type { SelectOption } from '@/components/Select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toSearchKey } from '@/lib/search-text';
import { cn } from '@/lib/utils';

interface SearchableSelectBaseProps {
  id: string;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  ariaLabelledBy: string;
  title?: string;
  variant?: 'default' | 'inline';
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  name?: string;
  triggerRef?: Ref<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
}

interface SearchableSingleSelectProps extends SearchableSelectBaseProps {
  selectionMode?: 'single';
  value: string;
  onValueChange: (value: string) => void;
}

interface SearchableMultipleSelectProps extends SearchableSelectBaseProps {
  selectionMode: 'multiple';
  value: string[];
  onValueChange: (value: string[]) => void;
}

type SearchableSelectProps = SearchableSingleSelectProps | SearchableMultipleSelectProps;

function SearchableSelect(props: SearchableSelectProps) {
  const {
    id,
    options,
    placeholder,
    searchPlaceholder,
    emptyText,
    ariaLabelledBy,
    title,
    variant = 'default',
    isDisabled = false,
    isRequired = false,
    isInvalid = false,
    name,
    triggerRef,
    onBlur,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const normalizedSearch = toSearchKey(search);
  const filteredOptions = useMemo(() => {
    if (normalizedSearch.length === 0) {
      return options;
    }

    return options.filter((option) => {
      const normalizedLabel = toSearchKey(option.label);
      const normalizedValue = toSearchKey(option.value);
      return (
        normalizedLabel.includes(normalizedSearch) || normalizedValue.includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, options]);
  const listboxId = `${id}-listbox`;
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;
  const selectedValues = props.selectionMode === 'multiple' ? props.value : [props.value];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  const handleSelect = (option: SelectOption) => {
    if (option.isDisabled) {
      return;
    }

    if (props.selectionMode === 'multiple') {
      if (props.value.includes(option.value)) {
        props.onValueChange(props.value.filter((selectedValue) => selectedValue !== option.value));
        return;
      }

      props.onValueChange([...props.value, option.value]);
      return;
    }

    props.onValueChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  const trigger = (
    <Button
      ref={triggerRef}
      id={id}
      name={name}
      title={title}
      type="button"
      variant={variant === 'inline' ? 'ghost' : 'outline'}
      disabled={isDisabled}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={listboxId}
      aria-labelledby={ariaLabelledBy}
      aria-required={isRequired}
      aria-invalid={isInvalid}
      className={cn(
        variant === 'inline'
          ? 'h-auto min-w-0 max-w-full gap-1 rounded-sm bg-transparent px-0 py-0 text-base font-normal leading-normal text-foreground underline decoration-foreground/30 underline-offset-4 shadow-none hover:bg-transparent hover:decoration-foreground focus-visible:decoration-foreground'
          : 'h-9 min-w-0 w-full justify-between bg-transparent px-3 font-normal shadow-sm',
      )}
      onBlur={onBlur}
    >
      <span className={cn('truncate', selectedLabels.length === 0 && 'text-muted-foreground')}>
        {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
      </span>
      {variant === 'default' ? (
        <ChevronIcon
          className="size-4 shrink-0 opacity-50"
          aria-hidden
        />
      ) : null}
    </Button>
  );

  const content = (
    <>
      <div className="relative shrink-0 border-b p-1">
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
        aria-multiselectable={props.selectionMode === 'multiple' ? true : undefined}
        aria-labelledby={ariaLabelledBy}
        className="min-h-0 max-h-48 space-y-0.5 overflow-y-auto p-1"
      >
        {filteredOptions.map((option) => {
          const isSelected = selectedValues.includes(option.value);

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
    </>
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={(isNextOpen) => {
        setIsOpen(isNextOpen);
        if (!isNextOpen) {
          setSearch('');
        }
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className={cn(
          'flex max-h-[var(--radix-popover-content-available-height)] max-w-[calc(100vw-2rem)] flex-col p-0',
          variant === 'inline' ? 'w-64' : 'w-[var(--radix-popover-trigger-width)]',
        )}
        aria-labelledby={ariaLabelledBy}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}

export { SearchableSelect };
