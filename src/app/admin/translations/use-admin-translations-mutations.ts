import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { adminKeys } from '@/app/admin/adminKeys';
import type { AdminTranslationNamespaceFilter } from '@/app/admin/translations/admin-translations-filters';
import { patchAdminTranslationActive, putAdminTranslation } from '@/lib/admin-api';
import type { AdminTranslationRecord, PutAdminTranslationBody } from '@/lib/admin-api';

export interface UseAdminTranslationsMutationsParams {
  readonly namespaceFilter: AdminTranslationNamespaceFilter;
  readonly localeFilter?: string;
}

export interface SetAdminTranslationActiveMutationParams {
  readonly id: string;
  readonly isActive: boolean;
}

interface InvalidateAdminTranslationsQueriesParams {
  readonly queryClient: QueryClient;
  readonly namespaceFilter: AdminTranslationNamespaceFilter;
  readonly localeFilter?: string;
}

interface UseAdminTranslationsMutationsResult {
  readonly isSaving: boolean;
  readonly saveErrorMessage: string | null;
  readonly upsert: (body: PutAdminTranslationBody) => void;
  readonly upsertAsync: (body: PutAdminTranslationBody) => Promise<AdminTranslationRecord>;
  readonly setActive: (params: SetAdminTranslationActiveMutationParams) => void;
}

async function invalidateAdminTranslationsQueries(
  params: InvalidateAdminTranslationsQueriesParams,
): Promise<void> {
  const { queryClient, namespaceFilter, localeFilter } = params;

  await queryClient.invalidateQueries({
    queryKey: adminKeys.translationNamespaces(),
  });
  await queryClient.invalidateQueries({
    queryKey: adminKeys.translations(namespaceFilter, localeFilter),
  });
}

export function useAdminTranslationsMutations(
  params: UseAdminTranslationsMutationsParams,
): UseAdminTranslationsMutationsResult {
  const { namespaceFilter, localeFilter } = params;
  const queryClient = useQueryClient();

  const upsertMutation = useMutation({
    mutationFn: (body: PutAdminTranslationBody) => putAdminTranslation(body),
    onSuccess: async () => {
      await invalidateAdminTranslationsQueries({
        queryClient,
        namespaceFilter,
        localeFilter,
      });
    },
  });

  const activeMutation = useMutation({
    mutationFn: (mutationParams: SetAdminTranslationActiveMutationParams) =>
      patchAdminTranslationActive(mutationParams.id, {
        isActive: mutationParams.isActive,
      }),
    onSuccess: async () => {
      await invalidateAdminTranslationsQueries({
        queryClient,
        namespaceFilter,
        localeFilter,
      });
    },
  });

  const saveErrorMessage = useMemo(() => {
    const error = upsertMutation.error ?? activeMutation.error;
    if (error instanceof Error) {
      return error.message;
    }
    if (error != null) {
      return String(error);
    }
    return null;
  }, [activeMutation.error, upsertMutation.error]);

  return {
    isSaving: upsertMutation.isPending || activeMutation.isPending,
    saveErrorMessage,
    upsert: (body) => upsertMutation.mutate(body),
    upsertAsync: (body) => upsertMutation.mutateAsync(body),
    setActive: (mutationParams) => activeMutation.mutate(mutationParams),
  };
}
