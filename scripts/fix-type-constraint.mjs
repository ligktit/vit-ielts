// Drop quizzes_type_check constraint to allow 'academic' and other WP type values
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Drop the restrictive type constraint
const { error: dropErr } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_type_check"
});

if (dropErr) {
    console.log('rpc method not available, trying direct sql...');
    // Alternative: just try upsert with new type to test
    // Supabase doesn't allow raw SQL via client API without a function
    // Need to use the Supabase dashboard SQL editor or create a migration
    console.log('');
    console.log('⚠️ Cannot drop constraint via API. Please run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_type_check;');
    console.log("ALTER TABLE quizzes ADD CONSTRAINT quizzes_type_check CHECK (type IN ('practice', 'academic', 'general', 'mock'));");
    console.log('');
} else {
    console.log('✅ Constraint dropped');

    // Re-add with broader values
    const { error: addErr } = await supabase.rpc('exec_sql', {
        query: "ALTER TABLE quizzes ADD CONSTRAINT quizzes_type_check CHECK (type IN ('practice', 'academic', 'general', 'mock'))"
    });

    if (addErr) {
        console.log('⚠️ Could not re-add constraint:', addErr.message);
    } else {
        console.log('✅ New constraint added with practice, academic, general, mock');
    }
}
