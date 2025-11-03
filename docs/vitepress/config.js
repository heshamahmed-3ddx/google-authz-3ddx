import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '3DDX Client Documentation',
  description: 'Documentation for the Vue.js client application and components',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Components', link: '/components/' },
      { text: 'API', link: '/api/' }
    ]
  }
});
