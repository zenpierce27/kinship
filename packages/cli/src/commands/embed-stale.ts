import { Command } from 'commander';
import chalk from 'chalk';
import { getSupabase } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';
import { generateEmbedding, buildEmbeddingText } from '../lib/embeddings.js';

export const embedStaleCommand = new Command('embed-stale')
  .description('Process all contacts with stale embeddings')
  .option('-l, --limit <n>', 'Max contacts to process', '50')
  .action(async (options) => {
    const supabase = getSupabase();
    const limit = parseInt(options.limit);
    
    // Get stale persons
    const { data: persons, error } = await supabase
      .from('persons')
      .select('id, full_name, current_company, job_title, notes, how_we_met')
      .eq('user_id', CONFIG.userId)
      .eq('embedding_stale', true)
      .limit(limit);

    if (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }

    if (!persons?.length) {
      console.log(chalk.green('No stale embeddings to process.'));
      return;
    }

    console.log(chalk.blue(`Processing ${persons.length} stale embeddings...`));
    
    let success = 0;
    let failed = 0;
    
    for (const person of persons) {
      process.stdout.write(chalk.gray(`  ${person.full_name}... `));
      
      const text = buildEmbeddingText(person);
      const embedding = await generateEmbedding(text);
      
      if (embedding) {
        const { error: updateError } = await supabase
          .from('persons')
          .update({ embedding, embedding_stale: false })
          .eq('id', person.id);
        
        if (updateError) {
          console.log(chalk.red('✗'));
          failed++;
        } else {
          console.log(chalk.green('✓'));
          success++;
        }
      } else {
        console.log(chalk.yellow('skipped'));
        failed++;
      }
    }
    
    console.log();
    console.log(chalk.green(`✓ ${success} updated`), chalk.gray(`| ${failed} failed`));
  });
