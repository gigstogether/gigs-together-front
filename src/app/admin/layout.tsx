import AppHeader from '@/app/_components/AppHeader';
import AdminLayoutClient from '@/app/admin/AdminLayoutClient';
import type { ReactNode } from 'react';
import AdminHeaderNavMenu from '@/app/admin/_components/AdminHeaderNavMenu';

interface AdminLayoutProps {
  readonly children: ReactNode;
}

export default function AdminLayout(props: AdminLayoutProps) {
  const { children } = props;

  return (
    <>
      <AppHeader>
        <AdminHeaderNavMenu />
      </AppHeader>
      <div className="min-h-[calc(100dvh-var(--header-h))] bg-gray-50">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </div>
    </>
  );
}
