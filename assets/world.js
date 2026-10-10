/* Pixel world: a tiny agent-based civilization that runs in the hero strip.
   Four kingdoms gather wood and stone, farm, build, train soldiers and go to war.
   Logic (update) and drawing (draw) are separate so the logic can run without a DOM. */
(function (root) {
  'use strict';
  var NAMES = ['Solari', 'Cyan', 'Veren', 'Lumen'];
  var COLORS = ['#F5B94A', '#4CC9F0', '#F06CA8', '#5EF2B8'];
  var HAIR = ['#3B2A20', '#1E1A2B', '#8A5A2B', '#D9C07A'];
  var SKIN = '#E8B88A', LEG = '#2A2842';
  var PLAN = [
    { t: 'hut', w: 2, s: 0 }, { t: 'field', w: 1, s: 0 }, { t: 'house', w: 3, s: 1 },
    { t: 'house', w: 3, s: 1 }, { t: 'tower', w: 2, s: 3 }, { t: 'house', w: 3, s: 1 }
  ];
  var SLOT = [[-1, 12], [1, 12], [-1, 21], [1, 21], [-1, 30], [1, 30]];
  var rnd = Math.random;

  function World(W, H) { this.W = W; this.H = H; this.G = H - 5; this.tick = 0; this.reset(); }

  World.prototype.reset = function () {
    var W = this.W, i, j;
    this.K = []; this.A = []; this.N = []; this.FX = []; this.peace = 0; this.base = this.tick;
    for (i = 0; i < 4; i++) {
      var k = { id: i, name: NAMES[i], x: Math.round(W * (0.125 + 0.25 * i)), wood: 4, stone: 1, food: 6, built: [], plan: 0,
        builder: null, soldiers: 0, warOn: -1, warT: 0, cool: 200 + i * 40, alive: true, conq: 0, hp: 40, starve: 0 };
      this.K.push(k);
      var offs = [-18, -27, 17, 26], rocks = [-33, 33];
      for (j = 0; j < offs.length; j++) this.N.push({ x: k.x + offs[j] + Math.round(rnd() * 3), type: 'tree', hp: 3, re: 0 });
      for (j = 0; j < rocks.length; j++) this.N.push({ x: k.x + rocks[j] + Math.round(rnd() * 2), type: 'rock', hp: 3, re: 0 });
      for (j = 0; j < 3; j++) this.spawn(k);
    }
  };

  World.prototype.spawn = function (k) {
    this.A.push({ x: k.x + (rnd() * 8 - 4), k: k.id, role: 'peasant', job: null, tx: 0, t: 0, node: null, carry: null,
      dir: rnd() < 0.5 ? 1 : -1, hp: 3, hair: Math.floor(rnd() * 4), ph: Math.floor(rnd() * 6), idle: 0 });
  };

  World.prototype.radius = function (k) { return Math.min(44, 20 + 3 * k.built.length + 8 * k.conq); };
  World.prototype.pop = function (id) { var n = 0; for (var i = 0; i < this.A.length; i++) if (this.A[i].k === id) n++; return n; };
  World.prototype.alive = function () { return this.K.filter(function (k) { return k.alive; }); };
  World.prototype.neighbor = function (k) {
    var best = null, bd = 1e9;
    this.alive().forEach(function (o) { if (o !== k) { var d = Math.abs(o.x - k.x); if (d < bd) { bd = d; best = o; } } });
    return best;
  };
  World.prototype.touching = function (a, b) { return Math.abs(a.x - b.x) <= this.radius(a) + this.radius(b) + 2; };
  World.prototype.field = function (k) { for (var i = 0; i < k.built.length; i++) if (k.built[i].type === 'field') return k.built[i]; return null; };
  World.prototype.slotX = function (k, p) { return k.x + SLOT[p][0] * SLOT[p][1]; };

  World.prototype.findNode = function (k, type) {
    var best = null, bd = 1e9, r = this.radius(k) + 12;
    this.N.forEach(function (n) { if (n.type === type && n.hp > 0 && Math.abs(n.x - k.x) <= r) { var d = Math.abs(n.x - k.x); if (d < bd) { bd = d; best = n; } } });
    return best;
  };

  World.prototype.think = function (a, k) {
    var p = k.plan < PLAN.length ? PLAN[k.plan] : null, node;
    if (p && !k.builder && k.wood >= p.w && k.stone >= p.s) { a.job = 'build'; a.tx = this.slotX(k, k.plan); a.t = 0; k.builder = a; return; }
    if (this.field(k) && k.food < 5) { a.job = 'farm'; a.tx = this.field(k).x; a.t = 0; return; }
    if ((p && k.wood < p.w) || (!p && k.wood < 4)) { node = this.findNode(k, 'tree'); if (node) { a.job = 'chop'; a.node = node; a.tx = node.x; a.t = 0; return; } }
    if (p && k.stone < p.s) { node = this.findNode(k, 'rock'); if (node) { a.job = 'mine'; a.node = node; a.tx = node.x; a.t = 0; return; } }
    if (this.field(k) && k.food < 12 && rnd() < 0.5) { a.job = 'farm'; a.tx = this.field(k).x; a.t = 0; return; }
    a.job = 'wander'; a.tx = k.x + Math.round(rnd() * 24 - 12); a.t = 0;
  };

  World.prototype.walk = function (a, tx, sp) {
    var d = tx - a.x;
    if (Math.abs(d) <= sp) { a.x = tx; return true; }
    a.dir = d > 0 ? 1 : -1; a.x += a.dir * sp; return false;
  };

  World.prototype.peasant = function (a, k) {
    var sp = 0.55;
    if (!a.job) { if (a.idle-- > 0) return; this.think(a, k); return; }
    switch (a.job) {
      case 'wander': if (this.walk(a, a.tx, 0.3)) { a.job = null; a.idle = 6 + Math.floor(rnd() * 14); } break;
      case 'chop': case 'mine':
        if (!a.node || a.node.hp <= 0) { a.job = null; a.node = null; break; }
        if (this.walk(a, a.tx, sp)) { if (++a.t >= 12) { a.node.hp--; if (a.node.hp <= 0) a.node.re = 500; a.carry = a.job === 'chop' ? 'wood' : 'stone'; a.job = 'haul'; a.tx = k.x; a.node = null; } }
        break;
      case 'farm': if (this.walk(a, a.tx, sp)) { if (++a.t >= 14) { a.carry = 'food'; a.job = 'haul'; a.tx = k.x; } } break;
      case 'haul':
        if (this.walk(a, a.tx, sp)) { if (a.carry) k[a.carry] += 2; a.carry = null; a.job = null; a.idle = 2; }
        break;
      case 'build':
        if (this.walk(a, a.tx, sp)) {
          if (++a.t >= 16) {
            var p = PLAN[k.plan];
            if (k.wood >= p.w && k.stone >= p.s) { k.wood -= p.w; k.stone -= p.s; k.built.push({ type: p.t, x: this.slotX(k, k.plan), owner: k.id }); k.plan++; }
            k.builder = null; a.job = null; a.idle = 3;
          }
        }
        break;
    }
  };

  World.prototype.spark = function (x) { this.FX.push({ x: x, y: this.G - 6 - Math.floor(rnd() * 3), t: 0 }); };

  World.prototype.soldier = function (a, k) {
    var self = this, foe = null, fd = 28;
    this.A.forEach(function (e) {
      if (e.role === 'soldier' && e.k !== a.k && (k.warOn === e.k || self.K[e.k].warOn === k.id)) { var d = Math.abs(e.x - a.x); if (d < fd) { fd = d; foe = e; } }
    });
    if (foe) {
      if (fd > 2.5) { this.walk(a, foe.x, 0.6); }
      else if (rnd() < 0.25) { this.spark((a.x + foe.x) / 2); if (rnd() < 0.5) foe.hp--; else a.hp--; }
      a.dir = foe.x > a.x ? 1 : -1; return;
    }
    if (k.warOn >= 0 && this.K[k.warOn].alive) {
      var en = this.K[k.warOn];
      if (Math.abs(a.x - en.x) > 5) this.walk(a, en.x - (a.x < en.x ? 4 : -4), 0.6);
      else { en.hp -= 1; if (rnd() < 0.3) this.spark(en.x); }
      return;
    }
    if (a.t-- <= 0) { a.tx = k.x + Math.round(rnd() * 18 - 9); a.t = 10 + Math.floor(rnd() * 20); }
    this.walk(a, a.tx, 0.25);
  };

  World.prototype.conquer = function (w, l) {
    var self = this;
    l.alive = false; w.conq++; w.food += 4;
    l.built.forEach(function (b) { b.owner = w.id; w.built.push(b); });
    this.A = this.A.filter(function (a) { if (a.k === l.id) { if (a.role === 'soldier') return false; a.k = w.id; a.job = null; } return true; });
    l.warOn = -1; w.warOn = -1; w.soldiers = this.A.filter(function (a) { return a.k === w.id && a.role === 'soldier'; }).length;
    for (var i = 0; i < 5; i++) this.spark(l.x - 6 + i * 3);
    this.K.forEach(function (k) { if (k.warOn === l.id) k.warOn = -1; });
    void self;
  };

  World.prototype.update = function () {
    var t = ++this.tick, self = this;
    this.K.forEach(function (k) {
      if (!k.alive) return;
      var pop = self.pop(k.id), nb = self.neighbor(k);
      // births, hunger
      if (t % 70 === 0 && k.food >= 4 && pop < 4 + 2 * k.built.filter(function (b) { return b.type === 'house'; }).length + k.built.filter(function (b) { return b.type === 'hut'; }).length) { k.food -= 2; self.spawn(k); }
      if (t % 110 === 0) k.food = Math.max(0, k.food - Math.ceil(pop / 5));
      if (k.food === 0) { if (++k.starve > 160 && pop > 2) { var v = self.A.filter(function (a) { return a.k === k.id && a.role === 'peasant'; })[0]; if (v) v.hp = 0; k.starve = 0; } } else k.starve = 0;
      // soldiers
      k.soldiers = self.A.filter(function (a) { return a.k === k.id && a.role === 'soldier'; }).length;
      if (nb && k.built.length >= 4 && t > 300 && t % 90 === 0 && k.stone >= 1 && k.soldiers < Math.ceil(pop / 3) && (self.touching(k, nb) || pop >= 8)) {
        var p = self.A.filter(function (a) { return a.k === k.id && a.role === 'peasant' && !a.node && a.job !== 'build'; })[0];
        if (p) { p.role = 'soldier'; p.job = null; p.t = 0; p.hp = 4; k.stone -= 1; }
      }
      // war
      if (k.warOn >= 0) { if (--k.warT <= 0 || !self.K[k.warOn].alive) k.warOn = -1; else if (self.K[k.warOn].hp <= 0) self.conquer(k, self.K[k.warOn]); }
      else if (--k.cool <= 0 && nb && k.soldiers >= 3 && (self.touching(k, nb) || (k.conq > 0 && k.soldiers >= 4)) && rnd() < 0.03) {
        k.warOn = nb.id; k.warT = 420; k.cool = 300; nb.hp = 26 + 6 * nb.built.length;
      }
    });
    // agents
    this.A.forEach(function (a) {
      var k = self.K[a.k];
      if (a.role === 'soldier') self.soldier(a, k); else self.peasant(a, k);
    });
    this.A = this.A.filter(function (a) { if (a.hp > 0) return true; var k = self.K[a.k]; if (k.builder === a) k.builder = null; return false; });
    // nature, effects
    this.N.forEach(function (n) { if (n.hp < 3 && --n.re <= 0) { n.hp++; n.re = 400; } });
    this.FX = this.FX.filter(function (f) { return ++f.t < 5; });
    // end of an age
    var left = this.alive();
    if (left.length === 1) { if (++this.peace > 350) this.reset(); }
    else if (t - this.base > 2600) this.reset();
  };

  World.prototype.bless = function (x) {
    var best = null, bd = 1e9;
    this.alive().forEach(function (k) { var d = Math.abs(k.x - x); if (d < bd) { bd = d; best = k; } });
    if (best) { best.food += 4; for (var i = 0; i < 4; i++) this.FX.push({ x: x - 4 + i * 3, y: 1 + i, t: -2, gold: true }); }
  };

  World.prototype.stats = function () {
    var self = this;
    return { year: Math.floor(this.tick / 45), kingdoms: this.K.map(function (k) { return { name: k.name, color: COLORS[k.id], pop: self.pop(k.id), alive: k.alive, war: k.warOn >= 0 }; }) };
  };

  /* ---------- drawing ---------- */
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function tree(c, x, G, hp) { if (hp <= 0) { rect(c, x + 2, G - 1, 1, 1, '#6B4A2B'); return; } rect(c, x + 2, G - 3, 1, 3, '#6B4A2B'); rect(c, x, G - 3 - hp - 1, 5, hp + 1, '#2F9E62'); rect(c, x + 1, G - 4 - hp - 1, 3, 1, '#3FBF7A'); }
  function rock(c, x, G, hp) { if (hp <= 0) return; rect(c, x, G - hp, 5, hp, '#8C8AA8'); rect(c, x + 1, G - hp - 1, 3, 1, '#A9A7C4'); }
  function building(c, b, G, col) {
    var x = Math.round(b.x);
    if (b.type === 'hut') { rect(c, x - 2, G - 4, 5, 4, '#C9B28A'); rect(c, x - 3, G - 6, 7, 2, col); rect(c, x - 1, G - 7, 3, 1, col); rect(c, x, G - 3, 1, 3, '#5A3E24'); }
    else if (b.type === 'house') { rect(c, x - 4, G - 6, 9, 6, '#C9B28A'); rect(c, x - 5, G - 8, 11, 2, col); rect(c, x - 3, G - 9, 7, 1, col); rect(c, x, G - 4, 2, 4, '#5A3E24'); rect(c, x - 3, G - 4, 2, 2, '#9CD7FF'); }
    else if (b.type === 'tower') { rect(c, x - 2, G - 14, 5, 14, '#9A98B8'); rect(c, x - 3, G - 16, 2, 2, '#9A98B8'); rect(c, x + 1, G - 16, 2, 2, '#9A98B8'); rect(c, x - 1, G - 9, 1, 3, '#3C3558'); rect(c, x, G - 21, 1, 5, '#6B6A85'); rect(c, x + 1, G - 21, 4, 2, col); }
    else if (b.type === 'field') { for (var i = 0; i < 4; i++) { rect(c, x - 5 + i * 3, G - 2, 2, 2, '#8FBF4E'); rect(c, x - 5 + i * 3, G - 3, 1, 1, '#C9E26E'); } }
  }
  function castle(c, k, G, col, level) {
    var x = k.x;
    if (level < 2) { rect(c, x - 3, G - 5, 7, 5, '#D9CFA8'); rect(c, x - 4, G - 6, 9, 1, col); rect(c, x - 1, G - 4, 3, 4, '#5A3E24'); rect(c, x, G - 11, 1, 6, '#6B6A85'); rect(c, x + 1, G - 11, 4, 2, col); return; }
    var w = level < 5 ? 14 : 24, hgt = level < 5 ? 10 : 14, x0 = x - Math.floor(w / 2);
    rect(c, x0, G - hgt, w, hgt, '#9A98B8'); rect(c, x0 + 1, G - hgt, w - 2, 1, '#B7B5D2');
    for (var i = 0; i < w; i += 4) rect(c, x0 + i, G - hgt - 2, 2, 2, '#9A98B8');
    rect(c, x - 2, G - 7, 4, 7, '#3C3558'); rect(c, x, G - hgt - 10, 1, 8, '#6B6A85'); rect(c, x + 1, G - hgt - 10, 5, 3, col);
  }
  function person(c, a, G, tick) {
    var x = Math.round(a.x) - 2, y = G - 6, col = COLORS[a.k], step = Math.floor(tick / 3 + a.ph) % 2;
    var moving = a.role === 'soldier' ? true : (a.job && a.job !== 'build' && (Math.abs(a.tx - a.x) > 0.6));
    var soldier = a.role === 'soldier';
    rect(c, x + 1, y, 3, 1, soldier ? '#B8BACD' : HAIR[a.hair]); rect(c, x + 1, y + 1, 3, 1, SKIN); rect(c, x + 1, y + 2, 3, 2, col);
    var lg = moving && step ? [2, 2] : [1, 3]; rect(c, x + lg[0], y + 4, 1, 2, LEG); rect(c, x + lg[1], y + 4, 1, 2, LEG);
    if (soldier) { var s = a.dir, hit = Math.floor(tick / 4 + a.ph) % 3 === 0; rect(c, x + (s > 0 ? 5 : -2), y + 2 + (hit ? 0 : 1), 2, 1, '#E6E8F2'); rect(c, x + (s > 0 ? -1 : 5), y + 2, 1, 3, '#7A7A99'); }
    else if (a.job === 'chop' || a.job === 'mine') { if (Math.abs(a.tx - a.x) < 0.6) { var up = Math.floor(tick / 3) % 2; rect(c, x + (a.dir > 0 ? 5 : -1), y + (up ? 0 : 2), 1, 3, '#8A5A2B'); rect(c, x + (a.dir > 0 ? 5 : -2), y + (up ? 0 : 2), 2, 1, '#C9CCD8'); } }
    else if (a.job === 'farm' && Math.abs(a.tx - a.x) < 0.6) { var u2 = Math.floor(tick / 4) % 2; rect(c, x + 5, y + (u2 ? 1 : 3), 1, 3, '#8A5A2B'); }
    else if (a.job === 'build' && Math.abs(a.tx - a.x) < 0.6) { var u3 = Math.floor(tick / 3) % 2; rect(c, x + 5, y + (u3 ? 0 : 2), 2, 1, '#C9CCD8'); rect(c, x + 5, y + (u3 ? 0 : 2) + 1, 1, 2, '#8A5A2B'); }
    if (a.carry) rect(c, x + 1, y - 2, 3, 2, a.carry === 'wood' ? '#8A5A2B' : a.carry === 'stone' ? '#8C8AA8' : '#E9C46A');
  }
  World.prototype.draw = function (c, o) {
    var W = this.W, H = this.H, G = this.G, self = this, dark = o.dark;
    rect(c, 0, 0, W, H, o.sky);
    for (var s = 0; s < W; s += 17) rect(c, s + (s * 7) % 9, 2 + (s * 3) % 9, 1, 1, dark ? '#FFFFFF33' : '#FFFFFF');
    rect(c, 0, G, W, H - G, o.grass); rect(c, 0, G + 1, W, 1, o.grassHi); rect(c, 0, G + 2, W, H - G - 2, o.dirt);
    this.N.forEach(function (n) { if (n.type === 'tree') tree(c, n.x, G, n.hp); else rock(c, n.x, G, n.hp); });
    this.K.forEach(function (k) {
      if (!k.alive) { rect(c, k.x - 3, G - 2, 7, 2, '#5C5A74'); return; }
      k.built.forEach(function (b) { building(c, b, G, COLORS[b.owner]); });
      castle(c, k, G, COLORS[k.id], k.built.length);
    });
    this.A.forEach(function (a) { person(c, a, G, self.tick); });
    this.FX.forEach(function (f) { if (f.t < 0) return; if (f.gold) rect(c, f.x, G - 12 + f.t * 2 + f.y, 1, 1, '#FFD34D'); else { rect(c, f.x, f.y, 1, 1, '#FFF3A8'); rect(c, f.x + 1, f.y - 1, 1, 1, '#FFB347'); } });
  };

  var api = { World: World, NAMES: NAMES, COLORS: COLORS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PixelWorld = api;
})(typeof window !== 'undefined' ? window : this);
