# CLAUDE.md

@AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Vue 3 + TypeScript + Vite admin system (Element Plus, Pinia, Vue Router, Axios, Sass). All UI copy, comments, and labels are in Chinese — do not rewrite or reword existing Chinese text unless the task requires it; when editing Chinese text ensure the file is saved as UTF-8.

The authoritative project rules live in `AGENTS.md` and `.codex/rules/` (read them before business changes):
- `.codex/rules/UTILS_INDEX.md` — shared components, hooks, form helpers, request/API conventions. **Check this before writing any business logic; never hand-roll a duplicate of an existing abstraction.**
- `.codex/rules/CRUD_GUIDE.md` — CRUD page composition, dialog forms, skeleton generator.
- `.codex/rules/COMPONENTS_GUIDE.md` — shared component inventory, props, reuse rules, and the "do not recombine raw `el-*` components" constraint.
- `.codex/rules/TECH_STACK.md` — stack, directory layout, TSX notes, style, commands.
- `.codex/maps/` — per-business-domain page/API/type/route maps.

Do NOT scan, reference, or modify `.codex`, `.agents`, `node_modules`, `dist`, or nested `.git` unless a task explicitly requires it.

## Commands (pnpm)

- `pnpm dev` — dev server on port **8080** (proxy `/api` → `VITE_APP_BASE_URL`).
- `pnpm build` — `vue-tsc -b` then `vite build`.
- `pnpm lint` / `pnpm lint:fix` — ESLint (`.vue`, `.ts`, `.js`).
- `pnpm format` — Prettier over the whole tree.
- `pnpm page:create` — interactive CRUD page skeleton generator (types + API + page; run from `script/page-gen`, see its `README.md` for flags).

Type-only check (TS 6): `.\node_modules\.bin\vue-tsc.cmd --noEmit --ignoreDeprecations 6.0`. After changes, run `pnpm lint` and the type check; run `pnpm build` when touching build output, routing, global components, or Vite config.

Path alias `@` → `src`. Style is Prettier-managed: no semicolons, single quotes, `printWidth 80`, no trailing commas, `arrowParens: 'avoid'`.

## Architecture

### Shared global response types
`src/global.d.ts` declares ambient types used everywhere: `BaseResponse`, `DataResponse<T>`, `ListResponse<T>` (rows/total), `PaginationParams`, `ListQuery<T>`, `CommonTableData`. Do not redefine these.

### Request layer
- `src/utils/request` (`SCRequest` axios wrapper). Import `request` from `@/utils/request`. Responses are auto-unwrapped by the global interceptor (`src/utils/request/interceptors.ts`): successful calls resolve to the `data` payload; non-200 codes are surfaced via `handleBusinessError`.
- List endpoints use the `createListAPI<SearchParams, Data>(url)` factory from `@/utils/pageRequest.ts`.
- **subjectId injection**: when inside a project-process scope (see below), the global request interceptor automatically appends `subjectId` to `params` (GET) or `data` (POST/PUT/DELETE, incl. FormData). A single request can opt out with `needSubjectId: false` in its config.
- Delete shape follows the existing domain convention (typically `POST {baseUrl}/delete`); match the surrounding domain's API file.

### Routing — static + backend-driven dynamic
- `src/router/modules/staticRoutes.ts` is the sole source of static routes. Most business menus are returned by the backend and converted to dynamic routes in `src/store/modules/router-store.ts` (`getRouters` → `filterAsyncRoutes` → `router.addRoute`). Do not infer a page is routed just because its directory exists.
- The `projectProcess` static route is an empty `Layout` parent; process pages are mounted onto it at runtime via `mountProcessRoutes` / removed via `removeProcessRoutes`.

### Project-process scope (distinctive feature)
`src/hooks/useProjectProcessScope.ts` + `src/store/modules/router-store.ts` + `src/store/modules/scope-store.ts` implement an enter/switch/leave scope where a user enters a specific project:
- Enter (`/projectProcess`-prefixed path): snapshots current roles/permissions/sidebar, sets `PROCESS_PROJECT_ID_KEY` in sessionStorage, refreshes user info + mounts that project's menu routes.
- Switch project: replaces project id, permissions, and process routes without stacking a new snapshot.
- Leave: restores the snapshot, clears `PROCESS_PROJECT_ID_KEY`, unmounts process routes, cleans process tab views, and redirects back to the source page.
- `getProjectIdFromRoute` reads `query.projectId` first, then falls back to `PROCESS_PROJECT_ID_KEY`.
- The router guard `src/utils/routerInterceptor.ts` drives all of this from `beforeEach`.

### CRUD pages
Standard pages compose shared components — do not hand-write search bars, tables, pagination, dialogs, delete confirmation, or refresh logic:
- `ScResourcePage` (`src/components/ScBaseComponents/ScResourcePage`): search bar, action bar, table, pagination, columns, operate column, export. Configured via `PageConfig<T>` (needs `searchConfig.searchbarItems`, `tableConfig.tableColumns`, `fetchData`). Refresh via `ref` → `refresh()`.
- `ScDialogForm`: add/edit dialog wrapping `ScDialog` + `ScBaseForm` + validation; submits via `confirm` event (there is no `success` event — refresh from `useDialogForm`'s `onSuccess`).
- `useDialogForm` (`src/hooks/useDialogForm.ts`) / `useDeleteAction` (`src/hooks/useDeleteAction.ts`): dialog state/submit and delete-confirm+refresh.
- Form items must be declared with `defineFormItems<FormData>()` from `@/utils/form.ts`; field `prop` must match the `FormData` type. Dictionary-backed fields use `dictField`; complex fields use `customSlot` with `custom-${slot}` slots.
- Supported form item types: `input`, `select`, `date`, `dateRange`, `radio`, `checkbox`, `switch`, `treeSelect`, `tree`, `customSlot`.

### Shared component constraint
When a project component covers a need, it is forbidden to recombine the corresponding raw Element Plus `el-*` components in business pages (e.g. `ScButton` over `el-button`, `ScDialog` over `el-dialog`, `ScTable`/`ScResourcePage` over `el-table`, `ScSelect` over `el-select`, `ScDatePicker` over `el-date-picker`). See `.codex/rules/COMPONENTS_GUIDE.md` for the full inventory and `ScBaseUpload`/`useUploadDialog` for file import.

### Auto-import / component registration
`vite/plugins/auto-import.ts` and `vite/plugins/components.ts` auto-import `vue`/`vue-router`/`pinia` and auto-register components, generating `src/auto-import.d.ts` and `src/components.d.ts`. Do not edit those generated files manually. `.vue` templates may rely on auto-registration; `.tsx`/`.jsx` must explicitly import local components (use `h()` for events with colons, e.g. `'onUpdate:modelValue'`).

### Module layout convention
New business modules must keep domain subdirectories consistent across `src/api`, `src/types`, and `src/views` (e.g. `src/api/adminManagement/foo-api.ts`, `src/types/adminManagement/foo.d.ts`, `src/views/adminManagement/foo/index.vue`). Update the matching `.codex/maps/<module>-map.md` when adding/removing module pages rather than rewriting `PROJECT_MAP.md`.
