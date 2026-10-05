# AGENTS.md — Neuros Handbook (`neuros-handbook`)

The public product handbook: what every Neuros term means, every feature end to end, and every
page of the app for each kind of company (supplier, distributor, reseller/buyer) and for the
platform operator. Docusaurus 3. Published to GitHub Pages from `main`; Amplify later.

PRs target `dev` (ADR-010). `main` is what the public reads. The agent never merges and never deploys.

- **Screenshots are generated, never hand-made.** `yarn capture` drives the real client against a
  freshly seeded engine and writes `static/shots/**` and `src/data/shots.json`. To change a picture
  or its numbered callouts, change `capture/scenarios/`, then re-run capture.
- **Public site.** Only seeded demo companies and people may appear. `yarn lint:public` fails on
  credentials, connection strings, internal hosts and personal email addresses.
- **The handbook follows the code.** A user-visible change in `neuros-client` or `neuros-engine`
  ships with a PR here: the page, its `FieldTable`, and fresh captures. Wording comes from the
  app's field descriptions and the engine's route descriptions.
- **Every app route has a page.** `handbook.manifest.json` lists each `neuros-client` route and the
  pages that document it. The client's coverage test reads a synced copy, so a new route lands
  here first: page, manifest entry, then `yarn sync:handbook` in the client.
- Read `docs/_README.md` (the authoring guide) before writing a page.

## Verify

```bash
yarn verify        # typecheck + lint:public + check:manifest + build
```
