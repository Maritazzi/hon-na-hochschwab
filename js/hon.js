/* Logika stránky: stav, výpočty a texty generované skriptem (hlášky, plán lovu, výstroj). */
window.__dcBoot(function () {
class Component extends DCLogic {
  constructor(props) {
    super(props);
    // shared: společné odškrtávání ze Supabase ({id: {done, who}}), dodává js/hlasovna.js; me: kdo je přihlášený v prezenci
    this.state = { show: 'all', peaks: {}, gear: {}, copied: '', kr: 0, shared: null, me: '' };
  }
  renderVals() {
    var self = this;
    var p = this.props;
    var s = this.state;
    var d1 = p.d1 || '#4E7A3A';
    var d2 = p.d2 || '#8E2F25';
    var d3 = p.d3 || '#3B5E86';
    var loden = p.loden || '#33422E';
    var show = s.show;
    function vis(k) { return (show === 'all' || show === k) ? 'inline' : 'none'; }
    var tabDefs = [
      { id: 'all', label: 'Celý hon', sw: 'linear-gradient(90deg, ' + d1 + ' 0 33%, ' + d2 + ' 33% 66%, ' + d3 + ' 66%)' },
      { id: 'd1', label: '1. leč', sw: d1 },
      { id: 'd2', label: '2. leč', sw: d2 },
      { id: 'd3', label: '3. leč', sw: d3 }
    ];
    var tabs = tabDefs.map(function (t) {
      var on = show === t.id;
      return {
        label: t.label, sw: t.sw, pressed: on ? 'true' : 'false',
        bg: on ? loden : '#F4ECD8', fg: on ? '#EEE9D9' : '#1D2418', bd: on ? loden : '#C5B48E',
        pick: function () { self.setState({ show: t.id }); }
      };
    });
    var peakDefs = [
      { id: 'foelz', name: 'Fölzstein', sub: '2. leč · rozcvička hned po snídani', el: '1 946 m' },
      { id: 'foelzk', name: 'Fölzkogel', sub: '2. leč · Ondra ho v hlášení zatajil', el: '2 022 m' },
      { id: 'karl', name: 'Karlhochkogel', sub: '2. leč · nejvyšší bod před rozcestím', el: '2 096 m' },
      { id: 'hs', name: 'Hochschwab · kapitální kus', sub: '2. leč · od chaty, ne po žebřících', el: '2 277 m', big: true },
      { id: 'hut', name: 'Hutkogel', sub: '3. leč · první kus na hřebeni', el: '2 035 m' },
      { id: 'sev', name: 'Severinkogel', sub: '3. leč · o 3 m vyšší než Hutkogel, ať je čím se chlubit', el: '2 038 m' },
      { id: 'kraut', name: 'Krautgartenkogel', sub: '3. leč · zelná zahrádka, pak už jen dolů ke Krügerlu', el: '1 988 m' }
    ];
    // Společné odškrtávání (výřad družiny, společná výstroj) jde přes Supabase. Bez něj se pamatuje jen v telefonu.
    var sh = s.shared;
    function sharedOn(id) { return sh ? !!(sh[id] && sh[id].done) : !!s.gear[id]; }
    function sharedWho(id) { return sh && sh[id] && sh[id].done ? sh[id].who || '' : ''; }
    function sharedToggle(id) {
      if (sh && window.honShared) { window.honShared.toggle(id); return; }
      var n = Object.assign({}, self.state.gear); n[id] = !n[id]; self.setState({ gear: n });
    }
    function stamperl(n) { return n === 1 ? '1 Stamperl' : (n < 5 ? n + ' Stamperly' : n + ' Stamperlů'); }
    var nPeaks = 0;
    var peaks = peakDefs.map(function (k) {
      var id = 'v-' + k.id;
      var on = sh ? sharedOn(id) : !!s.peaks[k.id];
      var who = sharedWho(id);
      if (on) nPeaks += 1;
      return {
        name: k.name, el: k.el, on: on, mark: on ? '✓' : '',
        sub: on ? '✓ ' + (who ? who + ' · ' : '') + 'Sepp nalévá Stamperl' : k.sub,
        bg: on ? loden : '#F4ECD8', fg: on ? '#EEE9D9' : '#1D2418', subc: on ? '#CDA95C' : '#5B6250',
        bd: k.big ? '#94742E' : (on ? loden : '#C5B48E'),
        toggle: function () {
          if (sh && window.honShared) { window.honShared.toggle(id); return; }
          var n = Object.assign({}, self.state.peaks); n[k.id] = !n[k.id]; self.setState({ peaks: n });
        }
      };
    });
    var tally = nPeaks === peakDefs.length
      ? 'Výřad kompletní: ' + peakDefs.length + ' vrcholů, ' + stamperl(nPeaks) + '. Sepp jde spát.'
      : 'Výřad družiny: ' + nPeaks + ' ze ' + peakDefs.length + ' vrcholů' + (nPeaks ? ' · Sepp nalil ' + stamperl(nPeaks) : ' · na každém vrcholu Sepp nalévá Stamperl');
    var hint = !sh ? 'Odškrtnutí se pamatuje jen v tomhle telefonu.'
      : (s.shareErr ? 'Odškrtnutí se neuložilo, zkus to znovu.'
      : (s.me ? 'Odškrtáváš jako ' + s.me + ', vidí to celá družina.' : 'Vidí to celá družina. Odškrtávat jde po přihlášení v prezenci.'));
    var sharedDefs = [
      { id: 's-grasser', name: 'Grasserhütte zarezervovaná', sub: 'hlasem, 1. noc' },
      { id: 's-schiestl', name: 'Schiestlhaus zarezervovaný', sub: 'hlasem, po–pá 10–11 h, 2. noc' },
      { id: 's-schuster', name: 'Schuster a Roger', sub: 'jen při čtvrtku: apartmány a večeře nahlásit předem' },
      { id: 's-znamky', name: 'Dálniční známky na obě auta', sub: 'online předem' },
      { id: 's-karty', name: 'Karty', sub: 'mariášky na prší, nese Mari' },
      { id: 's-stan', name: 'Stan pro Smekyho', sub: 'jen jako rekvizita, spí se na chatě' }
    ];
    var gearShared = sharedDefs.map(function (g) {
      var on = sharedOn(g.id), who = sharedWho(g.id);
      return {
        name: g.name, sub: g.sub + (who ? ' · ✓ ' + who : ''), on: on, mark: on ? '✓' : '',
        col: on ? '#5B6250' : '#1D2418', deco: on ? 'line-through' : 'none',
        toggle: function () { sharedToggle(g.id); }
      };
    });
    var gearDefs = [
      { id: 'sack', name: 'Hüttenschlafsack', sub: 'na Grasserhütte povinný' },
      { id: 'lamp', name: 'Čelovka', sub: 'východ slunce na vrcholu ve 4:51' },
      { id: 'warm', name: 'Teplá vrstva a bunda', sub: 'noc ve 2 156 m, v červnu kolem 4 °C' },
      { id: 'rain', name: 'Nepromokavá vrstva', sub: 'odpoledne prší skoro každý druhý den, membránu konzultujte s Gregym' },
      { id: 'plugs', name: 'Špunty do uší', sub: 'pokoj pro dvanáct a Pavlovy historky' },
      { id: 'cash', name: 'Hotovost', sub: '„bankáč je u pizzy“ tady neprojde' },
      { id: 'ins', name: 'Pojištění s horskou záchranou', sub: 'v Rakousku se záchrana platí, viz Alpenverein níž' },
      { id: 'map', name: 'Mapy.cz staženy offline', sub: 'signál v revíru nezaručujeme' },
      { id: 'hat', name: 'Klobouk s Gamsbartem', sub: 'dobrovolný, ale Sepp si to pamatuje' }
    ];
    var nGear = 0;
    var gear = gearDefs.map(function (g) {
      var on = !!s.gear[g.id];
      if (on) nGear += 1;
      return {
        name: g.name, sub: g.sub, on: on, mark: on ? '✓' : '',
        col: on ? '#5B6250' : '#1D2418', deco: on ? 'line-through' : 'none',
        toggle: function () { var n = Object.assign({}, self.state.gear); n[g.id] = !n[g.id]; self.setState({ gear: n }); }
      };
    });
    function setAllGear(v) { var n = Object.assign({}, self.state.gear); gearDefs.forEach(function (g) { n[g.id] = v; }); self.setState({ gear: n }); }
    var says = [
      'Střízlivý Pražan v revíru. Sepp volá Bergrettung.',
      'Prost! První je nejlepší, proto se pije hned.',
      'Zum Wohl! Druhý je kvůli symetrii.',
      'Třetí. Pavel začíná historku. Zbývají dvě hodiny padesát minut.',
      'Čtvrtý. Gregy vysvětluje, proč má jeho bunda lepší membránu než tvoje.',
      'Pátý. Mari preventivně kontroluje batoh. Kameny zatím žádné.',
      'Šestý. Lencoš ke každému pivu rozdává proteinovou tyčinku. Prý aby se to počítalo jako regenerace.',
      'Sedmý. Smeky jde ven zkontrolovat, jestli by se pod širákem nespalo líp.',
      'Osmý. Jindřich právě dorazil. Přesně.',
      'Devátý. Vlasta vybaluje plnou polní.',
      'Desátý. Sepp vidí dva Hochschwaby a na oba chce ráno vylézt.',
      'Jedenáctý. Dechovka hraje Rosamunde potřetí. Nikomu to nevadí.',
      'Sepp vám bere Krügerl a nese Himbeerkracherl. Ne kvůli vám. Ten Krügerl chtěl on.'
    ];
    var kr = s.kr || 0;
    var blurPx = kr < 3 ? 0 : Math.min(2.2, (kr - 2) * 0.28);
    var fx = {
      blur: blurPx ? 'blur(' + blurPx.toFixed(2) + 'px)' : 'none',
      ghost: kr < 3 ? 'none' : (Math.min(6, kr - 1) + 'px 0 0 rgba(29,36,24,.28)'),
      cls: kr >= 9 ? 'kr-sway2' : (kr >= 6 ? 'kr-sway' : '')
    };
    var mugs = [];
    for (var i = 0; i < Math.min(kr, 20); i++) { mugs.push({ i: i }); }
    function cp(id, text, base) {
      var done = s.copied === id;
      return {
        label: done ? '✓ Zkopírováno' : base,
        bg: done ? loden : '#EADFC6', fg: done ? '#EEE9D9' : '#1D2418',
        run: function () {
          window.__copyText(text);
          self.setState({ copied: id });
          setTimeout(function () { if (self.state.copied === id) { self.setState({ copied: '' }); } }, 1800);
        }
      };
    }
    return {
      d1: d1, d2: d2, d3: d3, loden: loden,
      tabs: tabs,
      mv: { d1: vis('d1'), d2: vis('d2'), d3: vis('d3') },
      peaks: peaks, tally: tally, hint: hint,
      gearShared: gearShared, gear: gear, gearCount: nGear + ' / ' + gearDefs.length,
      gearAll: function () { setAllGear(true); },
      gearReset: function () { setAllGear(false); },
      kr: kr,
      krSays: says[Math.min(kr, says.length - 1)],
      fx: fx, mugs: mugs,
      krReset: function () { self.setState({ kr: 0 }); },
      krUp: function () { self.setState({ kr: (self.state.kr || 0) + 1 }); },
      krDown: function () { self.setState({ kr: Math.max(0, (self.state.kr || 0) - 1) }); },
      cp: {
        gTel: cp('gTel', '+4366478069267', 'Kopírovat'),
        gGps: cp('gGps', '47.60079, 15.18916', 'GPS'),
        sTel: cp('sTel', '+4369910812199', 'Kopírovat'),
        sGps: cp('sGps', '47.62014, 15.14702', 'GPS'),
        vTel: cp('vTel', '+43386124184', 'Kopírovat'),
        rTel: cp('rTel', '+436649185963', 'Kopírovat'),
        schTel: cp('schTel', '+43386324101', 'Kopírovat'),
        vTel2: cp('vTel2', '+43386124184', 'Kopírovat'),
        pGps: cp('pGps', '47.62040, 15.26709', 'GPS')
      }
    };
  }
}
  return Component;
}, ['gear', 'peaks'], 'hon-hochschwab-v1');
