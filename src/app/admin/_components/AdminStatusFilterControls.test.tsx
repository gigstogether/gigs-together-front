import { fireEvent, render, screen } from '@testing-library/react';

import AdminStatusFilterControls from '@/app/admin/_components/AdminStatusFilterControls';

describe('AdminStatusFilterControls', () => {
  it('should report selected status when a filter is clicked', () => {
    const onChange = vi.fn();
    render(
      <AdminStatusFilterControls
        ariaLabel="Filter records"
        value="pending"
        options={[
          { value: 'pending', label: 'Pending' },
          { value: 'accepted', label: 'Accepted' },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accepted' }));

    expect(onChange).toHaveBeenCalledWith('accepted');
  });
});
