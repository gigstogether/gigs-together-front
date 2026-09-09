'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import AdminDashboardActions from '@/app/admin/_components/AdminDashboardActions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import { adminNavItems } from '@/app/admin/_lib/admin-nav-config';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { ADMIN_GIGS_BASE_PATH } from '@/lib/admin-gig-paths';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAdminDashboard } from '@/app/admin/_lib/admin-api';

export default function AdminPageClient() {
  const dashboardQuery = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: fetchAdminDashboard,
  });
  const summary = dashboardQuery.data?.summary;

  const sectionLinks = adminNavItems.filter((item) => item.href !== '/admin');

  return (
    <>
      <AdminPageHeader title="Dashboard" />
      <AdminDashboardActions />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href={ADMIN_GIGS_BASE_PATH}>
          <Card className="border shadow-sm">
            <CardHeader className="min-h-24 justify-center">
              <CardDescription>All gigs</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {dashboardQuery.isLoading ? '—' : (summary?.gigsCount ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href={ADMIN_GIGS_BASE_PATH}>
          <Card className="border shadow-sm">
            <CardHeader className="min-h-24 justify-center">
              <CardDescription>Visible gigs</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {dashboardQuery.isLoading ? '—' : (summary?.visibleGigsCount ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
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
