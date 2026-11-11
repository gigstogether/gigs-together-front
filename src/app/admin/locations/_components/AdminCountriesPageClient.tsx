'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminCountryDialog from '@/app/admin/locations/_components/AdminCountryDialog';
import { fetchAdminCountries } from '@/app/admin/locations/_lib/admin-countries-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';

const ADMIN_LOCALE = 'en';

export default function AdminCountriesPageClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const countriesQuery = useQuery({
    queryKey: adminKeys.countries(),
    queryFn: fetchAdminCountries,
  });

  const countryOptions = useMemo(
    () =>
      createCountryDisplayOptions(
        (countriesQuery.data ?? []).map((country) => country.iso),
        ADMIN_LOCALE,
      ),
    [countriesQuery.data],
  );

  return (
    <>
      <AdminPageHeader
        title="Locations"
        description="Manage the countries supported by Communities and location catalogs."
        actions={
          <Button
            type="button"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus aria-hidden="true" />
            Add country
          </Button>
        }
      />

      <h2 className="mb-3 text-lg font-semibold">Countries</h2>

      {countriesQuery.isError ? (
        <div className="space-y-3 py-8">
          <p className="text-sm text-destructive">Could not load configured countries.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void countriesQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {countriesQuery.isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading countries…</p>
      ) : countriesQuery.isSuccess && countryOptions.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No countries configured.</p>
      ) : countriesQuery.isSuccess ? (
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {countryOptions.map((country) => (
                <li
                  key={country.iso}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="font-medium">{country.name}</span>
                  <span className="text-sm text-muted-foreground">{country.iso}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {isDialogOpen ? <AdminCountryDialog onOpenChange={setIsDialogOpen} /> : null}
    </>
  );
}
