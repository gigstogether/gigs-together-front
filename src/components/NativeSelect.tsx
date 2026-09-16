import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export default function NativeSelect(props: ComponentProps<'select'>) {
  const { className, ...selectProps } = props;

  return (
    <div className="relative w-full">
      <select
        {...selectProps}
        className={cn(
          'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent py-1 pl-3 pr-10 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
      />
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
      />
    </div>
  );
}
