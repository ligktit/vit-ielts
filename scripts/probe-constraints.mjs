// Quick probe: check DB constraints and unique skill/type values
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check current distinct skill and type values
const { data: quizzes } = await supabase.from('quizzes').select('skill, type');
const skills = new Set(quizzes?.map(q => q.skill));
const types = new Set(quizzes?.map(q => q.type));
console.log('Current skills:', [...skills]);
console.log('Current types:', [...types]);
console.log('Total quizzes:', quizzes?.length);

// Try inserting a test quiz with skill='listening' to see if constraint allows it
const { error: testErr } = await supabase
    .from('quizzes')
    .insert({
        title: '__test_listening__',
        slug: '__test_listening__',
        skill: 'listening',
        type: 'practice',
        status: 'draft',
    });

if (testErr) {
    console.log('Listening insert error:', testErr.message);
} else {
    console.log('Listening insert OK!');
    await supabase.from('quizzes').delete().eq('slug', '__test_listening__');
    console.log('Cleaned up');
}

// Try with type='academic'
const { error: testErr2 } = await supabase
    .from('quizzes')
    .insert({
        title: '__test_academic__',
        slug: '__test_academic__',
        skill: 'reading',
        type: 'academic',
        status: 'draft',
    });

if (testErr2) {
    console.log('Academic type error:', testErr2.message);
} else {
    console.log('Academic type insert OK!');
    await supabase.from('quizzes').delete().eq('slug', '__test_academic__');
    console.log('Cleaned up');
}
