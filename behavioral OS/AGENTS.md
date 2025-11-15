# Repository Guidelines

## Project Structure & Module Organization
DocQuest backend code lives in `src/`. Keep HTTP handling in `routes/`, controller logic in `controllers/`, validation in `validators/`, and shared helpers in `utils/`. The compiled output in `dist/` is disposable—never edit it directly. Environment configuration comes from the repository-level `.env`; record new keys in `COMPREHENSIVE_DOCUMENTATION.md` and keep secrets out of version control.

## Build, Test, and Development Commands
- `npm install` once per clone to sync dependencies.
- `npm run dev` starts the Express + Socket.IO server with Node’s watch mode, loading env vars via `--env-file=../.env`.
- `npm run build` compiles TypeScript to `dist/`.
- `npm start` runs the compiled bundle.
- `npx tsc --noEmit` is the quickest way to catch type regressions before committing.

## Coding Style & Naming Conventions
Use two-space indentation, single quotes, trailing commas in multiline literals, and TypeScript ES module syntax. Keep filenames lowercase; use hyphens only where the codebase already does (`redis-student-app.ts`). Mirror route names across controllers and validators. Surface shared constants through helpers in `src/utils/` instead of scattering magic values.

## Testing Guidelines
Target Jest + Supertest for HTTP coverage. Place specs alongside code under `src/**/__tests__/` using the `<feature>.spec.ts` naming pattern. Aim for meaningful integration coverage on each new route and focused unit checks for validators. Until the Jest harness lands, call out manual test steps in your updates.

## Collaboration & Entropy Expectations
- Simplify: every change should reduce complexity or duplication.
- Preserve boundaries: keep controllers thin, validators strict, and utilities reusable.
- Be consistent: follow existing naming, error handling, and dependency flows.
- Self-check: run the entropy checklist before final output and rerun it if new files, dependency shifts, or structural fixes appear mid-task.
- Log debt: when you see duplicate validators or stale helpers, note them in your response instead of silently ignoring them.
- Infrastructure: if Redis, Postgres, or other services are unavailable, stub safely in development but stop and report for CI or production.
- Encoding: strip BOMs or odd encodings from config files before handing code back.

## Introspection Workflow
Scan the repo before editing: identify related modules, shared utilities, and existing patterns you can reuse. Map the dependencies that rely on each file you touch, and capture your findings as part of the reasoning trail. Summarize what you reused, which files you referenced, and any new abstractions you introduced. Temporary environment tweaks (such as clearing a local Redis password) are allowed when documented and reverted. If context is unclear or critical modules are missing, pause and ask for guidance instead of guessing.

## Additional Resources
Detailed metrics, compliance checklists, and the learning-corpus process now live in `AGENTS-APPENDIX.md`. That appendix defines the quantified entropy calculations, mandatory compliance report format, and pattern-tracking workflow that must accompany substantive code changes.
