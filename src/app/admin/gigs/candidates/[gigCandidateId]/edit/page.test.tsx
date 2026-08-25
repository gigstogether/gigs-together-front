// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminGigCandidateEditPage from './page';

const { getCountriesMock, getTranslationsMock } = vi.hoisted(() => ({
  getCountriesMock: vi.fn(),
  getTranslationsMock: vi.fn(),
}));

vi.mock('@/lib/countries.server', () => ({
  getCountries: getCountriesMock,
}));

vi.mock('@/lib/i18n/translations.server', () => ({
  getTranslations: getTranslationsMock,
}));

vi.mock('@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient', () => ({
  default: () => <div>Gig Candidate edit form</div>,
}));

describe('AdminGigCandidateEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCountriesMock.mockResolvedValue([]);
    getTranslationsMock.mockResolvedValue({ locale: 'en', translations: {} });
  });

  it('should link back to the Gig Candidate list from the edit page', async () => {
    const page = await AdminGigCandidateEditPage({
      params: Promise.resolve({ gigCandidateId: 'gigCandidate-42' }),
    });

    render(page);

    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      '/admin/gigs/candidates',
    );
  });
});
