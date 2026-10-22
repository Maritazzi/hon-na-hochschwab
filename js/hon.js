/* Logika stránky: stav, výpočty a texty generované skriptem (hlášky, plán lovu, výstroj, ankety). */
window.__dcBoot(function () {
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { show: 'all', peaks: {}, gear: {}, copied: '', kr: 0 };
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
    var nPeaks = 0;
    var peaks = peakDefs.map(function (k) {
      var on = !!s.peaks[k.id];
      if (on) nPeaks += 1;
      return {
        name: k.name, sub: k.sub, el: k.el, on: on,
        bg: on ? loden : '#F4ECD8', fg: on ? '#EEE9D9' : '#1D2418', subc: on ? '#B9BDA4' : '#5B6250',
        bd: k.big ? '#94742E' : (on ? loden : '#C5B48E'),
        toggle: function () { var n = Object.assign({}, self.state.peaks); n[k.id] = !n[k.id]; self.setState({ peaks: n }); }
      };
    });
    var tally = 'Výřad: ' + nPeaks + ' z ' + peakDefs.length + ' vrcholů' + (nPeaks === peakDefs.length ? ' · Výřad kompletní. Sepp nalévá Stamperl.' : '');
    var gearDefs = [
      { id: 'sack', name: 'Hüttenschlafsack', sub: 'na Grasserhütte povinný' },
      { id: 'lamp', name: 'Čelovka', sub: 'východ slunce na vrcholu ve 4:51' },
      { id: 'warm', name: 'Teplá vrstva a bunda', sub: 'noc ve 2 156 m, v červnu kolem 4 °C' },
      { id: 'rain', name: 'Nepromokavá vrstva', sub: 'odpoledne prší skoro každý druhý den, membránu konzultujte s Gregym' },
      { id: 'plugs', name: 'Špunty do uší', sub: 'pokoj pro dvanáct a Pavlovy historky' },
      { id: 'cash', name: 'Hotovost', sub: '„bankáč je u pizzy“ tady neprojde' },
      { id: 'ins', name: 'Pojištění s horskou záchranou', sub: 'v Rakousku se záchrana platí' },
      { id: 'map', name: 'Mapy.cz staženy offline', sub: 'signál v revíru nezaručujeme' },
      { id: 'vig', name: 'Rakouská dálniční známka', sub: 'online předem' },
      { id: 'res', name: 'Obě chaty zarezervované', sub: 'hlasem, Schiestlhaus po–pá 10–11 h' },
      { id: 'hat', name: 'Klobouk s Gamsbartem', sub: 'dobrovolný, ale Sepp si to pamatuje' },
      { id: 'tent', name: 'Stan pro Smekyho', sub: 'jen jako rekvizita, spí se na chatě' }
    ];
    var nGear = 0;
    var gear = gearDefs.map(function (g) {
      var on = !!s.gear[g.id];
      if (on) nGear += 1;
      return {
        name: g.name, sub: g.sub, on: on,
        col: on ? '#5B6250' : '#1D2418', deco: on ? 'line-through' : 'none',
        toggle: function () { var n = Object.assign({}, self.state.gear); n[g.id] = !n[g.id]; self.setState({ gear: n }); }
      };
    });
    function setAllGear(v) { var n = {}; gearDefs.forEach(function (g) { n[g.id] = v; }); self.setState({ gear: n }); }
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
    var polls = {
      p1: "Usnesení č. 3, orientační (rozhodne se na místě): 1. leč, kudy na Fölzalm?\n1A Ondrova trasa · 11,4 km · 5:12 h\n1B Totéž + odbočka na Windgrube a Schönleitenhaus · 14,9 km · 6:10 h\n1C Ondrův oblouk přes Fölzklamm · 16,6 km · 8:30 h · jen při čtvrtku",
      p2: "Usnesení č. 4, orientační (rozhodne se na místě): 2. leč, co s vrcholem?\n2A Klasika: k chatě, vrchol nalehko\n2B Klasika + G'hacktkogel · +1:20 h\n2C Klasika + Ringkamp · +2:45 h\n2D Žebříky rovnou na vrchol",
      p3: "Usnesení č. 2: termín 2027 (pá–ne, při odjezdu ve čtvrtek o den dřív)?\n18.–20. 6.\n25.–27. 6.\n11.–13. 6.",
      p0: "Usnesení č. 1: kdy vyrazit z Prahy?\nČtvrtek po obědě · Krügerl na přivítání, noc v Seewiesenu\nPátek v 5:00 · rovnou na trasu, střízlivě",
      p4: "Usnesení č. 5: první Krügerl?\nGösser Märzen\nMurauer Märzen\nPuntigamer\nZwickl\nRadler\nHimbeerkracherl (řidič)"
    };
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
      peaks: peaks, tally: tally,
      gear: gear, gearCount: nGear + ' / ' + gearDefs.length,
      gearAll: function () { setAllGear(true); },
      gearReset: function () { setAllGear(false); },
      kr: kr,
      krSays: says[Math.min(kr, says.length - 1)],
      fx: fx, mugs: mugs, polls: polls,
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
        pGps: cp('pGps', '47.62040, 15.26709', 'GPS'),
        poll1: cp('poll1', polls.p1, 'Kopírovat anketu'),
        poll2: cp('poll2', polls.p2, 'Kopírovat anketu'),
        poll3: cp('poll3', polls.p3, 'Kopírovat anketu'),
        poll0: cp('poll0', polls.p0, 'Kopírovat anketu'),
        poll4: cp('poll4', polls.p4, 'Kopírovat anketu')
      }
    };
  }
}
  return Component;
}, ['gear', 'peaks'], 'hon-hochschwab-v1');
