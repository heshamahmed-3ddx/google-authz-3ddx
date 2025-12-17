// Professional VitePress Sidebar Configuration

module.exports = [
  {
    text: 'Getting Started',
    collapsible: true,
    items: [
      { text: 'Quick Start', link: '/getting-started' },
      { text: 'Dev Mode Guide', link: '/DEV_MODE_GUIDE' },
      { text: 'Deployment', link: '/deployment' },
      { text: 'Development Roadmap', link: '/development-roadmap' },
      { text: 'Roadmap 2025 (Detailed)', link: '/DEVELOPMENT_ROADMAP_2025' },
    ]
  },
  {
    text: 'API & Backend',
    collapsible: true,
    items: [
      { text: 'API Reference', link: '/api-reference' },
      { text: 'API Spec (OpenAPI)', link: '/api-spec' },
      { text: 'Backend Performance', link: '/BACKEND_PERFORMANCE_OPTIMIZATIONS' },
      { text: 'General Performance', link: '/PERFORMANCE_OPTIMIZATIONS' },
      { text: 'Implementation Guide', link: '/implementation-guide' },
      { text: 'Casbin User Management', link: '/casbin-user-management' },
    ]
  },
  {
    text: 'Monitoring & Observability',
    collapsible: true,
    items: [
      { text: 'Monitoring Guide', link: '/monitoring' },
      { text: 'DevOps Coordination', link: '/DEVOPS_COORDINATION' },
      { text: 'DevOps Deployment Briefing', link: '/DEVOPS_DEPLOYMENT_BRIEFING' },
      { text: 'Deployment Environment Config', link: '/DEPLOYMENT_ENVIRONMENT_CONFIG' },
    ]
  },
  {
    text: 'Architecture & Technical',
    collapsible: true,
    items: [
      { text: 'System Architecture', link: '/architecture' },
      { text: 'Technical Specifications', link: '/technical-specifications' },
      { text: 'Reuse Guide', link: '/reuse-guide' },
    ]
  },
  {
    text: 'Security',
    collapsible: true,
    items: [
      { text: 'Security Overview', link: '/security' },
      { text: 'Security Guide', link: '/security-guide' },
    ]
  },
  {
    text: 'UI/UX & Navigation',
    collapsible: true,
    items: [
      { text: 'Navigation Index', link: '/NAVIGATION-INDEX' },
      { text: 'Quick Start', link: '/NAVIGATION-QUICK-START' },
      { text: 'Navigation System', link: '/NAVIGATION-SYSTEM' },
      { text: 'Architecture', link: '/NAVIGATION-ARCHITECTURE' },
      { text: 'Implementation Summary', link: '/NAVIGATION-IMPLEMENTATION-SUMMARY' },
      { text: 'Expandable Rows Guide', link: '/EXPANDABLE_ROWS_GUIDE' },
      { text: 'Dashboard Access Guide', link: '/DASHBOARD_ACCESS_GUIDE' },
      { text: 'Surgical Guide Report', link: '/SURGICAL_GUIDE_REPORT' },
      { text: 'Surgical Guide Delivery', link: '/SURGICAL_GUIDE_REPORT_DELIVERY' },
    ]
  },
  {
    text: 'Testing & Quality',
    collapsible: true,
    items: [
      { text: 'Testing & QA Report', link: '/TESTING_AND_QUALITY_REPORT' },
      { text: 'Manager Meeting Presentation', link: '/MANAGER_MEETING_PRESENTATION' },
      { text: 'Admin Testing Guide', link: '/admin-testing-guide' },
      { text: 'Code Review Checklist', link: '/CODE_REVIEW_CHECKLIST' },
    ]
  },
  {
    text: 'JSDoc & Misc',
    collapsible: true,
    items: [
      { text: 'JSDoc Guide', link: '/jsdoc' },
      { text: 'Documentation Completion', link: '/DOCUMENTATION_COMPLETION' },
    ]
  }
];
