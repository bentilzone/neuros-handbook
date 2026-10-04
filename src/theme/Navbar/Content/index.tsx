// The handbook's navbar, in two rows: the brand, a wide search and the right-hand links on top,
// and the left-hand items (one tab per sidebar) underneath. Below the desktop breakpoint it falls
// back to Docusaurus' own layout: brand, search and the menu toggle that opens every item.
import type { ReactNode } from 'react';
import { ErrorCauseBoundary, useThemeConfig } from '@docusaurus/theme-common';
import { splitNavbarItems, useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import NavbarItem, { type Props as NavbarItemConfig } from '@theme/NavbarItem';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import SearchBar from '@theme/SearchBar';
import ThemeMenu from '@site/src/components/ThemeMenu';

function Items({ items }: { items: NavbarItemConfig[] }): ReactNode {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary key={i} onError={(error) => new Error(`A navbar item failed to render: ${JSON.stringify(item)}`, { cause: error })}>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

export default function NavbarContent(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useThemeConfig().navbar.items as NavbarItemConfig[];
  const [tabs, links] = splitNavbarItems(items);
  return (
    <div className="nh-nav">
      <div className="navbar__inner nh-nav__top">
        <div className="navbar__items nh-nav__brand">
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
        </div>
        <div className="nh-nav__search">
          <NavbarSearch>
            <SearchBar />
          </NavbarSearch>
        </div>
        <div className="navbar__items navbar__items--right nh-nav__links">
          <Items items={links} />
          <ThemeMenu />
        </div>
      </div>
      <div className="navbar__items nh-nav__tabs">
        <Items items={tabs} />
      </div>
    </div>
  );
}
