-- Run these statements in the Supabase SQL editor (or via psql) to create the required tables.

-- Enable extensions (if not already enabled)
-- Note: `pgcrypto` is used for gen_random_uuid(); on some projects `uuid-ossp` may be used instead.
create extension if not exists pgcrypto;

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  player_x uuid references players(id),
  player_o uuid references players(id),
  winner text,
  moves text,
  created_at timestamptz default now()
);

-- Add an index on created_at for fast ordering
create index if not exists games_created_at_idx on games(created_at desc);
