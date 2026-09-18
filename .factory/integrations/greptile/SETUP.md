# Connect Greptile

The kit works locally before you connect a review service. To enable Greptile:

1. Create your account and connect the GitHub or GitLab integration. Grant access
   to the repositories you intend to review and enable them in the dashboard.
2. Allow repository indexing to finish. Check branch/author filters and review
   triggers. Draft PRs are skipped by default; configure that behavior if needed.
3. To use the included settings, copy `config.json` and `rules.md` from this folder
   into a `.greptile/` directory at the project root. If configuration already
   exists, merge the settings deliberately rather than overwriting it. This kit's
   own repository includes the configuration already.
4. Push an authorized task branch and open a PR/MR. The proposed settings request
   reviews on updates and a status check, while leaving auto-approval disabled.
5. If you need a manual review, the documented comment trigger is `@greptileai`.
   Posting that comment is an external action; use the user's existing authorization.
6. Confirm a completed review appears for the latest commit. Read inline findings
   and unresolved threads as well as the summary. Follow the bounded review skill.
7. If you want merge enforcement, configure branch protection/rulesets in your
   hosting service using the actual check name emitted by your integration. A local
   config file alone does not prevent merges.

`.factory/config.json` sets the agent's review preference and iteration limit; it
is not a Greptile config file. Changing the provider to `manual` supports another
reviewer. Keep `required_for_delivery: true` when review is a delivery requirement.
A missing Greptile account is reported as pending review, never silently bypassed.

No API key belongs in this kit. The hosted Git integration handles authentication;
authenticate any optional CLI through its supported mechanism. The factory CLI
neither installs Greptile nor calls its API. Review requests may incur account usage.

Official references, checked September 14, 2026:

- [Quickstart](https://www.greptile.com/docs/quickstart)
- [Review triggers and draft behavior](https://www.greptile.com/docs/code-review/developer-essentials)
- [Configuration fields](https://www.greptile.com/docs/code-review/greptile-config-reference)
