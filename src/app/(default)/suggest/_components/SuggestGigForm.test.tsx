import { fireEvent, render, screen } from '@testing-library/react';

import SuggestGigForm from './SuggestGigForm';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { apiPublicRequestMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

vi.mock('../_lib/gig-candidate-api', () => ({
  createGigCandidate: vi.fn(),
}));

const COMMUNITY_OPTIONS = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];

describe('SuggestGigForm', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset().mockResolvedValue({ localities: [] });
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
});
