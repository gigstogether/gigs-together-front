import type { ReactNode } from 'react';

import AdminLayoutClient from '@/app/admin/AdminLayoutClient';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-[calc(100dvh-var(--header-h))] bg-gray-50">
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
