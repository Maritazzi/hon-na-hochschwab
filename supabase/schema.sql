-- Hlasovna valné hromady · Hon na Hochschwab
-- Vlož celé do Supabase → SQL Editor → New query a dej Run. Id otázek, možností a jména musí sedět s js/hlasovna.js.

create table if not exists public.votes (
  question   text not null check (question in ('odjezd', 'termin', 'lec1', 'lec2', 'pivo', 'hymna', 'vychod')),
  voter      text not null check (voter in ('Mari', 'Smeky', 'Lencoš', 'Gregy', 'Jindřich', 'Pavel', 'Vlasta')),
  option     text not null,
  updated_at timestamptz not null default now(),
  primary key (question, voter),
  constraint votes_option_valid check (
    (question = 'odjezd' and option in ('ct', 'pa')) or
    (question = 'termin' and option in ('18-20-6', '25-27-6', '11-13-6')) or
    (question = 'lec1'   and option in ('1A', '1B', '1C')) or
    (question = 'lec2'   and option in ('2A', '2B', '2C', '2D')) or
    (question = 'pivo'   and option in ('gosser', 'murauer', 'puntigamer', 'zwickl', 'radler')) or
    (question = 'hymna'  and option in ('rosamunde', 'traum', 'skoda', 'eger', 'vogelwiese', 'johann', 'jager')) or
    (question = 'vychod' and option in ('vsichni', 'dobrovolnici', 'spime'))
  )
);

alter table public.votes enable row level security;

-- Kdo má odkaz, vidí hlasy a může hlasovat nebo svůj hlas změnit. Mazat nejde.
drop policy if exists "cist hlasy" on public.votes;
drop policy if exists "hlasovat" on public.votes;
drop policy if exists "zmenit hlas" on public.votes;
create policy "cist hlasy" on public.votes for select to anon using (true);
create policy "hlasovat" on public.votes for insert to anon with check (true);
create policy "zmenit hlas" on public.votes for update to anon using (true) with check (true);

grant select, insert, update on public.votes to anon;

-- Společné odškrtávání: výřad družiny (v-*) a společná výstroj (s-*). Id musí sedět s js/hon.js.
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
