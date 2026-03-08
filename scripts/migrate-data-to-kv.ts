const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded environment variables from .env.local\n');
} else {
  console.log('⚠ .env.local not found. Using system environment variables.\n');
}

const { readData, writeData } = require('../lib/server/affiliate-data-helper');

const dataFiles = [
  'coupons.json',
  'orders.json',
  'affiliates.json',
  'affiliate-links.json',
  'affiliate-commissions.json',
  'affiliate-visits.json',
];

async function migrate() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('❌ Error: KV_REST_API_URL or KV_REST_API_TOKEN not found!');
    console.log('\nPlease run one of the following:');
    console.log('  1. vercel env pull .env.local');
    console.log('  2. Or set environment variables manually');
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  process.env.VERCEL = '1';

  console.log('🚀 Starting data migration to Vercel KV...');
  console.log(`   KV URL: ${process.env.KV_REST_API_URL}`);
  console.log(`   Data files to migrate: ${dataFiles.length}\n`);

  let successCount = 0;
  let failCount = 0;
  const failedFiles: string[] = [];

  for (const fileName of dataFiles) {
    try {
      const data = await Promise.resolve(readData(fileName));
      
      if (Array.isArray(data) && data.length === 0) {
        console.log(`⚠ ${fileName} is empty, skipping...`);
        continue;
      }

      await Promise.resolve(writeData(fileName, data));
      console.log(`✓ Migrated: ${fileName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to migrate ${fileName}:`, error instanceof Error ? error.message : error);
      failCount++;
      failedFiles.push(fileName);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Data migration completed!');
  console.log(`   ✓ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`   ✗ Failed: ${failCount}`);
    console.log(`   Failed files: ${failedFiles.join(', ')}`);
  }
  console.log('='.repeat(50));
  
  if (failCount > 0) {
    process.exit(1);
  }
}

migrate().catch((error) => {
  console.error('\n❌ Migration failed with error:', error);
  process.exit(1);
});
