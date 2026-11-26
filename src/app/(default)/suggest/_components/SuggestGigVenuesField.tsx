import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { FocusEventHandler, Ref } from 'react';

import type { SelectOption } from '@/components/Select';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';

interface SuggestGigVenuesFieldProps {
  value: string[];
  options: SelectOption[];
  placeholder: string;
  isDisabled: boolean;
  isInvalid: boolean;
  name?: string;
  triggerRef?: Ref<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onValueChange: (value: string[]) => void;
}

export default function SuggestGigVenuesField(props: SuggestGigVenuesFieldProps) {
  const {
    value,
    options,
    placeholder,
    isDisabled,
    isInvalid,
    name,
    triggerRef,
    onBlur,
    onValueChange,
  } = props;

  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const venueIds = value.length === 0 ? [''] : [...value];
  if (isAddingVenue && value.length > 0) {
    venueIds.push('');
  }
  const canAddVenue =
    value.length > 0 && !isAddingVenue && options.some((option) => !value.includes(option.value));

  return (
    <>
      <FieldLabel
        id="suggest-gig-venue-label"
        htmlFor="suggest-gig-venue"
      >
        Venue:
      </FieldLabel>
      <div className="space-y-3">
        {venueIds.map((venueId, index) => {
          const inputId = index === 0 ? 'suggest-gig-venue' : `suggest-gig-venue-${index + 1}`;
          const labelId = `${inputId}-label`;
          const availableOptions = options.filter(
            (option) => option.value === venueId || !value.includes(option.value),
          );

          return (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              {index > 0 ? (
                <span
                  id={labelId}
                  className="sr-only"
                >
                  Venue {index + 1}
                </span>
              ) : null}
              <SearchableSelect
                id={inputId}
                name={name}
                value={venueId}
                options={availableOptions}
                placeholder={placeholder}
                searchPlaceholder="Search venues"
                emptyText="No venues found."
                ariaLabelledBy={labelId}
                isDisabled={isDisabled}
                isInvalid={isInvalid}
                triggerRef={index === 0 ? triggerRef : undefined}
                onBlur={onBlur}
                onValueChange={(venueId) => {
                  const nextVenueIds = [...value];
                  nextVenueIds[index] = venueId;
                  onValueChange(nextVenueIds);
                  if (index === value.length) {
                    setIsAddingVenue(false);
                  }
                }}
              />
              {venueId.length > 0 || index > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove venue ${index + 1}`}
                  onClick={() => {
                    if (venueId.length > 0) {
                      onValueChange(value.filter((_, venueIndex) => venueIndex !== index));
                    }
                    if (venueId.length === 0 || value.length === 1) {
                      setIsAddingVenue(false);
                    }
                  }}
                >
                  <X
                    className="size-4"
                    aria-hidden
                  />
                </Button>
              ) : null}
            </div>
          );
        })}
        {canAddVenue ? (
          <Button
            type="button"
            variant="ghost"
            className="h-auto justify-start gap-2 px-0 py-1 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => setIsAddingVenue(true)}
          >
            <Plus
              className="size-4"
              aria-hidden
            />
            Add another venue
          </Button>
        ) : null}
      </div>
    </>
  );
}
