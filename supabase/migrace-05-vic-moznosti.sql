-- Migrace 05 · hlasování pro víc možností: každý může u usnesení vybrat víc možností a hlas zase zrušit.
-- Stávající hlasy zůstávají. Vlož do Supabase → SQL Editor → New query a dej Run. Jde spustit i opakovaně.

alter table public.votes drop constraint if exists votes_pkey;
alter table public.votes add primary key (question, voter, option);

drop policy if exists "zrusit hlas" on public.votes;
create policy "zrusit hlas" on public.votes for delete to anon using (true);
grant delete on public.votes to anon;

notify pgrst, 'reload schema';
