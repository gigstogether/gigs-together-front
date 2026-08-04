import Header from '@/components/header/Header';
import type { ReactNode } from 'react';

interface DefaultLayoutProps {
  readonly children: ReactNode;
}

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children } = props;

  return (
    <>
      <Header />
      {children}
    </>
  );
}
