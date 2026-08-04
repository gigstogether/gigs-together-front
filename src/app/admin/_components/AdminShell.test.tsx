import { render, screen } from '@testing-library/react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('AdminShell', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  it('should render admin navigation links in desktop sidebar', () => {
    render(
      <AdminShell>
        <div>Content</div>
      </AdminShell>,
    );

    expect(screen.getByRole('link', { name: 'Gigs' })).toBeInTheDocument();
  });
});
