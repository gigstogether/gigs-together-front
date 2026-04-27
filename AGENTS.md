# AGENTS

This file contains repository-wide guidance for AI coding agents and human contributors.

## Scope

Apply these rules to the whole repository unless a more specific instruction exists closer to the relevant files.

## Code Style

- Prefer explicit, strict typing. Keep types narrow and avoid widening to `string | number | ...` when the domain is known.
- Comments must be in English using the Latin alphabet only. Do not write comments in Cyrillic.
- For numeric constants in seconds or milliseconds (for example `604_800`, `86_400`), add a short comment with human-readable equivalents (at least days or hours, and minutes when useful).
- Boolean variables and flags should preferably start with `is`/`has`/`can`, for example `isActive`, `isAdmin`, `isValid`.
- Always create new files with `LF` line endings (not `CRLF`). Prefer editor or Git settings that default new files to `LF`.
- Keep line endings as `LF` in tracked files. If you hit formatter errors caused by `CRLF`, convert the file to `LF` and reformat.

## Execution Rules

- Do not run `build`, `dev`, or start watchers or servers unless the user explicitly asks.
- If command execution is needed to validate a change, ask first instead of running it proactively.
- After source code changes (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.json`), run `npm run lint:fix` before finishing the task.
- Do not run lint after documentation-only changes (for example `*.md`).

## Testing Rules

- Use Vitest for unit and integration tests in this repository.
- Write tests for all new code.
- Name test files as `*.test.ts` and colocate them near the module under test when practical.
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

- Avoid type assertions with `as` as much as possible.
- Prefer type guards, narrowing, and better source types instead of `as`.
- Prefer `satisfies` for validating object shapes without changing inferred types.
- Prefer parsing and validation at boundaries such as HTTP, env, storage, and third-party SDKs so the rest of the code stays strongly typed.
- Avoid `as any` entirely.

- Prefer `readonly` where immutability is appropriate, especially for DTOs, config objects, and constants.

- Prefer named types for public APIs such as service methods, controller responses, and module exports.
- Do not use inline object types in public signatures such as `Promise<{ ... }>` or `foo(arg: { ... })`.
- Extract object shapes into a named `interface` or `type`, ideally colocated in `types/requests/*` for DTOs.

- Prefer `interface` over `type` for object shapes unless `type` is clearly the better fit.
- Use `type` for unions, intersections, mapped types, conditional types, tuples, and other patterns that interfaces cannot express cleanly.
- Keep type imports separate from value imports. Do not mix them in one import statement.

## Strictness

- Prefer explicit correctness over best-effort fallbacks.
- Do not add "just in case" logic that guesses shapes or silently recovers from invalid states.
- If something is not as expected, throw an error or return an explicit error result instead of defaulting silently.
- Avoid patterns that hide invalid states, for example `res?.data ?? res ?? {}`, `value || {}`, or `arr ?? []` when the default is not explicitly part of the contract.
- At boundaries, parse unknown input, validate the expected shape, and throw if it does not match.

## React Typing Style

- Do not use `React.*` namespace types such as `React.RefObject<T>`.
- Import React types directly, for example `import type { RefObject } from 'react'`.

## Notes

- `'use client'` is not needed for every hook or component by default. Use it only in files that declare a client boundary.
- A client boundary is a module that may be imported directly by a Server Component and therefore must explicitly opt into client-side execution. Files that are only imported from other client modules usually do not need their own `'use client'` directive.
- This file is the repository-wide, tool-agnostic source of agent instructions.
- If a tool supports its own instruction format, prefer pointing it to this file instead of duplicating rules.
