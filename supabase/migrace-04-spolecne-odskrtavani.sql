-- Migrace 04 · společné odškrtávání: výřad družiny v Plánu lovu (v-*) a společná výstroj (s-*).
-- Vlož do Supabase → SQL Editor → New query a dej Run. Jde spustit i opakovaně.
-- Id položek musí sedět s js/hon.js (peakDefs s předponou v-, sharedDefs).

create table if not exists public.checks (
  item       text primary key check (item in (
               'v-foelz', 'v-foelzk', 'v-karl', 'v-hs', 'v-hut', 'v-sev', 'v-kraut',
               's-grasser', 's-schiestl', 's-schuster', 's-znamky', 's-karty', 's-stan')),
  done       boolean not null default false,
  who        text check (who in ('Mari', 'Smeky', 'Lencoš', 'Gregy', 'Jindřich', 'Pavel', 'Vlasta')),
  updated_at timestamptz not null default now()
);

alter table public.checks enable row level security;

-- Kdo má odkaz, vidí odškrtnuté položky a může je odškrtnout nebo vrátit. Mazat nejde.
drop policy if exists "cist odskrtnute" on public.checks;
drop policy if exists "odskrtnout" on public.checks;
drop policy if exists "zmenit odskrtnuti" on public.checks;
create policy "cist odskrtnute" on public.checks for select to anon using (true);
create policy "odskrtnout" on public.checks for insert to anon with check (true);
create policy "zmenit odskrtnuti" on public.checks for update to anon using (true) with check (true);

grant select, insert, update on public.checks to anon;
