// The Neuros Handbook. Where it is served comes from the environment, so the same build runs on
// GitHub Pages now (https://bentilzone.github.io/neuros-handbook/) and on Amplify at
// handbook.<domain> later: HANDBOOK_URL + HANDBOOK_BASE_URL.
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const url = process.env.HANDBOOK_URL ?? 'https://bentilzone.github.io';
const baseUrl = process.env.HANDBOOK_BASE_URL ?? '/neuros-handbook/';
// The production API's address, once it has one. Unset, the API pages show a placeholder.
const apiUrl = process.env.HANDBOOK_API_URL ?? '';

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
  customFields: { apiUrl },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          // A section's index page is its category link (sidebars.ts), so not also one of its pages.
          sidebarItemsGenerator: async ({ defaultSidebarItemsGenerator, ...args }) =>
            (await defaultSidebarItemsGenerator(args)).filter((i) => !(i.type === 'doc' && /(^|\/)index$/.test(i.id))),
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarShortcutHint: true,
        searchResultLimits: 10,
        searchResultContextMaxLength: 60,
      },
    ],
  ],

  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    docs: { sidebar: { hideable: false, autoCollapseCategories: false } },
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    // Two rows (src/theme/Navbar/Content): the brand, search and the right-hand links on top; the
    // left-hand items below as tabs, one per sidebar.
    navbar: {
      title: 'Handbook',
      logo: { alt: 'Neuros', src: 'img/logo.svg' },
      hideOnScroll: false,
      items: [
        { type: 'docSidebar', sidebarId: 'overview', position: 'left', label: 'Overview' },
        { type: 'docSidebar', sidebarId: 'guides', position: 'left', label: 'Guides' },
        { type: 'docSidebar', sidebarId: 'api', position: 'left', label: 'API' },
        { type: 'docSidebar', sidebarId: 'reference', position: 'left', label: 'Reference' },
        { href: 'https://github.com/bentilzone', label: 'GitHub', position: 'right' },
        { to: '/api/quickstart', label: 'API quickstart', position: 'right' },
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
