CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS pokemon_card_sets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    series TEXT NOT NULL,
    printed_total INTEGER,
    total INTEGER,
    legalities JSONB,
    ptcgo_code TEXT,
    release_date DATE,
    updated_at TIMESTAMP,
    images JSONB
);

CREATE TABLE IF NOT EXISTS pokemon_cards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    supertype TEXT NOT NULL,
    subtypes JSONB,
    hp INTEGER,
    types JSONB,
    evolves_from JSONB,
    evolves_to JSONB,
    rules JSONB,
    abilities JSONB,
    attacks JSONB,
    weaknesses JSONB,
    retreat_cost JSONB,
    converted_retreat_cost INTEGER,
    set_id TEXT NOT NULL REFERENCES pokemon_card_sets(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    artist TEXT,
    rarity TEXT,
    flavor_text TEXT,
    national_pokedex_numbers JSONB,
    legalities JSONB,
    images JSONB,
    tcgplayer_url TEXT,
    tcgplayer_updated_at DATE,
    tcgplayer_prices JSONB,
    cardmarket_url TEXT,
    cardmarket_updated_at DATE,
    cardmarket_prices JSONB
);

