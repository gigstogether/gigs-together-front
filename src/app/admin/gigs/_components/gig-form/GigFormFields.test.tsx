// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import GigFormFields from '@/app/admin/gigs/_components/gig-form/GigFormFields';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';

function GigFormFieldsTestSubject() {
  const form = useForm<GigFormValues>({ defaultValues: defaultGigFormValues });

  return (
    <GigFormFields
      form={form}
      countries={[]}
      isSubmitting={false}
      allowEmptyCountry
    />
  );
}

describe('GigFormFields', () => {
  it('should render the start and end date fields in the same horizontal row', () => {
    render(<GigFormFieldsTestSubject />);

    const dateField = screen.getByLabelText('Date:').closest('[data-slot="field"]');
    const endDateField = screen
      .getByLabelText('End Date: (optional)')
      .closest('[data-slot="field"]');

    expect(dateField?.parentElement).toBe(endDateField?.parentElement);
    expect(dateField?.parentElement).toHaveClass('grid-cols-2');
  });
});
