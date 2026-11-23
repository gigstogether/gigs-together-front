import {
  createDefaultGigCandidateDraftFormValues,
  createGigCandidateDraftFormSchema,
  gigCandidateDraftFormSchema,
  mapGigCandidateFormValuesToDraft,
  mapGigCandidateToFormValues,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-form';
import { GigCandidateStatusAPI } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';

const emptyDraft = {
  communityIds: ['community-id'],
  countryIso: '',
  localityId: '',
  venueIds: [],
  title: '',
  date: '',
  endDate: '',
  ticketsUrl: '',
};

describe('admin-gig-candidate-form', () => {
  it('should allow an empty location in an existing draft', () => {
    expect(gigCandidateDraftFormSchema.safeParse(emptyDraft).success).toBe(true);
  });

  it('should reject a title longer than 300 characters', () => {
    expect(
      gigCandidateDraftFormSchema.safeParse({
        ...emptyDraft,
        title: 'A'.repeat(301),
      }).success,
    ).toBe(false);
  });

  it('should require a Community, Country, Locality, title, and date when creating', () => {
    expect(createGigCandidateDraftFormSchema.safeParse(emptyDraft).success).toBe(false);
    expect(
      createGigCandidateDraftFormSchema.safeParse({
        ...emptyDraft,
        countryIso: 'ES',
        localityId: 'locality-id',
        title: 'Band',
        date: '2026-09-30',
      }).success,
    ).toBe(true);
  });

  it('should select the only Community in new draft defaults', () => {
    expect(createDefaultGigCandidateDraftFormValues(['community-id'])).toEqual({
      ...emptyDraft,
      countryIso: 'ES',
    });
    expect(createDefaultGigCandidateDraftFormValues(['one', 'two']).communityIds).toEqual([]);
  });

  it('should map the candidate location and Venue assignments to form values', () => {
    expect(
      mapGigCandidateToFormValues({
        id: 'candidate-id',
        source: {
          type: 'user',
          userId: 'user-id',
          isCurrentlyAdmin: false,
          origin: { type: 'admin' },
        },
        locality: {
          id: 'locality-id',
          countryIso: 'ES',
          name: 'Barcelona',
        },
        gigDraft: {
          communityIds: ['community-id'],
          venueIds: ['venue-id'],
          title: 'Band',
        },
        status: GigCandidateStatusAPI.Reviewing,
        version: 1,
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-02T10:00:00.000Z',
      }),
    ).toEqual({
      ...emptyDraft,
      countryIso: 'ES',
      localityId: 'locality-id',
      venueIds: ['venue-id'],
      title: 'Band',
    });
  });

  it('should omit empty optional fields from the editable gigDraft', () => {
    expect(
      mapGigCandidateFormValuesToDraft({
        ...emptyDraft,
        communityIds: ['community-id'],
        venueIds: ['venue-id'],
        title: ' Band ',
      }),
    ).toEqual({
      communityIds: ['community-id'],
      venueIds: ['venue-id'],
      title: 'Band',
    });
  });
});
