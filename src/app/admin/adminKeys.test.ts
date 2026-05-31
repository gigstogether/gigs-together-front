import { adminKeys } from '@/app/admin/adminKeys';
import { GigStatus } from '@/app/admin/gigs/types';

describe('adminKeys', () => {
  it('should build root admin key', () => {
    expect(adminKeys.all()).toEqual(['admin']);
  });

  it('should build dashboard key', () => {
    expect(adminKeys.dashboard()).toEqual(['admin', 'dashboard']);
  });

  it('should build languages key', () => {
    expect(adminKeys.languages()).toEqual(['admin', 'languages']);
  });

  it('should build gigs key with filter status', () => {
    expect(adminKeys.gigs(GigStatus.Pending)).toEqual(['admin', 'gigs', GigStatus.Pending]);
  });
});
