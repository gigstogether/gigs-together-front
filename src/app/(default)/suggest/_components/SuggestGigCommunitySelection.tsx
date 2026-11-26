import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';

interface SuggestGigCommunitySelectionProps {
  communityOptions: CommunityDisplayOption[];
  onSelect: (communityId: string) => void;
  description?: string;
}

export default function SuggestGigCommunitySelection(props: SuggestGigCommunitySelectionProps) {
  const { communityOptions, onSelect, description } = props;

  return (
    <Card className="mx-auto w-full max-w-md border-0">
      <form
        onSubmit={(event) => event.preventDefault()}
        aria-labelledby="suggest-gig-heading"
        aria-describedby={description ? 'suggest-gig-description' : undefined}
      >
        <CardHeader>
          <CardTitle className="text-base font-normal leading-normal text-foreground">
            <h1
              id="suggest-gig-heading"
              className="text-base font-normal text-foreground"
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
            <FieldLabel
              id="suggest-gig-community-label"
              htmlFor="suggest-gig-community"
            >
              Choose a community
            </FieldLabel>
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
