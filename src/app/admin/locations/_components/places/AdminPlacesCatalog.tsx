import { Pencil, Trash2 } from 'lucide-react';

import { getAdminCountryLabel } from '../shared/admin-location-display';
import type { AdminLocality, AdminPlace, AdminRegion } from '../../_lib/admin-locations-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminPlacesCatalogProps {
  places: AdminPlace[];
  localityById: ReadonlyMap<string, AdminLocality>;
  regionById: ReadonlyMap<string, AdminRegion>;
  onEdit: (place: AdminPlace) => void;
  onDelete: (place: AdminPlace) => void;
}

export default function AdminPlacesCatalog(props: AdminPlacesCatalogProps) {
  const { places, localityById, regionById, onEdit, onDelete } = props;

  if (places.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No places found.</p>;
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {places.map((place) => {
            const locality = localityById.get(place.localityId);
            const region = locality ? regionById.get(locality.regionId) : undefined;
            return (
              <li
                key={place.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    <span>{place.name}</span>
                    {!place.isActive ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                        Inactive
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locality?.name ?? 'Unknown locality'}
                    {region
                      ? ` · ${region.name} · ${getAdminCountryLabel(region.countryIso)}`
                      : null}
                    {place.aliases.length > 0 ? ` · ${place.aliases.join(', ')}` : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit place ${place.name}`}
                    onClick={() => onEdit(place)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete place ${place.name}`}
                    onClick={() => onDelete(place)}
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
