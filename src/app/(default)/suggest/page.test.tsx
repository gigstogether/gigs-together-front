import { fireEvent, render, screen } from '@testing-library/react';

import SuggestPage from './page';
import type { V1TranslationsByNamespace } from '@/lib/api-boundary-schemas';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

interface MissingTranslationCase {
  condition: string;
  translations: V1TranslationsByNamespace;
}

const { apiPublicRequestMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

vi.mock('@/env/server-env', () => ({
  serverEnv: { translationsRevalidateSeconds: 3_600 }, // 1 hour
}));

vi.mock('@/lib/countries.server', () => ({
  getCountries: vi.fn<() => Promise<[]>>().mockResolvedValue([]),
}));

vi.mock('@/lib/community/community-display-options.server', () => ({
  getCommunityDisplayOptions: vi.fn<() => Promise<[]>>().mockResolvedValue([]),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: () => ({
    authState: { displayLabel: '@user', isAdmin: false },
    isLoadingAuthState: false,
    isTelegramSignInAvailable: true,
  }),
}));

async function renderPage(translations: V1TranslationsByNamespace) {
  apiPublicRequestMock.mockResolvedValue({ locale: 'en', translations });
  const page = await SuggestPage();

  return render(page, {
    wrapper: createQueryClientWrapper(createTestQueryClient()),
  });
}

describe('SuggestPage', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should display the backend description below the title when the translation exists', async () => {
    const description = 'Tell us about a gig missing from our feed.';

    await renderPage({
      suggest: {
        description: { value: description, format: 'plain', kind: 'text' },
      },
    });

    expect(screen.getByRole('form', { name: 'Suggest a gig' })).toHaveAccessibleDescription(
      description,
    );
    expect(apiPublicRequestMock).toHaveBeenCalledWith(
      '/v1/translations?namespaces=suggest',
      'GET',
      undefined,
      expect.objectContaining({ headers: { 'accept-language': 'en' } }),
    );
  });

  it.each<MissingTranslationCase>([
    { condition: 'the namespace is absent', translations: {} },
    { condition: 'the key is absent', translations: { suggest: {} } },
    {
      condition: 'the translation is empty',
      translations: {
        suggest: {
          description: { value: '', format: 'plain', kind: 'text' },
        },
      },
    },
  ])('should omit the description when $condition', async ({ translations }) => {
    await renderPage(translations);

    expect(screen.getByRole('form', { name: 'Suggest a gig' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  it('should display community information from the backend when the hint translation exists', async () => {
    const hint = 'Choose the community you would like to share this gig with.';

    await renderPage({
      suggest: {
        communitySelectionHint: { value: hint, format: 'plain', kind: 'text' },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Community information' }));

    expect(screen.getByRole('dialog', { name: 'Community information' })).toHaveTextContent(hint);
    expect(screen.getByRole('combobox', { name: 'Choose a community' })).not.toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it.each<MissingTranslationCase>([
    { condition: 'the namespace is absent', translations: {} },
    { condition: 'the key is absent', translations: { suggest: {} } },
    {
      condition: 'the translation is empty',
      translations: {
        suggest: {
          communitySelectionHint: { value: '', format: 'plain', kind: 'text' },
        },
      },
    },
  ])('should omit the information icon when $condition', async ({ translations }) => {
    await renderPage(translations);

    expect(screen.queryByRole('button', { name: 'Community information' })).not.toBeInTheDocument();
  });
});
