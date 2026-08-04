import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationIcon } from '@/components/ui/location-icon';

interface LocationPopoverProps {
  location?: string;
  cn?: string;
}

export default function LocationPopover(props: LocationPopoverProps) {
  const { location, cn = 'flex items-center gap-2 text-base font-normal text-gray-800' } = props;

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
        <LocationIcon className="h-4 w-4" />
        {location}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto px-3 py-2 text-sm"
        align="end"
        side="bottom"
      >
        Currently, we only support one location: Barcelona.
      </PopoverContent>
    </Popover>
  );
}
