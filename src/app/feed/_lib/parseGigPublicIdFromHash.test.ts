import { parseGigPublicIdFromHash } from './parseGigPublicIdFromHash';

describe('parseGigPublicIdFromHash', () => {
  it('should return the public id when the hash contains only a gig anchor', () => {
    expect(parseGigPublicIdFromHash('#ist-ist-2026-10-13')).toBe('ist-ist-2026-10-13');
  });

  it('should return the public id before Telegram launch params', () => {
    expect(
      parseGigPublicIdFromHash(
        '#ist-ist-2026-10-13?tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop',
      ),
    ).toBe('ist-ist-2026-10-13');
  });

  it('should return null when the hash does not start with a valid public id', () => {
    expect(
      parseGigPublicIdFromHash('#tgWebAppData=user%3Dtest&tgWebAppPlatform=tdesktop'),
    ).toBeNull();
  });
});
