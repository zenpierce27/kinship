import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!CONFIG.supabaseUrl) {
      throw new Error('KINSHIP_SUPABASE_URL not set');
    }
    _supabase = createClient(
      CONFIG.supabaseUrl,
      CONFIG.supabaseServiceKey || CONFIG.supabaseAnonKey
    );
  }
  return _supabase;
}

export type Person = {
  id: string;
  user_id: string;
  full_name: string;
  preferred_name?: string;
  emails: { email: string; type?: string; primary?: boolean }[];
  phones: { number: string; type?: string }[];
  current_company?: string;
  job_title?: string;
  how_we_met?: string;
  met_date?: string;
  warmth_tier: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact_at?: string;
};

export type Interaction = {
  id: string;
  user_id: string;
  person_id: string;
  interaction_type: string;
  direction?: string;
  channel?: string;
  occurred_at: string;
  subject?: string;
  summary?: string;
  notes?: string;
  sentiment?: string;
};
