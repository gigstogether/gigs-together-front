'use client';

import type { ReactNode } from 'react';

export interface SignInContentProps {
  children: ReactNode;
}

export default function SignInContent(props: SignInContentProps) {
  const { children } = props;

  return (
    <>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Continue with the button below to sign in to your account.
        </p>
      </div>
      <div className="flex justify-center pt-1">{children}</div>
    </>
  );
}
