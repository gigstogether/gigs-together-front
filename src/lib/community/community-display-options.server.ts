import 'server-only';

import { getCommunities } from '@/lib/community/community.server';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { getTranslations } from '@/lib/i18n/translations.server';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';

export async function getCommunityDisplayOptions(
  locale: string,
): Promise<CommunityDisplayOption[]> {
  const catalog = await getCommunities();
  const i18n = await getTranslations(locale, [catalog.nameTranslationNamespace]);

  return catalog.communities.map((community) => ({
    value: community.id,
    label: resolveTranslationValue({
      entry: i18n.translations[catalog.nameTranslationNamespace]?.[community.nameTranslationKey],
      namespace: catalog.nameTranslationNamespace,
      key: community.nameTranslationKey,
    }),
  }));
}
