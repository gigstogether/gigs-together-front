import {
  mapGigCandidateDraftToFormValues,
  mapGigCandidateFormValuesToDraft,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate-form';

describe('GigCandidate draft form mapping', () => {
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
