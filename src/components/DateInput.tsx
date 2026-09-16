import { X } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type DateInputProps = Omit<ComponentProps<'input'>, 'type' | 'value'> & {
  clearLabel: string;
  onClear: () => void;
  value: string;
};

export default function DateInput(props: DateInputProps) {
  const { className, clearLabel, disabled, onClear, readOnly, value, ...inputProps } = props;
  const isClearable = value.length > 0 && !disabled && !readOnly;

  return (
    <div
      data-slot="date-input-frame"
      className="relative h-9 min-h-9 max-h-9 w-full min-w-0 max-w-full overflow-hidden rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring"
    >
      <input
        {...inputProps}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        type="date"
        data-has-clear-button={isClearable}
        className={cn(
          'date-input-native absolute inset-0 block h-full min-h-0 max-h-full w-full min-w-0 max-w-full border-0 bg-transparent p-0 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
      />
      {isClearable ? (
        <button
          type="button"
          aria-label={clearLabel}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-1 z-10 flex w-8 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-1"
          onClick={onClear}
        >
          <X
            aria-hidden="true"
            className="h-4 w-4"
          />
        </button>
      ) : null}
    </div>
  );
}
