import { z } from 'zod';

import { apiRequest } from '@/lib/api';

const v1AdminDashboardSummarySchema = z
  .object({
    pendingGigsCount: z.number().int().nonnegative(),
    publishedGigsCount: z.number().int().nonnegative(),
  })
  .strict();

const v1AdminDashboardResponseBodySchema = z
  .object({
    summary: v1AdminDashboardSummarySchema,
  })
  .strict();

type AdminDashboard = z.infer<typeof v1AdminDashboardResponseBodySchema>;

function parseAdminDashboard(payload: unknown): AdminDashboard {
  const parsed = v1AdminDashboardResponseBodySchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Invalid admin dashboard response');
  }
  return parsed.data;
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const raw = await apiRequest<unknown>('v1/admin/dashboard', 'GET');
  return parseAdminDashboard(raw);
}
