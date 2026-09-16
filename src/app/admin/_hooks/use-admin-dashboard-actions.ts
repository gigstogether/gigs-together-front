import { useMutation } from '@tanstack/react-query';

import { toast } from '@/hooks/use-toast';
import {
  createAdminDigestPost,
  postAdminFeedRevalidate,
  postAdminTranslationsRevalidate,
} from '@/app/admin/_lib/admin-api';

interface UseAdminDashboardActionsResult {
  readonly isPostingDigest: boolean;
  readonly isRevalidatingFeed: boolean;
  readonly isRevalidatingTranslations: boolean;
  readonly createDigestPostAsync: () => Promise<void>;
  readonly revalidateFeed: () => void;
  readonly revalidateTranslations: () => void;
}

export function useAdminDashboardActions(): UseAdminDashboardActionsResult {
  const digestPostMutation = useMutation({
    mutationFn: () => createAdminDigestPost(),
    onSuccess: () => {
      toast({ title: 'Digest posted' });
    },
    onError: () => {
      toast({
        title: 'Could not post digest',
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
    isPostingDigest: digestPostMutation.isPending,
    isRevalidatingFeed: revalidateFeedMutation.isPending,
    isRevalidatingTranslations: revalidateTranslationsMutation.isPending,
    createDigestPostAsync: () => digestPostMutation.mutateAsync(),
    revalidateFeed: () => revalidateFeedMutation.mutate(),
    revalidateTranslations: () => revalidateTranslationsMutation.mutate(),
  };
}
