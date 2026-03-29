import { Command } from 'commander';
import chalk from 'chalk';
import { getSupabase, type Person } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';
import { generateEmbedding, buildEmbeddingText } from '../lib/embeddings.js';

export const addCommand = new Command('add')
  .description('Add a new person to your network')
  .argument('<name>', 'Full name of the person')
  .option('-e, --email <email>', 'Email address')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-c, --company <company>', 'Current company')
  .option('-t, --title <title>', 'Job title')
  .option('-m, --met <context>', 'How you met')
  .option('--tier <tier>', 'Warmth tier', 'contact')
  .option('-n, --notes <notes>', 'Additional notes')
  .option('--no-embed', 'Skip embedding generation')
  .action(async (name: string, options) => {
    const supabase = getSupabase();
    
    // Build embedding text
    const embeddingText = buildEmbeddingText({
      full_name: name,
      current_company: options.company,
      job_title: options.title,
      how_we_met: options.met,
      notes: options.notes,
    });
    
    // Generate embedding if not skipped
    let embedding: number[] | null = null;
    if (options.embed !== false) {
      process.stdout.write(chalk.gray('Generating embedding... '));
      embedding = await generateEmbedding(embeddingText);
      if (embedding) {
        console.log(chalk.green('✓'));
      } else {
        console.log(chalk.yellow('skipped'));
      }
    }
    
    const person: Partial<Person> & { embedding?: number[] } = {
      user_id: CONFIG.userId,
      full_name: name,
      emails: options.email ? [{ email: options.email, primary: true }] : [],
      phones: options.phone ? [{ number: options.phone }] : [],
      current_company: options.company,
      job_title: options.title,
      how_we_met: options.met,
      warmth_tier: options.tier,
      notes: options.notes,
      met_date: new Date().toISOString().split('T')[0],
      embedding_stale: !embedding,
    };
    
    if (embedding) {
      (person as any).embedding = embedding;
    }

    const { data, error } = await supabase
      .from('persons')
      .insert(person)
      .select()
      .single();

    if (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }

    console.log(chalk.green('✓'), `Added ${chalk.bold(name)}`);
    console.log(chalk.gray(`  ID: ${data.id}`));
    if (options.company) console.log(chalk.gray(`  Company: ${options.company}`));
    if (options.email) console.log(chalk.gray(`  Email: ${options.email}`));
    console.log(chalk.gray(`  Tier: ${options.tier}`));
    if (embedding) console.log(chalk.gray(`  Embedding: ${embedding.length} dims`));
  });
