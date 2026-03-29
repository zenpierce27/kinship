import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Person = {
  id: string;
  full_name: string;
  preferred_name?: string;
  emails: { email: string; primary?: boolean }[];
  phones: { number: string }[];
  current_company?: string;
  job_title?: string;
  how_we_met?: string;
  met_date?: string;
  warmth_tier: string;
  notes?: string;
  last_contact_at?: string;
  created_at: string;
};

export const WARMTH_TIERS = [
  'stranger', 'acquaintance', 'contact', 'colleague', 
  'friend', 'close_friend', 'inner_circle'
] as const;

export const TIER_COLORS: Record<string, string> = {
  stranger: 'bg-gray-500',
  acquaintance: 'bg-gray-400',
  contact: 'bg-blue-500',
  colleague: 'bg-green-500',
  friend: 'bg-cyan-500',
  close_friend: 'bg-purple-500',
  inner_circle: 'bg-pink-500',
};
