import { Command } from 'commander';

import { Pokedex } from '@pokemon/clients';
import { postgres } from '@pokemon/database';

const program = new Command();

program
  .command('sync:sets:pg')
  .description(
    'Synchronizes our local TCG DataStore with the Pokemon TCG API V2'
  )
  .action(syncSets);

program
  .command('sync:cards:pg')
  .description(
    'Synchronizes our local TCG DataStore with the Pokemon TCG API V2'
  )
  .action(syncCards);

program.parse();

async function syncSets() {
  const pokedex = new Pokedex();
  const pool = postgres.getPool();
  for await (const set of pokedex.getAllSets()) {
    console.log('Inserting set %s', set.name);
    try {
      await postgres.insertSet(pool, set);
    } catch (e) {
      console.error(e);
      return;
    }
  }
}

async function syncCards() {
  const pokedex = new Pokedex();
  const pool = postgres.getPool();
  for await (const set of pokedex.getAllSets()) {
    for await (const card of pokedex.getAllCardsInSet(set.id)) {
      console.log('Inserting card %s', card.id);
      try {
        await postgres.insertCard(pool, card);
      } catch (e) {
        console.error(e);
        return;
      }
    }
  }
}
