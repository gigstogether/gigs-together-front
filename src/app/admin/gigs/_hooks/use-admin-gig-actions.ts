import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchAdminGigVisibility, postAdminGigPost } from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-errors';

interface UseAdminGigActionsParams {
  publicId: string;
  expectedVersion: number;
  isVisible: boolean;
}

async function invalidateAdminGigQueries(
  queryClient: QueryClient,
  publicId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.gigsRoot() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.gigByPublicId(publicId) }),
  ]);
}

async function handleAdminGigActionError(
  error: unknown,
  queryClient: QueryClient,
  publicId: string,
  fallbackTitle: string,
): Promise<void> {
  if (error instanceof ApiError && error.statusCode === 409) {
    await invalidateAdminGigQueries(queryClient, publicId);
    toast({
      title: 'Gig changed',
      description: 'The latest version was loaded. Please try again.',
      variant: 'destructive',
    });
    return;
  }

  toast({ title: fallbackTitle, variant: 'destructive' });
}

export function useAdminGigActions(params: UseAdminGigActionsParams) {
  const queryClient = useQueryClient();
  const postMutation = useMutation({
    mutationFn: () => postAdminGigPost(params.publicId, params.expectedVersion),
    onSuccess: async () => {
      await invalidateAdminGigQueries(queryClient, params.publicId);
      toast({ title: `Gig ${params.publicId} posted` });
    },
    onError: (error) =>
      handleAdminGigActionError(
        error,
        queryClient,
        params.publicId,
        `Could not post ${params.publicId} gig`,
      ),
  });
  const visibilityMutation = useMutation({
    mutationFn: () =>
      patchAdminGigVisibility({
        publicId: params.publicId,
        expectedVersion: params.expectedVersion,
        isVisible: !params.isVisible,
      }),
    onSuccess: async () => {
      await invalidateAdminGigQueries(queryClient, params.publicId);
      toast({ title: `Gig ${params.isVisible ? 'hidden' : 'made visible'}` });
    },
    onError: (error) =>
      handleAdminGigActionError(
        error,
        queryClient,
        params.publicId,
        'Could not change gig visibility',
      ),
  });

  return {
    isPosting: postMutation.isPending,
    isChangingVisibility: visibilityMutation.isPending,
    post: () => postMutation.mutate(),
    toggleVisibility: () => visibilityMutation.mutate(),
  };
}
