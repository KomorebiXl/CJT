# CJT Admin Console

The web admin console of the CJT software testing and risk assessment management platform. It covers the full testing service workflow — contracts, projects, per-project testing processes (plan guidelines, test plans, initial and regression testing, penetration and port testing, baseline checks, reports, and archives) — along with data statistics and platform administration.

This repository is the frontend. It is built as a Vue 3 single-page application and talks to the backend service through a configurable API base path.

## Tech Stack

| Category | Choice |
| --- | --- |
| Framework | Vue 3 (`<script setup>` SFCs, TSX support) |
| Language | TypeScript |
| Build tool | Vite |
| UI library | Element Plus |
| Routing | Vue Router |
| State management | Pinia (with persisted state) |
| HTTP client | Axios (wrapper in `src/utils/request`) |
| Charts | ECharts |
| Styling | Sass |
| Quality | ESLint + Prettier, vue-tsc, Husky + Commitlint |

Auto-import is enabled via `unplugin-auto-import` (Vue, Vue Router, Pinia APIs) and `unplugin-vue-components` (Element Plus components). The generated declaration files `src/auto-import.d.ts` and `src/components.d.ts` must not be edited by hand.

## Getting Started

### Prerequisites

- Node.js ≥ 20 (22.x recommended)
- pnpm

### Install and Run

```bash
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:8080` and opens the browser automatically. Requests to `/api` are proxied to `VITE_APP_BASE_URL` with the `/api` prefix stripped.

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (port 8080) |
| `pnpm build` | Type-check with `vue-tsc -b`, then build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint on `.vue`, `.ts`, `.js` files |
| `pnpm lint:fix` | Run ESLint and auto-fix issues |
| `pnpm format` | Format the codebase with Prettier |
| `pnpm page:create` | Scaffold a new CRUD page via the generator in `script/page-gen` |
| `pnpm commit` | Interactive Conventional Commits prompt (Commitizen) |

## Environment Configuration

Environment files: `.env.development`, `.env.production`.

| Variable | Scope | Description |
| --- | --- | --- |
| `VITE_APP_TITLE` | all | Browser tab / page title |
| `VITE_APP_ENV` | all | Environment name (`development` / `production`) |
| `VITE_APP_BASE_API` | all | Base path for API requests (`/api` in dev, `/ras-prod-api` in prod) |
| `VITE_APP_BASE_URL` | dev | Backend origin the dev proxy forwards `/api` requests to |
| `VITE_OUT_DIR` | prod | Build output directory and base path (`risk_assess_web`) |
| `VITE_BUILD_COMPRESS` | prod | Enable gzip compression of build assets |

The production build is emitted to `risk_assess_web/` with static assets organized under `static/js`, `static/css`, etc. Vendor code is split into dedicated chunks (`vue`, `echarts`, `vendor`).

## Project Structure

```text
├── script/page-gen        # CRUD page scaffold generator
├── vite/                  # Vite plugin setup (auto-import, components, svg, compression)
├── src/
│   ├── api/               # API modules, one file per domain (xxx-api.ts)
│   ├── assets/            # Static assets
│   ├── components/        # Shared UI components (Sc* family)
│   ├── constant/          # App-wide constants
│   ├── hooks/             # Composables
│   ├── layout/            # Admin layout and navigation
│   ├── plugins/           # App-level plugins
│   ├── router/modules/    # Static routes and dynamic route assembly
│   ├── store/modules/     # Pinia stores
│   ├── styles/            # Global styles and variables
│   ├── types/             # Business type declarations
│   ├── utils/             # Request, form, tree, file, and validation utilities
│   └── views/             # Business pages
└── vite.config.ts
```

The path alias `@` points to `src`. Within each business domain, `api`, `types`, and `views` directories mirror each other (e.g. `src/api/system/foo-api.ts`, `src/types/system/foo.d.ts`, `src/views/system/foo/index.vue`).

## Business Modules

| Module | Directory | Scope |
| --- | --- | --- |
| System management | `src/views/system` | Platform administration: menus, permissions, configuration |
| System monitor | `src/views/systemMonitor` | Runtime monitoring views |
| Back-office management | `src/views/adminManagement` | Back-office administration, incl. tools sub-domain |
| System tools | `src/views/systemTools` | Operational tooling |
| Contract management | `src/views/contractManagement` | Contracts and signing-unit library |
| Project management | `src/views/projectManagement` | Testing projects and their lifecycle |
| Project process | `src/views/projectProcess` | Per-project testing workspace: plan guidelines, test plans, initial and regression testing, penetration/port testing, baseline checks, reports, archives |
| Data statistics | `src/views/dataStatistics` | Statistics and dashboards |
| User profile | `src/views/userInfo` | Personal profile and password |

Business menus and most pages are served by the backend and assembled into dynamic routes at runtime; `src/router/modules/staticRoutes.ts` only holds the static shell.

## Development Conventions

- **Reuse first.** CRUD pages are composed from `ScResourcePage`, `ScDialogForm`, and `ScBaseForm` instead of being hand-rolled. Check the shared component and hook inventory before writing new utilities. `pnpm page:create` scaffolds a page from these building blocks.
- **Commits.** Commit messages follow Conventional Commits (`type(scope?): subject`), enforced by Commitlint via Husky. Use `pnpm commit` for the interactive prompt. The `pre-push` hook runs a full `vue-tsc -b` type check.
- **Checks before handing off.** Run `pnpm lint` and a `vue-tsc` type check after changes; run `pnpm build` when build output, routing, global components, or Vite config are affected.
- **Generated files.** Do not manually edit `src/auto-import.d.ts` or `src/components.d.ts`.

## Further Documentation

- [`AGENTS.md`](./AGENTS.md) — development rules and agent guidelines for this repository
- [`PROJECT_MAP.md`](./PROJECT_MAP.md) — top-level project navigation map and module index
