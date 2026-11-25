// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import GigFormFields from '@/app/admin/gigs/_components/gig-form/GigFormFields';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type {
  fetchAdminLocalities,
  fetchAdminVenues,
} from '@/app/admin/locations/_lib/admin-locations-api';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { fetchLocalitiesMock, fetchVenuesMock } = vi.hoisted(() => ({
  fetchLocalitiesMock: vi.fn<typeof fetchAdminLocalities>(),
  fetchVenuesMock: vi.fn<typeof fetchAdminVenues>(),
}));

vi.mock('@/app/admin/locations/_lib/admin-locations-api', () => ({
  fetchAdminLocalities: fetchLocalitiesMock,
  fetchAdminVenues: fetchVenuesMock,
}));

const BARCELONA_LOCALITY_ID = '507f1f77bcf86cd799439011';
const RAZZMATAZZ_VENUE_ID = '507f1f77bcf86cd799439012';

function GigFormFieldsTestSubject() {
  const form = useForm<GigFormValues>({
    defaultValues: {
      ...defaultGigFormValues,
      communityIds: ['community-id'],
      countryIso: 'ES',
      localityId: BARCELONA_LOCALITY_ID,
      venueIds: [RAZZMATAZZ_VENUE_ID],
    },
  });

  return (
    <GigFormFields
      form={form}
      countries={[
        { iso: 'ES', name: 'Spain' },
        { iso: 'FR', name: 'France' },
      ]}
      communityOptions={[{ value: 'community-id', label: 'Barcelona' }]}
      isSubmitting={false}
    />
  );
}

function renderFields() {
  const queryClient = createTestQueryClient();
  return render(<GigFormFieldsTestSubject />, {
    wrapper: createQueryClientWrapper(queryClient),
  });
}

describe('GigFormFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchLocalitiesMock.mockResolvedValue([
      {
        id: BARCELONA_LOCALITY_ID,
        countryIso: 'ES',
        name: 'Barcelona',
        aliases: [],
        timeZone: 'Europe/Madrid',
      },
    ]);
    fetchVenuesMock.mockResolvedValue([
      {
        id: RAZZMATAZZ_VENUE_ID,
        localityId: BARCELONA_LOCALITY_ID,
        name: 'Razzmatazz',
        aliases: [],
        isActive: true,
      },
    ]);
  });

  it('should display catalog assignments', async () => {
    renderFields();

    expect(screen.getByRole('combobox', { name: 'Communities:' })).toHaveTextContent('Barcelona');
    expect(screen.getByRole('combobox', { name: 'Country:' })).toHaveTextContent('Spain');
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Locality:' })).toHaveTextContent('Barcelona');
      expect(screen.getByRole('combobox', { name: 'Venues:' })).toHaveTextContent('Razzmatazz');
    });
  });

  it('should limit the title input to 300 characters', () => {
    renderFields();

    expect(screen.getByLabelText('Title:*')).toHaveAttribute('maxlength', '300');
  });

  it('should mark complete Gig fields as required', () => {
    renderFields();

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Communities:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByLabelText('Locality:*')).toBeRequired();
    expect(screen.getByLabelText('Date:*')).toBeRequired();
    expect(screen.getByLabelText('Venues:*')).toBeRequired();
    expect(screen.getByLabelText('Tickets URL:*')).toBeRequired();
    expect(screen.getByLabelText('End Date:')).not.toBeRequired();
  });

  it('should search countries', () => {
    renderFields();

    const countrySelect = screen.getByRole('combobox', { name: 'Country:' });
    fireEvent.click(countrySelect);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search countries' }), {
      target: { value: 'France' },
    });

    expect(screen.queryByRole('option', { name: 'Spain' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'France' }));
    expect(countrySelect).toHaveTextContent('France');
  });

  it('should stack date fields on mobile and align them horizontally on larger screens', () => {
    renderFields();

    const dateInput = screen.getByLabelText('Date:*');
    const dateField = dateInput.closest('[data-slot="field"]');
    const endDateField = screen.getByLabelText('End Date:').closest('[data-slot="field"]');

    expect(dateField?.parentElement).toBe(endDateField?.parentElement);
    expect(dateField?.parentElement).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    expect(dateInput.closest('[data-slot="date-input-frame"]')).toHaveClass(
      'h-9',
      'max-w-full',
      'overflow-hidden',
    );
  });
});
