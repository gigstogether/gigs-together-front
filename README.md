# Gigs Together Frontend

Frontend for the Gigs Together platform. This repository contains a Next.js app that:

- redirects the root route to the public gigs feed
- renders the public feed for supported locations
- exposes stable public gig permalink redirects via `/gigs/[publicId]`
- exposes a public `/suggest` placeholder and a Telegram-aware `/suggest/launch` entry
- exposes a moderator-only `/admin` area with gig moderation, posting/create/edit flows, and locale management
- exposes revalidation endpoints for cached content

At the moment, the default public feed points to `es/barcelona`.

## Tech stack

### Runtime and package manager

- Node.js: `v22.x`
- npm: `11.x`
- package lock format: `lockfileVersion 3`

## Prerequisites

Before you start, make sure you have:

- Node.js installed
- npm installed
- access to the backend API used by this frontend

## Getting started

### 1. Install dependencies

```bash
npm install
```

This also runs the `prepare` script and installs Husky git hooks.

### 2. Create environment variables

Copy `.env.example` into a local env file:

You can also use `.env`, but `.env.local` is the safer default for machine-specific values.

### 3. Fill in the required env vars

What they are used for:

| Variable                                          | Required?                        | Purpose                                                                                                                                          |
| ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_API_BASE_URL`                    | Required                         | Base URL for backend API requests. Without it, direct API calls throw at runtime.                                                                |
| `NEXT_PUBLIC_APP_BASE_URL`                        | Optional\*                       | Public site base URL used for metadata, sitemap, and robots. \*Recommended; required at runtime for `/sitemap.xml` and `/robots.txt`.            |
| `NEXT_PUBLIC_GITHUB_URL`                          | Optional                         | GitHub link rendered in the header.                                                                                                              |
| `NEXT_PUBLIC_TELEGRAM_URL`                        | Optional                         | Telegram link used in the header and as a fallback on gig cards.                                                                                 |
| `NEXT_PUBLIC_TELEGRAM_AUTH_SESSION_HELP_URL`      | Optional                         | Deep link to the Telegram service chat where users can terminate an active login session.                                                        |
| `NEXT_PUBLIC_AUTH_ENABLED`                        | Optional                         | Shows/hides auth menu button. Parsed as boolean. Default: `false`.                                                                               |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`               | Required\*                       | Telegram bot username used by auth flow. \*Required when `NEXT_PUBLIC_AUTH_ENABLED` is `true`.                                                   |
| `NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY` | Optional                         | localStorage key for the cached Telegram display profile. Default: `gt_tg_client_profile`.                                                       |
| `NEXT_PUBLIC_FEED_PAGE_SIZE`                      | Optional                         | Feed page size. Must be a positive integer. Default is `10`.                                                                                     |
| `NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS`   | Optional                         | Calendar dates query stale time in milliseconds. Must be a positive integer. Default is `600000` (10 minutes).                                   |
| `NEXT_PUBLIC_SUGGEST_GIG_ENABLED`                 | Optional                         | Shows/hides the public "Suggest a gig" header action. Parsed as boolean. Default: `false`. Admins always see the button when signed in.          |
| `SITE_PREVIEW_TITLE`                              | Optional                         | SEO/social preview title. Defaults to `Gigs Together!`.                                                                                          |
| `SITE_PREVIEW_DESCRIPTION`                        | Optional                         | SEO/social preview description. Defaults to a short product blurb.                                                                               |
| `BRAND_NAME`                                      | Optional                         | Brand name used in metadata. Defaults to `Gigs Together`.                                                                                        |
| `ALLOWED_DEV_ORIGINS`                             | Optional                         | Comma-separated list of allowed development origins for Next.js `allowedDevOrigins` (for example `http://localhost:3000,http://127.0.0.1:3000`). |
| `FEED_REVALIDATE_SECRET`                          | Required for revalidation routes | Secret checked by `/api/revalidate/feed`.                                                                                                        |
| `TRANSLATIONS_REVALIDATE_SECRET`                  | Required for revalidation routes | Secret checked by `/api/revalidate/translations` (`x-translations-revalidate-secret`).                                                           |
| `TRANSLATIONS_REVALIDATE_SECONDS`                 | Optional                         | Server-side cache revalidation period for translation fetching. Positive integer in seconds, default `3600`.                                     |

## Running the app locally

Start the development server:

