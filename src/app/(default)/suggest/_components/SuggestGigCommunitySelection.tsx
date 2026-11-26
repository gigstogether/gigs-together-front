import { Info } from 'lucide-react';

import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SuggestGigCommunitySelectionProps {
  communityOptions: CommunityDisplayOption[];
  onSelect: (communityId: string) => void;
  description?: string;
  communitySelectionHint?: string;
}

export default function SuggestGigCommunitySelection(props: SuggestGigCommunitySelectionProps) {
  const { communityOptions, onSelect, description, communitySelectionHint } = props;

  return (
    <Card className="mx-auto w-full rounded-none border-0 shadow-none sm:max-w-md sm:rounded-xl sm:shadow">
      <form
        onSubmit={(event) => event.preventDefault()}
        aria-labelledby="suggest-gig-heading"
        aria-describedby={description ? 'suggest-gig-description' : undefined}
      >
        <CardHeader>
          <CardTitle className="text-base font-semibold leading-normal text-foreground">
            <h1
              id="suggest-gig-heading"
              className="text-base font-semibold text-foreground"
            >
              Suggest a gig
            </h1>
          </CardTitle>
          {description ? (
            <CardDescription
              id="suggest-gig-description"
              className="text-sm"
            >
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <Field>
            <div className="flex items-center gap-1.5">
              <FieldLabel
                id="suggest-gig-community-label"
                htmlFor="suggest-gig-community"
              >
                Choose a community
              </FieldLabel>
              {communitySelectionHint ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground"
                      aria-label="Community information"
                    >
                      <Info
                        className="size-4"
                        aria-hidden
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    collisionPadding={16}
                    className="max-w-[calc(100vw-2rem)] text-sm leading-relaxed"
                    aria-label="Community information"
                  >
                    {communitySelectionHint}
                  </PopoverContent>
                </Popover>
              ) : null}
            </div>
            <SearchableSelect
              id="suggest-gig-community"
              name="communityId"
              value=""
              options={communityOptions}
              placeholder="Select community"
              searchPlaceholder="Search communities"
              emptyText="No communities found."
              ariaLabelledBy="suggest-gig-community-label"
              isRequired
              onValueChange={onSelect}
            />
          </Field>
        </CardContent>
      </form>
    </Card>
  );
}
