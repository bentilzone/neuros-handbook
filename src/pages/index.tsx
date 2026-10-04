import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const CARDS = [
  { to: '/start', title: 'Start here', text: 'What Neuros is, how to read this handbook, signing in and switching company.' },
  { to: '/glossary', title: 'Glossary', text: 'Every word Neuros uses, from offer and price list to journal and period.' },
  { to: '/features', title: 'Features end to end', text: 'Each feature followed across everyone it touches: seller, buyer, team, books.' },
  { to: '/supplier', title: 'Suppliers', text: 'You sell and hold stock, you don’t buy. Every page, in order.' },
  { to: '/distributor', title: 'Distributors', text: 'You buy, hold stock and sell on. Every page, in order.' },
  { to: '/reseller', title: 'Resellers and buyers', text: 'You buy from sellers you have accounts with. Every page, in order.' },
  { to: '/operator', title: 'Platform operator', text: 'Running Neuros itself: applications, companies, billing, support.' },
  { to: '/reference', title: 'Reference', text: 'Permissions, statuses and the messages Neuros shows.' },
];

export default function Home() {
  return (
    <Layout title="Neuros Handbook" description="How Neuros works, page by page">
      <header className="nh-hero">
        <h1>Neuros Handbook</h1>
        <p>How Neuros works, page by page, for every kind of company that uses it.</p>
      </header>
      <main className="nh-cards">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="nh-card">
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </Link>
        ))}
      </main>
    </Layout>
  );
}
