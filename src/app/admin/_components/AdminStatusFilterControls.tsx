import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminStatusFilterOption<TStatus extends string> {
  value: TStatus;
  label: string;
}

interface AdminStatusFilterControlsProps<TStatus extends string> {
  ariaLabel: string;
  value: TStatus;
  options: readonly AdminStatusFilterOption<TStatus>[];
  onChange: (value: TStatus) => void;
  trailingAction?: ReactNode;
}

export default function AdminStatusFilterControls<TStatus extends string>(
  props: AdminStatusFilterControlsProps<TStatus>,
) {
  const { ariaLabel, value, options, onChange, trailingAction } = props;

  return (
    <nav
      className="shrink-0 bg-muted/20 px-2 pt-2 pb-1"
      aria-label={ariaLabel}
    >
      <div className="flex min-w-0 w-full">
        {options.map((option, index) => {
          const isActive = value === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                'h-8 min-w-0 flex-1 rounded-none px-1 text-xs font-normal focus-visible:z-10',
                index === 0 && 'rounded-l-md',
                index > 0 && '-ml-px',
                !trailingAction && index === options.length - 1 && 'rounded-r-md',
                isActive && 'z-[1] bg-accent text-accent-foreground',
              )}
            >
              {option.label}
            </Button>
          );
        })}
        {trailingAction}
      </div>
    </nav>
  );
}
