#!/usr/bin/env node
/**
 * Test script for GitHub repository endpoint
 * Tests the /api/config/github endpoint
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testGitHubEndpoint() {
  console.log('🔗 Testing GitHub Repository Endpoint\n');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/config/github`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Response:');
    console.log(JSON.stringify(data, null, 2));

    // Validate response structure
    console.log('\n📋 Validation:');
    if (data.success !== undefined) {
      console.log(`  ✓ success field present: ${data.success}`);
    }
    if (data.data) {
      console.log(`  ✓ data object present`);
      if (data.data.repositoryUrl) {
        console.log(`  ✓ repositoryUrl: ${data.data.repositoryUrl}`);
      }
      if (data.data.repositoryName) {
        console.log(`  ✓ repositoryName: ${data.data.repositoryName}`);
      }
      if (data.data.displayInDocs !== undefined) {
        console.log(`  ✓ displayInDocs: ${data.data.displayInDocs}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ GitHub endpoint test completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nNote: Make sure the server is running on', BASE_URL);
  }
}

testGitHubEndpoint();

