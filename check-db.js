const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('mock_test_collections').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Row:', data[0]);
  }
}
check();
