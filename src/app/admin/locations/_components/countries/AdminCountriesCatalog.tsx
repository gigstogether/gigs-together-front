import { useMemo } from 'react';

import type { AdminCountry } from '../../_lib/admin-countries-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';

const ADMIN_LOCALE = 'en';

interface AdminCountriesCatalogProps {
  countries: AdminCountry[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function AdminCountriesCatalog(props: AdminCountriesCatalogProps) {
  const { countries, isLoading, isError, onRetry } = props;

  const countryOptions = useMemo(
    () =>
      createCountryDisplayOptions(
        countries.map((country) => country.iso),
        ADMIN_LOCALE,
      ),
    [countries],
  );

  return (
    <>
      {isError ? (
        <div className="space-y-3 py-8">
          <p className="text-sm text-destructive">Could not load configured countries.</p>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading countries…</p>
      ) : !isError && countryOptions.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No countries configured.</p>
      ) : !isError ? (
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
    </>
  );
}
