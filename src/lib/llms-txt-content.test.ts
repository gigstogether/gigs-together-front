import type { V1TranslationValue } from '@/lib/api-boundary-schemas';
import { buildLlmsTxtContent, LlmsTxtContentError } from '@/lib/llms-txt-content';

const BASE_URL = 'https://gigstogether.example';

const llmsTranslations: Record<string, V1TranslationValue> = {
  content: {
    value: `# Gigs Together!

> Gigs Together helps people find friends and company for concerts.

Going to a concert is better when you have someone to share it with, but finding that person is not always easy. Gigs Together is not intended to be a complete concert guide; the focus is on bringing people together through shared music interests and real plans. The first community is in Barcelona.

## Product
- [Home]({baseUrl}/): Site entry; redirects to the default public feed.
- [Barcelona feed]({baseUrl}/feed/es/barcelona): Browse gigs where people in Barcelona, ES are looking for concert company.
- [Feed index]({baseUrl}/feed): Entry point for location-based community gig feeds.
- [About]({baseUrl}/about): Overview of Gigs Together and how the platform works.

## Community
- [Suggest a gig]({baseUrl}/suggest): Post a concert you would like to attend and let others know you are looking for company.
- [Suggest via Telegram]({baseUrl}/suggest/launch): Telegram-aware entry to suggest a gig or continue from the community.
- [Telegram community]({telegramUrl}): Join fellow concertgoers in Barcelona, suggest gigs, and find company for concerts already suggested.

## Optional
- [Sitemap]({baseUrl}/sitemap.xml): Public URLs for crawlers.
- [GitHub]({githubUrl}): Project source code and issue tracker.`,
    format: 'plain',
    kind: 'template',
  },
};

describe('buildLlmsTxtContent', () => {
  it('should start with a single H1 and blockquote summary', () => {
    const content = buildLlmsTxtContent({
      baseUrl: BASE_URL,
      translations: llmsTranslations,
    });

    expect(content.startsWith('# Gigs Together!\n\n>')).toBe(true);
    expect(content.match(/^# /gm)).toHaveLength(1);
  });

  it('should include absolute product and community links', () => {
    const content = buildLlmsTxtContent({
      baseUrl: BASE_URL,
      translations: llmsTranslations,
    });

    expect(content).toContain(`[Home](${BASE_URL}/)`);
    expect(content).toContain(`[Barcelona feed](${BASE_URL}/feed/es/barcelona)`);
    expect(content).toContain(`[Feed index](${BASE_URL}/feed)`);
    expect(content).toContain(`[About](${BASE_URL}/about)`);
    expect(content).toContain(`[Suggest a gig](${BASE_URL}/suggest)`);
    expect(content).toContain(`[Suggest via Telegram](${BASE_URL}/suggest/launch)`);
    expect(content).toContain(`[Sitemap](${BASE_URL}/sitemap.xml)`);
  });

  it('should describe the product focus in the intro paragraph', () => {
    const content = buildLlmsTxtContent({
      baseUrl: BASE_URL,
      translations: llmsTranslations,
    });

    expect(content).toContain('not intended to be a complete concert guide');
    expect(content).toContain('first community is in Barcelona');
  });

  it('should include Telegram and GitHub links when provided', () => {
    const content = buildLlmsTxtContent({
      baseUrl: BASE_URL,
      translations: llmsTranslations,
      telegramUrl: 'https://t.me/gigstogether',
      githubUrl: 'https://github.com/example/gigs-together-front',
    });

    expect(content).toContain('[Telegram community](https://t.me/gigstogether)');
    expect(content).toContain('[GitHub](https://github.com/example/gigs-together-front)');
  });

  it('should omit optional external links when URLs are not configured', () => {
    const content = buildLlmsTxtContent({
      baseUrl: BASE_URL,
      translations: llmsTranslations,
    });

    expect(content).not.toContain('[Telegram community](');
    expect(content).not.toContain('[GitHub](');
  });

  it('should throw when llms.content is missing', () => {
    expect(() =>
      buildLlmsTxtContent({
        baseUrl: BASE_URL,
        translations: {},
      }),
    ).toThrow(LlmsTxtContentError);
  });

  it('should throw when llms.content is not a template', () => {
    expect(() =>
      buildLlmsTxtContent({
        baseUrl: BASE_URL,
        translations: {
          content: {
            value: 'Plain text',
            format: 'plain',
            kind: 'text',
          },
        },
      }),
    ).toThrow(LlmsTxtContentError);
  });
});
