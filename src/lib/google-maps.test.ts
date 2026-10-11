import { buildGoogleMapsSearchUrl } from '@/lib/google-maps';

describe('buildGoogleMapsSearchUrl', () => {
  it('should encode the location as a Google Maps search query', () => {
    const result = buildGoogleMapsSearchUrl('Sala Apolo, Barcelona, ES');

    expect(result).toBe(
      'https://www.google.com/maps/search/?api=1&query=Sala%20Apolo%2C%20Barcelona%2C%20ES',
    );
  });
});
