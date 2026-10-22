/*
 * Malý vykreslovač šablony v index.html.
 *  - {{cesta}} v textu nebo atributu se nahradí hodnotou z Component.renderVals() (js/hon.js)
 *  - <template data-for="seznam" data-as="polozka"> zopakuje obsah pro každou položku seznamu
 *  - data-on="funkce" zavolá při kliknutí funkci z renderVals() (v cyklu z položky)
 * Po každém setState() se šablona překreslí.
 */
(function () {
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
  function get(scope, path) {
    var o = scope, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; }
    return o;
  }
  function interp(t, scope) {
    return t.replace(HOLE, function (m, p) { var v = get(scope, p); return v == null ? '' : String(v); });
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    } catch (e) {}
  }
  window.__copyText = function (text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
        return;
      }
    } catch (e) {}
    fallbackCopy(text);
  };

  var current = {};
  function collect(node, out, isLoopItem) {
    if (node.nodeType === 3) {
      if (node.nodeValue.indexOf('{{') >= 0) out.push({ k: 't', n: node, t: node.nodeValue });
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.tagName === 'TEMPLATE' && node.hasAttribute('data-for')) {
      var anchor = document.createComment('for');
      node.parentNode.insertBefore(anchor, node.nextSibling);
      out.push({ k: 'f', tpl: node, anchor: anchor, list: node.getAttribute('data-for'), as: node.getAttribute('data-as'), nodes: [] });
      return;
    }
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name === 'data-on') continue;
      if (a.value.indexOf('{{') >= 0) out.push({ k: 'a', n: node, a: a.name, t: a.value });
    }
    if (node.hasAttribute('data-on')) {
      if (!isLoopItem) node.__static = true;
      node.addEventListener('click', function (ev) {
        var el = ev.currentTarget;
        var sc = el.__static ? current : el.__scope;
        var f = get(sc, el.getAttribute('data-on'));
        if (typeof f === 'function') f(ev);
      });
    }
    for (var c = node.firstChild; c; c = c.nextSibling) collect(c, out, isLoopItem);
  }
  function apply(bindings, scope) {
    bindings.forEach(function (b) {
      if (b.k === 't') b.n.nodeValue = interp(b.t, scope);
      else if (b.k === 'a') b.n.setAttribute(b.a, interp(b.t, scope));
      else if (b.k === 'f') {
        b.nodes.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
        b.nodes = [];
        var list = get(scope, b.list) || [];
        list.forEach(function (item, idx) {
          var frag = b.tpl.content.cloneNode(true);
          var itemScope = Object.create(scope);
          itemScope[b.as] = item; itemScope.$index = idx;
          var inner = [];
          var kids = Array.prototype.slice.call(frag.childNodes);
          kids.forEach(function (k) { collect(k, inner, true); });
          apply(inner, itemScope);
          kids.forEach(function (k) {
            if (k.nodeType === 1) {
              if (k.hasAttribute('data-on')) k.__scope = itemScope;
              k.querySelectorAll('[data-on]').forEach(function (e) { e.__scope = itemScope; });
            }
            b.anchor.parentNode.insertBefore(k, b.anchor);
            b.nodes.push(k);
          });
        });
      }
    });
  }

  // persistKeys: části stavu, které si prohlížeč pamatuje (odškrtnutá výstroj a vrcholy)
  window.__dcBoot = function (Component, persistKeys, storeKey) {
    var app = document.getElementById('app');
    var bindings = [];
    collect(app, bindings, false);
    var comp;
    var queued = false;
    function render() {
      queued = false;
      try {
        current = comp.renderVals();
        apply(bindings, current);
      } finally {
        app.removeAttribute('data-pending');
      }
      try {
        var keep = {};
        persistKeys.forEach(function (k) { keep[k] = comp.state[k]; });
        localStorage.setItem(storeKey, JSON.stringify(keep));
      } catch (e) {}
    }
    window.DCLogic = function (props) { this.props = props || {}; this.state = {}; };
    window.DCLogic.prototype.setState = function (p) {
      var u = typeof p === 'function' ? p(this.state, this.props) : p;
      this.state = Object.assign({}, this.state, u);
      if (!queued) { queued = true; Promise.resolve().then(render); }
    };
    window.DCLogic.prototype.forceUpdate = function () { if (!queued) { queued = true; Promise.resolve().then(render); } };
    comp = new (Component())({});
    try {
      var saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
      if (saved) persistKeys.forEach(function (k) { if (saved[k] && typeof saved[k] === 'object') comp.state[k] = saved[k]; });
    } catch (e) {}
    render();
  };
})();
