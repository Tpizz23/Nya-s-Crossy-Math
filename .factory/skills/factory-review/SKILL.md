---
name: factory-review
description: Process code review findings in a bounded loop and record review coverage for the current revision, using Greptile or another reviewer.
---

Read `.factory/config.json` review settings and the task's `review.md`. The settings
are instructions for the agent; the CLI does not contact a reviewer or enforce a
remote review gate. Greptile setup is documented in
`.factory/integrations/greptile/SETUP.md`.

Use the configured reviewer. With Greptile, first confirm the repository is
connected and the PR is eligible for review. Existing user authorization governs
pushing and posting review requests. Record the exact commit, review URL, iteration
and status in review.md. An unavailable service or missing review is not approval.

For at most `review.max_iterations` cycles (default 3):

1. Read the complete review for the current revision, including inline findings
   and unresolved discussion threads. Verify which commit was reviewed.
2. Triage findings against actual code and requirements. Fix valid issues; record
   evidence for findings that do not apply. Never blindly optimize for a score.
3. Run affected checks and the project's required verification after edits.
4. Submit the updated revision for review only within existing authorization.
   Wait for a new completed review; do not reuse an earlier revision's result.

Stop sooner on authentication/indexing errors, repeated unchanged findings, no
progress or a decision needing the user. Record the blocker instead of starting an
unbounded polling or repair loop. A harness without waiting or networking support
can hand off the pending review to another operator.

Finish when actionable findings are resolved, the current revision has been
reviewed and project review requirements are met. If review is required but cannot
be obtained, label delivery pending review. Scores are supporting signals, never
proof that acceptance criteria are met. No automatic merge.
