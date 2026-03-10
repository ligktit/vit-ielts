/**
 * Re-migration Script: Fix ALL JSONB fields in questions table
 * 
 * Root cause: The WordPress → Supabase migration script passed JS objects
 * directly to Supabase `.insert()` for JSONB columns. Supabase client
 * double-serialized them, resulting in JSON strings stored as JSONB text.
 * 
 * This script:
 * 1. Fetches ALL questions with pagination
 * 2. Detects any string-encoded JSONB fields
 * 3. Parses them back to native objects
 * 4. Updates the rows in Supabase
 * 5. Verifies the fix
 * 
 * Fields affected:
 * - list_of_questions (RadioSelectQuestion[])
 * - list_of_options (ListOfOption[])
 * - matching_question (MatchingQuestion)
 * - matrix_question (MatrixQuestion)
 * - explanations (Explanation[])
 * 
 * Usage: node scripts/fix-question-jsonb.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JSONB_FIELDS = [
    'list_of_questions',
    'list_of_options',
    'matching_question',
    'matrix_question',
    'explanations',
];

const PAGE_SIZE = 1000;

/**
 * Recursively parse any string-encoded JSON.
 * Handles cases where JSON was double or triple encoded.
 */
function deepParseJsonb(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;

    try {
        const parsed = JSON.parse(value);
        // Recursively parse in case of triple-encoding
        if (typeof parsed === 'string') {
            return deepParseJsonb(parsed);
        }
        return parsed;
    } catch {
        return value; // Not JSON, return as-is
    }
}

async function fetchAllQuestions() {
    const allQuestions = [];
    let offset = 0;

    while (true) {
        const { data, error } = await supabase
            .from('questions')
            .select(`id, ${JSONB_FIELDS.join(', ')}`)
            .range(offset, offset + PAGE_SIZE - 1);

        if (error) {
            console.error('Fetch error at offset', offset, ':', error.message);
            break;
        }

        allQuestions.push(...data);
        console.log(`  Fetched ${data.length} questions (offset: ${offset})`);

        if (data.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
    }

    return allQuestions;
}

async function fixQuestions(questions) {
    let fixedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const q of questions) {
        const updates = {};
        let needsUpdate = false;

        for (const field of JSONB_FIELDS) {
            const value = q[field];

            if (typeof value === 'string') {
                const parsed = deepParseJsonb(value);
                if (parsed !== value) {
                    updates[field] = parsed;
                    needsUpdate = true;
                }
            }
        }

        if (!needsUpdate) {
            skippedCount++;
            continue;
        }

        const { error: updateError } = await supabase
            .from('questions')
            .update(updates)
            .eq('id', q.id);

        if (updateError) {
            console.error(`  ✗ Update failed for question ${q.id}:`, updateError.message);
            errorCount++;
        } else {
            fixedCount++;
        }
    }

    return { fixedCount, errorCount, skippedCount };
}

async function verify() {
    const questions = await fetchAllQuestions();

    const issues = {};
    for (const field of JSONB_FIELDS) {
        issues[field] = { total: 0, stringEncoded: 0, nulls: 0, proper: 0 };
    }

    for (const q of questions) {
        for (const field of JSONB_FIELDS) {
            const value = q[field];
            issues[field].total++;

            if (value === null) {
                issues[field].nulls++;
            } else if (typeof value === 'string') {
                issues[field].stringEncoded++;
            } else {
                issues[field].proper++;
            }
        }
    }

    return { questions, issues };
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   Fix JSONB Double-Encoding in Questions Table    ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');

    // Step 1: Pre-check
    console.log('📋 Step 1: Auditing current state...');
    const { questions: preQuestions, issues: preIssues } = await verify();
    console.log(`  Total questions: ${preQuestions.length}`);
    console.log('');
    console.log('  Field                  | Total | Proper | String | Null');
    console.log('  -----------------------|-------|--------|--------|-----');
    for (const field of JSONB_FIELDS) {
        const i = preIssues[field];
        const padField = field.padEnd(21);
        console.log(`  ${padField} | ${String(i.total).padStart(5)} | ${String(i.proper).padStart(6)} | ${String(i.stringEncoded).padStart(6)} | ${String(i.nulls).padStart(4)}`);
    }

    const totalStringEncoded = JSONB_FIELDS.reduce((sum, f) => sum + preIssues[f].stringEncoded, 0);

    if (totalStringEncoded === 0) {
        console.log('\n✅ All JSONB fields are already properly formatted! Nothing to fix.');
        return;
    }

    console.log(`\n⚠️  Found ${totalStringEncoded} string-encoded fields to fix`);

    // Step 2: Fix
    console.log('\n🔧 Step 2: Fixing string-encoded fields...');
    const { fixedCount, errorCount, skippedCount } = await fixQuestions(preQuestions);
    console.log(`  ✅ Fixed: ${fixedCount} questions`);
    console.log(`  ⏭️  Skipped (already OK): ${skippedCount} questions`);
    if (errorCount > 0) {
        console.log(`  ❌ Errors: ${errorCount} questions`);
    }

    // Step 3: Verify
    console.log('\n📋 Step 3: Verifying fix...');
    const { questions: postQuestions, issues: postIssues } = await verify();
    console.log(`  Total questions: ${postQuestions.length}`);
    console.log('');
    console.log('  Field                  | Total | Proper | String | Null');
    console.log('  -----------------------|-------|--------|--------|-----');
    for (const field of JSONB_FIELDS) {
        const i = postIssues[field];
        const padField = field.padEnd(21);
        console.log(`  ${padField} | ${String(i.total).padStart(5)} | ${String(i.proper).padStart(6)} | ${String(i.stringEncoded).padStart(6)} | ${String(i.nulls).padStart(4)}`);
    }

    const remainingIssues = JSONB_FIELDS.reduce((sum, f) => sum + postIssues[f].stringEncoded, 0);

    if (remainingIssues === 0) {
        console.log('\n╔════════════════════════════════════════════════════╗');
        console.log('║        ✅ ALL JSONB FIELDS FIXED SUCCESSFULLY      ║');
        console.log('╚════════════════════════════════════════════════════╝');
    } else {
        console.log(`\n❌ Still ${remainingIssues} string-encoded fields remaining!`);
    }

    // Step 4: Sample verification
    console.log('\n📊 Step 4: Sample data verification...');
    const { data: samples } = await supabase
        .from('questions')
        .select('id, type, title, list_of_questions, matching_question')
        .not('list_of_questions', 'is', null)
        .limit(3);

    if (samples) {
        for (const s of samples) {
            console.log(`\n  Question: ${s.title || s.id}`);
            console.log(`    Type: ${s.type}`);
            console.log(`    list_of_questions: type=${typeof s.list_of_questions}, isArray=${Array.isArray(s.list_of_questions)}`);
            if (Array.isArray(s.list_of_questions) && s.list_of_questions.length > 0) {
                const first = s.list_of_questions[0];
                console.log(`    First item: question="${String(first.question || '').substring(0, 60)}...", options=${Array.isArray(first.options) ? first.options.length : 'N/A'}`);
            }
        }
    }
}

main().catch(console.error);
