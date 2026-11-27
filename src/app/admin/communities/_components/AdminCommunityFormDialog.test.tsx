import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminCommunityFormDialog from './AdminCommunityFormDialog';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

const COMMUNITY = {
  id: 'community-1',
  countryIso: 'ES',
  slug: 'barcelona',
  nameTranslationKey: 'barcelona.name',
  timeZone: 'Europe/Madrid',
  isActive: true,
};
const COUNTRIES = [{ iso: 'ES' }, { iso: 'FR' }];
const NAMES = [{ value: 'barcelona.name', label: 'Barcelona' }];

function selectOption(label: string, search: string, option: string): void {
  fireEvent.click(screen.getByRole('combobox', { name: label }));
  fireEvent.change(screen.getByRole('textbox', { name: search }), { target: { value: option } });
  fireEvent.click(screen.getByRole('option', { name: option }));
}

describe('AdminCommunityFormDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    stubResizeObserver();
    vi.spyOn(Intl, 'supportedValuesOf').mockReturnValue(['Europe/Madrid', 'Europe/Paris']);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should submit the current Community model when creating a Community', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminCommunityFormDialog
        value={null}
        countries={COUNTRIES}
        nameOptions={NAMES}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    selectOption('Country:', 'Search countries', 'Spain');
    fireEvent.change(screen.getByLabelText('Slug:*'), { target: { value: ' barcelona ' } });
    selectOption('Name:', 'Search community names', 'Barcelona');
    selectOption('Time zone:', 'Search time zones', 'Europe/Madrid');
    fireEvent.click(screen.getByRole('button', { name: 'Create community' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        countryIso: 'ES',
        slug: 'barcelona',
        nameTranslationKey: 'barcelona.name',
        timeZone: 'Europe/Madrid',
        isActive: true,
      }),
    );
  });

  it('should allow route and active-state changes when editing a Community', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminCommunityFormDialog
        value={COMMUNITY}
        countries={COUNTRIES}
        nameOptions={NAMES}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText('Slug:*'), { target: { value: 'new-barcelona' } });
    fireEvent.click(screen.getByRole('switch', { name: 'Active' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        countryIso: 'ES',
        slug: 'new-barcelona',
        nameTranslationKey: 'barcelona.name',
        timeZone: 'Europe/Madrid',
        isActive: false,
      }),
    );
  });

  it('should permit deactivation when an active name in the default language is missing', () => {
    render(
      <AdminCommunityFormDialog
        value={COMMUNITY}
        countries={COUNTRIES}
        nameOptions={[]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    fireEvent.click(screen.getByRole('switch', { name: 'Active' }));
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('should keep the dialog open and show the error when saving fails', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error('A Community with this country and slug already exists'));
    render(
      <AdminCommunityFormDialog
        value={COMMUNITY}
        countries={COUNTRIES}
        nameOptions={NAMES}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A Community with this country and slug already exists',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should prevent submission when the slug is invalid', () => {
    render(
      <AdminCommunityFormDialog
        value={COMMUNITY}
        countries={COUNTRIES}
        nameOptions={NAMES}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Slug:*'), { target: { value: 'invalid/slug' } });
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('should disable editing and submission when a save is pending', () => {
    render(
      <AdminCommunityFormDialog
        value={COMMUNITY}
        countries={COUNTRIES}
        nameOptions={NAMES}
        isSaving
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Slug:*')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
