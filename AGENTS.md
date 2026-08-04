# AGENTS

This file contains repository-wide guidance for AI coding agents and human contributors.

## Scope

Apply these rules to the whole repository unless a more specific instruction exists closer to the relevant files.

## Code Style

- Prefer correctness and maintainability over implementation speed.
- Prefer explicit, strict typing. Keep types narrow and avoid widening to `string | number | ...` when the domain is known.
- Comments must be in English using the Latin alphabet only. Do not write comments in Cyrillic.
- Do not remove `TODO` comments (for example `// TODO: ...`) unless you are explicitly completing that TODO as part of the current task. Leave unrelated TODOs untouched.
- Remove a TODO only when it explicitly describes the work you are doing now — not when it uses vague wording such as "refactor", "fix" or similar. Do not assume your change satisfies a TODO unless the comment clearly and specifically matches the task at hand; a generic TODO may refer to different work.
- For numeric constants in seconds or milliseconds (for example `604_800`, `86_400`), add a short comment with human-readable equivalents (at least days or hours, and minutes when useful).
- Boolean variables and flags should preferably start with `is`/`has`/`can`, for example `isActive`, `isAdmin`, `isValid`.
- In `catch` clauses, bind the caught value as `e`, not `error`, when a binding is needed (for example `catch (e) { ... }`).
- Always create new files with `LF` line endings (not `CRLF`). Prefer editor or Git settings that default new files to `LF`.
- Keep line endings as `LF` in tracked files. If you hit formatter errors caused by `CRLF`, convert the file to `LF` and reformat.

## Execution Rules

