import { isRecord } from '@/lib/is-record';
import type { AuthClientProfile, AuthClientProfileResponseBody } from '@/types/auth-client-profile';

export function parseAuthClientProfileResponseBody(raw: unknown): AuthClientProfileResponseBody {
  if (!isRecord(raw)) {
    throw new Error('Invalid auth client profile response');
  }
  const profileRaw = raw.profile;
  if (!isRecord(profileRaw)) {
    throw new Error('Invalid auth client profile response: profile');
  }
  const displayLabel = profileRaw.displayLabel;
  if (typeof displayLabel !== 'string' || !displayLabel.trim()) {
    throw new Error('Invalid auth client profile response: profile.displayLabel');
  }
  const photoUrlRaw = profileRaw.photoUrl;
  let photoUrl: string | undefined;
  if (photoUrlRaw !== undefined) {
    if (typeof photoUrlRaw !== 'string' || !photoUrlRaw.trim()) {
      throw new Error('Invalid auth client profile response: profile.photoUrl');
    }
    photoUrl = photoUrlRaw.trim();
  }
  const isAdmin = profileRaw.isAdmin;
  if (typeof isAdmin !== 'boolean') {
    throw new Error('Invalid auth client profile response: profile.isAdmin');
  }
  const profile: AuthClientProfile = {
    displayLabel: displayLabel.trim(),
    ...(photoUrl ? { photoUrl } : {}),
    isAdmin,
  };
  return { profile };
}
