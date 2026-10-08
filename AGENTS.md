# EasyuseUI

## UI skills — select by task

- Use [skills/README.md](./skills/README.md) to select from the visual vocabulary, foundations, patterns, states, component implementation and UI review skills. Read only the relevant `SKILL.md` and its needed references.
- Each skill distinguishes using EasyuseUI components from implementing independently. This repository defaults to reuse; external projects without EasyuseUI default to independent implementation unless the user requests adoption. Independent implementation follows the target project's stack and formal contracts, without requiring this library, Registry or local development commands.
- Skills guide execution and do not replace the design contract below. Vocabulary entries do not establish component availability; verify actual exports and installed APIs before importing.

## Design contract — read before UI work

- Read [Design-rules.md](./Design-rules.md), then [Component-Specification.md](./Component-Specification.md). The former defines principles; the latter fixes dimensions, interaction/data/runtime states and acceptance criteria for Button, Item, Tree, Activity, Session, Agent, Inspector, Chat Message, Tool Call, Badge/Tag/Chip and StyleWorkbench.
- Use [UI-VISUAL-DICTIONARY.md](./UI-VISUAL-DICTIONARY.md) to identify names and check implementation availability, [UI-PATTERNS.md](./UI-PATTERNS.md) to choose information architecture and interaction patterns, and [UI-STATES.md](./UI-STATES.md) to separate state axes and define recovery. These supplement the design contract; vocabulary entries are not promises of exported components.
- Build in order: Foundation → Primitive Components → Product Patterns → Workspace Layout → Page. Use `components/ui/` for primitives, `components/blocks/` for reusable patterns/layout, `components/examples/` for local adapters, and `app/` for pages.
- Use Compact density, a 4px spacing grid, neutral surfaces and hairline dividers. Default Button/Input height is 32px; coarse-pointer icon targets are at least 44px; tool page titles are 20px and at most 24px. Sessions, Agents, Activity and logs use Item/list/table rather than nested Cards.
- `styles/theme.css` owns shared tokens. `lib/runtime-status.ts` owns the ten runtime statuses; use `RuntimeStatusBadge` across product patterns. Keep interaction, data and runtime states separate. Unknown outcomes must not look successful.
- Implement loading / empty / partial / error / success for data regions. Preserve existing data on refresh failure. Add hover only to interactive objects, keep selection distinct from focus, and support keyboard, touch and reduced motion.
- Icon-only Button needs `aria-label`; Button provides a hover/focus tooltip. Item main and trailing actions are sibling targets, never nested buttons. A hidden navigation title needs `ariaLabel`.
- Workspace entry: `/workspace/`. Reuse Tree, SessionRow, AgentRow, ActivityTimeline, Inspector, ChatMessage/Conversation/ChatComposer and ToolCall rather than rebuilding their markup in pages. Tree supports single selection, keyboard navigation, controlled dragging and a keyboard move alternative. Runtime operations, tool execution, transport, approval authority and persistence remain caller responsibilities; local examples do not prove real service integration.
- Style workbench entry: `/style-workbench/`; read [STYLE-WORKBENCH.md](./STYLE-WORKBENCH.md) for parameter ranges, baseline/theme behavior, export and installation. Reuse `StyleWorkbench`; keep B edits scoped to its preview. Shared tokens remain in `styles/theme.css`; parameter definitions and presets live in `lib/style-workbench-model.ts`. Keep the model filename distinct from the component for Registry import rewriting.
- DataRegion owns shared data-state presentation. Inspector receives a complete controlled object snapshot; callers discard late responses by object ID. ActivityTimeline and Conversation follow new content only within 64px of the bottom. ToolCall redacts before rendering/copying/exporting, bounds previews, requires explicit approval callbacks and reconciles unknown results before another write.
- Canvas entry: `/workspace/canvas/`; see `CANVAS.md`. Use CanvasWorkspace/WorkflowCanvas/NodePalette/NodeInspector/VariablePicker and canvas commands rather than page-owned graph markup. Document/selection are controlled; `useCanvasEditor` is an optional in-memory adapter. Use CanvasExecutionPanel and useCanvasRuntime for authoritative execution snapshots; CanvasProjectWorkspace for scoped subflows; CanvasConfigEditor for structured fields; CanvasServicePanel and a retained CanvasPersistenceSession for service capabilities. Tool routes use the full-window layout; `layout="fill"` fills a parent with an explicit height, with scenario controls and bottom content initially collapsed. Keep documentation previews in `layout="preview"`. Real execution/storage/collaboration/publishing remain caller services; local fixtures do not prove them.
- Existing marketing/docs pages, `/scroll/` and `/style-workbench/` are documentation or independent previews. New agent tool pages follow the compact workspace contract; do not copy decorative preview styling or experimental parameters into product lists.

## Development and initialization

- Fresh checkout: `pnpm install --frozen-lockfile`, then `pnpm registry:build` and `pnpm dev`. This project is already initialized; do not regenerate or replace its scaffold.
- Check listeners/process ownership before starting or restarting. Development uses 3010; production browser tests use 3011. Reuse the existing project dev server when available.
- Use Webpack on this GLIBC 2.28 host; Next.js can use its WASM SWC fallback. Read installed Next.js guides before changing framework code.
- After implementation run `pnpm lint`, `pnpm typecheck`, `pnpm build`, plus browser tests for behavior changes. Run `pnpm test:install` when changing registry dependencies or portable source/CSS.

## Shared workspace and distribution

- Use ordinary filesystem and shell tools. The paused Boost MCP servers must not be called or re-enabled.
- Keep distributable components independent from the documentation site, authentication and network services.
- Add a working example, catalog entry and registry item when adding a component.
- Theme tokens live in `styles/theme.css`; the registry build extracts them from that file.
- Preserve existing work and follow the authorized Git delivery rules below.
- Use Webpack for development and builds on this GLIBC 2.28 host.
- After changes, run `pnpm lint`, `pnpm typecheck` and `pnpm build`. Run browser tests for behavior changes.
- Boost servers `boost`, `codex-skills`, and `agent-skills` are paused. Do not call, re-enable, reinstall or manually launch their bridge/daemon. Read skill files with ordinary filesystem tools. `allthecodes-bridge` is separate. Fall back promptly when an external tool is unavailable.

## Completion, commit author and push

- The user authorizes automatic commit and push after implementation is complete and all required checks pass. Use the current branch and its configured upstream, or the configured `origin` for the first push. Explicit read-only, no-commit or no-push instructions override this default; failed checks or unresolved approval requirements must not be reported as a completed delivery.
- Use the GitHub repository owner as both author and committer, verified from the configured remote and GitHub profile. Current origin is `https://github.com/Crsei/EasyuseUI.git`; owner identity is `Crsei <256245632+Crsei@users.noreply.github.com>`. Configure identity only in this repository; re-verify it if the remote owner changes.
- Authenticate using `/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/github_token.txt`. Read the token locally only for the authorized GitHub operation. Never print it, include it in command arguments or remote URLs, persist it in Git configuration, or commit it. Keep `github_token.txt`, local environments, build outputs, dependencies and test artifacts out of commits.
- Inspect status and staged changes before committing. Stage reviewed task files by explicit paths; preserve unrelated files and staged work. Do not use broad staging, reset, clean, stash, force push or history rewriting to obtain a clean state.
- Check the remote before pushing, use an ordinary push, and verify the remote branch SHA matches the delivered commit. Reconcile concurrent remote changes without overwriting them. If authentication or push fails, report the actual failure and keep the local commit available for recovery.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
