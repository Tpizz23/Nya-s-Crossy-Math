# Review: crossy-3d

Status: pending external review
Provider/reviewer: Greptile (configured), local self-review performed by Codex
Base commit: c00b808c555d20d50e1fb00d31d2d2f7afcbd837
Review URL: none
Iteration: 0 external review cycles

## Local findings and resolution
- Original forward movement could repeatedly score the same ground. Fixed with furthest-row scoring; backtracking regression test passes.
- Original river drift was separate from keyboard column state. New model uses one position and carries the player with the log; drift and missed-log tests pass.
- New lowered river surface initially overlapped the terrain base, causing visible z-fighting. Lowered the river's base; recheck final screenshots.
- Desktop title initially wrapped into three lines and crowded lower controls. Adjusted title width/scale; mobile help spacing adjusted after screenshot review.
- Runtime CDN dependency removed: Three.js is pinned and vendored with its license. Browser test rejects external runtime requests.
- Invalid legacy preferences could break character lookup or math generation. Added save validation preserving legitimate existing progression.

## Completion
No Greptile tool is available. GitHub CLI is authenticated; read-only inspection found no open PRs. This branch has not been pushed and no PR has been opened, so there is no current-revision Greptile review. Local self-review and passing tests are not a substitute for required external review. Before publishing, obtain authorization to push the task branch and open a PR; confirm the repository is enabled in Greptile and review the resulting current-commit findings. No deployment or merge performed.
