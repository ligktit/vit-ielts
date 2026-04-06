const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const run = async () => {
    const { data } = await supabase.from('quizzes').select('title, passages').eq('slug', 'ielts-reading-full-demo').single();
    let q7 = null;
    if (data && data.passages) {
        for (const p of data.passages) {
            for (const q of p.questions) {
                if (q.type === 'select') q7 = q;
            }
        }
    }
    console.log(JSON.stringify(q7, null, 2));
};
run();
