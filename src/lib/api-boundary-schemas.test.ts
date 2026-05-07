import {
  parseCountries,
  parseLanguageGetTranslationsResponseBody,
  parseV1GigAroundGetResponseBody,
  parseV1GigByPublicIdGetResponseBody,
  parseV1GigDatesGetResponseBody,
  parseV1GigGetResponseBody,
} from '@/lib/api-boundary-schemas';

describe('parseCountries', () => {
  it('should return countries when payload is valid', () => {
    const payload = [{ iso: 'ES' }, { iso: 'US' }];
    const parsed = parseCountries(payload);
    expect(parsed).toEqual([{ iso: 'ES' }, { iso: 'US' }]);
  });

  it('should throw when countries payload shape is invalid', () => {
    const payload = [{ code: 'ES' }];
    expect(() => parseCountries(payload)).toThrow();
  });
});

describe('parseLanguageGetTranslationsResponseBody', () => {
  it('should return translations response when payload is valid', () => {
    const payload = {
      locale: 'en',
      translations: {
        country: {
          es: {
            value: 'Spain',
            format: 'plain',
          },
        },
      },
    };
    const parsed = parseLanguageGetTranslationsResponseBody(payload);
    expect(parsed).toEqual(payload);
  });

  it('should throw when translation format is invalid', () => {
    const payload = {
      locale: 'en',
      translations: {
        country: {
          es: {
            value: 'Spain',
            format: 'markdown',
          },
        },
      },
    };
    expect(() => parseLanguageGetTranslationsResponseBody(payload)).toThrow();
  });

  it('should throw when locale is empty', () => {
    const payload = {
      locale: '',
      translations: {},
    };
    expect(() => parseLanguageGetTranslationsResponseBody(payload)).toThrow();
  });
});

describe('parseV1GigGetResponseBody', () => {
  it('should return feed response when payload is valid', () => {
    const payload = {
      gigs: [
        {
          id: '1',
          title: 'Gig',
          date: '2026-04-21',
          city: 'Barcelona',
          country: 'ES',
          venue: 'Club',
          ticketsUrl: 'https://example.com/tickets',
        },
      ],
      nextCursor: 'next',
    };

    const parsed = parseV1GigGetResponseBody(payload);
    expect(parsed).toEqual(payload);
  });

  it('should throw when gig payload shape is invalid', () => {
    const payload = {
      gigs: [
        {
          id: '1',
          title: 'Gig',
        },
      ],
    };

    expect(() => parseV1GigGetResponseBody(payload)).toThrow();
  });
});

describe('parseV1GigDatesGetResponseBody', () => {
  it('should return dates response when payload is valid', () => {
    const payload = { dates: ['2026-04-21', 42] };

    const parsed = parseV1GigDatesGetResponseBody(payload);
    expect(parsed).toEqual(payload);
  });

  it('should throw when date item is invalid', () => {
    const payload = { dates: [false] };
    expect(() => parseV1GigDatesGetResponseBody(payload)).toThrow();
  });
});

describe('parseV1GigAroundGetResponseBody', () => {
  it('should return around response when payload is valid', () => {
    const payload = {
      before: [],
      after: [
        {
          id: '2',
          title: 'Next Gig',
          date: 42,
          city: 'Barcelona',
          country: 'ES',
          venue: 'Hall',
          ticketsUrl: 'https://example.com/tickets',
        },
      ],
      prevCursor: 'prev',
      nextCursor: 'next',
    };

    const parsed = parseV1GigAroundGetResponseBody(payload);
    expect(parsed).toEqual(payload);
  });

  it('should throw when around payload shape is invalid', () => {
    const payload = { before: [], after: {} };
    expect(() => parseV1GigAroundGetResponseBody(payload)).toThrow();
  });
});

describe('parseV1GigByPublicIdGetResponseBody', () => {
  it('should return publicId date response when payload is valid', () => {
    const payload = { date: 42 };
    const parsed = parseV1GigByPublicIdGetResponseBody(payload);
    expect(parsed).toEqual(payload);
  });

  it('should throw when publicId date payload shape is invalid', () => {
    const payload = { date: { value: '2026-04-21' } };
    expect(() => parseV1GigByPublicIdGetResponseBody(payload)).toThrow();
  });
});
