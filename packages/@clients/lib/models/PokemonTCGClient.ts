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
        const response = await fetch(url, {
          headers: { 
            'Accept': 'application/json',
            'X-API-KEY': process.env.POKEMON_TCG_API_KEY! 
          }
        });

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

          for (const set of json) {
            yield set;
          }
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

  public async *getAllCardsInSet(setId: string): AsyncGenerator<Pokemon.Card> {
    try {
      let page = 1;
      const pageSize = 250;
      let count = 0;
      let max = Infinity;

      while (count < max) {
        const url = `${PokemonTCGClient.base}cards?q=set.id:${setId}&orderBy=number&page=${page}&pageSize=${pageSize}`;
        const response = await fetch(url, {
          headers: { 
            'Accept': 'application/json',
            'X-API-KEY': process.env.POKEMON_TCG_API_KEY!
          }
        });

        if (response.ok) {
          const data: Pokemon.CardResponse = await response.json();
          const {
            count: nextCount,
            data: json,
            page: nextPage,
            totalCount
          } = data;
          page = (nextPage + 1);
          count += nextCount;
          max = Math.min(max, totalCount);

          for (const card of json) {
            yield card;
          }
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
