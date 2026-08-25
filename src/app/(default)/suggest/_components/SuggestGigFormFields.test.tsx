// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import SuggestGigFormFields from '@/app/(default)/suggest/_components/SuggestGigFormFields';
import { defaultSuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';

function SuggestGigFormFieldsTestSubject() {
  const form = useForm<SuggestGigFormValues>({
    defaultValues: defaultSuggestGigFormValues,
  });

  return (
    <SuggestGigFormFields
      form={form}
      countries={[]}
    />
  );
}

describe('SuggestGigFormFields', () => {
  it('should render the start and end date fields in the same horizontal row', () => {
    render(<SuggestGigFormFieldsTestSubject />);

    const dateField = screen.getByLabelText('Date:').closest('[data-slot="field"]');
    const endDateField = screen
      .getByLabelText('End Date: (optional)')
      .closest('[data-slot="field"]');

    expect(dateField?.parentElement).toBe(endDateField?.parentElement);
    expect(dateField?.parentElement).toHaveClass('grid-cols-2');
  });
});
