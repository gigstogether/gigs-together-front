import { GIG_PUBLIC_ID_PATTERN } from '@/lib/gig.constants';

export function parseGigPublicIdFromHash(hash: string): string | null {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  const telegramParamsStartIndex = fragment.indexOf('?');
  const publicId =
    telegramParamsStartIndex === -1 ? fragment : fragment.slice(0, telegramParamsStartIndex);

  return GIG_PUBLIC_ID_PATTERN.test(publicId) ? publicId : null;
}
