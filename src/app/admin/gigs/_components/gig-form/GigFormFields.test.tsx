// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import GigFormFields from '@/app/admin/gigs/_components/gig-form/GigFormFields';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';

interface GigFormFieldsTestSubjectProps {
  validationMode?: 'completeGig' | 'candidateCreate' | 'candidateDraft';
}

function GigFormFieldsTestSubject(props: GigFormFieldsTestSubjectProps) {
  const { validationMode = 'completeGig' } = props;
  const form = useForm<GigFormValues>({ defaultValues: defaultGigFormValues });

  return (
    <GigFormFields
      form={form}
      countries={[]}
      isSubmitting={false}
      validationMode={validationMode}
      allowEmptyCountry={validationMode === 'candidateDraft'}
    />
  );
}

describe('GigFormFields', () => {
  it('should limit the title input to 300 characters', () => {
    render(<GigFormFieldsTestSubject />);

    expect(screen.getByLabelText('Title:*')).toHaveAttribute('maxlength', '300');
  });

  it('should mark fields required by the complete Gig schema', () => {
    render(<GigFormFieldsTestSubject />);

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByLabelText('City:*')).toBeRequired();
    expect(screen.getByLabelText('Date:*')).toBeRequired();
    expect(screen.getByLabelText('Venue:*')).toBeRequired();
    expect(screen.getByLabelText('Tickets URL:*')).toBeRequired();
    expect(screen.getByLabelText('End Date: (optional)')).not.toBeRequired();
  });

  it('should leave fields optional for the Gig Candidate draft schema', () => {
    render(<GigFormFieldsTestSubject validationMode="candidateDraft" />);

    expect(screen.getByLabelText('Title:')).not.toBeRequired();
    expect(screen.getByLabelText('Country:')).not.toBeRequired();
    expect(screen.getByLabelText('City:')).not.toBeRequired();
    expect(screen.getByLabelText('Date:')).not.toBeRequired();
    expect(screen.getByLabelText('Venue:')).not.toBeRequired();
    expect(screen.getByLabelText('Tickets URL:')).not.toBeRequired();
    expect(screen.getByLabelText('End Date: (optional)')).not.toBeRequired();
  });

  it('should mark core fields required when creating a Gig Candidate', () => {
    render(<GigFormFieldsTestSubject validationMode="candidateCreate" />);

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByLabelText('City:*')).toBeRequired();
    expect(screen.getByLabelText('Date:*')).toBeRequired();
    expect(screen.getByLabelText('Venue:')).not.toBeRequired();
    expect(screen.getByLabelText('Tickets URL:')).not.toBeRequired();
    expect(screen.getByLabelText('End Date: (optional)')).not.toBeRequired();
  });

  it('should stack date fields on mobile and align them horizontally on larger screens', () => {
    render(<GigFormFieldsTestSubject />);

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
