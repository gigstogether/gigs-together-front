import { Pencil, Trash2 } from 'lucide-react';

import { getAdminCountryLabel, getAdminLocalityLabel } from '../shared/admin-location-display';
import type { AdminLocality } from '../../_lib/admin-locations-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminLocalitiesCatalogProps {
  localities: AdminLocality[];
  onEdit: (locality: AdminLocality) => void;
  onDelete: (locality: AdminLocality) => void;
}

export default function AdminLocalitiesCatalog(props: AdminLocalitiesCatalogProps) {
  const { localities, onEdit, onDelete } = props;

  if (localities.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No localities found.</p>;
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {localities.map((locality) => (
            <li
              key={locality.id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="font-medium">
                  {getAdminLocalityLabel(locality.name, locality.qualifier)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getAdminCountryLabel(locality.countryIso)} · {locality.timeZone}
                  {locality.aliases.length > 0 ? ` · ${locality.aliases.join(', ')}` : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit locality ${getAdminLocalityLabel(locality.name, locality.qualifier)}`}
                  onClick={() => onEdit(locality)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete locality ${getAdminLocalityLabel(locality.name, locality.qualifier)}`}
                  onClick={() => onDelete(locality)}
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
