#!/usr/bin/env node
/**
 * Script to batch update JSDoc file headers with InsightHub branding
 * Usage: node scripts/update-jsdoc-headers.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Files to update
const filesToUpdate = [
  'server/src/routes/api.routes.js',
  'server/src/middleware/security.js',
  'server/src/controllers/surgicalGuideOrders.controller.js',
  'server/src/services/surgicalGuideOrders.service.js',
  'server/src/routes/surgicalGuideOrders.routes.js',
  'server/src/models/surgicalGuideOrders.model.js',
  'server/src/adapters/casbin-mysql-adapter-enhanced.js',
  'server/src/adapters/casbin-mysql-adapter.js',
  'server/src/middleware/errorHandler.js',
  'server/src/middleware/logger.js',
  'server/src/middleware/requestId.js',
  'server/src/services/security.js',
  'server/src/middleware/auth.js',
  'server/src/services/messages.js',
  'server/src/config/swagger.config.js',
  'server/src/config/version.js',
  'server/src/services/logging.js',
  'client/src/services/logger.js'
];

function updateFileHeader(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  // Update author
  if (content.includes('@author 3D Diagnostix Development Team')) {
    content = content.replace(/@author 3D Diagnostix Development Team/g, '@author InsightHub Development Team');
    updated = true;
  }

  // Update copyright
  if (content.includes('@copyright 2025 3D Diagnostix')) {
    content = content.replace(/@copyright 2025 3D Diagnostix, Inc\. All rights reserved\./g, '@copyright 2025 InsightHub. All rights reserved.');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  Skipped (no changes needed): ${filePath}`);
    return false;
  }
}

// Main execution
console.log('🔄 Updating JSDoc file headers with InsightHub branding...\n');

let updatedCount = 0;
for (const file of filesToUpdate) {
  if (updateFileHeader(file)) {
    updatedCount++;
  }
}

console.log(`\n✨ Done! Updated ${updatedCount} of ${filesToUpdate.length} files.`);

