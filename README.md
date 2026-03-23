# Gigs Together Frontend

Frontend for the Gigs Together platform. This repository contains a Next.js app that:

- redirects the root route to the public gigs feed
- renders the public feed for supported locations
- provides a gig submission and edit flow
- includes a client-side admin panel built with `react-admin`
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

| Variable                                      | Required                         | Purpose                                                                           |
| --------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_API_BASE_URL`                | Yes                              | Base URL for backend API requests. Without it, direct API calls throw at runtime. |
| `NEXT_PUBLIC_APP_BASE_URL`                    | Recommended                      | Public site base URL used for metadata, sitemap, and robots.                      |
| `NEXT_PUBLIC_GITHUB_URL`                      | Optional                         | GitHub link rendered in the header.                                               |
| `NEXT_PUBLIC_TELEGRAM_URL`                    | Optional                         | Telegram link used in the header and as a fallback on gig cards.                  |
| `NEXT_PUBLIC_TRANSLATIONS_REVALIDATE_SECONDS` | Optional                         | Cache revalidation period for server-side translation fetching.                   |
| `NEXT_PUBLIC_FEED_PAGE_SIZE`                  | Optional                         | Feed page size. Must be a positive integer. Default is `10`.                      |
| `NEXT_PUBLIC_SUGGEST_GIG_LINK`                | Optional                         | Link for the "suggest gig" action in the header.                                  |
| `NEXT_PUBLIC_SITE_PREVIEW_TITLE`              | Optional                         | SEO/social preview title.                                                         |
| `NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION`        | Optional                         | SEO/social preview description.                                                   |
| `NEXT_PUBLIC_BRAND_NAME`                      | Optional                         | Brand name used in metadata. Defaults to `Gigs Together`.                         |
| `FEED_REVALIDATE_SECRET`                      | Required for revalidation routes | Secret checked by `/api/revalidate/feed`.                                         |

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
- `/gig-form` -> create gig flow
- `/gig-form/[publicId]/edit` -> edit gig flow
- `/admin` -> admin UI
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
- `src/app/gig-form` contains create/edit gig flows
- `src/app/admin` contains the `react-admin` application
- `src/app/api/revalidate` contains manual cache revalidation endpoints
- `src/lib/api.ts` contains the shared API request wrapper

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

There are currently no dedicated test scripts in `package.json`.

Before opening a PR, at minimum run:

```bash
npm run lint
npm run build
```

## Troubleshooting

### `Missing NEXT_PUBLIC_APP_API_BASE_URL for direct API calls`

Set `NEXT_PUBLIC_APP_API_BASE_URL` in your local env file and restart the dev server.

### Admin panel cannot load data

Check one of these:

- `NEXT_PUBLIC_ADMIN_API_BASE_URL` points to a valid admin API
- your environment provides a working `/api/admin` endpoint

### Revalidation endpoint returns `401`

Send the `x-revalidate-secret` header and make sure it matches `FEED_REVALIDATE_SECRET`.

### Revalidation endpoint returns `503`

The server is missing `FEED_REVALIDATE_SECRET`.

## License

This repository is marked `UNLICENSED` in `package.json`.
