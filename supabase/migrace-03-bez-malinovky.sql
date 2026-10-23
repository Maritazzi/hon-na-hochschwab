-- Migrace 03 · z usnesení č. 5 (první Krügerl) mizí Himbeerkracherl.
-- Vlož do Supabase → SQL Editor → New query a dej Run. Jde spustit i opakovaně.
-- Když už pro malinovku někdo hlasoval, migrace skončí chybou a nic nezmění. Pak ten hlas nejdřív ruční změnou přesuň jinam.

alter table public.votes drop constraint if exists votes_option_valid;
alter table public.votes add constraint votes_option_valid check (
  (question = 'odjezd' and option in ('ct', 'pa')) or
  (question = 'termin' and option in ('18-20-6', '25-27-6', '11-13-6')) or
  (question = 'lec1'   and option in ('1A', '1B', '1C')) or
  (question = 'lec2'   and option in ('2A', '2B', '2C', '2D')) or
  (question = 'pivo'   and option in ('gosser', 'murauer', 'puntigamer', 'zwickl', 'radler')) or
  (question = 'hymna'  and option in ('rosamunde', 'traum', 'skoda', 'eger', 'vogelwiese', 'johann', 'jager')) or
  (question = 'vychod' and option in ('vsichni', 'dobrovolnici', 'spime'))
);
