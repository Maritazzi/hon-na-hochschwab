-- Migrace 06 · nováček Lukáš smí hlasovat i odškrtávat.
-- Vlož do Supabase → SQL Editor → New query a dej Run. Jde spustit i opakovaně. Na konci vypíše platná pravidla pro jména.

alter table public.votes drop constraint if exists votes_voter_check;
alter table public.votes add constraint votes_voter_check
  check (voter in ('Mari', 'Smeky', 'Lencoš', 'Gregy', 'Jindřich', 'Pavel', 'Vlasta', 'Lukáš'));

alter table public.checks drop constraint if exists checks_who_check;
alter table public.checks add constraint checks_who_check
  check (who in ('Mari', 'Smeky', 'Lencoš', 'Gregy', 'Jindřich', 'Pavel', 'Vlasta', 'Lukáš'));

select conrelid::regclass as tabulka, conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid in ('public.votes'::regclass, 'public.checks'::regclass) and contype = 'c'
  and pg_get_constraintdef(oid) like '%Mari%';
