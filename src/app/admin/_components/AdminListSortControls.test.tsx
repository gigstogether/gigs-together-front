import { fireEvent, render, screen } from '@testing-library/react';

import AdminListSortControls from '@/app/admin/_components/AdminListSortControls';

describe('AdminListSortControls', () => {
  it('should report selected sort field', () => {
    const onSortByChange = vi.fn();
    render(
      <AdminListSortControls
        ariaLabel="Sort records"
        sortBy="createdAt"
        sortOrder="desc"
        options={[
          { value: 'createdAt', label: 'Created' },
          { value: 'eventDate', label: 'Event date' },
        ]}
        onSortByChange={onSortByChange}
        onSortOrderToggle={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sort records by' }));
    fireEvent.click(screen.getByRole('option', { name: 'Event date' }));

    expect(onSortByChange).toHaveBeenCalledWith('eventDate');
  });

  it('should report sort order toggle', () => {
    const onSortOrderToggle = vi.fn();
    render(
      <AdminListSortControls
        ariaLabel="Sort records"
        sortBy="createdAt"
        sortOrder="asc"
        options={[{ value: 'createdAt', label: 'Created' }]}
        onSortByChange={vi.fn()}
        onSortOrderToggle={onSortOrderToggle}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sort order: Oldest first' }));

    expect(onSortOrderToggle).toHaveBeenCalledTimes(1);
  });
});
