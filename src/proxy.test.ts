import { NextRequest } from 'next/server';

import { proxy } from '@/proxy';

describe('proxy', () => {
  it('should allow a supported feed location', () => {
    const request = new NextRequest('https://gigstogether.example/feed/es/barcelona');

    const response = proxy(request);

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('should allow a supported feed location with a trailing slash', () => {
    const request = new NextRequest('https://gigstogether.example/feed/es/barcelona/');

    const response = proxy(request);

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('should redirect an unsupported feed location and preserve its query', () => {
    const request = new NextRequest('https://gigstogether.example/feed/fr/paris?source=search');

    const response = proxy(request);

    expect(response.headers.get('location')).toBe(
      'https://gigstogether.example/feed/es/barcelona?source=search',
    );
  });
});
