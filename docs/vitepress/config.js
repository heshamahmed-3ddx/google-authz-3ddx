import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'InsightHub Client Documentation',
  description: 'Documentation for the Vue.js client application and components',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'UI & Styling', link: '/compact-ui-style-guide' },
      { text: 'Components', link: '/vue-components' },
      { text: 'API', link: '/backend-api' },
      { text: 'Guides', link: '/usage-guides' }
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Home', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Architecture', link: '/architecture' }
          ]
        },
        {
          text: 'UI & Styling',
          items: [
            { text: 'Compact UI Style Guide', link: '/compact-ui-style-guide' },
            { text: 'Settings Page', link: '/settings-page-guide' }
          ]
        },
        {
          text: 'Frontend',
          items: [
            { text: 'Vue Components', link: '/vue-components' },
            { text: 'Client Services', link: '/client-services' }
          ]
        },
        {
          text: 'Backend',
          items: [
            { text: 'Backend API', link: '/backend-api' },
            { text: 'Casbin User Management', link: '/casbin-user-management' }
          ]
        },
        {
          text: 'Guides',
          items: [
            { text: 'Usage Guides', link: '/usage-guides' },
            { text: 'Dev Mode Guide', link: '/DEV_MODE_GUIDE' }
          ]
        },
        {
          text: 'Deployment & Security',
          items: [
            { text: 'Deployment', link: '/deployment' },
            { text: 'Security', link: '/security' },
            { text: 'Technical Specifications', link: '/technical-specifications' }
          ]
        }
      ]
    }
  }
});
