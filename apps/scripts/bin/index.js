import { mkdir, exists, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { Command } from 'commander';
import handlebars from 'handlebars';

import { Pokedex } from '@pokemon/clients';
import { postgres, neo4j } from '@pokemon/database';

import { createLogger } from '@pokemon/logger'

const program = new Command();
const logger = createLogger('pokemon:scripts');

program
  .command('db:sync')
  .description(
    'Synchronizes our local TCG DataStore with the Pokemon TCG API V2'
  )
  .action(async () => {
    await syncSets();
    await syncCards();
  });

program
  .command('scaffold')
  .argument('<type>', 'Type of thing to scaffold, either "lib", "rs-app", "ts-app", or "web-app"')
  .argument('name', 'Name of the thing')
  .action(async (type, name) => {
    const knownScaffoldingTypes = ['lib', 'rs-app', 'ts-app', 'web-app'];
    
    if (!knownScaffoldingTypes.includes(type)) {
      throw new Error(`Unknown scaffolding type ${type}`);
    }
    
    await scaffold(type, name);
  })

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
        const pgResult = await postgres.insertCard(pool, card);
        if (!pgResult) {
          throw new Error('Failed to insert card(postgres):\n' + JSON.stringify(card, null, 2));
        }
        logger.info('Inserted card %s w local name %s from set %s into postgres', card.id, card.name, card.set.name);

        logger.info('Inserting card %s w local name %s from set %s into neo4j', card.id, card.name, card.set.name);
        const neo4jResult = await neo4j.insertCard(card);
        if (!neo4jResult) {
          throw new Error('Failed to insert card(neo4j):\n' + JSON.stringify(card, null, 2));
        }
        logger.info('Inserted card %s w local name %s from set %s into neo4j', card.id, card.name, card.set.name);
      } catch (e) {
        console.error(e);
        return;
      }
    }
  }
}

async function scaffold(type, name) {
  const packageRoot = path.resolve(process.cwd(), '..', '..');
  switch(type) {
    case 'lib': {

      logger.info('Scaffolding library %s...', name);

      logger.info('Creating directory...');

      const dirpath = path.resolve(path.join(packageRoot, 'packages', name));
      
      if (await exists(dirpath)) {
        throw new Error(`Directory ${dirpath} already exists`);
      }

      await mkdir(dirpath, { recursive: true });


      logger.info('Writing files...');

      const TSCONFIG_TEMPLATE_FILE = await readFile(
        path.resolve(process.cwd(), 'templates', 'lib', 'tsconfig.json.hbs'),
        { encoding: 'utf-8' }
      );

      const TSCONFIG = handlebars.compile(TSCONFIG_TEMPLATE_FILE)({ name });

      const PACKAGE_JSON_TEMPLATE_FILE = await readFile(
        path.resolve(process.cwd(), 'templates', 'lib', 'package.json.hbs'),
        { encoding: 'utf-8' }
      );

      const PACKAGE_JSON = handlebars.compile(PACKAGE_JSON_TEMPLATE_FILE)({ name });

      const BUILD_TEMPLATE_FILE = await readFile(
        path.resolve(process.cwd(), 'templates', 'lib', 'build.ts.hbs'),
        { encoding: 'utf-8' }
      );

      const BUILD = handlebars.compile(BUILD_TEMPLATE_FILE)({ name });

      await writeFile(path.join(dirpath, 'tsconfig.json'), TSCONFIG, { encoding: 'utf-8' });
      await writeFile(path.join(dirpath, 'package.json'), PACKAGE_JSON, { encoding: 'utf-8' });
      await writeFile(path.join(dirpath, 'build.ts'), BUILD, { encoding: 'utf-8' });

      await mkdir(path.join(dirpath, 'lib'));
      await mkdir(path.join(dirpath, 'lib', '__tests__'));

      const LIB_INDEX_TEMPLATE_FILE = await readFile(
        path.resolve(process.cwd(), 'templates', 'lib', 'lib--index.ts.hbs'),
        { encoding: 'utf-8' }
      );

      const LIB_INDEX = handlebars.compile(LIB_INDEX_TEMPLATE_FILE)({ name });

      await writeFile(path.join(dirpath, 'lib', 'index.ts'), LIB_INDEX, { encoding: 'utf-8' });

      const LIB_TEST_TEMPLATE_FILE = await readFile(
        path.resolve(process.cwd(), 'templates', 'lib', 'lib--tests--index.test.ts.hbs'),
        { encoding: 'utf-8' }
      );

      const LIB_TEST = handlebars.compile(LIB_TEST_TEMPLATE_FILE)({ name });

      await writeFile(path.join(dirpath, 'lib', '__tests__', 'index.test.ts'), LIB_TEST, { encoding: 'utf-8' });

      logger.info('Scaffolded library %s', name);

      break;
    };
    case 'rs-app': {
      logger.warn('rs-app scaffolding not yet implemented');
      break;
    };
    case 'ts-app': {
      logger.warn('ts-app scaffolding not yet implemented');
      break;
    };
    case 'web-app': {
      logger.warn('web-app scaffolding not yet implemented');
      break;
    };
    default: {}
  }
}