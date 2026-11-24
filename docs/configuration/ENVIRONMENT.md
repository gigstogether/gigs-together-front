# Frontend environment configuration

Copy [`.env.example`](../../.env.example) to `.env`. Set both base URLs before running or building the app.

## Loading configuration

Priority: process environment → `.env.<NODE_ENV>.local` → `.env.local` → `.env.<NODE_ENV>` → `.env`. The `.env.local`
entry is skipped in test mode; keep env files at the repository root.

Next.js sets `NODE_ENV=development` for dev and `production` for build/start. The schemas also accept `test`; backend
aliases `dev` / `prod` are not valid frontend values.

**`NEXT_PUBLIC_*` values are public and embedded at build time.** Never put secrets there; rebuild after changes.
Server-only settings require a restart, and prerendered content may need rebuilding or revalidation.

## Value formats

Strings are trimmed; blank optional values use defaults or remain unset. Booleans accept `true/false` or `1/0`, ignoring
case. Numbers must be positive integers; invalid configured values are rejected. Use absolute URLs.

## Public variables

| Variable                                          | Required             | Default / purpose                                                                                                          |
| ------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_API_BASE_URL`                    | Yes                  | API base URL reachable from server and browser, without `/v1`.                                                             |
| `NEXT_PUBLIC_APP_BASE_URL`                        | Yes                  | Frontend URL for share links and metadata; matches backend `APP_BASE_URL`. Missing values break share-button rendering.    |
| `NEXT_PUBLIC_GITHUB_URL`                          | No                   | Unset. GitHub header link.                                                                                                 |
| `NEXT_PUBLIC_TELEGRAM_URL`                        | No                   | Unset. Telegram header link and gig-card fallback.                                                                         |
| `NEXT_PUBLIC_AUTH_ENABLED`                        | No                   | `false`. Enable Telegram sign-in.                                                                                          |
| `NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID`             | When auth is enabled | Positive BotFather Web Login Client ID, matching backend `TELEGRAM_OIDC_CLIENT_ID`.                                        |
| `NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY` | No                   | `gt_tg_client_profile`. Cached display-profile localStorage key.                                                           |
| `NEXT_PUBLIC_SUGGEST_GIG_ENABLED`                 | No                   | `false`. Show the public suggestion action; signed-in admins always see the admin creation action.                         |
| `NEXT_PUBLIC_FEED_PAGE_SIZE`                      | No                   | `10`. Feed page size.                                                                                                      |
| `NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS`   | No                   | `600000` (10 minutes). Calendar query stale time, milliseconds.                                                            |
| `NEXT_PUBLIC_GOATCOUNTER_ENDPOINT`                | No                   | Unset disables analytics. Count endpoint, e.g. `https://gigstogether.goatcounter.com/count`; production public pages only. |

## Server variables

| Variable                          | Required                   | Default / purpose                                                                                   |
| --------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                        | Set by Next.js/test runner | Runtime mode and env-file selection; omitted from the template.                                     |
| `BRAND_NAME`                      | No                         | `Gigs Together!`. Metadata/page-title brand.                                                        |
| `SITE_PREVIEW_TITLE`              | No                         | `Gigs Together!`. SEO/social preview title.                                                         |
| `SITE_PREVIEW_DESCRIPTION`        | No                         | `Find gigs and company in your city.` SEO/social description.                                       |
| `FEED_REVALIDATE_SECRET`          | For revalidation           | Must match backend value; `/api/revalidate/feed` checks `x-revalidate-secret`.                      |
| `TRANSLATIONS_REVALIDATE_SECRET`  | For revalidation           | Must match backend value; `/api/revalidate/translations` checks `x-translations-revalidate-secret`. |
| `TRANSLATIONS_REVALIDATE_SECONDS` | No                         | `3600` (1 hour). Translation fetch cache interval, seconds.                                         |
| `EAGER_INITIAL_POSTER_COUNT`      | No                         | `5` (first visible grid row on 2xl). Initial feed posters loaded eagerly.                           |
| `ALLOWED_DEV_ORIGINS`             | No; dev only               | Comma-separated hostnames without scheme/port, e.g. `dev.example.com,localhost`.                    |

Revalidation returns `503` for an unconfigured server secret and `401` for a missing/mismatched header. The API must
allow the frontend origin in its CORS configuration for browser requests.

For integration setup, see [Telegram Mini Apps](../integrations/TELEGRAM.md) and
[local HTTPS access](../development/CLOUDFLARE_TUNNEL.md).
