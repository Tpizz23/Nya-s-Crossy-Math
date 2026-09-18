# Software factory review context

Review correctness against the task's acceptance criteria and project conventions.
Prioritize concrete bugs, regression risk and data handling errors over cosmetic
preferences. Explain the failing scenario and suggest the smallest appropriate fix.

Check that verification claims refer to actual evidence and the delivered revision.
Do not treat a passing command, summary or reviewer score as complete runtime proof.
Do not require a service layer where the existing architecture does not need one.

For the factory utilities, scrutinize preservation of existing files, worktree
isolation, argument handling, failure exit codes, timeouts and stale evidence.
