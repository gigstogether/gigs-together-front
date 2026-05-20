import type { ReactNode } from 'react';

import AdminSessionRefresh from '@/app/admin/AdminSessionRefresh';

interface AdminLayoutProps {
  readonly children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSessionRefresh />
      {children}
    </div>
  );
}
