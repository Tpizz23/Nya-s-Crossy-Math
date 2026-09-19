---
name: factory-verify
description: Validate an implemented change against acceptance criteria and capture reproducible local test and runtime evidence.
---

Input: the task record, current code and `.factory/config.json`.

Configure real project checks as command argument arrays before running
`python3 .factory/bin/factory.py verify <id>`. Commands run at the project root,
inherit the environment and have individual timeouts. Empty checks are a setup
error. Do not replace failed checks with trivial commands to obtain a green result.
Formatting or generation commands that change tracked code must run before the
verification pass. If checks change the code snapshot, verification fails.

Inspect the generated `evidence/<run-id>/results.json` and logs. Each run is kept
separately. Link the run from task.md and map each acceptance criterion to evidence.
For UI changes, exercise the relevant flow using available browser/computer tools
and capture before/after screenshots or video. For backend or CLI changes, record
representative requests, responses, output pairs or measurements. Include failure
paths that materially affect the requested behavior.

Snapshots cover HEAD, Git-visible code and configuration, excluding task records
and ignored files. They do not fingerprint dependency environments, databases,
secrets or remote services. Record versions and external prerequisites in task.md.
If those inputs change, repeat the affected checks even when the snapshot matches.

Never call a test passed without observing its exit status. Distinguish automated
checks, manual verification and unavailable checks. Do not publish raw logs by
default. If a check fails, diagnose the cause and rerun after the fix.

Output: acceptance evidence plus passing checks for the revision to be reviewed,
or a precise failure/blocker record.
