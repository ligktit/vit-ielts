/**
 * Script để migrate config từ filesystem sang Vercel KV
 * 
 * Usage:
 *   1. Pull environment variables từ Vercel: vercel env pull .env.local
 *   2. Chạy script: npm run migrate:kv
 *   3. Hoặc: npx ts-node scripts/migrate-to-kv.ts
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables từ .env.local nếu có
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded environment variables from .env.local\n');
} else {
  console.log('⚠ .env.local not found. Using system environment variables.\n');
}

// Import sau khi load env
const { readConfigFromFileSystem, writeConfig } = require('../lib/server/admin-config-helper');

// Danh sách tất cả các config cần migrate
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

// Default configs cho các file không tồn tại
const defaultConfigs: Record<string, any> = {
  'subscription/faq': {
    badge: {
      text: "FREQUENTLY ASKED QUESTIONS",
    },
    title: "Have a Question with Histudy University?",
    description:
      "Its an educational platform Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    items: [
      {
        question: "What is Histudy ? How does it work?",
        answer:
          "Histudy is an educational platform designed to help students learn and grow. It works by providing comprehensive learning materials, interactive courses, and personalized learning paths to help you achieve your educational goals.",
      },
      {
        question: "How can I get the customer support?",
        answer:
          "You can reach our customer support team through multiple channels including email, live chat, or phone. Our support team is available 24/7 to assist you with any questions or concerns you may have.",
      },
      {
        question:
          "Can I get update regularly and For how long do I get updates?",
        answer:
          "Yes, you will receive regular updates about new courses, features, and educational content. Updates are provided for the duration of your subscription period, ensuring you always have access to the latest materials and improvements.",
      },
      {
        question: "15 Things To Know About Education?",
        answer:
          "Education is a lifelong journey that involves continuous learning, critical thinking, and personal growth. It encompasses various forms of learning including formal education, self-study, and practical experience. Understanding key educational principles can help you make the most of your learning experience.",
      },
    ],
  },
};

async function migrate() {
  // Kiểm tra environment variables
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('❌ Error: KV_REST_API_URL or KV_REST_API_TOKEN not found!');
    console.log('\nPlease run one of the following:');
    console.log('  1. vercel env pull .env.local');
    console.log('  2. Or set environment variables manually');
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  // Force sử dụng KV (không dùng filesystem)
  process.env.VERCEL = '1';

  console.log('🚀 Starting migration to Vercel KV...');
  console.log(`   KV URL: ${process.env.KV_REST_API_URL}`);
  console.log(`   Configs to migrate: ${configs.length}\n`);

  let successCount = 0;
  let failCount = 0;
  const failedConfigs: string[] = [];

  for (const configName of configs) {
    try {
      let config;
      
      // Thử đọc từ filesystem trước
      try {
        config = readConfigFromFileSystem(configName);
      } catch (fsError) {
        // Nếu file không tồn tại, kiểm tra xem có default config không
        if (defaultConfigs[configName]) {
          console.log(`⚠ File not found for ${configName}, using default config`);
          config = defaultConfigs[configName];
        } else {
          // Nếu không có default config, throw error
          throw fsError;
        }
      }
      
      // Ghi vào KV (force sử dụng KV)
      await Promise.resolve(writeConfig(configName, config));
      console.log(`✓ Migrated: ${configName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to migrate ${configName}:`, error instanceof Error ? error.message : error);
      failCount++;
      failedConfigs.push(configName);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Migration completed!');
  console.log(`   ✓ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`   ✗ Failed: ${failCount}`);
    console.log(`   Failed configs: ${failedConfigs.join(', ')}`);
  }
  console.log('='.repeat(50));
  
  if (failCount > 0) {
    process.exit(1);
  }
}

// Run migration
migrate().catch((error) => {
  console.error('\n❌ Migration failed with error:', error);
  process.exit(1);
});

