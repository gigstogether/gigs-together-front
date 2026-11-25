'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import SuggestGigFormFields from '@/app/(default)/suggest/_components/SuggestGigFormFields';
import { useSuggestGigSubmit } from '@/app/(default)/suggest/_hooks/use-suggest-gig-submit';
import {
  createDefaultSuggestGigFormValues,
  suggestGigFormSchema,
} from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type {
  SuggestCommunityOption,
  SuggestGigFormValues,
} from '@/app/(default)/suggest/_lib/suggest-form.shared';
import PosterField from '@/components/PosterField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';

interface SuggestGigFormClientProps {
  communityOptions: SuggestCommunityOption[];
  countries: CountryDisplayOption[];
  description?: string;
}

export default function SuggestGigFormClient(props: SuggestGigFormClientProps) {
  const { communityOptions, countries, description } = props;

  const defaultValues = createDefaultSuggestGigFormValues(communityOptions);

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
      form.reset(defaultValues);
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
      <Card className="w-full border-0">
        <CardHeader>
          <CardTitle>Suggestion received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md m-auto border-0">
      <CardHeader>
        <CardTitle>Suggest a gig</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <SuggestGigFormFields
            form={form}
            communityOptions={communityOptions}
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
        </form>
      </CardContent>
    </Card>
  );
}
