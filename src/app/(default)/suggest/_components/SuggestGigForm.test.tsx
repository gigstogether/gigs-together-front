// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SuggestGigForm from './SuggestGigForm';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

const { apiPublicRequestMock, createGigCandidateMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
  createGigCandidateMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

vi.mock('../_lib/gig-candidate-api', () => ({
  createGigCandidate: createGigCandidateMock,
}));

const COMMUNITY_OPTIONS = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];

function renderForm() {
  return render(
    <SuggestGigForm
      initialCommunityId="barcelona"
      communityOptions={COMMUNITY_OPTIONS}
      countries={[
        { iso: 'ES', name: 'Spain' },
        { iso: 'FR', name: 'France' },
      ]}
    />,
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

async function fillRequiredFields(): Promise<void> {
  fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });
  const localitySelect = screen.getByRole('combobox', { name: 'City / area:' });
  await waitFor(() => expect(localitySelect).toBeEnabled());
  fireEvent.click(localitySelect);
  fireEvent.click(screen.getByRole('option', { name: 'Barcelona (Catalonia)' }));
}

describe('SuggestGigForm', () => {
  beforeEach(() => {
    stubResizeObserver();
    createGigCandidateMock.mockReset().mockResolvedValue({ id: 'candidate-id' });
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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize the community when an initial ID is provided', () => {
    render(
      <SuggestGigForm
        initialCommunityId="madrid"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Madrid');
  });

  it('should preserve entered gig fields when the community changes in the header', () => {
    render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });

    fireEvent.click(screen.getByRole('combobox', { name: 'Community' }));
    fireEvent.click(screen.getByRole('option', { name: 'Madrid' }));

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Madrid');
    expect(screen.getByLabelText('Title:*')).toHaveValue('Muse');
  });

  it('should preserve form state when the initial community prop changes after mounting', () => {
    const { rerender } = render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });

    rerender(
      <SuggestGigForm
        initialCommunityId="madrid"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Barcelona');
    expect(screen.getByLabelText('Title:*')).toHaveValue('Muse');
  });

  it('should reveal optional errors when a collapsed optional field is invalid', async () => {
    render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.change(screen.getByLabelText('Tickets URL:'), { target: { value: 'invalid-url' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));

    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));

    expect(await screen.findByText('Please enter a valid ticket URL.')).toBeVisible();
  });

  it('should reveal the poster field when extra gig details are expanded', () => {
    render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    expect(screen.getByText('Poster:')).not.toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByText('Poster:')).toBeVisible();
  });

  it('should display the resolved country name', () => {
    renderForm();

    expect(screen.getByRole('combobox', { name: 'Country:' })).toHaveTextContent('Spain');
  });

  it('should search and select a country', () => {
    renderForm();

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
    renderForm();

    expect(screen.getByLabelText('Title:*')).toHaveAttribute('maxlength', '300');
  });

  it('should mark required fields', () => {
    renderForm();

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByRole('combobox', { name: 'City / area:' })).toBeRequired();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Date:')).not.toBeRequired();
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    expect(screen.getByLabelText('End Date:')).not.toBeRequired();
    expect(screen.getByLabelText('Venues:')).not.toBeRequired();
    expect(screen.getByLabelText('Tickets URL:')).not.toBeRequired();
  });

  it('should align date fields horizontally on all screen sizes when multiple days are enabled', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));

    const dateInput = screen.getByLabelText('Date:');
    const dateField = dateInput.closest('[data-slot="field"]');
    const endDateField = screen.getByLabelText('End Date:').closest('[data-slot="field"]');

    expect(dateField?.parentElement).toBe(endDateField?.parentElement);
    expect(dateField?.parentElement).toHaveClass('grid-cols-2');
    expect(dateInput.closest('[data-slot="date-input-frame"]')).toHaveClass(
      'h-9',
      'max-w-full',
      'overflow-hidden',
    );
  });

  it('should hide optional inputs when the form first opens', () => {
    renderForm();

    expect(screen.getByLabelText('Tickets URL:')).not.toBeVisible();
    expect(screen.getByLabelText('Date:')).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Add details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('should preserve optional values when extra details are collapsed and reopened', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.change(screen.getByLabelText('Tickets URL:'), {
      target: { value: 'https://tickets.example/gig' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));
    expect(screen.getByLabelText('Tickets URL:')).not.toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Tickets URL:')).toHaveValue('https://tickets.example/gig');
  });

  it('should show the Locality qualifier and enable only matching Venues', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    const venueSelect = screen.getByRole('combobox', { name: 'Venues:' });
    expect(venueSelect).toBeDisabled();
    expect(venueSelect).toHaveTextContent('Select a city or area first');

    const localitySelect = screen.getByRole('combobox', { name: 'City / area:' });
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

  it('should show only one date input when additional details are opened', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Date:')).toBeVisible();
    expect(screen.queryByLabelText('End Date:')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Multi-day event' })).not.toBeChecked();
  });

  it('should preserve both dates when additional details are collapsed and reopened', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });

    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Date:')).toHaveValue('2026-08-01');
    expect(screen.getByLabelText('End Date:')).toHaveValue('2026-08-03');
    expect(screen.getByRole('switch', { name: 'Multi-day event' })).toBeChecked();
  });

  it('should clear the dependent date error when multiple days are disabled', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
    expect(await screen.findByText('Date is required when End Date is provided.')).toBeVisible();

    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));

    await waitFor(() =>
      expect(
        screen.queryByText('Date is required when End Date is provided.'),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('End Date:')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    expect(screen.getByLabelText('End Date:')).toHaveValue('');
  });

  it.each([false, true])(
    'should submit the expected date range when multiple days are %s',
    async (isEndDateEnabled) => {
      renderForm();
      await fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
      fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
      fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2026-08-01' } });
      fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });
      if (!isEndDateEnabled) {
        fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
      }

      fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
      await screen.findByText('Suggestion received');

      const gig = {
        communityId: 'barcelona',
        localityId: 'locality-id',
        title: 'Muse',
        date: '2026-08-01',
      };
      const expectedGig = isEndDateEnabled ? { ...gig, endDate: '2026-08-03' } : gig;
      expect(createGigCandidateMock).toHaveBeenCalledWith({
        gig: expectedGig,
        poster: { mode: 'url', file: null, url: '' },
      });
    },
  );

  it('should disable the end date when another suggestion is started after a successful submission', async () => {
    renderForm();
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
    await screen.findByText('Suggestion received');

    fireEvent.click(screen.getByRole('button', { name: 'Suggest another' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByRole('switch', { name: 'Multi-day event' })).not.toBeChecked();
    expect(screen.getByLabelText('Date:')).toHaveValue('');
    expect(screen.queryByLabelText('End Date:')).not.toBeInTheDocument();
  });
});
