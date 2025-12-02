import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '3DDX Client Documentation',
  description: 'Documentation for the Vue.js client application and components',
  themeConfig: {
    sidebar: [
      {
        text: 'Getting Started',
        link: '/getting-started',
      },
      {
        text: 'Architecture',
        link: '/architecture',
      },
      {
        text: 'Usage Guides',
        link: '/usage-guides',
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: [
          {
            text: 'Backend API',
            link: '/backend-api',
          },
          {
            text: 'Legacy API Reference',
            link: '/api-reference',
          },
        ],
      },
      {
        text: 'Frontend',
        collapsed: false,
        items: [
          {
            text: 'Vue Components',
            link: '/vue-components',
          },
          {
            text: 'Client Services & Stores',
            link: '/client-services',
          },
          {
            text: 'Legacy Components',
            link: '/components',
          },
          {
            text: 'Legacy Client API',
            link: '/api',
          },
        ],
      },
      {
        text: 'Deployment Guide',
        link: '/deployment',
      },
      {
        text: 'Monitoring & Observability',
        link: '/monitoring',
      },
      {
        text: 'Security',
        collapsed: false,
        items: [
          {
            text: 'Security Guide',
            link: '/security',
          },
          {
            text: 'Casbin User Management',
            link: '/casbin-user-management',
          },
        ],
      },
      {
        text: 'Technical Specifications',
        link: '/technical-specifications',
      },
      {
        text: 'Development',
        collapsed: false,
        items: [
          {
            text: 'Dev Mode Guide',
            link: '/DEV_MODE_GUIDE',
          },
          {
            text: 'General Guide',
            link: '/guide',
          },
        ],
      },
    ],
    nav: [] // Remove top nav for sidebar-only navigation
  }
});
