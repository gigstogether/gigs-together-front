import { SUPPORTED_FEED_LOCATIONS, buildFeedPath } from '@/lib/feed.routes';

export interface BuildLlmsTxtContentParams {
  readonly baseUrl: string;
  readonly telegramUrl?: string;
  readonly githubUrl?: string;
}

const LLMS_TXT_TITLE = 'Gigs Together!';

const LLMS_TXT_SUMMARY =
  'Gigs Together helps people find friends and company for concerts. Suggest a gig you want to attend, browse community suggestions, and connect with others who share your music interests.';

const LLMS_TXT_INTRO = `Going to a concert is better when you have someone to share it with, but finding that person is not always easy — especially when your friends do not listen to the same music. Gigs Together is not intended to be a complete concert guide; the focus is on bringing people together through shared music interests and real plans. The first community is in Barcelona.`;

function appendOptionalLink(
  lines: string[],
  params: { readonly label: string; readonly url: string; readonly description: string },
): void {
  lines.push(`- [${params.label}](${params.url}): ${params.description}`);
}

export function buildLlmsTxtContent(params: BuildLlmsTxtContentParams): string {
  const { baseUrl, telegramUrl, githubUrl } = params;

  const lines: string[] = [
    `# ${LLMS_TXT_TITLE}`,
    '',
    `> ${LLMS_TXT_SUMMARY}`,
    '',
    LLMS_TXT_INTRO,
    '',
    '## Product',
    `- [Home](${baseUrl}/): Site entry; redirects to the default public feed.`,
  ];

  for (const location of SUPPORTED_FEED_LOCATIONS) {
    const feedPath = buildFeedPath(location);
    const cityLabel = location.city.charAt(0).toUpperCase() + location.city.slice(1);
    const countryLabel = location.country.toUpperCase();
    lines.push(
      `- [${cityLabel} feed](${baseUrl}${feedPath}): Browse gigs where people in ${cityLabel}, ${countryLabel} are looking for concert company.`,
    );
  }

  lines.push(
    `- [Feed index](${baseUrl}/feed): Entry point for location-based community gig feeds.`,
    `- [About](${baseUrl}/about): Overview of Gigs Together and how the platform works.`,
    '',
    '## Community',
    `- [Suggest a gig](${baseUrl}/suggest): Post a concert you would like to attend and let others know you are looking for company.`,
    `- [Suggest via Telegram](${baseUrl}/suggest/launch): Telegram-aware entry to suggest a gig or continue from the community.`,
  );

  if (telegramUrl) {
    appendOptionalLink(lines, {
      label: 'Telegram community',
      url: telegramUrl,
      description:
        'Join fellow concertgoers in Barcelona, suggest gigs, and find company for concerts already suggested.',
    });
  }

  lines.push('', '## Optional', `- [Sitemap](${baseUrl}/sitemap.xml): Public URLs for crawlers.`);

  if (githubUrl) {
    appendOptionalLink(lines, {
      label: 'GitHub',
      url: githubUrl,
      description: 'Project source code and issue tracker.',
    });
  }

  return `${lines.join('\n')}\n`;
}
