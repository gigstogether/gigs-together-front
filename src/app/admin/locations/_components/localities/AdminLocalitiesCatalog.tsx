import { Pencil, Trash2 } from 'lucide-react';

import { getAdminCountryLabel } from '../shared/admin-location-display';
import type { AdminLocality, AdminRegion } from '../../_lib/admin-locations-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminLocalitiesCatalogProps {
  localities: AdminLocality[];
  regionById: ReadonlyMap<string, AdminRegion>;
  onEdit: (locality: AdminLocality) => void;
  onDelete: (locality: AdminLocality) => void;
}

export default function AdminLocalitiesCatalog(props: AdminLocalitiesCatalogProps) {
  const { localities, regionById, onEdit, onDelete } = props;

  if (localities.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No localities found.</p>;
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {localities.map((locality) => {
            const region = regionById.get(locality.regionId);
            return (
              <li
                key={locality.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="font-medium">{locality.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {region
                      ? `${region.name} · ${getAdminCountryLabel(region.countryIso)}`
                      : 'Unknown region'}
                    · {locality.timeZone}
                    {locality.aliases.length > 0 ? ` · ${locality.aliases.join(', ')}` : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit locality ${locality.name}`}
                    onClick={() => onEdit(locality)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete locality ${locality.name}`}
                    onClick={() => onDelete(locality)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
