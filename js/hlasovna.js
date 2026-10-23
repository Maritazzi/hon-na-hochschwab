/* Hlasovna valné hromady (Supabase) a spodní přehrávač dechovky (Spotify).
 * Nastavení je v config.js. Id otázek, možností a jména v CREW musí sedět se supabase/schema.sql. */
var CFG = window.HON_CONFIG || {};
var SUPABASE_URL = CFG.supabaseUrl || '';
var SUPABASE_KEY = CFG.supabaseKey || '';

(function () {
  // --- Dechovka v doku: hraje popořadě a po posledním kusu zase od Rosamunde ---
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
  var dock = document.getElementById('dock');
  var slot = document.getElementById('dock-frame');
  var pick = document.getElementById('dock-track');
  var cur = 0, ctl = null, frame = null, booted = false, playing = false;

  TRACKS.forEach(function (t, i) {
    var o = document.createElement('option');
    o.value = String(i);
    pick.appendChild(o);
  });
  // Hymna honu (usnesení č. 6) dostane v seznamu korunku
  function labelTracks(hymn) {
    TRACKS.forEach(function (t, i) {
      pick.options[i].textContent = (i + 1) + '. ' + (t[3] === hymn ? '👑 ' : '') + t[1] + ' · ' + t[2];
    });
  }
  labelTracks('');
  function embedUrl(i) { return 'https://open.spotify.com/embed/track/' + TRACKS[i][0] + '?utm_source=generator'; }
  function fit() { document.body.style.paddingBottom = dock.hidden ? '' : (dock.offsetHeight + 16) + 'px'; }

  function setTrack(i, autoplay) {
    cur = (i + TRACKS.length) % TRACKS.length;
    playing = false;
    pick.value = String(cur);
    if (ctl) { ctl.loadUri('spotify:track:' + TRACKS[cur][0]); if (autoplay) ctl.play(); }
    else if (frame) frame.src = embedUrl(cur);
  }
  // Bez iFrame API od Spotify (blokované, pomalé) zůstane obyčejný embed, jen bez přechodu na další kus.
  function plainEmbed() {
    if (ctl || frame) return;
    frame = document.createElement('iframe');
    frame.title = 'Dechovka ze Spotify';
    frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.src = embedUrl(cur);
    slot.parentNode.replaceChild(frame, slot);
  }
  function boot() {
    booted = true;
    var fallback = setTimeout(plainEmbed, 5000);
    window.onSpotifyIframeApiReady = function (api) {
      if (frame) return;
      clearTimeout(fallback);
      api.createController(slot, { uri: 'spotify:track:' + TRACKS[cur][0], width: '100%', height: 80 }, function (c) {
        ctl = c;
        c.addListener('ready', function () { c.play(); fit(); });
        // Konec kusu Spotify hlásí jen pozicí rovnou délce (pauzu ne). Zprávy od předchozího kusu se ignorují.
        c.addListener('playback_update', function (e) {
          var d = e.data || {};
          if (d.playingURI && d.playingURI !== 'spotify:track:' + TRACKS[cur][0]) return;
          if (!d.isPaused && d.position > 0) playing = true;
          if (playing && d.duration > 0 && d.position >= d.duration - 500) setTrack(cur + 1, true);
        });
      });
    };
    var s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    s.onerror = function () { clearTimeout(fallback); plainEmbed(); };
    document.head.appendChild(s);
  }
  function openDock(ev) {
    if (ev) ev.preventDefault();
    dock.hidden = false; fit();
    if (!booted) boot();
    else if (ctl) ctl.resume();
    else if (frame && !frame.getAttribute('src')) frame.src = embedUrl(cur);
  }
  var opener = document.getElementById('rosamunde-open');
  if (opener) opener.addEventListener('click', openDock);
  pick.addEventListener('change', function () { setTrack(+pick.value, true); });
  document.getElementById('dock-prev').addEventListener('click', function () { setTrack(cur - 1, true); });
  document.getElementById('dock-next').addEventListener('click', function () { setTrack(cur + 1, true); });
  document.getElementById('dock-close').addEventListener('click', function () {
    if (ctl) ctl.pause();
    else if (frame) frame.removeAttribute('src');
    dock.hidden = true; fit();
  });
  window.addEventListener('resize', fit);

  // --- Hlasovna: prezence nahoře ve valné hromadě (#hlasovna), hlasování u každého usnesení ([data-hv="id"]) ---
  var CREW = ['Mari', 'Smeky', 'Lencoš', 'Gregy', 'Jindřich', 'Pavel', 'Vlasta'];
  var QUORUM = 4;
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
  function hlasy(n) { return n === 1 ? '1 hlas' : n + ' hlasy'; }
  function goLogin() {
    setStatus('Nejdřív se vyber, pak hlasuj u usnesení.', true);
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
    } }, [el('option', { value: '', text: 'vyber se' })].concat(CREW.map(function (n) {
      var o = el('option', { value: n, text: n }); if (n === me) o.selected = true; return o;
    })));
    root.appendChild(el('div', { class: 'hv-who' }, [
      el('label', { for: 'hv-voter', text: 'Kdo hlasuje:' }), sel,
      el('span', { class: 'hv-status', text: me ? 'Hlasuj rovnou u každého usnesení níž. Hlas jde kdykoli změnit.' : 'Vyber se, pak hlasuj u každého usnesení níž.' })
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
    var hymn = '';
    QUESTIONS.forEach(function (q) {
      var box = document.querySelector('[data-hv="' + q.id + '"]');
      if (!box) return;
      var qv = votes.filter(function (v) { return v.question === q.id; });
      var voters = qv.length;
      var counts = {};
      qv.forEach(function (v) { (counts[v.option] = counts[v.option] || []).push(v.voter); });
      var max = 0, leaders = [];
      q.options.forEach(function (o) { var c = (counts[o[0]] || []).length; if (c > max) { max = c; leaders = [o]; } else if (c === max && c > 0) leaders.push(o); });
      // Nezávazná usnesení (trasy) jsou jen nálada: bez kvóra a bez vítěze, rozhoduje se na rozcestí
      var state = (q.mood ? 'Nezávazné · hlasovalo ' : 'Hlasovalo ') + voters + ' ze 7', ok = false;
      if (!q.mood) {
        if (voters > 0 && voters < QUORUM) state += ', do usnesení chybí ' + hlasy(QUORUM - voters);
        else if (voters >= QUORUM && max > 0) {
          if (leaders.length === 1) { state = 'Platí: ' + leaders[0][1].split(' · ')[0]; ok = true; }
          else state = 'Rovnost, rozhoduje Jindřich';
        }
      }
      if (q.id === 'hymna' && ok) hymn = leaders[0][0];
      var mine = (qv.filter(function (v) { return v.voter === me; })[0] || {}).option;
      var opts = q.options.map(function (o) {
        var who = counts[o[0]] || [];
        var pct = Math.round(who.length / 7 * 100);
        var b = el('button', { type: 'button', class: 'hv-opt' + (mine === o[0] ? ' mine' : ''), 'aria-pressed': mine === o[0] ? 'true' : 'false',
          onclick: function () { castVote(q.id, o[0]); } }, [
          el('span', { class: 'bar', style: 'width:' + pct + '%' }),
          el('span', { text: o[1] }),
          el('span', { class: 'cnt', text: String(who.length) }),
          who.length ? el('span', { class: 'who', text: who.join(', ') }) : null
        ]);
        if (busy) b.disabled = true;
        return b;
      });
      var who = me ? el('span', { class: 'hv-q-label', text: 'Hlasuješ jako ' + me })
                   : el('button', { type: 'button', class: 'hv-q-login', onclick: goLogin, text: 'Nejdřív se přihlas v prezenci ↑' });
      box.hidden = false;
      box.textContent = '';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', q.title);
      box.appendChild(el('div', { class: 'hv-q-head' }, [who, el('span', { class: 'hv-q-state' + (ok ? ' ok' : ''), text: busy === q.id ? 'Ukládám hlas…' : state })]));
      box.appendChild(el('div', { class: 'hv-opts' }, opts));
      if (failed === q.id) box.appendChild(el('p', { class: 'hv-status err', role: 'status', text: 'Hlas se neuložil. Zkus to znovu za chvíli.' }));
    });
    labelTracks(hymn);
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
    busy = question; failed = ''; render();
    fetch(base + '?on_conflict=question,voter', {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify([{ question: question, voter: me, option: option, updated_at: new Date().toISOString() }])
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      busy = ''; return load();
    }).catch(function () {
      busy = ''; failed = question; render();
    });
  }
  render();
  load();
  setInterval(function () { if (!document.hidden && !busy) load(); }, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !busy) load(); });
})();
