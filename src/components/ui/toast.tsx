'use client';

import type { ComponentProps, ReactElement } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

function ToastViewport({ className, ...props }: ComponentProps<typeof ToastPrimitives.Viewport>) {
  return (
    <ToastPrimitives.Viewport
      className={cn(
        'pointer-events-none fixed left-1/2 top-[calc(var(--header-h)+0.75rem)] z-[120] flex max-h-[calc(100dvh-var(--header-h)-1.5rem)] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 flex-col sm:right-4 sm:left-auto sm:translate-x-0',
        className,
      )}
      {...props}
    />
  );
}
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Toast({
  className,
  variant,
  ...props
}: ComponentProps<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>) {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}
Toast.displayName = ToastPrimitives.Root.displayName;

function ToastAction({ className, ...props }: ComponentProps<typeof ToastPrimitives.Action>) {
  return (
    <ToastPrimitives.Action
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
        className,
      )}
      {...props}
    />
  );
}
ToastAction.displayName = ToastPrimitives.Action.displayName;

function ToastClose({ className, ...props }: ComponentProps<typeof ToastPrimitives.Close>) {
  return (
    <ToastPrimitives.Close
      className={cn(
        'absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className,
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
}
ToastClose.displayName = ToastPrimitives.Close.displayName;

function ToastTitle({ className, ...props }: ComponentProps<typeof ToastPrimitives.Title>) {
  return (
    <ToastPrimitives.Title
      className={cn('text-sm font-semibold [&+div]:text-xs', className)}
      {...props}
    />
  );
}
ToastTitle.displayName = ToastPrimitives.Title.displayName;

function ToastDescription({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Description>) {
  return (
    <ToastPrimitives.Description
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  );
}
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = ComponentProps<typeof Toast>;

type ToastActionElement = ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
