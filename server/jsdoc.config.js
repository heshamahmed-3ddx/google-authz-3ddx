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
    systemName: '3D Diagnostix Google OAuth & Casbin RBAC',
    footer: '© 2025 3D Diagnostix, Inc. All rights reserved.',
    copyright: '3D Diagnostix Development Team',
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
      title: '3D Diagnostix API Documentation',
      type: 'website',
      image: './docs/assets/logo.png',
      site_name: '3D Diagnostix',
      url: 'https://docs.3ddiagnostix.com'
    },
    meta: {
      title: '3D Diagnostix Google OAuth & Casbin RBAC API',
      description: 'Comprehensive API documentation for Google OAuth integration with Casbin RBAC system',
      keyword: 'API, OAuth, Google, Casbin, RBAC, Authentication, Authorization'
    },
    search: true,
    collapse: false,
    typedefs: true,
    removeQuotes: 'none',
    scripts: []
  }
};