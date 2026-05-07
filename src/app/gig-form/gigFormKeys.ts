export const gigFormKeys = {
  all(): readonly ['gig-form'] {
    return ['gig-form'];
  },

  editByPublicId(gigPublicId: string): readonly ['gig-form', 'edit-gig', string] {
    const id = gigPublicId.trim();
    return ['gig-form', 'edit-gig', id];
  },
} as const;
