/* Hlasovna valné hromady (Supabase).
 * Nastavení je v config.js. Id otázek, možností a jména v CREW musí sedět se supabase/schema.sql. */
var CFG = window.HON_CONFIG || {};
var SUPABASE_URL = CFG.supabaseUrl || '';
var SUPABASE_KEY = CFG.supabaseKey || '';

(function () {
  // Skladby playlistu Hon na Hochschwab ve Spotify, v pořadí playlistu. Z nich jsou možnosti usnesení o hymně.
  // [Spotify id, název, interpret, id možnosti v usnesení o hymně (musí sedět se supabase/schema.sql)]
  var TRACKS = [
    ['6FT3Zcgo1RkVmBcqyLsdyb', 'Rosamunde', 'Peter Alexander', 'rosamunde'],
    ['6r8pJYmX7u0MxmB7dznmkE', 'Böhmischer Traum', 'Gasterländer Blasmusikanten', 'traum'],
    ['4gr49XsRR5AbpihGZmIUAS', 'Egerländer Musikantenmarsch', 'Ernst Mosch', 'eger'],
    ['4pYwTYhwmBKfalocihRrlb', 'Auf der Vogelwiese', 'Ernst Mosch', 'vogelwiese'],
    ['6C7qI1CiQtNPdAxkzgkQPw', 'Erzherzog-Johann-Jodler-Marsch', 'Musikverein Dechantskirchen', 'johann'],
    ['1a2W0n1Z43jDBm4xT4y79s', 'Alter Jägermarsch', 'Blasmusikverein St. Hubertus', 'jager'],
    ['58Y9PExoI3NcjW7NGJZEML', 'Škoda lásky', 'Vejvodova kapela', 'skoda']
  ];

  // --- Hlasovna: prezence nahoře ve valné hromadě (#hlasovna), hlasování u každého usnesení ([data-hv="id"]) ---
  var CREW = ['Mari', 'Smeky', 'Lencoš', 'Gregy', 'Jindřich', 'Pavel', 'Vlasta', 'Lukáš'];
  var QUESTIONS = [
    { id: 'odjezd', title: 'Usnesení č. 1: odjezd z Prahy', options: [
      ['ct', 'Čtvrtek po obědě · Krügerl na přivítání, noc v Seewiesenu'],
      ['pa', 'Pátek v 5:00 · rovnou na trasu, střízlivě'] ] },
    { id: 'termin', title: 'Usnesení č. 2: termín 2027 (pá–ne, při čtvrtku o den dřív)', options: [
      ['18-20-6', '18.–20. 6.'], ['25-27-6', '25.–27. 6.'], ['11-13-6', '11.–13. 6.'] ] },
    { id: 'lec1', mood: true, title: 'Usnesení č. 3, nezávazné: 1. leč, kudy na Fölzalm', options: [
      ['1A', '1A Ondrova trasa · 11,4 km · ↑ 1 040 m · 5:12 h'],
      ['1B', '1B Totéž + odbočka na Windgrube a Schönleitenhaus · 14,9 km · ↑ 1 095 m · 6:10 h'],
      ['1C', '1C Ondrův oblouk přes Fölzklamm · 16,6 km · ↑ ≈ 1 530 m · 8:30 h · jen při čtvrtku'] ] },
    { id: 'lec2', mood: true, title: 'Usnesení č. 4, nezávazné: 2. leč, co s vrcholem', options: [
      ['2A', '2A Klasika: k chatě, vrchol nalehko'],
      ['2B', "2B Klasika + G'hacktkogel · +1:20 h"],
      ['2C', '2C Klasika + Ringkamp · +2:45 h'],
      ['2D', '2D Žebříky rovnou na vrchol'] ] },
    { id: 'pivo', title: 'Usnesení č. 5: první Krügerl', options: [
      ['gosser', 'Gösser Märzen'], ['murauer', 'Murauer Märzen'], ['puntigamer', 'Puntigamer'],
      ['zwickl', 'Zwickl'], ['radler', 'Radler'] ] },
    { id: 'hymna', title: 'Usnesení č. 6: hymna honu', options: TRACKS.map(function (t) { return [t[3], t[1] + ' · ' + t[2]]; }) },
    { id: 'vychod', title: 'Usnesení č. 7: na východ slunce na vrchol (4:51)', options: [
      ['vsichni', 'Všichni nahoru · budíček ve čtyři'],
      ['dobrovolnici', 'Jen dobrovolníci · ostatní spí'],
      ['spime', 'Spíme · Sepp to vyfotí'] ] }
  ];
  var root = document.getElementById('hlasovna');
  if (!root || !SUPABASE_URL || !SUPABASE_KEY) return;   // bez nastavení v config.js se hlasování neukáže

  var base = SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/votes';
  function headers(extra) {
    var h = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' };
    if (SUPABASE_KEY.indexOf('eyJ') === 0) h.Authorization = 'Bearer ' + SUPABASE_KEY;
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  var votes = [];   // {question, voter, option}
  var me = '';
  try { me = localStorage.getItem('hon-hochschwab-voter') || ''; } catch (e) {}
  if (CREW.indexOf(me) < 0) me = '';
  // busy: id usnesení, které se právě ukládá; failed: id usnesení, jehož hlas se neuložil
  var busy = '', failed = '', lastLoad = null, statusMsg = '', statusErr = false;

  // --- Společné odškrtávání (výřad družiny v Plánu lovu, společná výstroj): tabulka checks ---
  // Stav jde do šablony přes window.__dcComp.setState({ shared, me }) a js/hon.js volá window.honShared.toggle(id).
  var checksUrl = SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/checks';
  var checks = null, checkBusy = false;
  function publishShared(err) {
    if (window.__dcComp) window.__dcComp.setState({ shared: checks, me: me, shareErr: !!err });
  }
  function loadChecks() {
    return fetch(checksUrl + '?select=item,done,who', { headers: headers() })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) {
        if (checkBusy) return;
        var m = {};
        rows.forEach(function (x) { m[x.item] = { done: x.done, who: x.who }; });
        checks = m; publishShared();
      })
      .catch(function () {});   // bez tabulky checks zůstává odškrtávání jen v telefonu
  }
  window.honShared = { toggle: function (item) {
    if (!checks || checkBusy) return;
    if (!me) { goLogin(); return; }
    var prev = checks[item], now = !(prev && prev.done);
    checks = Object.assign({}, checks); checks[item] = { done: now, who: me };
    checkBusy = true; publishShared();
    fetch(checksUrl + '?on_conflict=item', {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify([{ item: item, done: now, who: me, updated_at: new Date().toISOString() }])
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      checkBusy = false; return loadChecks();
    }).catch(function () {
      checks = Object.assign({}, checks);
      if (prev) checks[item] = prev; else delete checks[item];
      checkBusy = false; publishShared(true);
    });
  } };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function setStatus(msg, err) { statusMsg = msg; statusErr = !!err; render(); }
  function goLogin() {
    setStatus('Nejdřív se vyber, pak můžeš hlasovat i odškrtávat.', true);
    var s = document.getElementById('hv-voter');
    if (s) { s.scrollIntoView({ block: 'center', behavior: 'smooth' }); s.focus({ preventScroll: true }); }
  }

  // Prezence: kdo hlasuje a prezenční listina (kolik usnesení kdo odhlasoval, ať je koho popohnat ve WhatsAppu)
  function renderRoll() {
    root.hidden = false;
    root.textContent = '';
    root.appendChild(el('h3', { text: 'Prezence' }));
    var sel = el('select', { id: 'hv-voter', onchange: function (e) {
      me = e.target.value;
      try { localStorage.setItem('hon-hochschwab-voter', me); } catch (err) {}
      statusMsg = ''; statusErr = false;
      render();
      publishShared();
    } }, [el('option', { value: '', text: 'vyber se' })].concat(CREW.map(function (n) {
      var o = el('option', { value: n, text: n }); if (n === me) o.selected = true; return o;
    })));
    root.appendChild(el('div', { class: 'hv-who' }, [
      el('label', { for: 'hv-voter', text: 'Kdo hlasuje:' }), sel,
      el('span', { class: 'hv-status', text: me ? 'Hlasuj rovnou u každého usnesení níž. Jde vybrat víc možností, dalším kliknutím hlas zrušíš.' : 'Vyber se, pak hlasuj u každého usnesení níž.' })
    ]));
    var all = QUESTIONS.length, full = 0;
    var chips = CREW.map(function (n) {
      var c = QUESTIONS.filter(function (q) { return votes.some(function (v) { return v.voter === n && v.question === q.id; }); }).length;
      if (c === all) full += 1;
      return el('span', { class: 'hv-chip' + (c === all ? ' done' : (c ? '' : ' none')), text: n + ' ' + c + '/' + all });
    });
    root.appendChild(el('div', { class: 'hv-roll' }, [el('span', { class: 'hv-roll-h', text: 'Prezenční listina' })].concat(chips)));
    if (lastLoad && full === CREW.length) root.appendChild(el('p', { class: 'hv-status', text: 'Odhlasováno do posledního myslivce. Sepp chystá oznámení.' }));
    var stamp = lastLoad ? 'Stav z ' + lastLoad.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) + ', obnovuje se samo.' : 'Načítám hlasy…';
    root.appendChild(el('p', { class: 'hv-status' + (statusErr ? ' err' : ''), role: 'status', text: statusMsg || stamp }));
  }

  function render() {
    renderRoll();
    QUESTIONS.forEach(function (q) {
      var box = document.querySelector('[data-hv="' + q.id + '"]');
      if (!box) return;
      var qv = votes.filter(function (v) { return v.question === q.id; });
      var voters = qv.map(function (v) { return v.voter; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).length;
      var counts = {};
      qv.forEach(function (v) { (counts[v.option] = counts[v.option] || []).push(v.voter); });
      var max = 0, leaders = [];
      q.options.forEach(function (o) { var c = (counts[o[0]] || []).length; if (c > max) { max = c; leaders = [o]; } else if (c === max && c > 0) leaders.push(o); });
      // Závazné usnesení se rozhodne, až hlasuje celá družina. Nezávazná (trasy) jsou jen nálada bez vítěze, rozhoduje se na rozcestí.
      var state = (q.mood ? 'Nezávazné · hlasovalo ' : 'Hlasovalo ') + voters + ' ze ' + CREW.length, ok = false;
      if (!q.mood && voters === CREW.length && max > 0) {
        if (leaders.length === 1) { state = 'Platí: ' + leaders[0][1].split(' · ')[0]; ok = true; }
        else state = 'Rovnost, rozhoduje Jindřich';
      }
      var mine = qv.filter(function (v) { return v.voter === me; }).map(function (v) { return v.option; });
      var opts = q.options.map(function (o) {
        var who = counts[o[0]] || [];
        var pct = Math.round(who.length / CREW.length * 100);
        var b = el('button', { type: 'button', class: 'hv-opt' + (mine.indexOf(o[0]) >= 0 ? ' mine' : ''), 'aria-pressed': mine.indexOf(o[0]) >= 0 ? 'true' : 'false',
          onclick: function () { castVote(q.id, o[0]); } }, [
          el('span', { class: 'bar', style: 'width:' + pct + '%' }),
          el('span', { text: o[1] }),
          el('span', { class: 'cnt', text: String(who.length) }),
          who.length ? el('span', { class: 'who', text: who.join(', ') }) : null
        ]);
        if (busy) b.disabled = true;
        return b;
      });
      var who = me ? el('span', { class: 'hv-q-label', text: 'Hlasuješ jako ' + me + ' · jde vybrat víc možností' })
                   : el('button', { type: 'button', class: 'hv-q-login', onclick: goLogin, text: 'Nejdřív se přihlas v prezenci ↑' });
      box.hidden = false;
      box.textContent = '';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', q.title);
      box.appendChild(el('div', { class: 'hv-q-head' }, [who, el('span', { class: 'hv-q-state' + (ok ? ' ok' : ''), text: busy === q.id ? 'Ukládám hlas…' : state })]));
      box.appendChild(el('div', { class: 'hv-opts' }, opts));
      if (failed === q.id) box.appendChild(el('p', { class: 'hv-status err', role: 'status', text: 'Hlas se neuložil. Zkus to znovu za chvíli.' }));
    });
  }

  function load() {
    return fetch(base + '?select=question,voter,option', { headers: headers() })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) { votes = rows; lastLoad = new Date(); if (!busy) { statusMsg = ''; statusErr = false; } render(); })
      .catch(function () { setStatus('Hlasy se nepodařilo načíst. Zkontroluj připojení a obnov stránku.', true); });
  }
  function castVote(question, option) {
    if (busy) return;
    if (!me) { goLogin(); return; }
    // Kliknutí přepíná: nová možnost se přidá, už vybraná se zruší
    var has = votes.some(function (v) { return v.question === question && v.voter === me && v.option === option; });
    busy = question; failed = ''; render();
    (has
      ? fetch(base + '?question=eq.' + encodeURIComponent(question) + '&voter=eq.' + encodeURIComponent(me) + '&option=eq.' + encodeURIComponent(option), {
          method: 'DELETE',
          headers: headers({ Prefer: 'return=minimal' })
        })
      : fetch(base, {
          method: 'POST',
          headers: headers({ Prefer: 'resolution=ignore-duplicates,return=minimal' }),
          body: JSON.stringify([{ question: question, voter: me, option: option, updated_at: new Date().toISOString() }])
        })
    ).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      busy = ''; return load();
    }).catch(function () {
      busy = ''; failed = question; render();
    });
  }
  render();
  load();
  loadChecks();
  setInterval(function () { if (!document.hidden && !busy) { load(); loadChecks(); } }, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !busy) { load(); loadChecks(); } });
})();
