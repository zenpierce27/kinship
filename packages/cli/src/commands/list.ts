import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getSupabase } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';

const TIER_COLORS: Record<string, (s: string) => string> = {
  inner_circle: chalk.magenta,
  close_friend: chalk.cyan,
  friend: chalk.blue,
  colleague: chalk.green,
  contact: chalk.white,
  acquaintance: chalk.gray,
  stranger: chalk.dim,
};

export const listCommand = new Command('list')
  .description('List people in your network')
  .option('-t, --tier <tier>', 'Filter by warmth tier')
  .option('-c, --company <company>', 'Filter by company')
  .option('-l, --limit <n>', 'Limit results', '20')
  .action(async (options) => {
    const supabase = getSupabase();
    
    let query = supabase
      .from('persons')
      .select('id, full_name, current_company, job_title, warmth_tier, last_contact_at')
      .eq('user_id', CONFIG.userId)
      .is('archived_at', null)
      .order('updated_at', { ascending: false })
      .limit(parseInt(options.limit));

    if (options.tier) {
      query = query.eq('warmth_tier', options.tier);
    }
    if (options.company) {
      query = query.ilike('current_company', `%${options.company}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }

    if (!data?.length) {
      console.log(chalk.yellow('No contacts found.'));
      return;
    }

    const table = new Table({
      head: ['Name', 'Company', 'Title', 'Tier', 'Last Contact'],
      style: { head: ['cyan'] },
    });

    for (const p of data) {
      const tierColor = TIER_COLORS[p.warmth_tier] || chalk.white;
      const lastContact = p.last_contact_at 
        ? new Date(p.last_contact_at).toLocaleDateString()
        : '-';
      
      table.push([
        p.full_name,
        p.current_company || '-',
        p.job_title || '-',
        tierColor(p.warmth_tier),
        lastContact,
      ]);
    }

    console.log(table.toString());
    console.log(chalk.gray(`\n${data.length} contacts`));
  });
