// VitePress main config for professional docs experience

module.exports = {
  title: 'Google AuthZ 3DDX Docs',
  description: 'Enterprise authentication & authorization platform documentation',
  themeConfig: {
    sidebar: require('./sidebar'),
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API Reference', link: '/api-reference' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Security', link: '/security' },
      { text: 'Deployment', link: '/deployment' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/heshamahmed-3ddx/google-authz-3ddx' }
    ]
  }
};
