import { AdminGigsSortBy, AdminGigsSortOrder } from './admin-gigs-sort';
import { buildAdminGigsSearchParams, getAdminGigsQueryStateOrDefaults } from './admin-gigs-query';

describe('admin Gig query', () => {
  it('should contain selection and sorting but no status filter', () => {
    const state = getAdminGigsQueryStateOrDefaults(
      new URLSearchParams('gig=my-gig&sortBy=eventDate&sortOrder=asc&status=pending'),
    );
    expect(state).toEqual({
      selectedGigPublicId: 'my-gig',
      sortBy: AdminGigsSortBy.EventDate,
      sortOrder: AdminGigsSortOrder.Asc,
    });
    expect(buildAdminGigsSearchParams(state).toString()).toBe(
      'sortBy=eventDate&sortOrder=asc&gig=my-gig',
    );
  });
});
