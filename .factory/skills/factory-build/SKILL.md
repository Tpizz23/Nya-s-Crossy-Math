---
name: factory-build
description: Implement a planned software change with isolated work, focused architecture and regression coverage.
---

Input: `.factory/tasks/<id>/task.md`, project instructions and current Git state.

Use an existing task worktree when the harness has supplied one. Otherwise use
`python3 .factory/bin/factory.py worktree <id> --destination .worktrees/<id>`.
The command resolves `base_ref` locally; it does not fetch. If the project uses a
remote base, fetch through the normal authorized Git workflow first. Inspect base
freshness and dirty changes. Do not assume uncommitted code follows into a worktree.
Native harness worktree tools may replace this utility. In an unborn repository,
create an agreed baseline first or continue in the user-selected initial checkout.

Reproduce bugs before fixing them and add a regression test when practical. For
new behavior, test externally observable results, including relevant failures.
Capture baseline runtime evidence before it disappears. Keep changes limited to
acceptance criteria and necessary supporting work.

Follow the project's architecture. Where workflows repeat operational mechanics,
extract a focused service with explicit inputs and returns; keep orchestration at
boundaries. Do not force a service layer onto simple scripts or an incompatible
architecture. Avoid unrelated refactoring and new dependencies without a reason.

Keep ports, databases and other mutable resources task-specific. Run the focused
checks during development, then hand off to the verification skill. Update the
task record with changed files, decisions and outstanding work.

Output: scoped implementation and meaningful checks, ready for verification.
