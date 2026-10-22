# Hon na Hochschwab

Pozvánka Svobodného mysliveckého spolku na hon na Hochschwab (Štýrsko, červen 2027): trasy tří lečí, valná hromada s hlasovnou, výčep s počítadlem Krügerlů, chaty a výstroj. Provází Oberjäger Sepp.

## Spuštění na počítači

Stránka je čisté HTML bez sestavování. Otevři `index.html` v prohlížeči, nebo spusť ve složce:

```
python3 -m http.server 8000
```

a jdi na http://localhost:8000.

## Zveřejnění na GitHub Pages

S Claude Code stačí ve složce napsat: „Inicializuj git, vytvoř veřejný repozitář na GitHubu, pushni a zapni GitHub Pages.“ Postup je popsaný v `CLAUDE.md`.

Ručně:
1. Vytvoř na GitHubu veřejný repozitář a nahraj do něj celý obsah složky.
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Za chvíli běží stránka na `https://<uživatel>.github.io/<repozitář>/`.

## Hlasovna (Supabase, zdarma)

1. Na supabase.com si založ projekt. Region zvol ve střední Evropě.
2. SQL Editor → New query → vlož `supabase/schema.sql` → Run.
3. Do `config.js` vyplň Project URL a Publishable key (u starších projektů „anon public“ klíč) a změnu pushni.

Když měníš otázky nebo možnosti v `js/hlasovna.js`, musí sedět i check constrainty v databázi. Změny se dělají migrací ze složky `supabase/` (`migrace-*.sql`), kterou spustíš v SQL Editoru.

Tabulka dovolí jen číst hlasy, hlasovat a hlas změnit, a to jen za sedm jmen z družiny. Kdo má odkaz, může hlasovat za kohokoli z nich, takže je to hlasování mezi kamarády. Projekt zdarma se uspí po týdnu bez provozu. V Supabase ho pak jedním klikem probudíš.

## Přehrávač

Tlačítko „▶ Dechovka ke skrolování“ otevře přehrávač Spotify ve spodní liště, takže hraje dál při skrolování. Hraje popořadě sedm kusů ze seznamu `TRACKS` v `js/hlasovna.js`: začíná Rosamunde, pak Böhmischer Traum, a po posledním zase od začátku. Kus jde přepnout šipkami nebo vybrat ze seznamu. Celou písničku pustí jen tomu, kdo je v prohlížeči přihlášený do Spotify, ostatním 30sekundovou ukázku.
