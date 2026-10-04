// The Neuros Handbook. Where it is served comes from the environment, so the same build runs on
// GitHub Pages now (https://bentilzone.github.io/neuros-handbook/) and on Amplify at
// handbook.<domain> later: HANDBOOK_URL + HANDBOOK_BASE_URL.
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const url = process.env.HANDBOOK_URL ?? 'https://bentilzone.github.io';
const baseUrl = process.env.HANDBOOK_BASE_URL ?? '/neuros-handbook/';

const config: Config = {
  title: 'Neuros Handbook',
  tagline: 'How Neuros works, page by page, for every kind of company that uses it',
  favicon: 'img/logo.svg',
  future: { v4: true },
  url,
  baseUrl,
  organizationName: 'bentilzone',
  projectName: 'neuros-handbook',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw' } },
  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: { routeBasePath: '/', sidebarPath: './sidebars.ts', showLastUpdateTime: true },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, docsRouteBasePath: '/', indexBlog: false, highlightSearchTermsOnTargetPage: true, explicitSearchResultPath: true },
    ],
  ],

  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'Neuros Handbook',
      logo: { alt: 'Neuros', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'handbook', position: 'left', label: 'Handbook' },
        { to: '/glossary', label: 'Glossary', position: 'left' },
        { to: '/features', label: 'Features', position: 'left' },
        { type: 'dropdown', label: 'Guides by role', position: 'left', items: [
          { to: '/supplier', label: 'Suppliers' },
          { to: '/distributor', label: 'Distributors' },
          { to: '/reseller', label: 'Resellers and buyers' },
          { to: '/operator', label: 'Platform operator' },
        ] },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} Bentilzone Labs. Screens show demo companies only.`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
