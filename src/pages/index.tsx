import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const GROUPS = [
  {
    title: 'Learn Neuros',
    cards: [
      { to: '/start', title: 'Start here', text: 'What Neuros is, how to read this handbook, signing in and switching company.' },
      { to: '/glossary', title: 'Glossary', text: 'Every word Neuros uses, from offer and price list to journal and period.' },
      { to: '/features', title: 'Features end to end', text: 'Each feature followed across everyone it touches: seller, buyer, team, books.' },
    ],
  },
  {
    title: 'Guides by role',
    cards: [
      { to: '/supplier', title: 'Suppliers', text: 'You sell and hold stock, you don’t buy. Every page, in order.' },
      { to: '/distributor', title: 'Distributors', text: 'You buy, hold stock and sell on. Every page, in order.' },
      { to: '/reseller', title: 'Resellers and buyers', text: 'You buy from sellers you have accounts with. Every page, in order.' },
      { to: '/operator', title: 'Platform operator', text: 'Running Neuros itself: applications, companies, billing, support.' },
    ],
  },
  {
    title: 'Build on Neuros',
    cards: [
      { to: '/api/quickstart', title: 'API quickstart', text: 'Get a token with an API client and make your first calls in minutes.' },
      { to: '/api/reference', title: 'API reference', text: 'Every operation, area by area, generated from the engine itself.' },
      { to: '/reference', title: 'Reference', text: 'Permissions, statuses and the messages Neuros shows.' },
    ],
  },
];

export default function Home() {
  return (
    <Layout title="Neuros Handbook" description="How Neuros works, page by page, and how to build on its API">
      <header className="nh-hero">
        <p className="nh-hero__eyebrow">Neuros Handbook</p>
        <h1>How Neuros works, page by page</h1>
        <p className="nh-hero__lead">For every kind of company that trades on it, and for the systems you connect to it. Press <kbd>⌘</kbd> <kbd>K</kbd> to search.</p>
        <div className="nh-hero__actions">
          <Link className="nh-button nh-button--primary" to="/start">Start here</Link>
          <Link className="nh-button" to="/api/quickstart">API quickstart</Link>
        </div>
      </header>
      <main className="nh-home">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2>{g.title}</h2>
            <div className="nh-cards">
              {g.cards.map((c) => (
                <Link key={c.to} to={c.to} className="nh-card">
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
