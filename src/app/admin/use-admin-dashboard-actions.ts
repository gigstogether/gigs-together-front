import { useMutation } from '@tanstack/react-query';

import { toast } from '@/hooks/use-toast';
import {
  postAdminDigestPublish,
  postAdminFeedRevalidate,
  postAdminTranslationsRevalidate,
} from '@/lib/admin-api';

interface UseAdminDashboardActionsResult {
  readonly isPublishingDigest: boolean;
  readonly isRevalidatingFeed: boolean;
  readonly isRevalidatingTranslations: boolean;
  readonly publishDigestAsync: () => Promise<void>;
  readonly revalidateFeed: () => void;
  readonly revalidateTranslations: () => void;
}

export function useAdminDashboardActions(): UseAdminDashboardActionsResult {
  const publishDigestMutation = useMutation({
    mutationFn: () => postAdminDigestPublish(),
    onSuccess: () => {
      toast({ title: 'Digest published' });
    },
    onError: () => {
      toast({
        title: 'Could not publish digest',
        variant: 'destructive',
      });
    },
  });

  const revalidateFeedMutation = useMutation({
    mutationFn: () => postAdminFeedRevalidate(),
    onSuccess: () => {
      toast({ title: 'Feed revalidated' });
    },
    onError: () => {
      toast({
        title: 'Could not revalidate feed',
        variant: 'destructive',
      });
    },
  });

  const revalidateTranslationsMutation = useMutation({
    mutationFn: () => postAdminTranslationsRevalidate(),
    onSuccess: () => {
      toast({ title: 'Translations revalidated' });
    },
    onError: () => {
      toast({
        title: 'Could not revalidate translations',
        variant: 'destructive',
      });
    },
  });

  return {
    isPublishingDigest: publishDigestMutation.isPending,
    isRevalidatingFeed: revalidateFeedMutation.isPending,
    isRevalidatingTranslations: revalidateTranslationsMutation.isPending,
    publishDigestAsync: () => publishDigestMutation.mutateAsync(),
    revalidateFeed: () => revalidateFeedMutation.mutate(),
    revalidateTranslations: () => revalidateTranslationsMutation.mutate(),
  };
}
