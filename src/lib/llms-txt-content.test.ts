import { buildLlmsTxtContent } from '@/lib/llms-txt-content';

const BASE_URL = 'https://gigstogether.example';

describe('buildLlmsTxtContent', () => {
  it('should start with a single H1 and blockquote summary', () => {
    const content = buildLlmsTxtContent({ baseUrl: BASE_URL });

    expect(content.startsWith('# Gigs Together!\n\n>')).toBe(true);
    expect(content.match(/^# /gm)).toHaveLength(1);
  });

  it('should include absolute product and community links', () => {
    const content = buildLlmsTxtContent({ baseUrl: BASE_URL });

    expect(content).toContain(`[Home](${BASE_URL}/)`);
    expect(content).toContain(`[Barcelona feed](${BASE_URL}/feed/es/barcelona)`);
    expect(content).toContain(`[Feed index](${BASE_URL}/feed)`);
    expect(content).toContain(`[About](${BASE_URL}/about)`);
    expect(content).toContain(`[Suggest a gig](${BASE_URL}/suggest)`);
    expect(content).toContain(`[Suggest via Telegram](${BASE_URL}/suggest/launch)`);
    expect(content).toContain(`[Sitemap](${BASE_URL}/sitemap.xml)`);
  });

  it('should describe the product focus in the intro paragraph', () => {
    const content = buildLlmsTxtContent({ baseUrl: BASE_URL });

    expect(content).toContain('not intended to be a complete concert guide');
    expect(content).toContain('first community is in Barcelona');
  });

  it('should include Telegram and GitHub links when provided', () => {
    const content = buildLlmsTxtContent({
      baseUrl: BASE_URL,
      telegramUrl: 'https://t.me/gigstogether',
      githubUrl: 'https://github.com/example/gigs-together-front',
    });

    expect(content).toContain('[Telegram community](https://t.me/gigstogether)');
    expect(content).toContain('[GitHub](https://github.com/example/gigs-together-front)');
  });

  it('should omit optional external links when URLs are not configured', () => {
    const content = buildLlmsTxtContent({ baseUrl: BASE_URL });

    expect(content).not.toContain('[Telegram community](');
    expect(content).not.toContain('[GitHub](');
  });
});
