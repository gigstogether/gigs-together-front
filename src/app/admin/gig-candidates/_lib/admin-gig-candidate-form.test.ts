import {
  gigCandidateDraftFormSchema,
  mapGigCandidateDraftToFormValues,
  mapGigCandidateFormValuesToDraft,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-form';

describe('GigCandidate draft form mapping', () => {
  it('should allow an empty or one-character title but reject more than 300 characters', () => {
    const emptyDraft = {
      title: '',
      date: '',
      endDate: '',
      city: '',
      country: '',
      venue: '',
      ticketsUrl: '',
    };

    expect(gigCandidateDraftFormSchema.safeParse(emptyDraft).success).toBe(true);
    expect(gigCandidateDraftFormSchema.safeParse({ ...emptyDraft, title: 'B' }).success).toBe(true);
    expect(
      gigCandidateDraftFormSchema.safeParse({
        ...emptyDraft,
        title: 'A'.repeat(301),
      }).success,
    ).toBe(false);
  });

  it('should map a partial gigDraft to safe empty form values', () => {
    expect(mapGigCandidateDraftToFormValues({ title: 'Band' })).toEqual({
      title: 'Band',
      date: '',
      endDate: '',
      city: '',
      country: '',
      venue: '',
      ticketsUrl: '',
    });
  });

  it('should omit empty fields from the editable gigDraft', () => {
    expect(
      mapGigCandidateFormValuesToDraft({
        title: ' Band ',
        date: '',
        endDate: '',
        city: ' Barcelona ',
        country: ' ES ',
        venue: '',
        ticketsUrl: '',
      }),
    ).toEqual({ title: 'Band', city: 'Barcelona', country: 'ES' });
  });
});
