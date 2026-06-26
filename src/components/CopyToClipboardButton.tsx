'use client';

import type { ComponentType } from 'react';
import { Copy } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface CopyToastContent {
  readonly title: string;
  readonly description?: string;
}

export type CopyToClipboardButtonIcon = ComponentType<{
  className?: string;
  'aria-hidden'?: boolean;
}>;

interface CopyToClipboardButtonProps {
  readonly copyText: string;
  readonly icon?: CopyToClipboardButtonIcon;
  readonly ariaLabel?: string;
  readonly title?: string;
  readonly copiedToast?: CopyToastContent;
  readonly failedToast?: CopyToastContent;
  readonly className?: string;
}

const DEFAULT_COPIED_TOAST: CopyToastContent = {
  title: 'Copied',
};

const DEFAULT_FAILED_TOAST: CopyToastContent = {
  title: 'Could not copy',
  description: 'Clipboard access is not available.',
};

export default function CopyToClipboardButton(props: CopyToClipboardButtonProps) {
  const {
    copyText,
    icon: Icon = Copy,
    ariaLabel = 'Copy',
    title = 'Copy',
    copiedToast = DEFAULT_COPIED_TOAST,
    failedToast = DEFAULT_FAILED_TOAST,
    className,
  } = props;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      toast(copiedToast);
    } catch {
      toast({ ...failedToast, variant: 'destructive' });
    }
  }, [copyText, copiedToast, failedToast]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 shrink-0', className)}
      onClick={() => void handleCopy()}
      title={title}
      aria-label={ariaLabel}
    >
      <Icon
        className="h-4 w-4"
        aria-hidden
      />
    </Button>
  );
}
