// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
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
      countries={[
        { iso: 'ES', name: 'Spain' },
        { iso: 'FR', name: 'France' },
      ]}
    />
  );
}

describe('SuggestGigFormFields', () => {
  it('should display the resolved country name', () => {
    render(<SuggestGigFormFieldsTestSubject />);

    expect(screen.getByRole('combobox', { name: 'Country:' })).toHaveTextContent('Spain');
  });

  it('should search and select a country', () => {
    render(<SuggestGigFormFieldsTestSubject />);

    const countrySelect = screen.getByRole('combobox', { name: 'Country:' });

    fireEvent.click(countrySelect);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search countries' }), {
      target: { value: 'France' },
    });

    expect(screen.queryByRole('option', { name: 'Spain' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'France' }));

    expect(countrySelect).toHaveTextContent('France');
  });

  it('should limit the title input to 300 characters', () => {
    render(<SuggestGigFormFieldsTestSubject />);

    expect(screen.getByLabelText('Title:*')).toHaveAttribute('maxlength', '300');
  });

  it('should mark required fields', () => {
    render(<SuggestGigFormFieldsTestSubject />);

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByLabelText('City:*')).toBeRequired();
    expect(screen.getByLabelText('Date:*')).toBeRequired();
    expect(screen.getByLabelText('End Date: (optional)')).not.toBeRequired();
    expect(screen.getByLabelText('Venue: (optional)')).not.toBeRequired();
    expect(screen.getByLabelText('Tickets URL: (optional)')).not.toBeRequired();
  });

  it('should stack date fields on mobile and align them horizontally on larger screens', () => {
    render(<SuggestGigFormFieldsTestSubject />);

    const dateInput = screen.getByLabelText('Date:*');
    const dateField = dateInput.closest('[data-slot="field"]');
    const endDateField = screen
      .getByLabelText('End Date: (optional)')
      .closest('[data-slot="field"]');

    expect(dateField?.parentElement).toBe(endDateField?.parentElement);
    expect(dateField?.parentElement).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    expect(dateInput.closest('[data-slot="date-input-frame"]')).toHaveClass(
      'h-9',
      'max-w-full',
      'overflow-hidden',
    );
  });
});
