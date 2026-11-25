import { buildGoogleMapsSearchUrl } from '@/lib/google-maps';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';
import { cn } from '@/lib/utils';

interface VenueMapLink {
  id: string;
  name: string;
}

interface VenueMapLinkLocality {
  countryIso: string;
  name: string;
  qualifier?: string;
}

interface VenueMapLinksProps {
  venues: VenueMapLink[];
  locality: VenueMapLinkLocality;
  locale: string;
  className?: string;
}

export function VenueMapLinks(props: VenueMapLinksProps) {
  const { venues, locality, locale, className } = props;

  const localityName = locality.qualifier
    ? `${locality.name} (${locality.qualifier})`
    : locality.name;
  const countryName = getCountryDisplayName(locality.countryIso, locale);
  const venueNames = venues.map((venue) => venue.name).join(', ');

  return (
    <span
      className={cn('min-w-0 truncate', className)}
      title={venueNames}
    >
      {venues.map((venue, index) => {
        const mapsHref = buildGoogleMapsSearchUrl(
          [venue.name, localityName, countryName].join(' '),
        );

        return (
          <span key={venue.id}>
            {index > 0 ? ', ' : null}
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 transition-colors hover:underline"
              aria-label={`Open ${venue.name} in Google Maps`}
            >
              {venue.name}
            </a>
          </span>
        );
      })}
    </span>
  );
}
