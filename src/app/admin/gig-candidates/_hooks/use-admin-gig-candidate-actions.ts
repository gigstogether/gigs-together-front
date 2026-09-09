import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  approveAdminGigCandidate,
  rejectAdminGigCandidate,
  sendAdminGigCandidateToModeration,
} from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-errors';

interface UseAdminGigCandidateActionsParams {
  gigCandidateId: string;
  expectedVersion: number;
}

interface AdminGigCandidateActions {
  isApproving: boolean;
  isRejecting: boolean;
  isSendingToModeration: boolean;
  approveGigCandidate: () => void;
  rejectGigCandidate: () => void;
  sendGigCandidateToModeration: () => void;
}

async function invalidateAdminGigCandidateQueries(
  queryClient: QueryClient,
  gigCandidateId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.gigCandidatesRoot() }),
    queryClient.invalidateQueries({
      queryKey: adminKeys.gigCandidateById(gigCandidateId),
    }),
  ]);
}

export function useAdminGigCandidateActions(
  params: UseAdminGigCandidateActionsParams,
): AdminGigCandidateActions {
  const { gigCandidateId, expectedVersion } = params;
  const queryClient = useQueryClient();

  async function handleConflict(e: unknown): Promise<boolean> {
    if (!(e instanceof ApiError) || e.statusCode !== 409) {
      return false;
    }

    await invalidateAdminGigCandidateQueries(queryClient, gigCandidateId);
    toast({
      title: 'Gig Candidate changed elsewhere',
      description: 'The latest version is being reloaded.',
      variant: 'destructive',
    });
    return true;
  }

  const sendToModerationMutation = useMutation({
    mutationFn: () =>
      sendAdminGigCandidateToModeration({
        gigCandidateId,
        expectedVersion,
      }),
    onSuccess: async (gigCandidate) => {
      await invalidateAdminGigCandidateQueries(queryClient, gigCandidate.id);
      toast({ title: 'Gig Candidate sent to moderation' });
    },
    onError: async (e) => {
      if (await handleConflict(e)) {
        return;
      }
      toast({
        title: 'Could not send Gig Candidate to moderation',
        variant: 'destructive',
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      approveAdminGigCandidate({
        gigCandidateId,
        expectedVersion,
      }),
    onSuccess: async (gigCandidate) => {
      await Promise.all([
        invalidateAdminGigCandidateQueries(queryClient, gigCandidate.id),
        queryClient.invalidateQueries({ queryKey: adminKeys.gigsRoot() }),
        queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() }),
      ]);
      toast({ title: 'Gig Candidate approved' });
    },
    onError: async (e) => {
      if (await handleConflict(e)) {
        return;
      }
      toast({
        title: 'Could not approve Gig Candidate',
        description: 'Review the Gig draft fields and try again.',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectAdminGigCandidate({
        gigCandidateId,
        expectedVersion,
      }),
    onSuccess: async (gigCandidate) => {
      await invalidateAdminGigCandidateQueries(queryClient, gigCandidate.id);
      toast({ title: 'Gig Candidate rejected' });
    },
    onError: async (e) => {
      if (await handleConflict(e)) {
        return;
      }
      toast({ title: 'Could not reject Gig Candidate', variant: 'destructive' });
    },
  });

  return {
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isSendingToModeration: sendToModerationMutation.isPending,
    approveGigCandidate: () => approveMutation.mutate(),
    rejectGigCandidate: () => rejectMutation.mutate(),
    sendGigCandidateToModeration: () => sendToModerationMutation.mutate(),
  };
}
