import { Command } from 'commander';

import { Pokedex } from '@pokemon/clients';

const program = new Command();

program
  .command('sync:sets')
  .description('Synchronizes our local TCG DataStore with the Pokemon TCG API V2')
  .action(syncSets);

program.parse();

async function syncSets() {
  const pokedex = new Pokedex();
  for await (const set of pokedex.getAllSets()) {
    console.log(set);
  }
}