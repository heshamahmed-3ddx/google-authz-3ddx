/**
 * @file jsdoc.config.js
 * @description Enhanced JSDoc configuration with comprehensive documentation settings
 * @author 3D Diagnostix Development Team
 * @created 2025-10-20
 * @version 1.2.0
 */

export default {
  source: {
    include: [
      './src/',
      './README.md'
    ],
    includePattern: '\\.(js|jsx|ts|tsx)$',
    exclude: [
      './src/**/*.test.js',
      './src/**/*.spec.js',
      './node_modules/'
    ],
    excludePattern: '(test|spec)\\.js$'
  },
  
  opts: {
    destination: './docs/jsdoc/',
    recurse: true,
    readme: './README.md'
  },
  
  plugins: [
    'plugins/markdown',
    'plugins/summarize'
  ],
  
  templates: {
    cleverLinks: false,
    monospaceLinks: false,
    systemName: 'InsightHub - Authorization & Analytics Platform',
    footer: '© 2025 InsightHub. All rights reserved.',
    copyright: 'InsightHub Development Team',
    includeDate: true,
    navType: 'vertical',
    theme: 'default',
    linenums: true,
    collapseSymbols: false,
    inverseNav: true,
    outputSourceFiles: true,
    sourceType: 'module',
    stylesheets: [
      './docs/assets/custom.css'
    ]
  },
  
  markdown: {
    parser: 'gfm',
    hardwrap: true,
    idInHeadings: true
  },
  
  docdash: {
    static: false,
    sort: true,
    sectionOrder: [
      'Modules',
      'Classes',
      'Namespaces',
      'Global'
    ],
    disqus: false,
    openGraph: {
      title: 'InsightHub API Documentation',
      type: 'website',
      image: './docs/assets/logo.png',
      site_name: 'InsightHub',
      url: 'https://docs.insighthub.com'
    },
    meta: {
      title: 'InsightHub - Authorization & Analytics Platform API',
      description: 'Comprehensive API documentation for InsightHub authorization and analytics platform with Google OAuth and Casbin RBAC',
      keyword: 'API, OAuth, Google, Casbin, RBAC, Authentication, Authorization, Analytics, InsightHub'
    },
    search: true,
    collapse: false,
    typedefs: true,
    removeQuotes: 'none',
    scripts: []
  }
};