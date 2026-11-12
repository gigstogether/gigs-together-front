import { Plus } from 'lucide-react';

import { getCatalogPluralLabel, LOCATION_CATALOG_KINDS } from './admin-location-catalog';
import type { AdminLocationCatalogProps } from './admin-location-catalog';
import { ADMIN_LOCATION_LOCALE } from './admin-location-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminLocationCatalogSearch {
  value: string;
  onChange: (value: string) => void;
}

interface AdminLocationCatalogControlsProps extends AdminLocationCatalogProps {
  actionLabel: string;
  isActionDisabled: boolean;
  search?: AdminLocationCatalogSearch;
  onAction: () => void;
}

export default function AdminLocationCatalogControls(props: AdminLocationCatalogControlsProps) {
  const { activeCatalog, actionLabel, isActionDisabled, search, onCatalogChange, onAction } = props;
  const searchLabel = `Search ${getCatalogPluralLabel(activeCatalog).toLocaleLowerCase(ADMIN_LOCATION_LOCALE)}`;

  return (
    <div
      role="group"
      aria-label="Location catalog controls"
      className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center"
    >
      <div
        role="tablist"
        aria-label="Location catalogs"
        className="flex w-full overflow-x-auto rounded-md border border-input bg-background p-1 shadow-sm lg:w-fit"
      >
        {LOCATION_CATALOG_KINDS.map((kind) => (
          <Button
            key={kind}
            type="button"
            role="tab"
            size="sm"
            className="flex-1 lg:flex-none"
            variant={activeCatalog === kind ? 'secondary' : 'ghost'}
            aria-selected={activeCatalog === kind}
            onClick={() => onCatalogChange(kind)}
          >
            {getCatalogPluralLabel(kind)}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        className="w-full lg:w-auto"
        disabled={isActionDisabled}
        onClick={onAction}
      >
        <Plus aria-hidden="true" />
        {actionLabel}
      </Button>
      {search ? (
        <Input
          value={search.value}
          className="w-full lg:ml-auto lg:max-w-xs"
          placeholder={searchLabel}
          aria-label={searchLabel}
          onChange={(event) => search.onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
