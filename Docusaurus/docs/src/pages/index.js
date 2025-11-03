import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
          <div style={{
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '1rem',
            boxShadow: '0 4px 24px rgba(67,233,123,0.15)',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            color: '#222',
            fontWeight: 500
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>API Reference</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Explore all backend endpoints, request/response formats, and usage examples for the 3DDX Auth app.
            </p>
            <Link
              className="button button--primary button--lg"
              to="/docs/api">
              View API Docs
            </Link>
          </div>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
