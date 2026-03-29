import { Command } from 'commander';
import chalk from 'chalk';
import { getSupabase } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';

// Days since last contact before decay triggers
const DECAY_RULES: Record<string, { days: number; downgrade_to: string }> = {
  inner_circle: { days: 30, downgrade_to: 'close_friend' },
  close_friend: { days: 60, downgrade_to: 'friend' },
  friend: { days: 90, downgrade_to: 'colleague' },
  colleague: { days: 120, downgrade_to: 'contact' },
  contact: { days: 180, downgrade_to: 'acquaintance' },
  acquaintance: { days: 365, downgrade_to: 'stranger' },
  stranger: { days: Infinity, downgrade_to: 'stranger' },
};

export const decayCommand = new Command('decay')
  .description('Check and apply warmth decay based on last contact')
  .option('--dry-run', 'Show what would change without applying')
  .option('--force', 'Apply changes immediately')
  .action(async (options) => {
    const supabase = getSupabase();
    const now = new Date();
    
    // Get all active persons
    const { data: persons, error } = await supabase
      .from('persons')
      .select('id, full_name, warmth_tier, last_contact_at')
      .eq('user_id', CONFIG.userId)
      .is('archived_at', null)
      .neq('warmth_tier', 'stranger');

    if (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }

    if (!persons?.length) {
      console.log(chalk.green('No contacts to check.'));
      return;
    }

    const toDecay: Array<{
      id: string;
      name: string;
      from: string;
      to: string;
      daysSinceContact: number;
    }> = [];

    for (const person of persons) {
      const rule = DECAY_RULES[person.warmth_tier];
      if (!rule || rule.days === Infinity) continue;

      const lastContact = person.last_contact_at 
        ? new Date(person.last_contact_at)
        : null;
      
      const daysSinceContact = lastContact
        ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      if (daysSinceContact > rule.days) {
        toDecay.push({
          id: person.id,
          name: person.full_name,
          from: person.warmth_tier,
          to: rule.downgrade_to,
          daysSinceContact,
        });
      }
    }

    if (toDecay.length === 0) {
      console.log(chalk.green('All relationships are healthy! No decay needed.'));
      return;
    }

    console.log(chalk.yellow(`\n${toDecay.length} relationships need attention:\n`));

    for (const d of toDecay) {
      console.log(
        chalk.gray('•'),
        chalk.white(d.name),
        chalk.gray(`(${d.daysSinceContact} days)`),
        chalk.red(d.from),
        chalk.gray('→'),
        chalk.yellow(d.to)
      );
    }

    if (options.dryRun || !options.force) {
      console.log(chalk.gray('\nDry run. Use --force to apply changes.'));
      return;
    }

    // Apply decay
    console.log(chalk.blue('\nApplying decay...'));
    
    for (const d of toDecay) {
      const { error: updateError } = await supabase
        .from('persons')
        .update({ warmth_tier: d.to })
        .eq('id', d.id);
      
      if (updateError) {
        console.error(chalk.red(`  ✗ ${d.name}:`), updateError.message);
      } else {
        console.log(chalk.green(`  ✓ ${d.name}`));
      }
    }

    console.log(chalk.green('\nDecay applied.'));
  });
