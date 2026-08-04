// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminDeniedGate from '@/app/admin/_components/AdminDeniedGate';

describe('AdminDeniedGate', () => {
  it('should deny access to signed-in non-admin users', () => {
    render(<AdminDeniedGate />);

    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });
});
