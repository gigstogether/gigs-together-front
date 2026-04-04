'use client';

import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

/**
 * Radix `DialogPrimitive.Overlay` wraps content in `react-remove-scroll`, which applies
 * `padding-right` to the body and shifts the layout. We use a full-screen `Dialog.Close`
 * backdrop instead (no RemoveScroll) and lock body scroll like `ImageLightbox`.
 */
function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <DialogPortal>
      <DialogPrimitive.Close asChild>
        <button
          type="button"
          className="fixed inset-0 z-[100] cursor-default border-0 bg-black/70 p-0 backdrop-blur-sm"
          tabIndex={-1}
          aria-label="Close dialog"
        />
      </DialogPrimitive.Close>
      <DialogPrimitive.Content
        className={cn(
          'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
        {...props}
      >
        <div
          className={cn(
            'pointer-events-auto relative w-full max-w-md rounded-lg bg-background p-6 shadow-2xl',
            className,
          )}
        >
          {children}
        </div>
        <DialogPrimitive.Close
          type="button"
          className="pointer-events-auto absolute right-4 top-4 z-[110] inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="Close"
        >
          <X
            className="h-5 w-5"
            aria-hidden
          />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

export type DialogContentProps = ComponentProps<typeof DialogContent>;
