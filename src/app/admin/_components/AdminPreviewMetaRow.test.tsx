import { render, screen } from '@testing-library/react';

import AdminPreviewMetaRow from '@/app/admin/_components/AdminPreviewMetaRow';

describe('AdminPreviewMetaRow', () => {
  it('should render an icon and metadata content', () => {
    render(
      <AdminPreviewMetaRow icon={<span aria-label="Date icon" />}>Event date</AdminPreviewMetaRow>,
    );

    expect(screen.getByLabelText('Date icon')).toBeInTheDocument();
    expect(screen.getByText('Event date')).toBeInTheDocument();
  });
});
