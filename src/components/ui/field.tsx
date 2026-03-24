'use client';

import { useMemo } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

function Field({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn('group/field flex w-full flex-col gap-3', className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-muted-foreground text-sm font-normal leading-normal',
        'nth-last-2:-mt-1 last:mt-0',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

interface FieldSeparatorProps extends ComponentProps<'div'> {
  children?: ReactNode;
}

function FieldSeparator({
  children,
  className,
  ...props
}: FieldSeparatorProps) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn('relative -my-2 h-5 text-sm', className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children ? (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

interface FieldErrorItem {
  readonly message?: string;
}

interface FieldErrorProps extends ComponentProps<'div'> {
  readonly errors?: readonly (FieldErrorItem | undefined)[];
}

function FieldError(props: FieldErrorProps) {
  const {
    className,
    children,
    errors,
    ...restProps
  } = props;
  const content = useMemo(() => {
    const messages = errors?.flatMap((error) => (
      error?.message ? [error.message] : []
    )) ?? [];

    if (children) {
      return children;
    }

    if (messages.length === 0) {
      return null;
    }

    if (messages.length === 1) {
      return messages[0];
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-destructive text-sm font-normal', className)}
      {...restProps}
    >
      {content}
    </div>
  );
}

export { Field, FieldDescription, FieldError, FieldLabel, FieldSeparator };
