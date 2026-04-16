const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('cms_settings').select('*').eq('section_name', 'library/mock-collections-order');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Row:', data[0]);
  }
}
check();
