import { Pencil, Trash2 } from 'lucide-react';

import { getAdminCountryLabel, getAdminLocalityLabel } from '../shared/admin-location-display';
import type { AdminLocality, AdminVenue } from '../../_lib/admin-locations-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminVenuesCatalogProps {
  venues: AdminVenue[];
  localityById: ReadonlyMap<string, AdminLocality>;
  onEdit: (venue: AdminVenue) => void;
  onDelete: (venue: AdminVenue) => void;
}

export default function AdminVenuesCatalog(props: AdminVenuesCatalogProps) {
  const { venues, localityById, onEdit, onDelete } = props;

  if (venues.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No venues found.</p>;
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {venues.map((venue) => {
            const locality = localityById.get(venue.localityId);
            return (
              <li
                key={venue.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    <span>{venue.name}</span>
                    {!venue.isActive ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                        Inactive
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locality
                      ? `${getAdminLocalityLabel(locality.name, locality.qualifier)} · ${getAdminCountryLabel(locality.countryIso)}`
                      : 'Unknown locality'}
                    {venue.aliases.length > 0 ? ` · ${venue.aliases.join(', ')}` : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit venue ${venue.name}`}
                    onClick={() => onEdit(venue)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete venue ${venue.name}`}
                    onClick={() => onDelete(venue)}
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
