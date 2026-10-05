---
draft: true # and the leading underscore keeps it out of dev builds too
---

# Writing the handbook

This file is for authors and the dev agent; `draft: true` keeps it off the site.

- **Folder layout:** one folder per pass (`00-start`, `01-glossary`, `02-features`, then a folder per role and `90-reference`). The number sets the sidebar order.
- **Page shape:** every role-guide page follows the layout in `00-start/index.md`.
- **Screenshots:** use `<Shot id="persona/page/state" />`, where the id is a key in `src/data/shots.json`.
  - `yarn capture` writes both the PNG and that key. Never add or edit a screenshot by hand.
  - To change a picture or its numbered callouts, change the scenario in `capture/scenarios/`.
- **Forms:** use `<FieldTable fields={[…]} />`.
  - Cover every field the form shows, including what the *other party* sees and what the field locks or posts.
  - Take wording from the app's own field descriptions and the engine route descriptions, so the handbook says what the code does.
- **Videos:** use `<Video id="flow" title="…" />`, recorded by capture. Only for flows that cross parties or have many steps.
- **Who sees a page:** use `<PersonaBadge who={['distribution']} permission="stock:read" />`.
- **Routes:** `handbook.manifest.json` maps every `neuros-client` route to the pages that document it.
  - A new route in the app needs a page here and an entry there; neuros-client copies the file (`yarn sync:handbook`) and its coverage test fails on a route missing from it.
  - `yarn check:manifest` (part of `yarn verify`) fails on a listed page that does not exist.
  - Public pages (sign-in, registration, password, invitations) are shot as the `visitor` persona, which never signs in.
