import { adminKeys } from '@/app/admin/adminKeys';

describe('adminKeys', () => {
  it('should build root admin key', () => {
    expect(adminKeys.all()).toEqual(['admin']);
  });

  it('should build dashboard key', () => {
    expect(adminKeys.dashboard()).toEqual(['admin', 'dashboard']);
  });
});
