// VitePress main config for professional docs experience

module.exports = {
  title: 'InsightHub Docs',
  description: 'Enterprise authentication & authorization platform documentation',
  themeConfig: {
    sidebar: require('./sidebar'),
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API Reference', link: '/api-reference' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Monitoring', link: '/monitoring' },
      { text: 'Security', link: '/security' },
      { text: 'Deployment', link: '/deployment' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/<your-org>/InsightHub' }
    ]
  }
};
