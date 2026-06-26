-- Schema for Luftgevärstracker
-- Kör detta i Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('traning', 'tavling')),
  title text not null,
  event_date date not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  series_count int not null default 10,
  shots_per_series int not null default 10,
  total_score numeric not null,
  inner_tens int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists results_event_id_idx on results(event_id);
create index if not exists events_event_date_idx on events(event_date);

alter table events enable row level security;
alter table results enable row level security;

-- Enkel öppen policy (ingen inloggning) - lämpligt för privat, ej publikt delad app.
-- Om appen ska vara publikt tillgänglig på internet bör detta ersättas med riktig autentisering.
create policy "allow all events" on events for all using (true) with check (true);
create policy "allow all results" on results for all using (true) with check (true);
