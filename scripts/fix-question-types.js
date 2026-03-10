/**
 * Fix Question Types Script
 * 
 * The WordPress migration set most questions to type="radio" as default.
 * This script re-classifies questions based on their actual data:
 * 
 * - Has list_of_questions with question text + options → "radio"
 * - Has question_text with {gaps} + list_of_options → "select"
 * - Has question_text with {gaps} WITHOUT list_of_options → "fillup"
 * - Has list_of_options (no gaps) → "checkbox"
 * - Has matching_question with data → "matching"
 * - Has matrix_question with data → "matrix"
 * 
 * Usage: node scripts/fix-question-types.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PAGE_SIZE = 1000;

async function fetchAll() {
    const all = [];
    let offset = 0;
    while (true) {
        const { data, error } = await supabase
            .from('questions')
            .select('id, type, title, question_form, question_text, instructions, list_of_questions, list_of_options, matching_question, matrix_question')
            .range(offset, offset + PAGE_SIZE - 1);
        if (error) { console.error('Fetch error:', error.message); break; }
        all.push(...data);
        if (data.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
    }
    return all;
}

function detectCorrectType(q) {
    // Check actual data presence
    const loq = q.list_of_questions;
    const hasRadioQuestions = Array.isArray(loq) && loq.some(lq => lq && lq.question);

    const loo = q.list_of_options;
    const hasOptions = Array.isArray(loo) && loo.length > 0 && loo.some(o => o && (o.option_text || o.option));

    const mq = q.matching_question;
    const hasMatchingItems = mq && Array.isArray(mq.matching_items) && mq.matching_items.length > 0;
    const hasMatchingSummary = mq && mq.summary_text && mq.summary_text.trim().length > 0;
    const hasMatchingAnswerOpts = mq && Array.isArray(mq.answer_options) && mq.answer_options.length > 0;
    // Also check camelCase variants (from frontend mapping)
    const hasMatchingItemsCamel = mq && Array.isArray(mq.matchingItems) && mq.matchingItems.length > 0 && mq.matchingItems.some(mi => mi.questionPart);
    const hasMatchingSummaryCamel = mq && mq.summaryText && mq.summaryText.trim().length > 0;
    const hasMatchingAnswerOptsCamel = mq && Array.isArray(mq.answerOptions) && mq.answerOptions.length > 0;
    const hasMatching = hasMatchingItems || hasMatchingSummary || hasMatchingAnswerOpts || hasMatchingItemsCamel || hasMatchingSummaryCamel || hasMatchingAnswerOptsCamel;

    const mx = q.matrix_question;
    const hasMatrix = mx && (
        (Array.isArray(mx.matrix_items) && mx.matrix_items.length > 0) ||
        (Array.isArray(mx.matrixItems) && mx.matrixItems.length > 0)
    );

    const questionText = q.question_text || '';
    const hasGaps = /\{[^}]+\}/.test(questionText);

    // Priority-based classification
    if (hasMatrix) return 'matrix';

    if (hasMatching) return 'matching';

    if (hasRadioQuestions) return 'radio';

    if (hasGaps && hasOptions) return 'select';

    if (hasGaps) return 'fillup';

    if (hasOptions) return 'checkbox';

    // If none of the above, keep current type
    return q.type;
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║       Fix Question Types Based on Actual Data     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Step 1: Fetch all
    console.log('📋 Step 1: Fetching all questions...');
    const questions = await fetchAll();
    console.log(`  Total: ${questions.length} questions\n`);

    // Step 2: Analyze
    console.log('🔍 Step 2: Analyzing types...');

    const beforeDist = {};
    const afterDist = {};
    const changes = [];

    questions.forEach(q => {
        const currentType = q.type || 'radio';
        beforeDist[currentType] = (beforeDist[currentType] || 0) + 1;

        const correctType = detectCorrectType(q);
        afterDist[correctType] = (afterDist[correctType] || 0) + 1;

        if (currentType !== correctType) {
            changes.push({ id: q.id, title: q.title, from: currentType, to: correctType });
        }
    });

    console.log('\n  BEFORE (current types):');
    Object.entries(beforeDist).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
        console.log(`    ${t.padEnd(12)} ${c}`);
    });

    console.log('\n  AFTER (corrected types):');
    Object.entries(afterDist).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
        console.log(`    ${t.padEnd(12)} ${c}`);
    });

    console.log(`\n  Total changes needed: ${changes.length}`);

    // Show sample changes
    const changesByType = {};
    changes.forEach(c => {
        const key = `${c.from} → ${c.to}`;
        if (!changesByType[key]) changesByType[key] = [];
        changesByType[key].push(c);
    });

    console.log('\n  Changes breakdown:');
    Object.entries(changesByType).forEach(([key, items]) => {
        console.log(`    ${key}: ${items.length} questions`);
        items.slice(0, 2).forEach(c => {
            console.log(`      - ${c.title}`);
        });
    });

    if (changes.length === 0) {
        console.log('\n✅ All question types are already correct!');
        return;
    }

    // Step 3: Apply fixes
    console.log('\n🔧 Step 3: Applying type fixes...');
    let fixedCount = 0;
    let errorCount = 0;

    for (const change of changes) {
        const { error } = await supabase
            .from('questions')
            .update({ type: change.to })
            .eq('id', change.id);

        if (error) {
            console.error(`  ✗ Failed to update ${change.id}: ${error.message}`);
            errorCount++;
        } else {
            fixedCount++;
        }
    }

    console.log(`  ✅ Fixed: ${fixedCount}`);
    if (errorCount > 0) console.log(`  ❌ Errors: ${errorCount}`);

    // Step 4: Verify
    console.log('\n📋 Step 4: Verification...');
    const postQuestions = await fetchAll();
    const postDist = {};
    postQuestions.forEach(q => {
        postDist[q.type || 'NULL'] = (postDist[q.type || 'NULL'] || 0) + 1;
    });

    console.log('  Final type distribution:');
    Object.entries(postDist).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
        console.log(`    ${t.padEnd(12)} ${c}`);
    });

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║        ✅ QUESTION TYPE FIX COMPLETE               ║');
    console.log('╚════════════════════════════════════════════════════╝');
}

main().catch(console.error);
