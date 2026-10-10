/* Pixel kingdom: a small, peaceful animation in the hero strip.
   Settlers arrive in a wagon, gather wood and stone, farm, and build a village
   until they raise a castle and celebrate. Then the meadow resets and it starts again.
   Logic (update) and drawing (draw) are separate so the logic can run without a DOM. */
(function (root) {
  'use strict';
  var COLORS = ['#F5B94A', '#4CC9F0', '#F06CA8', '#5EF2B8', '#E4572E'];
  var HAIR = ['#3B2A20', '#1E1A2B', '#8A5A2B', '#D9C07A'];
  var SKIN = '#E8B88A', LEG = '#2A2842';
  var TYPES = [
    { t: 'hut', w: 1, s: 0 }, { t: 'hut', w: 1, s: 0 }, { t: 'field', w: 1, s: 0 }, { t: 'house', w: 2, s: 1 },
    { t: 'well', w: 1, s: 1 }, { t: 'house', w: 2, s: 1 }, { t: 'windmill', w: 3, s: 1 }, { t: 'market', w: 2, s: 0 },
    { t: 'house', w: 2, s: 1 }, { t: 'field', w: 1, s: 0 }, { t: 'house', w: 2, s: 1 }, { t: 'tower', w: 2, s: 2 },
    { t: 'garden', w: 1, s: 0 }
  ];
  var CASTLE = { t: 'castle', w: 4, s: 4 };
  var rnd = Math.random;

  function World(W, H) { this.W = W; this.H = H; this.G = H - 5; this.tick = 0; this.age = 0; this.reset(); }

  World.prototype.reset = function () {
    var W = this.W, i, gap = Math.max(10, Math.min(17, (W / 2 - 24) / 6));
    var per = Math.floor((W / 2 - 22) / gap), n = Math.max(4, Math.min(TYPES.length, 2 * per + 2));
    this.cx = Math.round(W / 2);
    this.plan = [];
    for (i = 0; i < n; i++) this.plan.push({ t: TYPES[i].t, w: TYPES[i].w, s: TYPES[i].s, x: this.cx + (i % 2 ? 1 : -1) * (20 + Math.floor(i / 2) * gap), c: Math.floor(rnd() * 4), done: false });
    this.plan.push({ t: 'castle', w: CASTLE.w, s: CASTLE.s, x: this.cx, c: 0, done: false, p: 0 });
    this.step = 0; this.wood = 4; this.stone = 1; this.food = 10;
    this.A = []; this.N = []; this.FX = []; this.P = []; this.sheep = []; this.birds = [];
    this.phase = 'arrive'; this.pt = 0; this.wagon = { x: -14, parked: false }; this.king = null; this.fade = 0; this.fadeDir = 1; this.fadeT = 14;
    this.builders = [];
    var slots = this.plan.map(function (p) { return p.x; }), x, tries;
    for (x = 8; x < W - 8; x += 11 + Math.floor(rnd() * 6)) {
      var bad = slots.some(function (s) { return Math.abs(s - x) < 3; });
      if (!bad) this.N.push({ x: x, type: (this.N.length % 3 === 2) ? 'rock' : 'tree', hp: 3, re: 0 });
    }
    for (i = 0; i < 3; i++) this.sheep.push({ x: rnd() * W, dir: rnd() < 0.5 ? 1 : -1, t: Math.floor(rnd() * 40), go: false });
    for (i = 0; i < 2; i++) this.birds.push({ x: rnd() * W, y: 3 + i * 4 + rnd() * 3, sp: 0.12 + rnd() * 0.1 });
    this.flowers = []; for (i = 0; i < Math.floor(W / 6); i++) this.flowers.push({ x: Math.floor(rnd() * W), c: Math.floor(rnd() * 3) });
    void tries;
  };

  World.prototype.spawn = function (x) {
    this.A.push({ x: x, k: Math.floor(rnd() * COLORS.length), job: null, tx: 0, t: 0, node: null, carry: null, dir: 1, hair: Math.floor(rnd() * 4), ph: Math.floor(rnd() * 6), idle: 0, hop: 0 });
  };
  World.prototype.pop = function () { return this.A.length; };
  World.prototype.next = function () { return this.plan.filter(function (q) { return !q.done && !q.busy && q.t !== 'castle'; })[0] || null; };
  World.prototype.castleItem = function () { return this.plan[this.plan.length - 1]; };
  World.prototype.pending = function () { return this.plan.filter(function (q) { return !q.done && q.t !== 'castle'; }).length; };
  World.prototype.built = function (t) { return this.plan.filter(function (p) { return p.done && p.t === t; }).length; };
  World.prototype.hasField = function () { return this.plan.some(function (p) { return p.done && p.t === 'field'; }); };
  World.prototype.fieldX = function () { var f = this.plan.filter(function (p) { return p.done && p.t === 'field'; }); return f.length ? f[Math.floor(rnd() * f.length)].x : this.cx; };

  World.prototype.findNode = function (type, from) {
    var best = null, bd = 1e9;
    this.N.forEach(function (n) { if (n.type === type && n.hp > 0) { var d = Math.abs(n.x - from); if (d < bd) { bd = d; best = n; } } });
    return best;
  };

  World.prototype.need = function () {
    var w = 0, s = 0, i, p;
    var left = this.plan.filter(function (q) { return !q.done && !q.busy; }).slice(0, 3);
    for (i = 0; i < left.length; i++) { p = left[i]; w += p.w; s += p.s; }
    return { w: w, s: s };
  };

  World.prototype.think = function (a) {
    var p = this.next(), nd = this.need(), node, cs = this.castleItem(), self = this;
    if (this.pending() === 0 && !cs.done && this.wood >= cs.w && this.stone >= cs.s || (cs.paid && !cs.done)) { a.job = 'build'; a.item = cs; a.tx = this.cx + (this.builders.length % 2 ? 6 : -6); a.t = 0; this.builders.push(a); return; }
    var cand = this.plan.filter(function (q) { return !q.done && !q.busy && q.t !== 'castle' && self.wood >= q.w && self.stone >= q.s; })[0];
    if (cand && this.builders.length < 3) { cand.busy = true; this.wood -= cand.w; this.stone -= cand.s; a.job = 'build'; a.item = cand; a.tx = cand.x; a.t = 0; this.builders.push(a); return; }
    if (this.hasField() && this.food < 5) { a.job = 'farm'; a.tx = this.fieldX(); a.t = 0; return; }
    if (this.wood < nd.w + (p ? 0 : 4)) { node = this.findNode('tree', a.x); if (node) { a.job = 'chop'; a.node = node; a.tx = node.x; a.t = 0; return; } }
    if (this.stone < nd.s) { node = this.findNode('rock', a.x); if (node) { a.job = 'mine'; a.node = node; a.tx = node.x; a.t = 0; return; } }
    if (this.hasField() && this.food < 12 && rnd() < 0.5) { a.job = 'farm'; a.tx = this.fieldX(); a.t = 0; return; }
    a.job = 'wander'; a.tx = this.cx + Math.round(rnd() * 90 - 45); a.t = 0;
  };

  World.prototype.walk = function (a, tx, sp) {
    var d = tx - a.x;
    if (Math.abs(d) <= sp) { a.x = tx; return true; }
    a.dir = d > 0 ? 1 : -1; a.x += a.dir * sp; return false;
  };

  World.prototype.release = function (a) { var i = this.builders.indexOf(a); if (i >= 0) this.builders.splice(i, 1); };

  World.prototype.peasant = function (a) {
    var sp = 0.9, self = this;
    if (this.phase === 'celebrate' || this.phase === 'live') {
      if (this.phase === 'celebrate') { a.hop = (this.tick + a.ph * 2) % 12 < 3 ? 2 : 0; if (rnd() < 0.02) a.dir = -a.dir; return; }
      a.hop = 0;
    }
    if (!a.job) { if (a.idle-- > 0) return; this.think(a); return; }
    switch (a.job) {
      case 'wander': if (this.walk(a, a.tx, 0.3)) { a.job = null; a.idle = 8 + Math.floor(rnd() * 18); } break;
      case 'chop': case 'mine':
        if (!a.node || a.node.hp <= 0) { a.job = null; a.node = null; break; }
        if (this.walk(a, a.tx, sp)) { if (++a.t >= 6) { a.node.hp--; if (a.node.hp <= 0) a.node.re = 200; a.carry = a.job === 'chop' ? 'wood' : 'stone'; a.job = 'haul'; a.tx = this.cx; a.node = null; } }
        break;
      case 'farm': if (this.walk(a, a.tx, sp)) { if (++a.t >= 8) { a.carry = 'food'; a.job = 'haul'; a.tx = this.cx; } } break;
      case 'haul': if (this.walk(a, a.tx, sp)) { if (a.carry) this[a.carry] += 2; a.carry = null; a.job = null; a.idle = 1; } break;
      case 'build':
        if (this.walk(a, a.tx, sp)) {
          var it = a.item;
          if (it.t === 'castle') {
            if (!it.paid) { this.wood -= it.w; this.stone -= it.s; it.paid = true; }
            it.p += Math.max(1, this.builders.length) / 90;
            if (it.p >= 1) { it.p = 1; it.done = true; this.step++; this.builders.slice().forEach(function (b) { b.job = null; b.item = null; b.idle = 2; }); this.builders = []; this.finish(); }
          } else if (++a.t >= 8) {
            it.done = true; it.busy = false; this.step++; for (var i = 0; i < 4; i++) this.FX.push({ x: it.x - 3 + i * 2, y: this.G - 5, t: 0, kind: 'dust' });
            this.release(a); a.job = null; a.item = null; a.idle = 1;
          }
        }
        break;
    }
    void self;
  };

  World.prototype.finish = function () {
    this.phase = 'celebrate'; this.pt = 0;
    this.king = { x: this.cx, dir: 1, t: 0 };
  };

  World.prototype.burst = function (x, y) {
    var col = COLORS[Math.floor(rnd() * COLORS.length)], n = 14, i;
    for (i = 0; i < n; i++) { var an = (i / n) * Math.PI * 2; this.P.push({ x: x, y: y, vx: Math.cos(an) * 0.9, vy: Math.sin(an) * 0.9, life: 14 + Math.floor(rnd() * 5), col: col }); }
  };
  World.prototype.confetti = function (x) {
    for (var i = 0; i < 14; i++) this.P.push({ x: x, y: this.G - 4, vx: rnd() * 1.6 - 0.8, vy: -(rnd() * 1.4 + 0.6), life: 20 + Math.floor(rnd() * 8), col: COLORS[i % COLORS.length], g: 0.07 });
  };

  World.prototype.update = function () {
    var self = this, t = ++this.tick;
    if (this.fadeT > 0) { this.fadeT--; this.fade = this.fadeDir > 0 ? this.fadeT / 14 : 1 - this.fadeT / 14; if (this.fadeT === 0 && this.fadeDir < 0) { this.reset(); this.fadeDir = 1; this.fadeT = 14; this.fade = 1; } }
    this.pt++;
    var wg = this.wagon;
    if (wg) {
      if (!wg.parked) { wg.x += 2; if (wg.x >= this.cx - 20) { wg.parked = true; wg.t = 0; for (var i = 0; i < 6; i++) this.spawn(wg.x + 3 + i * 2); this.phase = 'grow'; } }
      else if (++wg.t > 40) { wg.x += 2; if (wg.x > this.W + 14) this.wagon = null; }
    }
    if (this.phase === 'grow' || this.phase === 'live') {
      var cap = 6 + 2 * this.built('hut') + 2 * this.built('house');
      if (t % 30 === 0 && this.food >= 3 && this.A.length < cap) { this.food -= 2; this.spawn(this.cx); this.FX.push({ x: this.cx, y: this.G - 10, t: 0, kind: 'heart' }); }
      if (t % 120 === 0) this.food = Math.max(0, this.food - Math.ceil(this.A.length / 6));
    }
    this.A.forEach(function (a) { self.peasant(a); });
    if (this.phase === 'celebrate') {
      if (this.pt % 10 === 0) this.burst(this.cx + (rnd() * 90 - 45), 6 + rnd() * 8);
      if (this.king) { this.king.t++; }
      if (this.pt > 260) { this.phase = 'live'; this.pt = 0; }
    } else if (this.phase === 'live') {
      if (this.pt % 50 === 0) this.burst(this.cx + (rnd() * 70 - 35), 7 + rnd() * 6);
      if (this.pt > 230 && this.fadeT === 0) { this.fadeDir = -1; this.fadeT = 14; }
    }
    this.N.forEach(function (n) { if (n.hp < 3 && --n.re <= 0) { n.hp++; n.re = 200; } });
    this.sheep.forEach(function (s) { if (s.t-- <= 0) { s.go = !s.go; s.t = 20 + Math.floor(rnd() * 50); if (rnd() < 0.5) s.dir = -s.dir; } if (s.go) { s.x += s.dir * 0.12; if (s.x < 2 || s.x > self.W - 6) s.dir = -s.dir; } });
    this.birds.forEach(function (b) { b.x += b.sp; if (b.x > self.W + 6) b.x = -6; });
    this.FX = this.FX.filter(function (f) { f.t++; return f.t < (f.kind === 'heart' ? 14 : 8); });
    this.P = this.P.filter(function (p) { p.x += p.vx; p.y += p.vy; p.vy += p.g || 0.05; return --p.life > 0; });
  };

  World.prototype.bless = function (x) { this.food += 3; this.confetti(x); };

  World.prototype.stats = function () {
    var total = this.plan.length, done = this.plan.filter(function (p) { return p.done; }).length;
    return { year: Math.floor(this.tick / 45), pop: this.A.length, built: done, total: total, founded: this.phase === 'celebrate' || this.phase === 'live' };
  };

  /* ---------- drawing ---------- */
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function tree(c, x, G, hp) { if (hp <= 0) { rect(c, x + 2, G - 1, 1, 1, '#6B4A2B'); return; } rect(c, x + 2, G - 3, 1, 3, '#6B4A2B'); rect(c, x, G - 3 - hp - 1, 5, hp + 1, '#2F9E62'); rect(c, x + 1, G - 4 - hp - 1, 3, 1, '#3FBF7A'); }
  function rock(c, x, G, hp) { if (hp <= 0) return; rect(c, x, G - hp, 5, hp, '#8C8AA8'); rect(c, x + 1, G - hp - 1, 3, 1, '#A9A7C4'); }
  function smoke(c, x, y, tick, ph) { var k = (Math.floor(tick / 4) + ph) % 4; rect(c, x + (k % 2), y - k, 1, 1, '#C9CCD8'); }
  function building(c, b, G, tick) {
    var x = Math.round(b.x), col = COLORS[b.c], i;
    if (b.t === 'hut') { rect(c, x - 2, G - 4, 5, 4, '#C9B28A'); rect(c, x - 3, G - 6, 7, 2, col); rect(c, x - 1, G - 7, 3, 1, col); rect(c, x, G - 3, 1, 3, '#5A3E24'); smoke(c, x + 2, G - 8, tick, b.c); }
    else if (b.t === 'house') { rect(c, x - 4, G - 6, 9, 6, '#C9B28A'); rect(c, x - 5, G - 8, 11, 2, col); rect(c, x - 3, G - 9, 7, 1, col); rect(c, x, G - 4, 2, 4, '#5A3E24'); rect(c, x - 3, G - 4, 2, 2, '#9CD7FF'); rect(c, x + 3, G - 11, 1, 2, '#8C8AA8'); smoke(c, x + 3, G - 12, tick, b.c + 1); }
    else if (b.t === 'tower') { rect(c, x - 2, G - 14, 5, 14, '#9A98B8'); rect(c, x - 3, G - 16, 2, 2, '#9A98B8'); rect(c, x + 1, G - 16, 2, 2, '#9A98B8'); rect(c, x - 1, G - 9, 1, 3, '#3C3558'); rect(c, x, G - 21, 1, 5, '#6B6A85'); rect(c, x + 1 + (Math.floor(tick / 6) % 2), G - 21, 4, 2, col); }
    else if (b.t === 'field') { for (i = 0; i < 4; i++) { rect(c, x - 5 + i * 3, G - 2, 2, 2, '#8FBF4E'); rect(c, x - 5 + i * 3, G - 3 - (Math.floor(tick / 20 + i) % 2), 1, 1, '#C9E26E'); } }
    else if (b.t === 'well') { rect(c, x - 2, G - 3, 5, 3, '#8C8AA8'); rect(c, x - 2, G - 6, 1, 3, '#6B4A2B'); rect(c, x + 2, G - 6, 1, 3, '#6B4A2B'); rect(c, x - 2, G - 7, 5, 1, col); rect(c, x, G - 4, 1, 1, '#4CC9F0'); }
    else if (b.t === 'windmill') {
      rect(c, x - 3, G - 9, 7, 9, '#D9CFA8'); rect(c, x - 4, G - 11, 9, 2, col); rect(c, x - 1, G - 4, 3, 4, '#5A3E24');
      var f = Math.floor(tick / 5) % 4, hx = x, hy = G - 8;
      rect(c, hx, hy, 1, 1, '#6B4A2B');
      if (f % 2 === 0) { rect(c, hx - 5, hy, 11, 1, '#F2E8CF'); rect(c, hx, hy - 5, 1, 11, '#F2E8CF'); }
      else { for (i = -4; i <= 4; i++) { if (i === 0) continue; rect(c, hx + i, hy + i, 1, 1, '#F2E8CF'); rect(c, hx + i, hy - i, 1, 1, '#F2E8CF'); } }
    }
    else if (b.t === 'market') { rect(c, x - 4, G - 3, 9, 3, '#8A5A2B'); for (i = 0; i < 9; i += 2) { rect(c, x - 4 + i, G - 6, 1, 2, '#F06CA8'); rect(c, x - 3 + i, G - 6, 1, 2, '#FFF4E0'); } rect(c, x - 4, G - 7, 9, 1, '#F06CA8'); rect(c, x - 3, G - 4, 1, 1, '#E63946'); rect(c, x - 1, G - 4, 1, 1, '#FFC857'); rect(c, x + 1, G - 4, 1, 1, '#5EF2B8'); }
    else if (b.t === 'garden') { for (i = 0; i < 5; i++) { rect(c, x - 5 + i * 3, G - 2, 1, 2, '#2F9E62'); rect(c, x - 5 + i * 3, G - 3, 1, 1, COLORS[(i + b.c) % 4]); } }
  }
  function castle(c, it, G, cx, tick) {
    var w = 24, h = 14, x0 = cx - 12, p = it.p || 0, top = Math.round(h * p), i;
    if (!it.done && p === 0) { // campfire
      rect(c, cx - 2, G - 1, 5, 1, '#6B4A2B'); var f = Math.floor(tick / 3) % 3; rect(c, cx - 1, G - 3 - (f === 0 ? 0 : 1), 3, 2, '#E4572E'); rect(c, cx, G - 4 - f, 1, 2, '#FFC857'); smoke(c, cx + 1, G - 7, tick, 0); return;
    }
    rect(c, x0, G - top, w, top, '#9A98B8'); if (top > 0) rect(c, x0 + 1, G - top, w - 2, 1, '#B7B5D2');
    if (!it.done) { // scaffolding
      rect(c, x0 - 2, G - h - 3, 1, h + 3, '#8A5A2B'); rect(c, x0 + w + 1, G - h - 3, 1, h + 3, '#8A5A2B');
      for (i = 0; i < 3; i++) { rect(c, x0 - 2, G - 4 - i * 5, w + 5, 1, '#8A5A2B'); }
      return;
    }
    for (i = 0; i < w; i += 4) rect(c, x0 + i, G - h - 2, 2, 2, '#9A98B8');
    rect(c, cx - 2, G - 7, 4, 7, '#3C3558'); rect(c, cx - 2, G - 8, 4, 1, '#5A4E7A');
    rect(c, x0 + 3, G - 10, 2, 3, '#3C3558'); rect(c, x0 + w - 5, G - 10, 2, 3, '#3C3558');
    rect(c, cx, G - h - 11, 1, 9, '#6B6A85'); var wv = Math.floor(tick / 6) % 2; rect(c, cx + 1, G - h - 11, 6 + wv, 3, COLORS[0]);
    rect(c, cx + 1, G - h - 8, 4 + wv, 1, COLORS[4]);
  }
  function person(c, a, G, tick, crown) {
    var x = Math.round(a.x) - 2, y = G - 6 - (a.hop || 0), col = COLORS[a.k], step = Math.floor(tick / 3 + a.ph) % 2;
    var moving = a.job && a.job !== 'build' && Math.abs(a.tx - a.x) > 0.6;
    rect(c, x + 1, y, 3, 1, crown ? '#FFD34D' : HAIR[a.hair]); rect(c, x + 1, y + 1, 3, 1, SKIN); rect(c, x + 1, y + 2, 3, 2, crown ? COLORS[4] : col);
    var lg = (moving || a.hop) && step ? [2, 2] : [1, 3]; rect(c, x + lg[0], y + 4, 1, 2, LEG); rect(c, x + lg[1], y + 4, 1, 2, LEG);
    if (crown) { rect(c, x + 1, y - 1, 1, 1, '#FFD34D'); rect(c, x + 3, y - 1, 1, 1, '#FFD34D'); if (Math.floor(tick / 6) % 2) rect(c, x + 4, y, 1, 2, SKIN); return; }
    if ((a.job === 'chop' || a.job === 'mine') && Math.abs(a.tx - a.x) < 0.6) { var up = Math.floor(tick / 3) % 2; rect(c, x + (a.dir > 0 ? 5 : -1), y + (up ? 0 : 2), 1, 3, '#8A5A2B'); rect(c, x + (a.dir > 0 ? 5 : -2), y + (up ? 0 : 2), 2, 1, '#C9CCD8'); }
    else if (a.job === 'farm' && Math.abs(a.tx - a.x) < 0.6) { var u2 = Math.floor(tick / 4) % 2; rect(c, x + 5, y + (u2 ? 1 : 3), 1, 3, '#8A5A2B'); }
    else if (a.job === 'build' && Math.abs(a.tx - a.x) < 0.6) { var u3 = Math.floor(tick / 3) % 2; rect(c, x + 5, y + (u3 ? 0 : 2), 2, 1, '#C9CCD8'); rect(c, x + 5, y + (u3 ? 0 : 2) + 1, 1, 2, '#8A5A2B'); }
    if (a.hop) rect(c, x - 1, y + 1, 1, 2, SKIN), rect(c, x + 5, y + 1, 1, 2, SKIN);
    if (a.carry) rect(c, x + 1, y - 2, 3, 2, a.carry === 'wood' ? '#8A5A2B' : a.carry === 'stone' ? '#8C8AA8' : '#E9C46A');
  }
  function sheep(c, s, G, tick) { var x = Math.round(s.x), l = s.go && Math.floor(tick / 4) % 2; rect(c, x, G - 3, 5, 2, '#F4F1FF'); rect(c, x + (s.dir > 0 ? 4 : -1), G - 3, 2, 2, '#4A4560'); rect(c, x + 1, G - 1, 1, 1 + (l ? 0 : 0), '#4A4560'); rect(c, x + 3, G - 1, 1, 1, '#4A4560'); }
  function bird(c, b, tick) { var f = Math.floor(tick / 5) % 2, x = Math.round(b.x), y = Math.round(b.y); if (f) { rect(c, x, y, 1, 1, '#C9CCD8'); rect(c, x + 1, y + 1, 1, 1, '#C9CCD8'); rect(c, x + 2, y, 1, 1, '#C9CCD8'); } else { rect(c, x, y + 1, 1, 1, '#C9CCD8'); rect(c, x + 1, y, 1, 1, '#C9CCD8'); rect(c, x + 2, y + 1, 1, 1, '#C9CCD8'); } }
  function wagon(c, w, G, tick) { var x = Math.round(w.x), b = !w.parked && Math.floor(tick / 3) % 2; rect(c, x, G - 5 - (b ? 1 : 0), 10, 3, '#8A5A2B'); rect(c, x + 1, G - 9 - (b ? 1 : 0), 8, 4, '#F2E8CF'); rect(c, x + 2, G - 10 - (b ? 1 : 0), 6, 1, '#F2E8CF'); rect(c, x + 1, G - 2, 2, 2, '#2A2842'); rect(c, x + 7, G - 2, 2, 2, '#2A2842'); rect(c, x + 10, G - 4, 3, 1, '#8A5A2B'); }

  World.prototype.draw = function (c, o) {
    var W = this.W, H = this.H, G = this.G, self = this, dark = o.dark, tick = this.tick, i;
    rect(c, 0, 0, W, H, o.sky);
    for (var s = 0; s < W; s += 17) rect(c, s + (s * 7) % 9, 2 + (s * 3) % 9, 1, 1, dark ? '#FFFFFF33' : '#FFFFFF');
    rect(c, W - 13, 4, 3, 1, dark ? '#F4E9B8' : '#FFD34D'); rect(c, W - 14, 5, 5, 3, dark ? '#F4E9B8' : '#FFD34D'); rect(c, W - 13, 8, 3, 1, dark ? '#F4E9B8' : '#FFD34D');
    if (dark) { rect(c, W - 11, 4, 3, 4, o.sky); rect(c, W - 12, 5, 2, 3, o.sky); }
    this.birds.forEach(function (b) { bird(c, b, tick); });
    rect(c, 0, G, W, H - G, o.grass); rect(c, 0, G + 1, W, 1, o.grassHi); rect(c, 0, G + 2, W, H - G - 2, o.dirt);
    var fc = ['#FFC857', '#F06CA8', '#FFFFFF'];
    this.flowers.forEach(function (f) { rect(c, f.x, G + 1, 1, 1, fc[f.c]); });
    this.N.forEach(function (n) { if (n.type === 'tree') tree(c, n.x, G, n.hp); else rock(c, n.x, G, n.hp); });
    this.sheep.forEach(function (sh) { sheep(c, sh, G, tick); });
    this.plan.forEach(function (p) { if (p.t === 'castle') castle(c, p, G, self.cx, tick); else if (p.done) building(c, p, G, tick); });
    if (this.wagon) wagon(c, this.wagon, G, tick);
    this.A.forEach(function (a) { person(c, a, G, tick); });
    if (this.king) { var k = this.king, kx = this.cx + (k.t < 40 ? 0 : (k.t < 80 ? (k.t - 40) / 4 : 10)); person(c, { x: kx, k: 4, ph: 0, hair: 0, dir: 1, hop: 0 }, G, tick, true); }
    this.FX.forEach(function (f) {
      if (f.kind === 'heart') { var y = f.y - Math.floor(f.t / 3); rect(c, f.x - 1, y, 1, 1, '#F06CA8'); rect(c, f.x + 1, y, 1, 1, '#F06CA8'); rect(c, f.x - 1, y + 1, 3, 1, '#F06CA8'); rect(c, f.x, y + 2, 1, 1, '#F06CA8'); }
      else rect(c, f.x + (f.t % 3) - 1, f.y - Math.floor(f.t / 2), 1, 1, '#E0D8C0');
    });
    this.P.forEach(function (p) { rect(c, p.x, p.y, 1, 1, p.col); });
    if (this.fade > 0) { c.globalAlpha = Math.min(1, this.fade); rect(c, 0, 0, W, H, o.sky); c.globalAlpha = 1; }
    void i; void H;
  };

  var api = { World: World, COLORS: COLORS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PixelWorld = api;
})(typeof window !== 'undefined' ? window : this);
