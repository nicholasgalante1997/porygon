import neo4j, { Driver, type Config } from 'neo4j-driver';

import { type Pokemon } from '@pokemon/clients';
import { createLogger } from '@pokemon/logger';

const logger = createLogger('pokemon:neo4j');

const defaultNeo4jConfig: Config = {
  maxConnectionLifetime: 30 * 60 * 1000, // 30 minutes
  maxConnectionPoolSize: 50, // Maximum number of connections in the pool
  connectionAcquisitionTimeout: 60 * 1000, // 60 seconds to acquire a connection before failing
  maxTransactionRetryTime: 15 * 1000 // Retry a transaction for up to 15 seconds
};

let driver: Driver;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    logger.info('Connecting to Neo4j...');

    const uri = process.env.NEO4J_URL;
    if (!uri) throw new Error('NEO4J_URL must be set');

    const user = process.env.NEO4J_USER;
    if (!user) throw new Error('NEO4J_USER must be set');

    const secret = process.env.NEO4J_SECRET;
    if (!secret) throw new Error('NEO4J_SECRET must be set');

    driver = neo4j.driver(
      uri,
      neo4j.auth.basic(user, secret),
      defaultNeo4jConfig
    );
  }

  return driver;
}

export async function closeNeo4jDriver() {
  if (driver) {
    logger.warn('Closing Neo4j driver...');
    await driver.close();
    logger.info('Closed Neo4j driver.');
  }
}

export async function writeToGraph<InputDTO extends Record<string, unknown>, OutputDTO>(
  query: string,
  params: InputDTO = {} as InputDTO,
  verbose = false
): Promise<OutputDTO | null> {
  logger.info('Setting up *write* session to Neo4j...');
  const session = getNeo4jDriver().session({
    database: 'neo4j',
    defaultAccessMode: neo4j.session.WRITE
  });
  let error = null;
  let record = null;
  try {
    logger.info('Writing to Neo4j...');

    if (verbose) {
      logger.info(query, params);
    }

    const result = await session.executeWrite(async (tx) => {
      return await tx.run(query, params);
    });

    record = result;

    logger.info('Wrote successfully.');
  } catch (e) {
    error = e;
    logger.error('Error writing to Neo4j.');
  } finally {
    if (error) {
      logger.error(error);
    }

    await session.close();

    if (error || !record || record.records.length === 0) return null;

    return record.records.at(0)?.toObject() as OutputDTO;
  }
}

export async function readFromGraph<T>(
  query: string,
  params: unknown[],
  verbose = false
): Promise<T[] | null> {
  logger.info('Setting up *read* session to Neo4j...');
  const session = getNeo4jDriver().session({
    database: 'neo4j',
    defaultAccessMode: neo4j.session.READ
  });
  let error = null;
  let records = null;
  try {
    logger.info('Reading from Neo4j...');

    if (verbose) {
      logger.info(query, params);
    }

    const result = await session.executeRead(async (tx) => {
      return await tx.run(query, params);
    });

    records = result;

    logger.info('Read successfully.');
  } catch (e) {
    error = e;
    logger.error('Error reading from Neo4j.');
  } finally {
    if (error || !records) {
      logger.error(error);
      return null;
    }

    await session.close();
    return records?.records.map((record) => record.toObject()) as T[];
  }
}

export async function setupGraphNodeConstraints() {
  const query = `
    CREATE CONSTRAINT IF NOT EXISTS FOR (n:PokemonCard) ASSERT n.id IS UNIQUE;
    CREATE CONSTRAINT IF NOT EXISTS FOR (n:PokemonCardSet) ASSERT n.id IS UNIQUE;
  `;
  return await writeToGraph(query);
}

export async function insertSet(set: Pokemon.Set) {
  const query = `
    MERGE (set:PokemonCardSet { id: $id })
    ON CREATE SET
        set.name = $name,
        set.series = $series,
        set.printedTotal = $printedTotal,
        set.total = $total,
        set.legalities = $legalities,
        set.ptcgoCode = $ptcgoCode,
        set.releaseDate = $releaseDate,
        set.updatedAt = $updatedAt,
        set.images = $images
    RETURN set;
  `;
  const params = {
    id: set.id,
    name: set.name,
    series: set.series,
    printedTotal: set.printedTotal,
    total: set.total,
    legalities: set.legalities,
    ptcgoCode: set.ptcgoCode,
    releaseDate: set.releaseDate,
    updatedAt: set.updatedAt,
    images: set.images
  }
  return await writeToGraph(query, params);
}

export async function insertCard(card: Pokemon.Card) {
  const query = `
    MERGE (card:PokemonCard { id: $id })
    ON CREATE SET
        card.name = $name,
        card.supertype = $supertype,
        card.subtypes = $subtypes,
        card.hp = $hp,
        card.types = $types,
        card.evolvesTo = $evolvesTo,
        card.rules = $rules,
        card.attacks = $attacks,
        card.weaknesses = $weaknesses,
        card.resistances = $resistances,
        card.retreatCost = $retreatCost,
        card.convertedRetreatCost = $convertedRetreatCost,
        card.set = $set,
        card.number = $number,
        card.artist = $artist,
        card.rarity = $rarity,
        card.flavorText = $flavorText,
        card.nationalPokedexNumbers = $nationalPokedexNumbers,
        card.legalities = $legalities,
        card.images = $images
    RETURN card;
  `;
  const params = {
    id: card.id,
    name: card.name,
    supertype: card.supertype,
    subtypes: card.subtypes,
    hp: card.hp,
    types: card.types,
    evolvesTo: card.evolvesTo,
    rules: card.rules,
    attacks: card.attacks,
    weaknesses: card.weaknesses,
    resistances: card.resistances,
    retreatCost: card.retreatCost,
    convertedRetreatCost: card.convertedRetreatCost,
    set: card.set,
    setId: card.set.id,
    number: card.number,
    artist: card.artist,
    rarity: card.rarity,
    flavorText: card.flavorText,
    nationalPokedexNumbers: card.nationalPokedexNumbers,
    legalities: card.legalities,
    images: card.images
  }
  return await writeToGraph(query, params);
}
