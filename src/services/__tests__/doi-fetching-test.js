/**
 * Test script to verify DOI metadata fetching functionality
 */

import { fetchDOIMetadata, batchFetchDOIMetadata } from '../DOIService.js';

async function testDOIFetching() {
  console.log('Testing DOI metadata fetching...\n');

  // Test 1: Single DOI fetch
  console.log('Test 1: Fetching single DOI metadata');
  try {
    const metadata = await fetchDOIMetadata('10.1088/1475-7516/2021/11/035');
    console.log('✓ Single DOI fetch successful');
    console.log('  Title:', metadata.title);
    console.log('  Authors:', metadata.authors);
    console.log('  Journal:', metadata.journal);
    console.log('  Year:', metadata.year);
    console.log('  Volume:', metadata.volume);
    console.log('  Issue:', metadata.issue);
    console.log('  Pages:', metadata.pages);
  } catch (error) {
    console.error('✗ Single DOI fetch failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Batch DOI fetch
  console.log('Test 2: Fetching multiple DOIs in batch');
  const dois = [
    '10.1088/1475-7516/2021/11/035',
    '10.1103/PhysRevD.102.083525',
    '10.1093/mnras/stz2034',
    '10.1103/PhysRevLett.131.181301',
    '10.1038/s41586-023-06098-3'
  ];

  try {
    const { results, errors } = await batchFetchDOIMetadata(dois);
    console.log(`✓ Batch DOI fetch completed`);
    console.log(`  Successful: ${results.length}/${dois.length}`);
    console.log(`  Failed: ${errors.length}/${dois.length}`);

    if (errors.length > 0) {
      console.log('\n  Errors:');
      errors.forEach(err => {
        console.log(`    - ${err.doi}: ${err.error}`);
      });
    }

    console.log('\n  Results:');
    results.forEach(metadata => {
      console.log(`    - ${metadata.doi}: ${metadata.title}`);
    });
  } catch (error) {
    console.error('✗ Batch DOI fetch failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Invalid DOI
  console.log('Test 3: Testing invalid DOI handling');
  try {
    await fetchDOIMetadata('10.1234/invalid');
    console.error('✗ Invalid DOI should have thrown an error');
  } catch (error) {
    console.log('✓ Invalid DOI properly rejected');
    console.log('  Error:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('All tests completed!');
}

// Run tests
testDOIFetching();
