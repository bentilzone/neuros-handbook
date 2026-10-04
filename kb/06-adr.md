# Decisions — neuros-handbook

## H-001 — A separate repo, generated screenshots, a public site

**Status:** Accepted (2026-10-04)

### Context

Neuros needs a handbook covering every term, every feature and every page for each kind of
company, and it must not go stale as the app changes.

### Decision

- **Its own repo,** `neuros-handbook`, built with Docusaurus 3: React and MDX, the same stack as the client.
- **Generated screenshots and videos.** Playwright drives the real client against a freshly seeded engine, and callouts are drawn on the page at capture time.
- **Hosting:** GitHub Pages now, AWS Amplify at `handbook.<domain>` later.
- **One public site** covering the customer personas and the platform operator, by the owner's choice.

### Consequences

- **Keeping it current:** `neuros-client` gains a coverage test (every visible route has a handbook page) and a merge dispatch that re-runs capture here. Both repos' AGENTS, CLAUDE and kb say a user-visible change ships with a handbook PR.
- **Publishability:** only demo data may appear, and `lint:public` refuses credentials and internal hosts.
- **Operator section:** it publishes operator procedures; nothing secret belongs in it.
