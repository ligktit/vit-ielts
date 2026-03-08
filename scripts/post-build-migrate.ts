/**
 * Script để migrate configs sau khi build
 * Chạy tự động trên Vercel sau khi build xong
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Chỉ chạy trên Vercel production
if (process.env.VERCEL !== "1" || !process.env.KV_REST_API_URL) {
  console.log("Skipping migration - not on Vercel or KV not configured");
  process.exit(0);
}

const { readConfigFromFileSystem, writeConfig } = require('../lib/server/admin-config-helper');
const { readData, writeData } = require('../lib/server/affiliate-data-helper');

const configs = [
  'hero-banner',
  'test-platform-intro',
  'why-choose-us',
  'testimonials',
  'header/top-bar',
  'footer/cta-banner',
  'subscription/course-packages',
  'subscription/faq',
  'privacy-policy',
  'terms-of-use',
  'sample-essay/banner',
  'ielts-practice-library/banner',
  'ielts-exam-library/hero-banner',
];

const defaultConfigs: Record<string, any> = {
  'subscription/faq': {
    badge: { text: "FREQUENTLY ASKED QUESTIONS" },
    title: "Have a Question with Histudy University?",
    description: "Its an educational platform Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    items: [
      {
        question: "What is Histudy ? How does it work?",
        answer: "Histudy is an educational platform designed to help students learn and grow.",
      },
      {
        question: "How can I get the customer support?",
        answer: "You can reach our customer support team through multiple channels.",
      },
      {
        question: "Can I get update regularly and For how long do I get updates?",
        answer: "Yes, you will receive regular updates about new courses and features.",
      },
      {
        question: "15 Things To Know About Education?",
        answer: "Education is a lifelong journey that involves continuous learning.",
      },
    ],
  },
};

async function migrate() {
  console.log('🚀 Starting post-build migration to Vercel KV...');
  
  let successCount = 0;
  let failCount = 0;

  for (const configName of configs) {
    try {
      let config;
      
      try {
        config = readConfigFromFileSystem(configName);
      } catch (fsError) {
        if (defaultConfigs[configName]) {
          config = defaultConfigs[configName];
        } else {
          throw fsError;
        }
      }
      
      await Promise.resolve(writeConfig(configName, config));
      successCount++;
      console.log(`✓ Migrated: ${configName}`);
    } catch (error: any) {
      failCount++;
      console.error(`✗ Failed to migrate ${configName}:`, error?.message || error);
    }
  }

  console.log(`\n✅ Config migration completed: ${successCount} success, ${failCount} failed`);

  const dataFiles = ['coupons.json'];
  console.log('\n🚀 Starting data files migration...');
  let dataSuccessCount = 0;
  let dataFailCount = 0;

  for (const fileName of dataFiles) {
    try {
      const data = await Promise.resolve(readData(fileName));
      if (Array.isArray(data) && data.length === 0) {
        console.log(`⚠ ${fileName} is empty, skipping...`);
        continue;
      }
      await Promise.resolve(writeData(fileName, data));
      console.log(`✓ Migrated data: ${fileName}`);
      dataSuccessCount++;
    } catch (error: any) {
      dataFailCount++;
      console.error(`✗ Failed to migrate data ${fileName}:`, error?.message || error);
    }
  }

  console.log(`\n✅ Data migration completed: ${dataSuccessCount} success, ${dataFailCount} failed`);
  console.log(`\n📊 Total: ${successCount + dataSuccessCount} success, ${failCount + dataFailCount} failed`);
  
  if (failCount > 0 || dataFailCount > 0) {
    process.exit(1);
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});

