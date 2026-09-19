---
name: factory-intake
description: Turn a software change request into a scoped task with acceptance criteria and a plan, or resume an existing factory task.
---

Read project instructions and `.factory/config.json` from the repository root.
For an existing task, read its task and review records and compare with live Git
state before continuing. Preserve explicit user decisions across harness changes.

For a new task:

1. Inspect the affected code and current changes. Determine whether the request is
   a bug, feature, refactor or investigation. Ask only material missing questions.
2. Choose a short lowercase task ID. Run `python3 .factory/bin/factory.py task
   <id> --title "<outcome>"` and edit `.factory/tasks/<id>/task.md`.
3. Write observable acceptance criteria and exclusions. For a bug, include an
   input and incorrect output; for a feature, include success and failure behavior.
4. Plan the smallest coherent change using existing architecture. Identify checks,
   environment requirements and shared-resource conflicts before implementation.
5. Record meaningful decisions and the next action. Continue within the user's
   authorized scope; do not add a mandatory approval meeting for routine choices.

Output: a task record another model can execute without this conversation.
