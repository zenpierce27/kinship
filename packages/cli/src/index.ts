#!/usr/bin/env node
import { Command } from 'commander';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { logCommand } from './commands/log.js';
import { searchCommand } from './commands/search.js';
import { embedStaleCommand } from './commands/embed-stale.js';
import { decayCommand } from './commands/decay.js';
import { validateConfig } from './lib/config.js';

const program = new Command();

program
  .name('kinship')
  .description('Relationship Intelligence CLI')
  .version('0.1.0');

program.hook('preAction', () => {
  validateConfig();
});

program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(logCommand);
program.addCommand(searchCommand);
program.addCommand(embedStaleCommand);
program.addCommand(decayCommand);

program.parse();
