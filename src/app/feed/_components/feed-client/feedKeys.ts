export interface FeedLocationKeyParams {
  readonly country: string;
  readonly city: string;
}

interface FeedLocationKeyValue {
  readonly country: string;
  readonly city: string;
}

function buildFeedLocationKeyValue(params: FeedLocationKeyParams): FeedLocationKeyValue {
  return {
    country: params.country,
    city: params.city,
  };
}

export const feedKeys = {
  all(): readonly ['feed'] {
    return ['feed'];
  },

  events(params: FeedLocationKeyParams): readonly ['feed', 'events', FeedLocationKeyValue] {
    return ['feed', 'events', buildFeedLocationKeyValue(params)];
  },

  calendarAvailableDates(
    params: FeedLocationKeyParams,
  ): readonly ['feed', 'calendar-available-dates', FeedLocationKeyValue] {
    return ['feed', 'calendar-available-dates', buildFeedLocationKeyValue(params)];
  },

  anchorDateByPublicId(publicId: string): readonly ['feed', 'anchor-date', string] {
    return ['feed', 'anchor-date', publicId];
  },
} as const;
