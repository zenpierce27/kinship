import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getSupabase } from '../lib/supabase.js';
import { CONFIG } from '../lib/config.js';
import { generateEmbedding } from '../lib/embeddings.js';

export const searchCommand = new Command('search')
  .description('Semantic search across your network')
  .argument('<query>', 'Natural language query (e.g., "who works at Google?")')
  .option('-l, --limit <n>', 'Max results', '10')
  .option('-t, --threshold <n>', 'Similarity threshold (0-1)', '0.3')
  .action(async (query: string, options) => {
    const supabase = getSupabase();
    const limit = parseInt(options.limit);
    const threshold = parseFloat(options.threshold);
    
    // Generate query embedding
    process.stdout.write(chalk.gray('Generating query embedding... '));
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      console.log(chalk.red('✗'));
      console.error(chalk.red('Error:'), 'Could not generate query embedding');
      process.exit(1);
    }
    console.log(chalk.green('✓'));
    
    // Get all persons with embeddings
    process.stdout.write(chalk.gray('Searching contacts... '));
    
    const { data: persons, error } = await supabase
      .from('persons')
      .select('id, full_name, current_company, job_title, warmth_tier, embedding, notes, how_we_met')
      .eq('user_id', CONFIG.userId)
      .is('archived_at', null)
      .not('embedding', 'is', null);
    
    if (error) {
      console.log(chalk.red('✗'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
    
    if (!persons?.length) {
      console.log(chalk.yellow('No contacts with embeddings found.'));
      console.log(chalk.gray('Run: kinship embed-stale'));
      return;
    }
    
    // Calculate cosine similarity client-side
    const results = persons
      .map(p => {
        // Parse embedding if it's a string (Supabase returns vectors as JSON strings)
        let embedding: number[];
        if (typeof p.embedding === 'string') {
          try {
            embedding = JSON.parse(p.embedding);
          } catch {
            // Try parsing as array format [x,y,z,...]
            embedding = p.embedding
              .replace(/[\[\]]/g, '')
              .split(',')
              .map(Number);
          }
        } else {
          embedding = p.embedding as number[];
        }
        
        return {
          ...p,
          similarity: cosineSimilarity(queryEmbedding, embedding),
        };
      })
      .filter(p => p.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    console.log(chalk.green('✓'));
    displayResults(results, query);
  });

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function displayResults(results: any[], query: string) {
  if (!results.length) {
    console.log(chalk.yellow(`No matches for "${query}"`));
    return;
  }
  
  console.log(chalk.blue(`\nResults for: "${query}"\n`));
  
  const table = new Table({
    head: ['Name', 'Company', 'Title', 'Match'],
    style: { head: ['cyan'] },
  });
  
  for (const r of results) {
    const sim = r.similarity;
    const simColor = sim > 0.7 ? chalk.green : sim > 0.5 ? chalk.yellow : chalk.gray;
    
    table.push([
      r.full_name,
      r.current_company || '-',
      r.job_title || '-',
      simColor((sim * 100).toFixed(0) + '%'),
    ]);
  }
  
  console.log(table.toString());
  console.log(chalk.gray(`${results.length} matches`));
}
