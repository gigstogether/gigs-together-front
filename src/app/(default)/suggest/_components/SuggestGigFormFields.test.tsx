// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import SuggestGigFormFields from '@/app/(default)/suggest/_components/SuggestGigFormFields';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { apiPublicRequestMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

function SuggestGigFormFieldsTestSubject() {
  const form = useForm<SuggestGigFormValues>({
    defaultValues: {
      communityId: 'community-id',
      countryIso: 'ES',
      localityId: '',
      venueIds: [],
      title: '',
      date: '',
      endDate: '',
      ticketsUrl: '',
    },
  });

  return (
    <SuggestGigFormFields
      form={form}
      countries={[
        { iso: 'ES', name: 'Spain' },
        { iso: 'FR', name: 'France' },
      ]}
    />
  );
}

function renderFields() {
  const queryClient = createTestQueryClient();

  return render(<SuggestGigFormFieldsTestSubject />, {
    wrapper: createQueryClientWrapper(queryClient),
  });
}

describe('SuggestGigFormFields', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
    apiPublicRequestMock.mockImplementation((endpoint: string) => {
      if (endpoint.startsWith('/v1/localities?')) {
        return Promise.resolve({
          localities: [
            {
              id: 'locality-id',
              countryIso: 'ES',
              name: 'Barcelona',
              qualifier: 'Catalonia',
              timeZone: 'Europe/Madrid',
            },
          ],
        });
      }

      return Promise.resolve({
        locality: {
          id: 'locality-id',
          countryIso: 'ES',
          name: 'Barcelona',
          qualifier: 'Catalonia',
          timeZone: 'Europe/Madrid',
        },
        venues: [
          { id: 'venue-id-1', name: 'Razzmatazz' },
          { id: 'venue-id-2', name: 'Sala Apolo' },
        ],
      });
    });
  });

  it('should display the resolved country name', () => {
    renderFields();

    expect(screen.getByRole('combobox', { name: 'Country:' })).toHaveTextContent('Spain');
  });

  it('should search and select a country', () => {
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

  it('should limit the title input to 300 characters', () => {
    renderFields();

    expect(screen.getByLabelText('Title:*')).toHaveAttribute('maxlength', '300');
  });

  it('should mark required fields', () => {
    renderFields();

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByRole('combobox', { name: 'Locality:' })).toBeRequired();
    expect(screen.getByLabelText('Date:')).not.toBeRequired();
    expect(screen.getByLabelText('End Date:')).not.toBeRequired();
    expect(screen.getByLabelText('Venues:')).not.toBeRequired();
    expect(screen.getByLabelText('Tickets URL:')).not.toBeRequired();
  });

  it('should stack date fields on mobile and align them horizontally on larger screens', () => {
    renderFields();

    const dateInput = screen.getByLabelText('Date:');
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

  it('should show the Locality qualifier and enable only matching Venues', async () => {
    renderFields();

    const venueSelect = screen.getByRole('combobox', { name: 'Venues:' });
    expect(venueSelect).toBeDisabled();
    expect(venueSelect).toHaveTextContent('Select a locality first');

    const localitySelect = screen.getByRole('combobox', { name: 'Locality:' });
    await waitFor(() => expect(localitySelect).toBeEnabled());
    fireEvent.click(localitySelect);
    fireEvent.click(screen.getByRole('option', { name: 'Barcelona (Catalonia)' }));

    expect(apiPublicRequestMock).toHaveBeenCalledWith('/v1/venues?localityId=locality-id', 'GET');
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Venues:' })).toBeEnabled());

    fireEvent.click(screen.getByRole('combobox', { name: 'Venues:' }));
    fireEvent.click(screen.getByRole('option', { name: 'Razzmatazz' }));
    fireEvent.click(screen.getByRole('option', { name: 'Sala Apolo' }));

    expect(screen.getByRole('combobox', { name: 'Venues:' })).toHaveTextContent(
      'Razzmatazz, Sala Apolo',
    );
  });
});
