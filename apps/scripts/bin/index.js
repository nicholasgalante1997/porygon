import { Command } from 'commander';

import { Pokedex } from '@pokemon/clients';
import { postgres, neo4j } from '@pokemon/database';

import { createLogger } from '@pokemon/logger'

const program = new Command();
const logger = createLogger('pokemon:scripts');

program
  .command('sync:sets')
  .description(
    'Synchronizes our local TCG DataStore with the Pokemon TCG API V2'
  )
  .action(syncSets);

program
  .command('sync:cards')
  .description(
    'Synchronizes our local TCG DataStore with the Pokemon TCG API V2'
  )
  .action(syncCards);

program
  .command('db:sync')
  .description(
    'Synchronizes our local TCG DataStore with the Pokemon TCG API V2'
  )
  .action(async () => {
    await syncSets();
    await syncCards();
  });

program.parse();

async function syncSets() {
  const pokedex = new Pokedex();
  const pool = postgres.getPool();
  for await (const set of pokedex.getAllSets()) {
    logger.info('Inserting set %s into datastores...', set.name);
    try {
      logger.info('Inserting set %s into postgres...', set.name);
      await postgres.insertSet(pool, set);
      logger.info('Inserted set %s into postgres.', set.name);

      logger.info('Inserting set %s into neo4j...', set.name);
      await neo4j.insertSet(set);
      logger.info('Inserted set %s into neo4j.', set.name);
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
      logger.info('Inserting card %s w local name %s from set %s into datastores ...', card.id, card.name, card.set.name);
      try {
        logger.info('Inserting card %s w local name %s from set %s into postgres', card.id, card.name, card.set.name);
        await postgres.insertCard(pool, card);
        logger.info('Inserted card %s w local name %s from set %s into postgres', card.id, card.name, card.set.name);

        logger.info('Inserting card %s w local name %s from set %s into neo4j', card.id, card.name, card.set.name);
        await neo4j.insertCard(card);
        logger.info('Inserted card %s w local name %s from set %s into neo4j', card.id, card.name, card.set.name);
      } catch (e) {
        console.error(e);
        return;
      }
    }
  }
}