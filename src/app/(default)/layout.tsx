import AppHeader from '@/app/_components/AppHeader';
import type { ReactNode } from 'react';

interface DefaultLayoutProps {
  readonly children: ReactNode;
}

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children } = props;

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
