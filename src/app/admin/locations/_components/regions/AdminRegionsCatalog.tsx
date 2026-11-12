import { Pencil, Trash2 } from 'lucide-react';

import { getAdminCountryLabel } from '../shared/admin-location-display';
import type { AdminRegion } from '../../_lib/admin-locations-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminRegionsCatalogProps {
  regions: AdminRegion[];
  onEdit: (region: AdminRegion) => void;
  onDelete: (region: AdminRegion) => void;
}

export default function AdminRegionsCatalog(props: AdminRegionsCatalogProps) {
  const { regions, onEdit, onDelete } = props;

  if (regions.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No regions found.</p>;
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {regions.map((region) => (
            <li
              key={region.id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="font-medium">{region.name}</div>
                <div className="text-sm text-muted-foreground">
                  {getAdminCountryLabel(region.countryIso)}
                  {region.aliases.length > 0 ? ` · ${region.aliases.join(', ')}` : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit region ${region.name}`}
                  onClick={() => onEdit(region)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete region ${region.name}`}
                  onClick={() => onDelete(region)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
