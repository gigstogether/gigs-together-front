import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { toast } from '@/hooks/use-toast';
import {
  postAdminGigApprove,
  postAdminGigPost,
  postAdminGigReject,
} from '@/app/admin/_lib/admin-api';

interface UseAdminGigModerationActionsParams {
  readonly publicId: string;
}

interface AdminGigModerationActions {
  readonly isApproving: boolean;
  readonly isRejecting: boolean;
  readonly isPosting: boolean;
  readonly approve: () => void;
  readonly reject: () => void;
  readonly post: () => void;
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

export function useAdminGigModerationActions(
  params: UseAdminGigModerationActionsParams,
): AdminGigModerationActions {
  const { publicId } = params;
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => postAdminGigApprove(publicId),
    onSuccess: async () => {
      await invalidateAdminGigQueries(queryClient, publicId);
      toast({ title: `Gig ${publicId} approved` });
    },
    onError: () => {
      toast({
        title: `Could not ${publicId} approve gig`,
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => postAdminGigReject(publicId),
    onSuccess: async () => {
      await invalidateAdminGigQueries(queryClient, publicId);
      toast({ title: `Gig ${publicId} rejected` });
    },
    onError: () => {
      toast({
        title: `Could not reject ${publicId} gig`,
        variant: 'destructive',
      });
    },
  });

  const postMutation = useMutation({
    mutationFn: () => postAdminGigPost(publicId),
    onSuccess: async () => {
      await invalidateAdminGigQueries(queryClient, publicId);
      toast({ title: `Gig ${publicId} posted` });
    },
    onError: () => {
      toast({
        title: `Could not post ${publicId} gig`,
        variant: 'destructive',
      });
    },
  });

  return {
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isPosting: postMutation.isPending,
    approve: () => approveMutation.mutate(),
    reject: () => rejectMutation.mutate(),
    post: () => postMutation.mutate(),
  };
}
