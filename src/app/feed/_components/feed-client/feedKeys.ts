export interface FeedLocationKeyParams {
  readonly country: string;
  readonly city: string;
}

type FeedLocationKeyValue = FeedLocationKeyParams;

export interface FeedAroundWindowKeyParams {
  readonly country: string;
  readonly city: string;
  readonly anchorYmd: string;
  readonly beforeLimit: number;
  readonly afterLimit: number;
}

type FeedAroundWindowKeyValue = FeedAroundWindowKeyParams;

export const feedKeys = {
  all(): readonly ['feed'] {
    return ['feed'];
  },

  events(params: FeedLocationKeyParams): readonly ['feed', 'events', FeedLocationKeyValue] {
    return ['feed', 'events', params];
  },

  calendarAvailableDates(
    params: FeedLocationKeyParams,
  ): readonly ['feed', 'calendar-available-dates', FeedLocationKeyValue] {
    return ['feed', 'calendar-available-dates', params];
  },

  anchorDateByPublicId(publicId: string): readonly ['feed', 'anchor-date', string] {
    return ['feed', 'anchor-date', publicId];
  },

  aroundWindow(
    params: FeedAroundWindowKeyParams,
  ): readonly ['feed', 'around-window', FeedAroundWindowKeyValue] {
    return ['feed', 'around-window', params];
  },
} as const;
