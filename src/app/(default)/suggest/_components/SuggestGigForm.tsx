import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import SuggestGigFormFields from '@/app/(default)/suggest/_components/SuggestGigFormFields';
import { useSuggestGigSubmit } from '@/app/(default)/suggest/_hooks/use-suggest-gig-submit';
import { suggestGigFormSchema } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import PosterField from '@/components/PosterField';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError } from '@/components/ui/field';
import { toast } from '@/hooks/use-toast';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';

interface SuggestGigFormProps {
  initialCommunityId: string;
  communityOptions: CommunityDisplayOption[];
  countries: CountryDisplayOption[];
  description?: string;
}

function createDefaultSuggestGigFormValues(communityId: string): SuggestGigFormValues {
  return {
    communityId,
    countryIso: 'ES',
    localityId: '',
    venueIds: [],
    title: '',
    date: '',
    endDate: '',
    ticketsUrl: '',
  };
}

export default function SuggestGigForm(props: SuggestGigFormProps) {
  const { initialCommunityId, communityOptions, countries, description } = props;

  const defaultValues = createDefaultSuggestGigFormValues(initialCommunityId);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<SuggestGigFormValues>({
    resolver: zodResolver(suggestGigFormSchema),
    defaultValues,
  });

  const { isSubmitting, onSubmit } = useSuggestGigSubmit({
    posterFile,
    posterUrl,
    onSuccess: () => {
      toast({
        title: 'Sent!',
        description: "Thanks — we'll review your suggestion soon.",
      });
      setIsSubmitted(true);
      form.reset(createDefaultSuggestGigFormValues(form.getValues('communityId')));
      setPosterFile(null);
      setPosterUrl('');
      if (posterFileInputRef.current) {
        posterFileInputRef.current.value = '';
      }
    },
  });

  function clearPoster() {
    setPosterFile(null);
    setPosterUrl('');
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = '';
    }
  }

  if (isSubmitted) {
    return (
      <Card className="mx-auto flex min-h-0 max-h-full w-full flex-col border-0 shadow-none sm:max-w-md sm:shadow">
        <div className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[inherit] [scrollbar-gutter:stable_both-edges]">
          <CardHeader className="px-6 sm:px-2">
            <CardTitle>Suggestion received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-2">
            <p className="text-sm text-muted-foreground">
              Your gig is in the review queue. You can suggest another one if you want.
            </p>
            <Button
              type="button"
              onClick={() => setIsSubmitted(false)}
            >
              Suggest another
            </Button>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex min-h-0 max-h-full w-full flex-col border-0 shadow-none sm:max-w-md sm:shadow">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        aria-labelledby="suggest-gig-heading"
        aria-describedby={description ? 'suggest-gig-description' : undefined}
        className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[inherit] [scrollbar-gutter:stable_both-edges]"
      >
        <CardHeader className="px-6 sm:px-2">
          <Controller
            control={form.control}
            name="communityId"
            render={({ field, fieldState }) => (
              <div>
                <CardTitle className="flex flex-wrap items-baseline gap-x-1 text-base font-normal leading-normal text-foreground">
                  <h1
                    id="suggest-gig-heading"
                    className="text-base font-normal text-foreground"
                  >
                    Suggest a gig
                  </h1>
                  <div className="inline-flex min-w-0 max-w-full items-baseline gap-x-1">
                    <span className="shrink-0">for the</span>
                    <span
                      id="suggest-gig-community-label"
                      className="sr-only"
                    >
                      Community
                    </span>
                    <SearchableSelect
                      id="suggest-gig-community"
                      name={field.name}
                      value={field.value}
                      options={communityOptions}
                      variant="inline"
                      title="Change community"
                      placeholder="Select community"
                      searchPlaceholder="Search communities"
                      emptyText="No communities found."
                      ariaLabelledBy="suggest-gig-community-label"
                      isRequired
                      isInvalid={fieldState.invalid}
                      triggerRef={field.ref}
                      onBlur={field.onBlur}
                      onValueChange={field.onChange}
                    />
                    <span className="shrink-0">community</span>
                  </div>
                </CardTitle>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          {description ? (
            <CardDescription
              id="suggest-gig-description"
              className="text-sm"
            >
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6 px-6 sm:px-2">
          <SuggestGigFormFields
            form={form}
            countries={countries}
          />
          <PosterField
            posterFile={posterFile}
            onPosterFileChange={setPosterFile}
            posterUrl={posterUrl}
            onPosterUrlChange={setPosterUrl}
            onClearPoster={clearPoster}
            posterFileInputRef={posterFileInputRef}
            isUrlInputEnabled={false}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting…' : 'Submit suggestion'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