```bash
npm run dev
```

By default, Next.js serves the app on:

```text
http://localhost:3000
```

Useful routes:

- `/` -> redirects to the default feed route
- `/feed` -> redirects to the default feed route
- `/feed/es/barcelona` -> current supported public feed
- `/gigs/:publicId` -> redirects to the default feed route anchored to the target gig
- `/suggest` -> public placeholder for the future suggestion flow
- `/suggest/launch` -> Telegram-aware redirect into `/suggest` or the moderator gig flow
- `/admin` -> moderator dashboard
- `/admin/gigs` -> gig moderation queue and create/edit flows
- `/admin/locales` -> locale activation and ordering
- `/admin/translations` -> translations placeholder page
- `/admin/admins` -> moderator access placeholder page
- `/about` -> about page

## Production build and local production run

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

The standard local production flow is:

```bash
npm install
npm run build
npm run start
```

## Code quality workflow

### Linting

```bash
npm run lint
```

### Auto-fixing lint issues

```bash
npm run lint:fix
```

### Formatting

```bash
npm run format:write
```

### Full local cleanup pass

```bash
npm run lint:format:fix
```

## Git hooks and commit rules

The repo uses Husky:

- `pre-commit` runs `npx --no-install lint-staged`
- `commit-msg` runs `npx --no -- commitlint --edit $1`

`lint-staged` currently does:

- for `*.{js,ts,jsx,tsx}`: Prettier write + ESLint fix
- for `*.{json,md,css,scss,yml,yaml}`: Prettier write

Commit messages are validated against the Conventional Commits config from `@commitlint/config-conventional`.

Example valid commits:

- `feat: add city filter to feed`
- `fix: handle missing Telegram link`
- `docs: expand local setup instructions`

## Project structure

```text
src/
  app/          Next.js App Router pages, layouts, route handlers
  components/   shared UI primitives
  hooks/        reusable React hooks
  lib/          API clients, mappers, providers, shared utilities
```

Key areas:

- `src/app/feed` contains the public feed pages and feed client logic
- `src/app/gigs/[publicId]` contains stable public gig permalink redirects used by share actions
- `src/app/suggest` contains the public suggest placeholder and Telegram launch routing
- `src/app/admin` contains the moderator-only admin shell and moderation tools
- `src/app/api/revalidate` contains manual cache revalidation endpoints
- `src/lib/api-core.ts` is the shared HTTP transport (`fetchApiJson` / `buildUrl`)
- `src/lib/api-public.ts` is the server-safe public API client (no cookies / session recovery)
- `src/lib/api-session-client.ts` is the browser session API client (recovery + sign-in UI on 401)

## API and runtime assumptions

- This frontend depends on an external backend API.
- Most data fetching goes through `NEXT_PUBLIC_APP_API_BASE_URL`.
- Without a reachable backend, the feed, translations, countries list, and gig forms will not function correctly.
- The revalidation route `src/app/api/revalidate/feed/route.ts` expects the `x-revalidate-secret` header to match `FEED_REVALIDATE_SECRET`.

## CI and branch automation

The repository currently includes one GitHub Actions workflow:

- on push to `main`, GitHub Actions automatically merges `main` into `stg`

There is no general CI workflow for linting, tests, or builds in this repository at the moment.

## Testing status

Available test scripts:

- `npm run test` -> run the Vitest suite once
- `npm run test:watch` -> run Vitest in watch mode

Before opening a PR, at minimum run:

```bash
npm run lint
npm run test
npm run build
```

## Troubleshooting

### Telegram Mini App behaves strangely

If the Mini App UI behaves inconsistently, buttons do not react, or the page looks out of sync after frontend changes, first try a hard refresh without cache.

```text
Ctrl/Cmd+Shift+R
```

This is the first thing to try before debugging tunnel, HMR, or Telegram-specific issues.

### `Missing NEXT_PUBLIC_APP_API_BASE_URL for direct API calls`

Set `NEXT_PUBLIC_APP_API_BASE_URL` in your local env file and restart the dev server.

### Revalidation endpoint returns `401`

Send the `x-revalidate-secret` header and make sure it matches `FEED_REVALIDATE_SECRET`.

### Revalidation endpoint returns `503`

The server is missing `FEED_REVALIDATE_SECRET`.

## License

This repository is marked `UNLICENSED` in `package.json`.
