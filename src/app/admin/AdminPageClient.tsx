'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import { adminNavItems } from '@/app/admin/admin-nav-config';
import { adminKeys } from '@/app/admin/adminKeys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAdminDashboard } from '@/lib/admin-api';

export default function AdminPageClient() {
  const dashboardQuery = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: fetchAdminDashboard,
  });
  const summary = dashboardQuery.data?.summary;

  const sectionLinks = adminNavItems.filter((item) => item.href !== '/admin');

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of moderation work and quick links to admin tools."
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="min-h-24 justify-center">
            <CardDescription>Pending gigs</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {dashboardQuery.isLoading ? '—' : (summary?.pendingGigsCount ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="min-h-24 justify-center">
            <CardDescription>Published gigs</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {dashboardQuery.isLoading ? '—' : (summary?.publishedGigsCount ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      {dashboardQuery.isError ? (
        <p className="mb-6 text-sm text-destructive">Could not load dashboard summary.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {sectionLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border bg-card shadow-sm transition-colors hover:bg-muted/40"
          >
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
