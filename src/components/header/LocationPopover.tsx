import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin } from 'lucide-react';

interface LocationPopoverProps {
  location?: string;
  cn?: string;
}

export default function LocationPopover(props: LocationPopoverProps) {
  const { location, cn = 'flex items-center gap-1 text-base font-normal text-gray-800' } = props;

  if (!location) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={cn}
        aria-label="Current location"
        title="Location"
      >
        <MapPin className="h-4 w-4" />
        {location}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto px-3 py-2 text-sm"
        align="end"
        side="bottom"
      >
        This feed is curated for the {location} community.
      </PopoverContent>
    </Popover>
  );
}
