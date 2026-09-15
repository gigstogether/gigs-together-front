'use client';

import { ShareButton } from '@/components/ShareButton';
import { cn } from '@/lib/utils';

interface AdminGigPreviewTitleRowProps {
  readonly title: string;
  readonly sharePath: string;
  readonly isVisible: boolean;
}

export default function AdminGigPreviewTitleRow(props: AdminGigPreviewTitleRowProps) {
  const { title, sharePath, isVisible } = props;
  const visibilityLabel = isVisible ? 'Visible' : 'Hidden';

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className="flex min-w-0 flex-1 items-center gap-2 text-base font-semibold leading-snug">
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 shrink-0 self-center rounded-full',
            isVisible ? 'bg-emerald-500' : 'bg-slate-400',
          )}
          title={visibilityLabel}
          aria-label={visibilityLabel}
        />
        <span className="min-w-0 truncate">{title}</span>
      </h2>
      <ShareButton sharePath={sharePath} />
    </div>
  );
}
