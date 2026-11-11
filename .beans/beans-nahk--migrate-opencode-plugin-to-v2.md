---
# beans-nahk
title: Migrate OpenCode plugin to v2
status: completed
type: task
priority: normal
created_at: 2026-11-11T03:36:39Z
updated_at: 2026-11-11T05:05:07Z
---

Port Beans Prime plugin and setup instructions to OpenCode v2; verify context injection and graceful fallback.

## Summary of Changes

Ported the Beans Prime plugin and installation instructions to OpenCode v2. Verified hook behavior and confirmed the plugin is active in this workspace.

Added a copyable global installation prompt and clarified global plugin activation and reload behavior.

## Review follow-up

Fix nested-location detection, verify real context and compaction hooks, and clarify the install source.

## Review Follow-up Summary

Removed the exact-location config guard so beans prime finds parent configs; added nested and empty-output test cases (later revised; see Code Review Fixes). Verified context and successful compaction requests against an isolated real OpenCode server and local fake provider, including a post-compaction request. Clarified the global install prompt with the origin URL and an unpublished-revision fallback.

## Code Review Fixes

- Added a 10s timeout to `beans prime` so a hung CLI can't stall plugin loading.
- Only a missing `beans` binary (ENOENT) is silent; other failures log via `console.error`.
- Test: fake `beans` prints `pwd` to prove the cwd is passed; dropped the redundant `.beans.yml` step; added a non-zero-exit case.
- Wired the bun test into `mise test` (`test:opencode` task, `bun` in mise tools) and CI (`oven-sh/setup-bun`).
- README: install prompt points at hmans/beans; note that this repo already ships a project-local copy.
- Kept separate `context` and `compaction` hooks: v2 types dispatch them as distinct per-request-kind events.
