import { config } from 'dotenv';
import { resolve } from 'path';
import { homedir } from 'os';

// Load from ~/.kinship/.env if exists
config({ path: resolve(homedir(), '.kinship', '.env') });
// Also try local .env
config();

export const CONFIG = {
  supabaseUrl: process.env.KINSHIP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.KINSHIP_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.KINSHIP_SUPABASE_SERVICE_KEY || '',
  userId: process.env.KINSHIP_USER_ID || 'default-user',
};

export function validateConfig() {
  if (!CONFIG.supabaseUrl) {
    console.error('Missing KINSHIP_SUPABASE_URL');
    console.error('Set it in ~/.kinship/.env or environment');
    process.exit(1);
  }
  if (!CONFIG.supabaseAnonKey && !CONFIG.supabaseServiceKey) {
    console.error('Missing KINSHIP_SUPABASE_ANON_KEY or KINSHIP_SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
}
