import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminPreviewMetaRowProps {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function AdminPreviewMetaRow(props: AdminPreviewMetaRowProps) {
  return (
    <div className={cn('flex min-w-0 items-start gap-2 text-sm', props.className)}>
      <span className="mt-0.5 shrink-0 text-muted-foreground">{props.icon}</span>
      <span className="min-w-0 flex-1 leading-snug">{props.children}</span>
    </div>
  );
}
