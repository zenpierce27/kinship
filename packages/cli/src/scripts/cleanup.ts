import { getSupabase } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';

async function cleanup() {
  const supabase = getSupabase();
  
  const testNames = ['Carol Test', 'Test Embedding', 'Mike Johnson', 'Carol'];
  
  for (const name of testNames) {
    const { data, error } = await supabase
      .from('persons')
      .update({ archived_at: new Date().toISOString() })
      .eq('full_name', name)
      .eq('user_id', CONFIG.userId)
      .neq('warmth_tier', 'inner_circle')  // Don't archive Carol Standridge
      .select('full_name');
    
    if (data && data.length > 0) {
      console.log('Archived:', name);
    }
  }
  
  console.log('Cleanup complete');
}

cleanup();
