---
name: factory-handoff
description: Prepare an evidence-backed delivery summary or preserve enough task state for another model or harness to continue.
---

Before switching harnesses, update `.factory/tasks/<id>/task.md` with the exact
branch, commit, checkout path, uncommitted changes, completed steps, next command,
resource ownership, blockers and important decisions. Store credentials outside
task records. Keep task.md and review.md in Git when appropriate so they travel
with the branch; ignored evidence needs a separately authorized transfer.

For delivery, run `python3 .factory/bin/factory.py packet <id>` from the tested
checkout. It generates a local draft summary and flags stale or failed evidence.
It does not validate review completion or declare the task mergeable. Inspect
review.md, acceptance criteria and the final diff yourself.

Prepare a PR/MR body explaining behavior, validation, before/after evidence and
material limitations. Use project templates where present, or `.factory/templates/pull-request.md`. Submit only within the
user's authorization. Keep local paths out of a remote PR body; attach evidence to
an authorized destination and link the accessible artifacts instead.

If review, runtime validation or delivery is pending, say exactly what remains.
If ready, give the user the result and how it was verified. Retain the worktree
until the project's cleanup conditions and authorization are satisfied.
