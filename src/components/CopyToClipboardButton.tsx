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
  readonly label?: string;
  readonly ariaLabel?: string;
  readonly title?: string;
  readonly copiedToast?: CopyToastContent;
  readonly failedToast?: CopyToastContent;
  readonly onCopied?: () => void;
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
    label,
    ariaLabel = 'Copy',
    title = 'Copy',
    copiedToast = DEFAULT_COPIED_TOAST,
    failedToast = DEFAULT_FAILED_TOAST,
    onCopied,
    className,
  } = props;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      toast(copiedToast);
      onCopied?.();
    } catch {
      toast({ ...failedToast, variant: 'destructive' });
    }
  }, [copyText, copiedToast, failedToast, onCopied]);

  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? 'default' : 'icon'}
      className={cn(
        label
          ? 'h-auto w-full justify-start gap-2 px-2 py-2 text-sm font-normal hover:bg-muted'
          : 'h-8 w-8 shrink-0',
        className,
      )}
      onClick={() => void handleCopy()}
      title={title}
      aria-label={ariaLabel}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        aria-hidden
      />
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