- Do not run `build`, `dev`, or start watchers or servers unless the user explicitly asks.
- If command execution is needed to validate a change, ask first instead of running it proactively.
- After source code changes (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.json`), run `npm run lint:fix` and `npx tsc --noEmit` before finishing the task without asking the user.
- If necessary for the task, it's allowed to run relevant tests without asking the user.
- Do not run lint or `tsc` after documentation-only changes (for example `*.md`).

## Secrets Access Policy

- Never read or print repository secret files such as `.env`, `.env.*` (except `.env.example`), private keys, or credential dumps.
- Treat `.env` and `.env.*` (except `.env.example`) as denied by default for AI agents. Do not run commands like `cat`, `type`, `Get-Content`, `rg`, or editors against them.
- Use `.env.example` (or documented variable names) for configuration guidance instead of reading real secret files.
- If a task cannot be completed without secret values, stop and ask the user to provide only the required variable names or masked values.

## Testing Rules

- Use Vitest for unit and integration tests in this repository.
- Write tests for all new code.
- Name test files as `*.test.*`. Colocate them near the module under test when practical.
- Name `describe` blocks after the unit under test (module/function/behavior group), for example `describe('fetchApiJson')`.
- Keep `describe` names short and stable; do not duplicate scenario phrasing that belongs in `it`.
- `describe` naming format: prefer exact symbol/module names (`fetchApiJson`, `useCalendarAvailableDates`, `parseCountries`), not full sentence descriptions.
- Write test titles in clear behavior form: `should <expected behavior> when <condition>`.
- Use Arrange-Act-Assert structure in each test; keep one primary behavior assertion per test.
- Do not add explicit AAA comments like `// Arrange`, `// Act`, `// Assert`; keep AAA structure through code layout only.
- Prefer deterministic tests: no real network, no timers without control, no hidden global state dependencies.
- Mock only at I/O boundaries (HTTP, storage, time, env). Do not mock pure business logic modules.
- For bug fixes, add at least one regression test that fails before the fix and passes after it.
- Cover both success and failure paths for boundary parsers, guards, and request flows.
- Keep fixtures minimal and explicit; avoid oversized shared fixtures that hide intent.
- Use `beforeEach`/`afterEach` to fully reset mocks, stubs, and globals.
- Do not assert on implementation details if externally observable behavior can be asserted instead.
- When asserting errors, verify error type and key message/code fields, not only "throws".
- Keep tests fast and isolated so they can run in parallel reliably.
- Avoid snapshot tests for dynamic or business-critical payloads; prefer explicit field assertions.

## TypeScript Rules

- `any` is forbidden by default.
- Use `unknown` plus type guards or narrowing instead of `any`.
- If you need a flexible object shape, prefer `Record<string, unknown>` or a specific interface over `any`.
- If you need to type JSON, prefer `unknown` or an explicit JSON union over `any`.
- Use `any` only when there is no realistic alternative, for example a truly untyped third-party API surface.
- When using `any`, localize it at the boundary and add a short comment explaining why it is unavoidable.

- Mark a function as `async` only when it contains `await`.
- Do not use `.then(...)` when the same logic can be written with `await`.
- If a function returns a `Promise` without using `await`, declare the `Promise` return type explicitly in the signature instead of marking the function as `async`.

- Do not use type assertions (`as ...`) when the same result can be achieved with proper types, `satisfies`, narrower return types, or refactoring.
- Treat `as` as a last resort and justify it locally with a short comment when unavoidable.
- Prefer type guards, narrowing, and better source types instead of `as`.
- Prefer `satisfies` for validating object shapes without changing inferred types.
- Prefer parsing and validation at boundaries such as HTTP, env, storage, and third-party SDKs so the rest of the code stays strongly typed.
- Avoid `as any` entirely.

- Prefer `readonly` where immutability is appropriate, especially for DTOs, config objects, and constants.

- Prefer named types for public APIs such as service methods, controller responses, and module exports.
- Do not use inline object types in public signatures such as `Promise<{ ... }>` or `foo(arg: { ... })`.
- Extract object shapes into a named `interface` or `type`, ideally colocated in `types/requests/*` for DTOs.
- Prefer a named params object for long function signatures.
- When an object-parameter function signature becomes long, do not destructure in the parameter list; accept `params: SomeParams` and destructure inside the function body.

- Prefer `interface` over `type` for object shapes unless `type` is clearly the better fit.
- Use `type` for unions, intersections, mapped types, conditional types, tuples, and other patterns that interfaces cannot express cleanly.
- Keep type imports separate from value imports. Do not mix them in one import statement.
- Files under `types/` and files named `*.types.ts` must export **types only** (`interface`, `type`, `enum`, type-only helpers). Put runtime constants and functions in a colocated `*.constants.ts` file or the owning module artifact (service, parser, controller).

## Strictness

- Prefer explicit correctness over best-effort fallbacks.
- Do not add "just in case" logic that guesses shapes or silently recovers from invalid states.
- If something is not as expected, throw an error or return an explicit error result instead of defaulting silently.
- Avoid patterns that hide invalid states, for example `res?.data ?? res ?? {}`, `value || {}`, or `arr ?? []` when the default is not explicitly part of the contract.
- At boundaries, parse unknown input, validate the expected shape, and throw if it does not match.

## Architecture and Design Decisions

- This is a **production** project with real users, not an MVP playground. Treat new and changed code accordingly.
- When introducing or changing behavior, **design for the best fit for this codebase first**: established patterns, clear ownership, maintainability, and correctness over speed of delivery or size of diff.
- Do **not** default to quick-and-dirty, "good enough for now", or compromise solutions when a clearly better alternative exists for this project.
- Do **not** recommend the smallest refactor, the fastest patch, or the simplest workaround **instead of** the more correct design unless the user explicitly asks for that tradeoff.
- **Do** research and propose best practices, proven patterns, and the most appropriate architecture for the task before implementation.
- **Do** propose refactoring when the current structure blocks the correct solution or would accumulate avoidable technical debt.
- Inferior or shortcut options may be listed **only after** presenting the preferred approach, **or** when the user explicitly requests alternatives. Always label them as not the best/default choice and explain why (tradeoffs, debt, limits).
- Perfection everywhere is not required, but **initial decisions should aim at the right long-term shape**; shortcuts must be conscious and explicit, not silent defaults.

## HTTP and runtime boundaries

Keep network access and server/client separation explicit. These rules protect caching, bundle boundaries, and API contract ownership.

### Where HTTP calls may live

- **Default:** app code does not call `fetch` directly.
- **Allowed `fetch` sites:**
  - API infrastructure under `src/lib/` (transport, session recovery, auth refresh);
  - auth bootstrap modules (for example Telegram sign-in exchange);
  - Next.js Route Handlers (`src/app/**/route.ts`).
- **Components, hooks, and pages** call typed endpoint modules (`*_api.ts`, `*.server.ts` loaders, or feature `_lib/` clients) — not `fetch`, not raw paths.

### Server and client imports

- Files named `*.server.ts` (or modules with `import 'server-only'`) are **server-only**. Do not import browser APIs, client env, React client hooks, or DOM globals into them.
- Client modules (`'use client'`, `*.client.ts`, hooks) must not import server-only modules — not even for types. Share shapes via colocated `*.types.ts`, `types/`, or feature `_lib/` files without `'server-only'`.
- If a module is imported from both server and client, split it: server-safe transport/wrappers on one side, browser UI/session effects on the other.

### Endpoint paths

- Do not put API path strings (`v1/...`, `/v1/...`) in components or hooks.
- Endpoint paths belong in endpoint modules next to the feature (`admin-api.ts`, `feedApi.ts`, `feed.server.ts`, etc.).
- Hooks and components call named functions (`fetchFeedPage`, `lookupGig`, `getCountries`) and receive typed results.

## File placement

- Do not add a new file when the code has a **single call site** — colocate it in the existing module (component, service, route, or parser) instead.
- Extract to a shared file only when there are **multiple consumers**, or when the boundary is already established (HTTP parsers, hooks reused across routes, module public API).
- Prefer extending an existing file in the same feature area over creating parallel one-off helpers.

## App Router colocation

Under `src/app/`, colocate code with the route it belongs to. **Shared** code lives **outside** `app/` in established top-level folders — not in `app/_components`, `app/_lib`, `app/_hooks`, or `app/_providers`.

```
src/
├── components/        # shared UI (outside app)
├── hooks/             # shared React hooks (outside app)
├── lib/               # shared non-hook logic (outside app)
├── providers/         # shared context providers (outside app)
│
└── app/
    ├── dashboard/
    │   ├── _components/   # dashboard segment only
    │   ├── _hooks/          # dashboard segment only
    │   ├── _lib/            # dashboard segment only
    │   ├── _providers/      # dashboard segment only
    │   └── page.tsx
    │
    └── page.tsx
```

- **Default:** new code lives next to its route — UI in `_components/`, React hooks in `_hooks/`, other non-UI logic (parsers, API clients, constants, reducers) in `_lib/`, context providers in `_providers/`. Keep `page.tsx`, `layout.tsx`, and other Next.js route files at the route root.
- **Hooks vs lib:** put React hooks (`use*`) in `_hooks/` (or `src/hooks/` when shared across segments). Keep `_lib/` for non-hook modules. Do not mix hooks into `_lib/` files.
- **Providers:** place React context providers in `_providers/` under the route segment they belong to. Providers reused across unrelated route segments live in `src/providers/` (outside `app/`). Do not put providers in `_components/` or `_hooks/`.
- **Provider modules:** colocate the context, provider component, and its consumer hook in **one file** under `_providers/` or `src/providers/`. Export only what callers outside the module need (typically the provider component, the hook, and public types).
- **Lift within a segment:** when a **second real consumer** appears under the same route subtree, move shared code to the nearest common route ancestor’s `_components` / `_hooks` / `_lib` / `_providers` (for example from `app/admin/gigs/_lib/` to `app/admin/_lib/`). Do not pre-extract for a single consumer.
- **Lift across segments:** when code is reused across unrelated route segments, move it out of `app/` into the appropriate top-level folder (`src/components/`, `src/hooks/`, `src/lib/`, `src/providers/`, etc.), matching existing project conventions.
- **Shared-by-nature exception:** code may live in the matching top-level folder even with one consumer when it is **domain-agnostic** — reusable UI, browser behavior, parsers, constants, or types with no route-specific or feature-specific logic. Put it in the appropriate shared folder (`src/hooks/`, `src/lib/`, `src/components/`, `src/providers/`, or a bounded subfolder such as `src/lib/telegram/`). Prefer segment colocation when the module encodes segment rules, copy, workflows, or admin-only behavior (for example admin sign-in gating, initData-expired toasts). When unsure, colocate first; lift once reuse is likely or the module is clearly generic.

## Legacy and backward compatibility

- Do not keep legacy code, aliases, fallbacks, or compatibility shims without a clear reason.
- If code remains **only** for backward compatibility, document that explicitly on the symbol: JSDoc on the function, method, class, type, or exported constant (what it supports, what callers should use instead, and when it can be removed if known).
- Prefer removing unused legacy paths over leaving them “just in case”. If retention is intentional, the doc must say **legacy** or **backward compatibility** and the reason — not an unexplained special case in implementation.
- Read-time normalization for old stored data (for example mapping missing fields to a default) belongs at the **I/O boundary** and must be documented as legacy compatibility, with a path toward explicit data or stricter validation.

## React component files

- One React component per file.
- Exception: `src/components/ui/**` shadcn primitives.
- After `const { ... } = props;`, always leave a blank line before the next statement.
- Do not add `'use client'` to an existing server component without explicit approval. Converting a server component to a client component must be agreed on first; without approval, leave the server boundary unchanged. Prefer extracting client-only logic into a new client child module instead of changing an existing component's boundary.

## React Typing Style

- Do not use `React.*` namespace types such as `React.RefObject<T>`.
- Import React types directly, for example `import type { RefObject } from 'react'`.

## Translations

- Do not use the word **copy** for UI text, labels, strings, templates, or other translatable content. Prefer **text**, **strings**, **labels**, or **content**. Reserve **copy** for clipboard actions (for example `Copy link`) and file operations (for example `Copy .env.example`).
- Translation **namespaces** and **keys** use **camelCase** identifiers.
- Namespace pattern: start with a lowercase letter, then alphanumeric; examples: `common`, `telegram`, `default`.
- Key pattern: dot-separated camelCase segments; examples: `mainGig.withLink`, `weeklyDigest.gigLine.html`, `button.approve`.
- Do not use snake_case or kebab-case in namespaces or keys (for example `main_gig_post`, `weekly-digest`).
- Post template keys name the post type without a redundant `Post` suffix (for example `mainGig`, `weeklyDigest`, not `mainGigPost`); namespace `telegram` already scopes channel post text.
- **Locale** values stay lowercase ISO 639-1 codes (for example `en`, `es`); locale is not camelCase.
- Pass namespaces to `t(namespace, key, params)` using the same camelCase spelling returned by the API.
- UI text uses `kind: text`; Telegram/post layouts with `{placeholders}` use `kind: template` under namespace `telegram`.

## Notes

- Never add `'use client'` to hooks. Hooks are not server-component entry points and should only be used from client modules that already define the client boundary when needed.
- This file is the repository-wide, tool-agnostic source of agent instructions.
- If a tool supports its own instruction format, prefer pointing it to this file instead of duplicating rules.
