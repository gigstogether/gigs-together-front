'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import {
  createAdminCountry,
  fetchAdminCountryOptions,
} from '@/app/admin/locations/_lib/admin-countries-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createCountryDisplayNameResolver } from '@/lib/i18n/country-display-name';

const ADMIN_LOCALE = 'en';

interface AdminCountryDialogProps {
  onOpenChange: (isOpen: boolean) => void;
}

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Could not add the country.';
}

export default function AdminCountryDialog(props: AdminCountryDialogProps) {
  const { onOpenChange } = props;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const optionsQuery = useQuery({
    queryKey: adminKeys.countryOptions(),
    queryFn: fetchAdminCountryOptions,
  });
  const createMutation = useMutation({
    mutationFn: createAdminCountry,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.countries() }),
        queryClient.invalidateQueries({ queryKey: adminKeys.countryOptions() }),
      ]);
    },
  });

  const localizedOptions = useMemo(() => {
    const resolveCountryDisplayName = createCountryDisplayNameResolver(ADMIN_LOCALE);
    const collator = new Intl.Collator(ADMIN_LOCALE);
    const options = (optionsQuery.data ?? []).map((option) => ({
      ...option,
      name: resolveCountryDisplayName(option.iso),
    }));

    return options.sort((left, right) => collator.compare(left.name, right.name));
  }, [optionsQuery.data]);

  const visibleOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase(ADMIN_LOCALE);

    if (normalizedSearch.length === 0) {
      return localizedOptions;
    }

    return localizedOptions.filter((option) =>
      `${option.name} ${option.iso}`.toLocaleLowerCase(ADMIN_LOCALE).includes(normalizedSearch),
    );
  }, [localizedOptions, search]);

  const handleSubmit = async () => {
    if (selectedIso === null) {
      return;
    }

    setSubmitError(null);
    try {
      await createMutation.mutateAsync({ iso: selectedIso });
      onOpenChange(false);
    } catch (e) {
      setSubmitError(getErrorMessage(e));
    }
  };

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add country</DialogTitle>
          <DialogDescription>
            Choose a country to enable it for Communities and location catalogs.
          </DialogDescription>
        </DialogHeader>

        <Input
          aria-label="Search countries"
          value={search}
          placeholder="Search by name or ISO code"
          autoFocus
          onChange={(event) => setSearch(event.target.value)}
        />

        {optionsQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading countries…</p>
        ) : null}

        {optionsQuery.isError ? (
          <div className="space-y-3 py-6 text-center">
            <p className="text-sm text-destructive">
              The country list could not be loaded from UNSD.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void optionsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {optionsQuery.isSuccess ? (
          visibleOptions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No countries match this search.
            </p>
          ) : (
            <ul className="max-h-72 divide-y overflow-y-auto rounded-md border">
              {visibleOptions.map((option) => (
                <li key={option.iso}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm transition hover:bg-muted aria-pressed:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={option.isConfigured || createMutation.isPending}
                    aria-pressed={selectedIso === option.iso}
                    onClick={() => setSelectedIso(option.iso)}
                  >
                    <span>{option.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {option.isConfigured ? 'Already added' : option.iso}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selectedIso === null || createMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            Add country
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
