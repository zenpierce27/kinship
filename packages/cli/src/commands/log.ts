import { Command } from 'commander';
import chalk from 'chalk';
import { supabase } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';

export const logCommand = new Command('log')
  .description('Log an interaction with someone')
  .argument('<summary>', 'What happened')
  .option('-p, --person <name>', 'Person name (fuzzy match)')
  .option('-t, --type <type>', 'Type: meeting, call, email, message, event', 'meeting')
  .option('-d, --direction <dir>', 'Direction: inbound, outbound, mutual', 'mutual')
  .option('--date <date>', 'Date (YYYY-MM-DD)', new Date().toISOString().split('T')[0])
  .action(async (summary: string, options) => {
    // Find person by name
    if (!options.person) {
      console.error(chalk.red('Error:'), 'Please specify --person');
      process.exit(1);
    }

    const { data: persons, error: findError } = await supabase
      .from('persons')
      .select('id, full_name')
      .eq('user_id', CONFIG.userId)
      .ilike('full_name', `%${options.person}%`)
      .limit(1);

    if (findError || !persons?.length) {
      console.error(chalk.red('Error:'), `Person "${options.person}" not found`);
      process.exit(1);
    }

    const person = persons[0];

    // Create interaction
    const { error: insertError } = await supabase
      .from('interactions')
      .insert({
        user_id: CONFIG.userId,
        person_id: person.id,
        interaction_type: options.type,
        direction: options.direction,
        summary,
        occurred_at: new Date(options.date).toISOString(),
      });

    if (insertError) {
      console.error(chalk.red('Error:'), insertError.message);
      process.exit(1);
    }

    // Update last_contact_at
    await supabase
      .from('persons')
      .update({ last_contact_at: new Date(options.date).toISOString() })
      .eq('id', person.id);

    console.log(chalk.green('✓'), `Logged ${options.type} with ${chalk.bold(person.full_name)}`);
    console.log(chalk.gray(`  "${summary}"`));
  });
