const { fetchApiJsonMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    errorFromUnknown: vi.fn(),
  },
}));

describe('apiPublicRequest', () => {
  beforeEach(() => {
    fetchApiJsonMock.mockReset();
    fetchApiJsonMock.mockResolvedValue({ ok: true });
  });

  it('should call pure transport with omit credentials', async () => {
    const { apiPublicRequest } = await import('@/lib/api-public');

    await apiPublicRequest('v1/gig?limit=10', 'GET');

    expect(fetchApiJsonMock).toHaveBeenCalledWith(
      'v1/gig?limit=10',
      'GET',
      undefined,
      expect.objectContaining({
        credentials: 'omit',
      }),
    );
  });
});

export {};
