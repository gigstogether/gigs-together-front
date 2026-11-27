'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import AdminCommunitiesCatalog from './AdminCommunitiesCatalog';
import AdminCommunityFormDialog from './AdminCommunityFormDialog';
import type { CommunityNameOption } from './AdminCommunityFormDialog';
import {
  createAdminCommunity,
  fetchAdminCommunities,
  updateAdminCommunity,
} from '../_lib/admin-communities-api';
import type { AdminCommunity, AdminCommunityBody } from '../_lib/admin-communities-api';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import { fetchAdminTranslations } from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import { fetchCountries } from '@/lib/countries';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';
import { toSearchKey } from '@/lib/search-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminCommunitiesPageClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState<AdminCommunity | null | undefined>(undefined);

  const communitiesQuery = useQuery({
    queryKey: adminKeys.communities(),
    queryFn: fetchAdminCommunities,
  });
  const countriesQuery = useQuery({
    queryKey: adminKeys.countryReferences(),
    queryFn: () => fetchCountries(),
  });
  const namesQuery = useQuery({
    queryKey: adminKeys.translations('community', 'en'),
    queryFn: () => fetchAdminTranslations({ namespace: 'community', locale: 'en' }),
  });
  const invalidateCommunities = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: adminKeys.communities() });
  const saveMutation = useMutation({
    mutationFn: (body: AdminCommunityBody) => {
      if (formValue === undefined) throw new Error('A community form must be open before saving');
      return formValue === null
        ? createAdminCommunity(body)
        : updateAdminCommunity(formValue.id, body);
    },
    onSuccess: invalidateCommunities,
  });

  const handleSave = async (body: AdminCommunityBody): Promise<void> => {
    await saveMutation.mutateAsync(body);
    setFormValue(undefined);
  };
  const retryLoading = (): void => {
    void communitiesQuery.refetch();
    void countriesQuery.refetch();
    void namesQuery.refetch();
  };
  const isBusy = saveMutation.isPending;
  const isLoadError = communitiesQuery.isError || countriesQuery.isError || namesQuery.isError;
  const isLoading = communitiesQuery.isPending || countriesQuery.isPending || namesQuery.isPending;

  if (isLoadError)
    return (
      <>
        <AdminPageHeader
          title="Communities"
          description="Manage communities."
        />
        <p
          role="alert"
          className="mb-4 text-sm text-destructive"
        >
          Could not load communities and their reference data.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={retryLoading}
        >
          Retry
        </Button>
      </>
    );
  if (isLoading)
    return (
      <>
        <AdminPageHeader
          title="Communities"
          description="Manage communities."
        />
        <p className="py-10 text-sm text-muted-foreground">Loading communities…</p>
      </>
    );
  if (
    communitiesQuery.data === undefined ||
    countriesQuery.data === undefined ||
    namesQuery.data === undefined
  )
    throw new Error('Loaded community reference data must be available');

  const countries = countriesQuery.data;
  const nameOptions: CommunityNameOption[] = namesQuery.data
    .filter(
      (record) =>
        record.isActive &&
        record.format === 'plain' &&
        record.kind === 'text' &&
        record.value.trim().length > 0,
    )
    .map((record) => ({ value: record.key, label: record.value }));
  const namesByKey = new Map(nameOptions.map((option) => [option.value, option.label]));
  const searchKey = toSearchKey(search, 'en');
  const visibleCommunities = communitiesQuery.data.filter((community) =>
    toSearchKey(
      [
        community.slug,
        community.countryIso,
        getCountryDisplayName(community.countryIso, 'en'),
        community.nameTranslationKey,
        namesByKey.get(community.nameTranslationKey) ?? '',
        community.timeZone,
        community.isActive ? 'active' : 'inactive',
      ].join(' '),
      'en',
    ).includes(searchKey),
  );

  return (
    <>
      <AdminPageHeader
        title="Communities"
        description="Manage communities."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          disabled={isBusy || countries.length === 0}
          onClick={() => setFormValue(null)}
        >
          <Plus aria-hidden="true" />
          New community
        </Button>
        <Input
          className="sm:ml-auto sm:max-w-xs"
          value={search}
          placeholder="Search communities"
          aria-label="Search communities"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <AdminCommunitiesCatalog
        communities={visibleCommunities}
        nameOptions={nameOptions}
        isBusy={isBusy}
        onEdit={setFormValue}
      />
      {formValue !== undefined ? (
        <AdminCommunityFormDialog
          key={formValue?.id ?? 'new'}
          value={formValue}
          countries={countries}
          nameOptions={nameOptions}
          isSaving={saveMutation.isPending}
          onSubmit={handleSave}
          onOpenChange={(isOpen) => {
            if (!isOpen) setFormValue(undefined);
          }}
        />
      ) : null}
    </>
  );
}
