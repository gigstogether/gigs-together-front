import { getCommunityDisplayOptions } from '@/lib/community/community-display-options.server';

const { getCommunitiesMock, getTranslationsMock } = vi.hoisted(() => ({
  getCommunitiesMock: vi.fn(),
  getTranslationsMock: vi.fn(),
}));

vi.mock('@/lib/community/community.server', () => ({
  getCommunities: getCommunitiesMock,
}));
vi.mock('@/lib/i18n/translations.server', () => ({
  getTranslations: getTranslationsMock,
}));

describe('getCommunityDisplayOptions', () => {
  it('should map active Communities to translated select options', async () => {
    getCommunitiesMock.mockResolvedValue({
      communities: [
        {
          id: 'community-id',
          nameTranslationKey: 'barcelona.name',
        },
      ],
      nameTranslationNamespace: 'community',
    });
    getTranslationsMock.mockResolvedValue({
      locale: 'en',
      translations: {
        community: {
          'barcelona.name': {
            value: 'Barcelona',
            format: 'plain',
            kind: 'text',
          },
        },
      },
    });

    await expect(getCommunityDisplayOptions('en')).resolves.toEqual([
      { value: 'community-id', label: 'Barcelona' },
    ]);
    expect(getTranslationsMock).toHaveBeenCalledWith('en', ['community']);
  });
});
