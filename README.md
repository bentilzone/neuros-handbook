# Neuros Handbook

How Neuros works, page by page, for every kind of company that uses it.

```bash
yarn install
yarn start           # http://localhost:3000/neuros-handbook/
yarn verify          # typecheck + lint:public + build
```

Published from `main` to GitHub Pages; the same build moves to AWS Amplify at `handbook.<domain>`
later (`amplify.yml`). See `AGENTS.md` for the rules and `docs/README.md` for how to write a page.
