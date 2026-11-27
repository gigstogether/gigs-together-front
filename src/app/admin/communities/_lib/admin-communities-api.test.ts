import { z } from 'zod';
import {
  createAdminCommunity,
  fetchAdminCommunities,
  updateAdminCommunity,
} from './admin-communities-api';

const request = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api-session-client', () => ({ apiClientRequest: request }));

const COMMUNITY = {
  id: 'community-1',
  countryIso: 'ES',
  slug: 'barcelona',
  nameTranslationKey: 'barcelona.name',
  timeZone: 'Europe/Madrid',
  isActive: false,
};
const BODY = {
  countryIso: 'ES',
  slug: 'barcelona',
  nameTranslationKey: 'barcelona.name',
  timeZone: 'Europe/Madrid',
  isActive: false,
};

describe('admin-communities-api', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('should retain inactive Communities when reading the administrative list', async () => {
    request.mockResolvedValue({ communities: [COMMUNITY] });
    await expect(fetchAdminCommunities()).resolves.toEqual([COMMUNITY]);
    expect(request).toHaveBeenCalledWith('v1/admin/communities', 'GET');
  });

  it('should parse the created Community when creation succeeds', async () => {
    request.mockResolvedValue(COMMUNITY);
    await expect(createAdminCommunity(BODY)).resolves.toEqual(COMMUNITY);
    expect(request).toHaveBeenCalledWith('v1/admin/communities', 'POST', BODY);
  });

  it('should send a partial-update request when saving an existing Community', async () => {
    request.mockResolvedValue(COMMUNITY);
    await expect(updateAdminCommunity(COMMUNITY.id, BODY)).resolves.toEqual(COMMUNITY);
    expect(request).toHaveBeenCalledWith('v1/admin/communities/community-1', 'PATCH', BODY);
  });

  it('should reject an unexpected payload when parsing the Community list', async () => {
    request.mockResolvedValue({ communities: [{ ...COMMUNITY, isActive: 'false' }] });
    await expect(fetchAdminCommunities()).rejects.toBeInstanceOf(z.ZodError);
  });

  it('should reject unknown response fields when parsing a saved Community', async () => {
    request.mockResolvedValue({ ...COMMUNITY, unknownField: true });
    await expect(createAdminCommunity(BODY)).rejects.toBeInstanceOf(z.ZodError);
  });
});
