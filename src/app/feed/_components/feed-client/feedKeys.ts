export interface FeedLocationKeyParams {
  readonly country: string;
  readonly city: string;
}

type FeedLocationKeyValue = FeedLocationKeyParams;

export interface FeedAroundKeyParams extends FeedLocationKeyParams {
  readonly anchorYmd: string;
  readonly beforeLimit: number;
  readonly afterLimit: number;
}

type FeedAroundKeyValue = FeedAroundKeyParams;

function buildFeedLocationKeyValue(params: FeedLocationKeyParams): FeedLocationKeyValue {
  return {
    country: params.country,
    city: params.city,
  };
}

function buildFeedAroundKeyValue(params: FeedAroundKeyParams): FeedAroundKeyValue {
  return {
    ...buildFeedLocationKeyValue(params),
    anchorYmd: params.anchorYmd,
    beforeLimit: params.beforeLimit,
    afterLimit: params.afterLimit,
  };
}

export const feedKeys = {
  all(): readonly ['feed'] {
    return ['feed'];
  },

  events(params: FeedLocationKeyParams): readonly ['feed', 'events', FeedLocationKeyValue] {
    return ['feed', 'events', buildFeedLocationKeyValue(params)];
  },

  around(params: FeedAroundKeyParams): readonly ['feed', 'around', FeedAroundKeyValue] {
    return ['feed', 'around', buildFeedAroundKeyValue(params)];
  },

  anchorDateByPublicId(publicId: string): readonly ['feed', 'anchor-date', string] {
    return ['feed', 'anchor-date', publicId];
  },
} as const;
