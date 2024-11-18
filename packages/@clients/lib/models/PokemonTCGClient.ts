import { type Pokemon } from '../types/index.js';

export default class PokemonTCGClient {
  private static readonly base = 'https://api.pokemontcg.io/v2/';

  public async *getAllSets(): AsyncGenerator<Pokemon.Set> {
    try {
      let page = 1;
      const pageSize = 250;
      let count = 0;
      let max = Infinity;

      while (count < max) {
        const url = `${PokemonTCGClient.base}sets?page=${page}&pageSize=${pageSize}`;
        const response = await fetch(url);

        if (response.ok) {
          const data: Pokemon.SetResponse = await response.json();
          const {
            count: nextCount,
            data: json,
            page: nextPage,
            totalCount
          } = data;
          page = nextPage;
          count += nextCount;
          max = Math.min(max, totalCount);

          yield json;
        } else {
          throw new Error(response.statusText);
        }
      }
    } catch (e) {
      /**
       * Implement failure metric emission logic here
       */
      throw e;
    }
  }
}
