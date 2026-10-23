# Hon na Hochschwab: pokyny pro Claude Code

Statická stránka (bez buildu a bez frameworku) pro sedm kamarádů z Prahy: třídenní přechod Hochschwabu ve Štýrsku v červnu 2027, pojatý jako satirická pozvánka na hon. Hostuje se na GitHub Pages, hlasování běží přes Supabase.

## Struktura

- `index.html`: celý obsah stránky jako šablona. Texty se upravují přímo tady.
- `js/hon.js`: třída `Component` s metodou `renderVals()`. Vrací hodnoty pro šablonu a obsahuje i texty generované skriptem: Seppovy hlášky u počítadla Krügerlů (`says`), plán lovu (`peakDefs`), výstroj (`gearDefs`) a telefony pro tlačítka Kopírovat (`cp`).
- `js/runtime.js`: malý vykreslovač šablony. `{{cesta}}` v textu nebo atributu se nahradí hodnotou z `renderVals()`, `<template data-for="seznam" data-as="x">` zopakuje obsah pro položky a `data-on="funkce"` napojí kliknutí. Na `{{…}}` v `index.html` nesahej, pokud neměníš i `renderVals()`.
- `js/hlasovna.js`: hlasovna valné hromady (Supabase REST) a spodní přehrávač Spotify. Otázky jsou v `QUESTIONS`, jména v `CREW`, skladby přehrávače v `TRACKS` (Spotify id, název, interpret, id možnosti v usnesení o hymně). Možnosti hymny se berou z `TRACKS`, takže nová skladba potřebuje i migraci. Přehrávač jede přes Spotify iFrame API. Konec kusu Spotify hlásí jen pozicí rovnou délce, bez pauzy.
- `config.js`: Supabase URL a publishable key. Oba jsou veřejné. Secret ani service_role klíč sem nikdy nepatří.
- `supabase/schema.sql`: tabulka `votes` s RLS. Povolená id otázek, možnosti každé otázky (`votes_option_valid`) a jména jsou v check constraintech a musí sedět s `js/hlasovna.js`. Při změně uprav schema.sql a připrav i další `supabase/migrace-NN-*.sql`, kterou uživatel spustí v SQL Editoru.
- `css/style.css`, `assets/ondra-nacrt.jpg` (Ondrův náčrt trasy 1C).

## Lokální náhled

`python3 -m http.server 8000`, pak http://localhost:8000. Hlasovna se ukáže jen s vyplněným `config.js`.

## Nasazení na GitHub Pages

Když uživatel požádá o zveřejnění a ve složce ještě není git:

```
git init -b main
git add -A
git commit -m "Hon na Hochschwab"
gh repo create hon-na-hochschwab --public --source=. --remote=origin --push
gh api -X POST "repos/{owner}/hon-na-hochschwab/pages" -f "source[branch]=main" -f "source[path]=/"
```

`{owner}` je účet z `gh api user -q .login`. Název repozitáře si nech potvrdit. Stránka pak běží na `https://<owner>.github.io/hon-na-hochschwab/`. Další změny stačí commitnout a pushnout, Pages se nasadí samy během minuty.

## Obsah a tón

- Píše se česky. Vypravěčem a průvodcem je rakouský Oberjäger Sepp Gamsbichler, který vede pražskou družinu. Nikde nepiš, že je smyšlený.
- Hlas: Sepp v uvozovkách a ve svém úvodu v záhlaví družině vyká („vy“). Všechno ostatní je psané za družinu („my“, „uvidíme“, „jdeme“).
- Humor je česká satira „na hraně“, ne poučky. Heslo zní „Všechno nejlepší hned!“, německy „Alles Gute sofort!“.
- Družina má 7 lidí: Mari (Dan, autor oběžníku), Smeky, Lencoš, Gregy, Jindřich, Pavel, Vlasta. Ondra není člen družiny ani nehlasuje. Je zvěd ze spřátelené party, který revír prošel v roce 2024.
- Leče jsou popsané jen jednou, jako rozbalovací bloky v „Hon v kostce“ (`details.lec`, id `lec-1` až `lec-3`): zavřené ukazují název, km, převýšení, čas a jednu větu, rozbalené profil, rozkaz dne a mapy. Obsahují jen základní trasu (1A, 2A a 3. leč). Varianty (1B, 1C, 2B–2D) a odjezd čtvrtek/pátek patří jen do valné hromady, varianty tras jsou tam sbalené (`details.var`). Trasy jsou orientační: usnesení č. 3 a 4 jsou nezávazná, jen nálada bez kvóra a bez vítěze, rozhoduje se na rozcestí. Ostatní usnesení (odjezd, termín, Krügerl, hymna, východ slunce) platí při čtyřech hlasech.
- Seppova vlastivěda (`#vlastiveda`) jsou historky ze starého Rakouska a Štýrska, které Sepp vypráví v uvozovkách. Fakta v nich musí být ověřená a se zdrojem v patičce, vtip je v pointě.
- Pes nejede. Mari kameny tahat nechce, je to jen vtip ve skupině.

## Fakta

Čísla tras jsou z Mapy.cz (přepočteno 17. 10. 2026), počasí z Open-Meteo ERA5 (2015–2025), kontakty a otevírací doby z webů chat a podniků. Zdroje jsou v patičce stránky. Když měníš fakt (telefon, otevírací dobu, výšku, čas), ověř ho a případně doplň zdroj do patičky. Otevírací doby Grasserhütte, Zum Roger a Schustera se mění, stránka vždy radí zavolat.
