import { fireEvent, render, screen } from '@testing-library/react';

import AdminLocalitiesCatalog from './localities/AdminLocalitiesCatalog';
import AdminPlacesCatalog from './places/AdminPlacesCatalog';
import AdminRegionsCatalog from './regions/AdminRegionsCatalog';

const region = {
  id: 'region-1',
  countryIso: 'ES',
  name: 'Catalonia',
  aliases: ['Catalunya'],
};

const locality = {
  id: 'locality-1',
  regionId: region.id,
  name: 'Barcelona',
  aliases: [],
  timeZone: 'Europe/Madrid',
};

const place = {
  id: 'place-1',
  localityId: locality.id,
  name: 'Razzmatazz',
  aliases: ['Sala Razzmatazz'],
  isActive: false,
};

describe('AdminLocationCatalogs', () => {
  it('should delegate region editing from the region catalog', () => {
    const onEdit = vi.fn();

    render(
      <AdminRegionsCatalog
        regions={[region]}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/Spain \(ES\).*Catalunya/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit region Catalonia' }));

    expect(onEdit).toHaveBeenCalledWith(region);
  });

  it('should delegate locality deletion with its parent context', () => {
    const onDelete = vi.fn();

    render(
      <AdminLocalitiesCatalog
        localities={[locality]}
        regionById={new Map([[region.id, region]])}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText(/Catalonia.*Spain \(ES\).*Europe\/Madrid/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete locality Barcelona' }));

    expect(onDelete).toHaveBeenCalledWith(locality);
  });

  it('should render place status and delegate place editing', () => {
    const onEdit = vi.fn();

    render(
      <AdminPlacesCatalog
        places={[place]}
        localityById={new Map([[locality.id, locality]])}
        regionById={new Map([[region.id, region]])}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText(/Barcelona.*Catalonia.*Spain \(ES\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit place Razzmatazz' }));

    expect(onEdit).toHaveBeenCalledWith(place);
  });
});
