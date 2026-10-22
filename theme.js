/* disalin dari tema Blogger */
(function(){
  'use strict';
  /* Target belajar harian + streak + deteksi skor kuis. Dibaca oleh panel profil, kartu Hari ini, dan Mochi. */
  if (window.qDaily) return;
  var KEY = 'qProgressDaily', LOGK = 'qProgressLog', LVS = ['n5','n4','n3','n2','n1'], GOALS = [5, 10, 20, 30];
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function p2(n){ return (n < 10 ? '0' : '') + n; }
  function dkey(d){ return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function today(){ return dkey(new Date()); }
  function yest(){ var d = new Date(); return dkey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)); }
  function cnt(k){ try { var a = JSON.parse(lsGet(k) || '[]'); return Array.isArray(a) ? a.length : 0; } catch(e){ return 0; } }
  function total(){ var n = 0; LVS.forEach(function(l){ n += cnt(l + '_kotoba_archived_v1') + cnt(l + '_kanji_archived_v1'); }); return n; }
  var S = {d:'', n:0, goal:10, met:false, streak:0, last:'', best:0, base:null};
  try {
    var o = JSON.parse(lsGet(KEY) || '{}') || {};
    S.d = o.d || ''; S.n = +o.n || 0; S.goal = GOALS.indexOf(+o.goal) >= 0 ? +o.goal : 10; S.met = !!o.met;
    S.streak = +o.streak || 0; S.last = o.last || ''; S.best = +o.best || 0; S.base = typeof o.base === 'number' ? o.base : null;
  } catch(e){}
  function save(){ lsSet(KEY, JSON.stringify(S)); }
  function streak(){ return (S.last === today() || S.last === yest()) ? S.streak : 0; }
  function emit(type, extra){
    var d = {type:type, n:S.n, goal:S.goal, streak:streak()};
    if (extra) for (var k in extra) d[k] = extra[k];
    try { window.dispatchEvent(new CustomEvent('qdaily', {detail:d})); } catch(e){}
  }
  function roll(){ var t = today(); if (S.d !== t) { S.d = t; S.n = 0; S.met = false; save(); } }
  function check(){
    if (S.met || S.n < S.goal) return;
    S.met = true; var t = today();
    if (S.last === yest()) S.streak++; else if (S.last !== t) S.streak = 1;
    S.last = t; S.best = Math.max(S.best, S.streak); save(); emit('goal');
  }
  var lastQ = null;
  function pollQuiz(){
    var a = []; try { a = JSON.parse(lsGet(LOGK) || '[]') || []; } catch(e){}
    var last = a.length ? a[a.length - 1] : null, at = last ? +last.at : 0;
    if (lastQ === null) { lastQ = at; return; }
    if (at > lastQ) { lastQ = at; if (last && last.t > 0) emit('quiz', {pct:Math.round(100 * last.s / last.t), s:last.s, t:last.t}); }
  }
  function poll(){
    roll();
    var tot = total();
    if (S.base === null) { S.base = tot; save(); }
    else if (tot > S.base) {
      var add = tot - S.base; S.base = tot;
      /* Lonjakan besar = hasil sinkron dari perangkat lain, bukan belajar hari ini. */
      if (add <= 5) { S.n += add; save(); emit('learn', {add:add}); check(); } else save();
    } else if (tot < S.base) { S.base = tot; save(); }
    pollQuiz();
  }
  setInterval(poll, 2000);
  setTimeout(poll, 1200);
  document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'visible') poll(); });
  window.qDaily = {
    get: function(){ roll(); return {n:S.n, goal:S.goal, met:S.met, streak:streak(), best:S.best}; },
    nextGoal: function(){ S.goal = GOALS[(GOALS.indexOf(S.goal) + 1) % GOALS.length]; roll(); save(); check(); emit('goalchange'); return S.goal; }
  };
})();
(function(){
  'use strict';
  /* Suasana: efek musim (sakura, aki, salju, panas) + musik ambient sintetis (WebAudio, tanpa berkas). */
  if (window.__qfx) return; window.__qfx = 1;
  var KEY = 'qfx_v1';
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  var st = {fx: 'aki', snd: {}, vol: 0.6};
  try { var sv = JSON.parse(lsGet(KEY) || '{}'); if (sv.fx) st.fx = sv.fx; if (sv.snd) st.snd = sv.snd; if (typeof sv.vol === 'number') st.vol = sv.vol; } catch(e){}
  function save(){ lsSet(KEY, JSON.stringify(st)); }
  window.__qfxSt = st;
  function fxChanged(){ try { window.dispatchEvent(new Event('qfx-change')); } catch(e){} }
  var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  /* ================= AUDIO ================= */
  var SOUNDS = [['hujan', 'Hujan'], ['guntur', 'Hujan guntur'], ['katak', 'Hutan'], ['burung', 'Burung'], ['meditasi', 'Meditasi']];
  function noiseBuf(ctx, kind){
    var len = ctx.sampleRate * 4, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0), i;
    if (kind === 'brown') { var last = 0; for (i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } }
    else if (kind === 'pink') { var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; for (i = 0; i < len; i++) { var x = Math.random() * 2 - 1; b0 = 0.99886 * b0 + x * 0.0555179; b1 = 0.99332 * b1 + x * 0.0750759; b2 = 0.969 * b2 + x * 0.153852; b3 = 0.8665 * b3 + x * 0.3104856; b4 = 0.55 * b4 + x * 0.5329522; b5 = -0.7616 * b5 - x * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11; b6 = x * 0.115926; } }
    else { for (i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; }
    return b;
  }
  /* hujan: desis tinggi + tetes acak (percikan berbentuk derau pendek dan denting air). Tetes ditulis melingkar, jadi loop mulus. */
  function rainBuf(ctx){
    var sr = ctx.sampleRate, len = Math.floor(sr * 6), b = ctx.createBuffer(2, len, sr), ch, i, n, k;
    for (ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch), prev = 0;
      for (i = 0; i < len; i++) { var w = Math.random() * 2 - 1; d[i] = (w - prev * 0.55) * 0.08; prev = w; }
      for (n = 0; n < 3000; n++) {
        var st = Math.floor(Math.random() * len), a = Math.pow(Math.random(), 3) * 0.9 + 0.04, tau = sr * (0.0015 + Math.random() * 0.006), L = Math.floor(tau * 6);
        var ping = Math.random() < 0.3, f = 1500 + Math.random() * 4000, ph = Math.random() * 6.2832, c = Math.random() * 0.8, pv = 0;
        for (k = 0; k < L; k++) {
          var e = Math.exp(-k / tau), v; pv = c * pv + (1 - c) * (Math.random() * 2 - 1); v = ping ? Math.sin(ph + 6.2832 * f * k / sr) * 0.7 + pv * 0.3 : pv * (1 + c * 1.5);
          d[(st + k) % len] += v * e * a * 0.35;
        }
      }
      var ss = 0; for (i = 0; i < len; i++) ss += d[i] * d[i];
      var g = 0.22 / Math.sqrt(ss / len);
      for (i = 0; i < len; i++) d[i] = Math.tanh(d[i] * g * 1.3);
    }
    return b;
  }
  function buildAudio(ctx, dest){
    var master = ctx.createGain(); master.gain.value = 0.0001; 
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    master.connect(lp); lp.connect(dest || ctx.destination);
    var bufs = {white: noiseBuf(ctx, 'white'), pink: noiseBuf(ctx, 'pink'), brown: noiseBuf(ctx, 'brown')};
    function src(kind){ var s = ctx.createBufferSource(); s.buffer = bufs[kind]; s.loop = true; s.start(0, Math.random() * 3); return s; }
    function lfo(f, depth, target){ var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); return o; }
    var layers = {};
    function mkLayer(name, level){ var g = ctx.createGain(); g.gain.value = 0; g.connect(master); layers[name] = {g: g, level: level, on: false, timers: []}; return g; }
    /* hujan & hujan guntur: rekaman mp3 di GitHub Pages. Cadangan (sebelum file termuat / jika gagal): hujan buatan kode, dan untuk guntur ditambah petir buatan. */
    var RB = rainBuf(ctx);
    function rainSyn(layerGain, vol){
      var n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), gs = ctx.createGain();
      n.buffer = RB; n.loop = true; n.start(0, Math.random() * 5);
      hp.type = 'highpass'; hp.frequency.value = 450; gs.gain.value = vol;
      n.connect(hp); hp.connect(gs); gs.connect(layerGain); return gs;
    }
    var layers_syn = {};
    layers_syn.hujan = rainSyn(mkLayer('hujan', 0.6), 1);
    layers_syn.guntur = rainSyn(mkLayer('guntur', 0.7), 0.8);
    mkLayer('katak', 0.4); mkLayer('burung', 0.35); mkLayer('meditasi', 1.3);

    /* katak: "kwek-kwek" = nada gergaji turun, diputus-putus cepat (AM ~28 Hz), disaring di sekitar 700 Hz */
    function croak(t, f0){
      var g = layers.katak.g, o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), am = ctx.createGain(), e = ctx.createGain(), m = ctx.createOscillator(), md = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.72, t + 0.16);
      bp.type = 'bandpass'; bp.frequency.value = 750 + Math.random() * 250; bp.Q.value = 1.6;
      am.gain.value = 0.5; m.type = 'square'; m.frequency.value = 26 + Math.random() * 8; md.gain.value = 0.5; m.connect(md); md.connect(am.gain);
      e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(0.9, t + 0.02); e.gain.setValueAtTime(0.9, t + 0.12); e.gain.linearRampToValueAtTime(0.0001, t + 0.2);
      o.connect(bp); bp.connect(am); am.connect(e); e.connect(g);
      o.start(t); m.start(t); o.stop(t + 0.22); m.stop(t + 0.22);
    }
    function frogs(t){
      var n = 2 + Math.floor(Math.random() * 4), base = 150 + Math.random() * 60, i;
      for (i = 0; i < n; i++) croak(t + i * (0.22 + Math.random() * 0.06), base * (1 - i * 0.03));
    }
    /* burung: kicau = beberapa nada sinus pendek yang meluncur naik/turun di 2,5-5 kHz */
    function tweet(t){
      var g = layers.burung.g, n = 3 + Math.floor(Math.random() * 5), base = 2600 + Math.random() * 1400, i, s = t;
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) { pan.pan.value = Math.random() * 1.4 - 0.7; pan.connect(g); }
      for (i = 0; i < n; i++) {
        var o = ctx.createOscillator(), e = ctx.createGain(), d = 0.06 + Math.random() * 0.08, up = Math.random() < 0.5, f = base * (0.85 + Math.random() * 0.4);
        o.type = 'sine'; o.frequency.setValueAtTime(up ? f * 0.8 : f * 1.15, s); o.frequency.exponentialRampToValueAtTime(up ? f * 1.15 : f * 0.8, s + d);
        e.gain.setValueAtTime(0.0001, s); e.gain.linearRampToValueAtTime(0.5, s + d * 0.25); e.gain.linearRampToValueAtTime(0.0001, s + d);
        o.connect(e); e.connect(pan || g); o.start(s); o.stop(s + d + 0.02);
        s += d + 0.04 + Math.random() * 0.1;
      }
    }
    /* petir: retakan singkat (derau putih) + gemuruh panjang (derau cokelat, penyaring menurun, bergelombang) */
    function thunder(t){
      var g = layers.guntur.g, dur = 3.5 + Math.random() * 2.5, i;
      var c = ctx.createBufferSource(); c.buffer = bufs.white;
      var chp = ctx.createBiquadFilter(); chp.type = 'highpass'; chp.frequency.value = 1200;
      var ce = ctx.createGain(); ce.gain.setValueAtTime(0.0001, t); ce.gain.linearRampToValueAtTime(0.45, t + 0.01); ce.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      c.connect(chp); chp.connect(ce); ce.connect(g); c.start(t, Math.random() * 3); c.stop(t + 0.3);
      var r = ctx.createBufferSource(); r.buffer = bufs.brown; r.loop = true;
      var lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.Q.value = 0.7;
      lpf.frequency.setValueAtTime(900, t + 0.1); lpf.frequency.exponentialRampToValueAtTime(110, t + dur);
      var re = ctx.createGain(); re.gain.setValueAtTime(0.0001, t + 0.1); re.gain.linearRampToValueAtTime(1, t + 0.35);
      for (i = 1; i < 6; i++) re.gain.linearRampToValueAtTime((0.35 + Math.random() * 0.65) * (1 - i / 7), t + 0.35 + i * dur / 6);
      re.gain.linearRampToValueAtTime(0.0001, t + dur);
      r.connect(lpf); lpf.connect(re); re.connect(g); r.start(t + 0.1, Math.random() * 3); r.stop(t + dur + 0.1);
    }
    var timer = null;
    function sched(){
      var now = ctx.currentTime;
      if (layers.katak.on && !layers.katak.file && Math.random() < 0.45) frogs(now + 0.05 + Math.random() * 0.8);
      if (layers.burung.on && !layers.burung.file && Math.random() < 0.55) tweet(now + 0.05 + Math.random() * 0.8);
      if (layers.guntur.on && !layers.guntur.file && Math.random() < 0.1) thunder(now + 0.05);
    }
    function startTimer(){ if (!timer) timer = setInterval(sched, 1800); }
    /* File mp3 (hujan, hujan guntur, hutan, burung, meditasi) dimuat hanya saat tombolnya pertama kali dinyalakan; kalau gagal tetap pakai suara buatan kode. */
    var BASE = 'https://bshantoz.github.io/nihongo/game/ambient/';
    var FILES = {hujan: BASE + 'hujan.mp3', guntur: BASE + 'guntur.mp3', katak: BASE + 'katak.mp3', burung: BASE + 'burung.mp3', meditasi: BASE + 'meditasi.mp3'};
    function loadFile(name){
      var L = layers[name], url = FILES[name]; if (!L || !url || L.fs) return; L.fs = 1;
      try {
        fetch(url).then(function(r){ if (!r.ok) throw 0; return r.arrayBuffer(); })
          .then(function(ab){ return new Promise(function(ok, no){ var p = ctx.decodeAudioData(ab, ok, no); if (p && p.catch) p.catch(no); }); })
          .then(function(buf){
            var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(L.g); s.start(0);
            L.file = 1; L.level = (name === 'meditasi' ? 1.3 : 1.6);
            if (layers_syn[name]) layers_syn[name].gain.setTargetAtTime(0, ctx.currentTime, 0.4);
            if (L.on) { L.g.gain.cancelScheduledValues(ctx.currentTime); L.g.gain.setTargetAtTime(L.level, ctx.currentTime, 1.2); }
          })
          .catch(function(){ L.fs = 0; });
      } catch(e){ L.fs = 0; }
    }
    function setLayer(name, on){
      var L = layers[name]; if (!L) return; L.on = !!on;
      L.g.gain.cancelScheduledValues(ctx.currentTime);
      L.g.gain.setTargetAtTime(on ? L.level : 0, ctx.currentTime, 1.2);
      if (on) { startTimer(); loadFile(name); }
    }
    function setVol(v){ master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(Math.max(0.0001, v * 0.9), ctx.currentTime, 0.3); }
    function stopTimer(){ if (timer) { clearInterval(timer); timer = null; } }
    return {ctx: ctx, setLayer: setLayer, setVol: setVol, stopTimer: stopTimer, layers: layers};
  }
  window.qfx = {buildAudio: buildAudio};

  var au = null;
  function anyOn(){ return SOUNDS.some(function(s){ return st.snd[s[0]]; }); }
  function ensureAudio(){
    if (au) { if (au.ctx.state === 'suspended') au.ctx.resume(); return au; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    au = buildAudio(new AC());
    if (au.ctx.state === 'suspended') au.ctx.resume();
    return au;
  }
  function applyAudio(){
    if (!anyOn()) { if (au) { SOUNDS.forEach(function(s){ au.setLayer(s[0], false); }); } return; }
    var a = ensureAudio(); if (!a) return;
    a.setVol(st.vol);
    SOUNDS.forEach(function(s){ a.setLayer(s[0], !!st.snd[s[0]]); });
  }

  /* ================= EFEK MUSIM ================= */
  var cv = document.createElement('canvas'); cv.id = 'qfxCv'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:5;display:none';
  var cx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, parts = [], raf = 0, last = 0, T = 0;
  function resize(){ dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function rnd(a, b){ return a + Math.random() * (b - a); }
  var COUNT = {sakura: 38, aki: 30, salju: 90, panas: 26};
  function mk(kind, init){
    var p = {x: rnd(0, W), y: init ? rnd(0, H) : rnd(-40, -10), r: 1, vx: 0, vy: 0, a: rnd(0, 6.28), va: rnd(-1, 1), ph: rnd(0, 6.28), c: 0};
    if (kind === 'sakura') { p.r = rnd(5, 9); p.vy = rnd(28, 52); p.vx = rnd(8, 26); p.c = ['#ffc1d6', '#ffb0cb', '#ffd6e4', '#f9a8c5'][Math.floor(rnd(0, 4))]; }
    else if (kind === 'aki') { p.r = rnd(8, 14); p.vy = rnd(30, 60); p.vx = rnd(-10, 20); p.c = ['#d9531e', '#e8892b', '#b8321f', '#e3a72f', '#a65a1c'][Math.floor(rnd(0, 5))]; }
    else if (kind === 'salju') { p.r = rnd(1.4, 4.2); p.vy = rnd(18, 55) * (p.r / 3 + 0.4); p.vx = rnd(-8, 8); }
    else { p.x = rnd(0, W); p.y = init ? rnd(0, H) : H + 10; p.r = rnd(8, 26); p.vy = -rnd(8, 22); p.vx = rnd(-6, 6); p.c = rnd(0.05, 0.14); }
    return p;
  }
  function drawPetal(p, col){
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, 0.6 + 0.4 * Math.abs(Math.sin(p.ph)));
    cx.fillStyle = col; cx.beginPath(); cx.moveTo(0, -p.r); cx.bezierCurveTo(p.r, -p.r * .7, p.r * .8, p.r * .6, 0, p.r); cx.bezierCurveTo(-p.r * .8, p.r * .6, -p.r, -p.r * .7, 0, -p.r); cx.fill();
    cx.restore();
  }
  function drawLeaf(p){
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(0.55 + 0.45 * Math.abs(Math.sin(p.ph)), 1);
    cx.fillStyle = p.c; cx.beginPath();
    cx.moveTo(0, -p.r); cx.quadraticCurveTo(p.r * .9, -p.r * .2, p.r * .35, p.r * .25); cx.lineTo(p.r * .6, p.r * .6); cx.lineTo(0, p.r * .35); cx.lineTo(-p.r * .6, p.r * .6); cx.lineTo(-p.r * .35, p.r * .25); cx.quadraticCurveTo(-p.r * .9, -p.r * .2, 0, -p.r); cx.fill();
    cx.strokeStyle = 'rgba(80,30,10,.45)'; cx.lineWidth = 0.8; cx.beginPath(); cx.moveTo(0, -p.r * .8); cx.lineTo(0, p.r * .9); cx.stroke();
    cx.restore();
  }
  function frame(ts){
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts; T += dt;
    cx.clearRect(0, 0, W, H);
    var kind = st.fx, i, p;
    if (kind === 'panas') {
      var g = cx.createRadialGradient(W * 0.92, H * 0.04, 0, W * 0.92, H * 0.04, Math.max(W, H) * 0.75);
      g.addColorStop(0, 'rgba(255,214,102,.55)'); g.addColorStop(0.25, 'rgba(255,190,80,.22)'); g.addColorStop(1, 'rgba(255,190,80,0)');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      cx.save(); cx.translate(W * 0.92, H * 0.04); cx.rotate(T * 0.05);
      for (i = 0; i < 9; i++) { cx.rotate(6.283 / 9); var rg = cx.createLinearGradient(0, 0, Math.max(W, H) * 0.8, 0); rg.addColorStop(0, 'rgba(255,224,130,.16)'); rg.addColorStop(1, 'rgba(255,224,130,0)'); cx.fillStyle = rg; cx.beginPath(); cx.moveTo(0, -10); cx.lineTo(Math.max(W, H) * 0.8, -50); cx.lineTo(Math.max(W, H) * 0.8, 50); cx.lineTo(0, 10); cx.fill(); }
      cx.restore();
    }
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; p.ph += dt * 2.2; p.a += p.va * dt;
      if (kind === 'sakura' || kind === 'aki') { p.x += (p.vx + Math.sin(p.ph) * 22) * dt; p.y += p.vy * dt; }
      else if (kind === 'salju') { p.x += (p.vx + Math.sin(p.ph * 0.6) * 12) * dt; p.y += p.vy * dt; }
      else { p.x += (p.vx + Math.sin(p.ph * 0.5) * 6) * dt; p.y += p.vy * dt; }
      if (kind === 'panas') {
        if (p.y < -30) { parts[i] = mk(kind, false); continue; }
        var rg2 = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        rg2.addColorStop(0, 'rgba(255,214,110,' + (p.c * 2.2) + ')'); rg2.addColorStop(1, 'rgba(255,214,110,0)');
        cx.fillStyle = rg2; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      } else {
        if (p.y > H + 20 || p.x > W + 30 || p.x < -30) { parts[i] = mk(kind, false); if (kind !== 'sakura' && kind !== 'aki') parts[i].x = rnd(0, W); else parts[i].x = rnd(-60, W); continue; }
        if (kind === 'sakura') drawPetal(p, p.c);
        else if (kind === 'aki') drawLeaf(p);
        else { cx.fillStyle = 'rgba(255,255,255,.95)'; cx.shadowColor = 'rgba(90,130,190,.55)'; cx.shadowBlur = 3; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); cx.shadowBlur = 0; }
      }
    }
  }
  function applyFx(){
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (st.fx === 'off' || !COUNT[st.fx]) { cv.style.display = 'none'; cx.clearRect(0, 0, W, H); return; }
    if (!cv.parentNode) document.body.appendChild(cv);
    resize(); cv.style.display = 'block';
    var n = Math.round(COUNT[st.fx] * (reduce ? 0.4 : 1) * (W < 600 ? 0.7 : 1));
    parts = []; for (var i = 0; i < n; i++) parts.push(mk(st.fx, true));
    last = performance.now();
    if (!document.hidden) raf = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function(){ if (st.fx !== 'off') applyFx(); });
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else if (st.fx !== 'off' && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });

  /* ================= PANEL ================= */
  var FX = [['off', 'Mati', ''], ['sakura', 'Sakura', '\ud83c\udf38'], ['aki', 'Aki', '\ud83c\udf42'], ['salju', 'Salju', '\u2744\ufe0f'], ['panas', 'Panas', '\u2600\ufe0f']];
  var fab = document.createElement('button');
  fab.type = 'button'; fab.id = 'qfxFab'; fab.setAttribute('aria-label', 'Suasana: efek musim dan musik');
  fab.innerHTML = '<svg viewBox="0 0 24 24" class="line" aria-hidden="true"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>';
  var pan = document.createElement('div'); pan.id = 'qfxPan'; pan.hidden = true; pan.setAttribute('role', 'dialog'); pan.setAttribute('aria-label', 'Suasana');
  function panHtml(){
    return '<div class="qfxH"><b>Suasana</b><button type="button" class="qfxX" data-x="1" aria-label="Tutup">&times;</button></div>' +
      '<div class="qfxT">Efek musim</div><div class="qfxRow">' + FX.map(function(f){
        return '<button type="button" class="qfxChip' + (st.fx === f[0] ? ' on' : '') + '" data-fx="' + f[0] + '">' + (f[2] ? '<span>' + f[2] + '</span>' : '') + f[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="qfxT">Musik santai (ambient)</div><div class="qfxRow">' + SOUNDS.map(function(s){
        return '<button type="button" class="qfxChip' + (st.snd[s[0]] ? ' on' : '') + '" data-snd="' + s[0] + '" aria-pressed="' + (!!st.snd[s[0]]) + '">' + s[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="qfxT">Teman belajar</div><div class="qfxRow"><button type="button" class="qfxChip' + (window.qcat && window.qcat.isOn() ? ' on' : '') + '" data-cat="1">Kucing Mochi</button><button type="button" class="qfxChip" data-catreset="1">Kembalikan posisi</button></div>' +
      '<label class="qfxVol">Volume <input type="range" min="0" max="100" value="' + Math.round(st.vol * 100) + '" id="qfxVol"></label>' +
      (/android/i.test(navigator.userAgent) && !/QategoriApp/.test(navigator.userAgent) ? '<a class="qfxD" href="https://github.com/bshantoz/qategori/releases/download/terbaru/QategoriKartu.apk">Unduh aplikasi Android</a><p class="qfxN">Kalau tidak terunduh, buka situs ini lewat Chrome lalu coba lagi.</p>' : '');
  }
  function renderPan(){ pan.innerHTML = panHtml(); }
  fab.addEventListener('click', function(){ pan.hidden = !pan.hidden; if (!pan.hidden) renderPan(); });
  pan.addEventListener('click', function(e){
    e.stopPropagation();
    var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
    if (b.hasAttribute('data-x')) { pan.hidden = true; return; }
    if (b.hasAttribute('data-cat')) { if (window.qcat) window.qcat.toggle(); renderPan(); return; }
    if (b.hasAttribute('data-catreset')) { if (window.qcat) window.qcat.reset(); return; }
    if (b.hasAttribute('data-fx')) { st.fx = b.getAttribute('data-fx'); save(); applyFx(); fxChanged(); renderPan(); return; }
    if (b.hasAttribute('data-snd')) { var k = b.getAttribute('data-snd'); st.snd[k] = !st.snd[k]; save(); applyAudio(); renderPan(); }
  });
  pan.addEventListener('input', function(e){
    if (e.target.id === 'qfxVol') { st.vol = e.target.value / 100; save(); if (au) au.setVol(st.vol); }
  });
  document.addEventListener('click', function(e){ if (!pan.hidden && !pan.contains(e.target) && !fab.contains(e.target)) pan.hidden = true; });
  function init(){
    document.body.appendChild(fab); document.body.appendChild(pan);
    if (st.fx !== 'off') { applyFx(); fxChanged(); }
    /* Peramban memblokir suara sebelum ada sentuhan: lanjutkan musik pada sentuhan pertama. */
    if (anyOn()) {
      var kick = function(){ document.removeEventListener('pointerdown', kick, true); applyAudio(); };
      document.addEventListener('pointerdown', kick, true);
    }
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
(function(){
  'use strict';
  /* Pemandangan musim: header (otera + hiasan), body (ornamen pinggir), footer (rumput + serangga). Mengikuti pilihan di panel Suasana; malam mengikuti tema gelap. */
  if (window.__qscene) return; window.__qscene = 1;
  var P = {
    sakura: {leaf: '#f6b3c8', leaf2: '#f48fb1', trunk: '#6b4a3a', grass: '#79c66a', grass2: '#5fae52', roof: '#5b4a58', wall: '#f3e3d3', acc: '#d6453d', tint: 'rgba(246,179,200,.10)'},
    aki: {leaf: '#e0662a', leaf2: '#c8431c', trunk: '#5a3a22', grass: '#c9a24a', grass2: '#a8832e', roof: '#4e3a2c', wall: '#f0d9b5', acc: '#b3341a', tint: 'rgba(224,102,42,.09)'},
    salju: {leaf: '#ffffff', leaf2: '#e3eef7', trunk: '#6a5a50', grass: '#f4f9fd', grass2: '#cfe0ee', roof: '#f2f6fa', wall: '#e6d8c3', acc: '#d6453d', tint: 'rgba(160,200,235,.10)'},
    panas: {leaf: '#3f9d4d', leaf2: '#2f8a3e', trunk: '#6b4a2a', grass: '#4cae4f', grass2: '#388e3c', roof: '#3d4a5a', wall: '#f6ecd8', acc: '#e8b01a', tint: 'rgba(250,210,80,.08)'}
  };
  function S(){ return (window.__qfxSt && window.__qfxSt.fx) || 'off'; }
  function isNight(){
    var n = document.querySelector('.nB'), t = n && n.getAttribute('data-theme');
    if (t === 'dark') return true; if (t === 'light') return false;
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch(e){ return false; }
  }
  function g(x, y, s, inner, cls){ return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + (cls ? '<g class="' + cls + '">' + inner + '</g>' : inner) + '</g>'; }

  /* ---------- Potongan gambar (titik 0,0 = dasar tengah) ---------- */
  function temple(p, s){
    var snow = s === 'salju';
    var roofStroke = snow ? ' stroke="#9fb4c6" stroke-width="1"' : '';
    return '<rect x="-12" y="-12" width="24" height="12" fill="' + p.wall + '"/><rect x="-3" y="-9" width="6" height="9" fill="' + p.acc + '"/>' +
      '<rect x="-9.5" y="-9" width="4" height="4" class="qsLit" fill="#6b5a40"/><rect x="5.5" y="-9" width="4" height="4" class="qsLit" fill="#6b5a40"/>' +
      '<path d="M-20 -11Q-8 -13 0 -22Q8 -13 20 -11Z" fill="' + p.roof + '"' + roofStroke + '/>' +
      '<rect x="-8" y="-30" width="16" height="8" fill="' + p.wall + '"/><rect x="-2" y="-28" width="4" height="4" class="qsLit" fill="#6b5a40"/>' +
      '<path d="M-14 -29Q-5 -31 0 -38Q5 -31 14 -29Z" fill="' + p.roof + '"' + roofStroke + '/>' +
      '<rect x="-5" y="-44" width="10" height="6" fill="' + p.wall + '"/>' +
      '<path d="M-10 -43Q-3 -45 0 -51Q3 -45 10 -43Z" fill="' + p.roof + '"' + roofStroke + '/>' +
      '<path d="M0 -51V-58M-2 -54H2M-1.4 -56.5H1.4" stroke="' + p.acc + '" stroke-width="1" stroke-linecap="round"/>' +
      (snow ? '<path d="M-20 -11Q-8 -14 0 -23Q8 -14 20 -11Q8 -13 0 -20Q-8 -13 -20 -11Z" fill="#fff"/>' : '');
  }
  function leafyTree(p, s){
    var petals = s === 'sakura' ? '<circle cx="-9" cy="-30" r="1.4" fill="#fff"/><circle cx="6" cy="-38" r="1.4" fill="#fff"/><circle cx="12" cy="-26" r="1.4" fill="#fff"/><circle cx="-2" cy="-24" r="1.2" fill="#fff"/>' : '';
    return '<path d="M-2 0Q-1 -14 -4 -26M2 0Q1 -14 5 -28M0 -14Q-9 -20 -12 -26M1 -17Q9 -24 12 -30" fill="none" stroke="' + p.trunk + '" stroke-width="4.4" stroke-linecap="round"/>' +
      '<circle cx="-12" cy="-30" r="11" fill="' + p.leaf2 + '"/><circle cx="12" cy="-34" r="12" fill="' + p.leaf2 + '"/><circle cx="0" cy="-42" r="14" fill="' + p.leaf + '"/><circle cx="-6" cy="-30" r="10" fill="' + p.leaf + '"/><circle cx="8" cy="-26" r="9" fill="' + p.leaf + '"/>' + petals;
  }
  function bareTree(p){
    var sn = '#fff';
    return '<path d="M0 0Q-1 -16 0 -34M0 -14Q-9 -20 -15 -32M0 -20Q8 -26 15 -38M-8 -22Q-14 -22 -19 -26M7 -28Q14 -28 18 -32M0 -30Q-4 -38 -6 -44M0 -33Q4 -40 8 -46" fill="none" stroke="' + p.trunk + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-17 -33Q-15 -35 -12 -33M13 -39Q15 -41 18 -39M-8 -45Q-6 -47 -3 -45M6 -47Q8 -49 11 -47" fill="none" stroke="' + sn + '" stroke-width="2.4" stroke-linecap="round"/>';
  }
  function sunflower(p){
    return '<path d="M0 0V-16" stroke="#3e8e41" stroke-width="2"/><path d="M0 -6Q-6 -8 -7 -12Q-2 -11 0 -6Z" fill="#3e8e41"/><circle cx="0" cy="-18" r="6" fill="none" stroke="#f6c21c" stroke-width="4" stroke-dasharray="2.2 1.4"/><circle cx="0" cy="-18" r="3.4" fill="#6b3f1d"/>';
  }
  function snowman(){
    return '<circle cx="0" cy="-7" r="7" fill="#fff" stroke="#b7cbdc" stroke-width=".8"/><circle cx="0" cy="-19" r="5.2" fill="#fff" stroke="#b7cbdc" stroke-width=".8"/>' +
      '<circle cx="-1.8" cy="-20" r=".8" fill="#333"/><circle cx="1.8" cy="-20" r=".8" fill="#333"/><path d="M0 -18.6L4.6 -17.6L0 -17Z" fill="#f08a24"/>' +
      '<path d="M-5.4 -14.4Q0 -12.4 5.4 -14.4" fill="none" stroke="#d6453d" stroke-width="2"/><path d="M-3.6 -23.6H3.6M-2.6 -23.6V-28.5H2.6V-23.6" fill="none" stroke="#333" stroke-width="1.6"/>' +
      '<circle cx="0" cy="-8" r=".8" fill="#333"/><circle cx="0" cy="-5" r=".8" fill="#333"/><path d="M-6 -10L-11 -14M6 -10L11 -14" stroke="#6a5a50" stroke-width="1.2" stroke-linecap="round"/>';
  }
  function torii(p){
    return '<path d="M-14 0V-26M14 0V-26" stroke="' + p.acc + '" stroke-width="3.4"/><path d="M-19 -28Q0 -24 19 -28V-31Q0 -27 -19 -31Z" fill="#2f2f2f"/><path d="M-16 -22H16" stroke="' + p.acc + '" stroke-width="2.6"/>';
  }
  function lantern(p){
    return '<rect x="-7" y="-4" width="14" height="4" fill="#9a9a9a"/><rect x="-2.5" y="-14" width="5" height="10" fill="#aaa"/><rect x="-6" y="-22" width="12" height="8" fill="#b7b7b7"/><rect x="-3" y="-20" width="6" height="4" class="qsLit" fill="#6b5a40"/><path d="M-9 -22L0 -29L9 -22Z" fill="#8a8a8a"/><circle cx="0" cy="-30" r="1.6" fill="#8a8a8a"/>';
  }
  function sun(){
    return '<circle r="8" fill="#ffd54a"/><circle r="12" fill="none" stroke="#ffd54a" stroke-width="3" stroke-dasharray="2 4.2"/>';
  }
  function cloud(){
    return '<ellipse cx="0" cy="0" rx="13" ry="5" fill="#fff"/><circle cx="-4" cy="-4" r="6" fill="#fff"/><circle cx="5" cy="-5" r="5" fill="#fff"/>';
  }
  function moon(){
    return '<path d="M10 0A10 10 0 1 0 10 20A8 8 0 0 1 10 0Z" fill="#fdf3c0"/>';
  }
  function stars(w, h, n){
    var o = '', i, x, y, r;
    for (i = 0; i < n; i++) { x = (i * 61 + 17) % w; y = (i * 37 + 5) % h; r = i % 3 === 0 ? 1.3 : .8; o += '<circle class="qsTw" style="animation-delay:' + ((i * .7) % 3).toFixed(1) + 's" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff6c8"/>'; }
    return o;
  }

  /* ---------- Header ---------- */
  function headerSVG(s, p){
    var o = '<g class="qsN">' + stars(380, 36, 14) + g(112, 5, .9, moon()) + '</g>';
    if (s === 'panas') o += '<g class="qsD">' + g(36, 20, .9, sun()) + g(100, 14, .8, cloud()) + g(160, 22, .6, cloud()) + '</g>';
    if (s === 'aki') o += '<g class="qsD">' + g(60, 18, .7, cloud().replace(/#fff/g, '#f6dcc4')) + '</g>';
    if (s === 'sakura') o += '<g class="qsD">' + g(70, 16, .7, cloud().replace(/#fff/g, '#fde7ef')) + '</g>';
    if (s === 'salju') o += '<g class="qsD">' + g(90, 16, .7, cloud().replace(/#fff/g, '#e3eef7')) + '</g>';
    if (s === 'sakura') o += g(215, 62, .5, leafyTree(p, s), 'qsSway') + g(262, 62, .72, leafyTree(p, s), 'qsSway') + g(396, 62, .4, leafyTree(p, s), 'qsSway');
    if (s === 'aki') o += g(205, 62, .5, leafyTree(p, s), 'qsSway') + g(256, 62, .76, leafyTree(p, s), 'qsSway') + g(396, 62, .42, leafyTree(p, s), 'qsSway');
    if (s === 'salju') o += g(170, 62, .6, snowman()) + g(236, 62, .66, bareTree(p), 'qsSway') + g(384, 62, .42, bareTree(p), 'qsSway');
    if (s === 'panas') o += g(158, 62, .55, torii(p)) + g(216, 62, .7, sunflower(p)) + g(234, 62, .55, sunflower(p)) + g(386, 62, .6, sunflower(p));
    o += g(326, 62, .8, temple(p, s));
    var ground = s === 'salju' ? '<path d="M120 62Q180 56 260 60Q320 57 400 60V64H120Z" fill="#fff"/>' : '<path d="M120 63Q200 59 280 62T400 61V64H120Z" fill="' + p.grass + '" opacity=".8"/>';
    return '<svg viewBox="0 0 400 64" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">' + ground + o + '</svg>';
  }

  /* ---------- Body (ornamen pinggir) ---------- */
  function bodySVG(s, p, side){
    var o = '';
    if (side === 'L') {
      if (s === 'sakura') o = g(60, 160, 1.5, leafyTree(p, s), 'qsSway') + g(130, 160, .8, lantern(p));
      if (s === 'aki') o = g(60, 160, 1.5, leafyTree(p, s), 'qsSway') + g(130, 160, .8, lantern(p));
      if (s === 'salju') o = g(60, 160, 1.6, bareTree(p), 'qsSway') + g(130, 160, 1, snowman());
      if (s === 'panas') o = g(40, 160, 1.5, sunflower(p)) + g(80, 160, 1.9, sunflower(p)) + g(120, 160, 1.4, sunflower(p));
    } else {
      if (s === 'sakura') o = g(70, 160, 1, torii(p)) + g(40, 160, .9, '<path d="M0 0V-12" stroke="#3e8e41" stroke-width="2"/><circle cx="0" cy="-14" r="5" fill="#f48fb1"/><circle cx="0" cy="-14" r="1.8" fill="#ffe082"/>');
      if (s === 'aki') o = g(90, 160, 1.1, '<path d="M-14 0Q-14 -14 0 -14Q14 -14 14 0Z" fill="#d9a066" stroke="#8a5a2b" stroke-width="1"/><rect x="-3" y="-22" width="6" height="8" fill="#6b4a2a"/>') + g(46, 160, 1.4, '<path d="M0 0V-10" stroke="#8a5a2b" stroke-width="2"/><path d="M-8 -10Q0 -20 8 -10Q0 -8 -8 -10Z" fill="#e0662a"/>');
      if (s === 'salju') o = g(90, 160, 1.3, lantern(p)) + g(40, 160, .9, '<path d="M-14 0Q-10 -12 0 -12Q10 -12 14 0Z" fill="#fff" stroke="#c4d6e4"/>');
      if (s === 'panas') o = g(80, 160, 1.5, '<path d="M0 0V-18M-8 -18Q0 -30 8 -18Z" stroke="#7b5a3a" stroke-width="2" fill="#4cae4f"/>') + g(40, 160, 1.1, torii(p));
    }
    return '<svg viewBox="0 0 160 164" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' + o + '</svg>';
  }

  /* ---------- Footer: rumput + hiasan + serangga ---------- */
  function uri(svg){ return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")'; }
  function grassTile(s, p){
    var tufts = '', i, x;
    for (i = 0; i < 6; i++) { x = 5 + i * 10; tufts += '<path d="M' + x + ' 40Q' + (x - 2) + ' ' + (22 + (i % 3) * 3) + ' ' + (x - 4) + ' ' + (18 + (i % 2) * 3) + 'Q' + (x + 1) + ' ' + (26) + ' ' + (x + 2) + ' 40Z" fill="' + (i % 2 ? p.grass : p.grass2) + '"/>'; }
    var extra = '';
    if (s === 'sakura') extra = '<circle cx="12" cy="26" r="2" fill="#f9c7d4"/><circle cx="44" cy="30" r="1.6" fill="#fff"/>';
    if (s === 'aki') extra = '<path d="M20 34l3-4 3 4-3-1z" fill="#c8431c"/><circle cx="48" cy="33" r="1.6" fill="#8a5a2b"/>';
    if (s === 'salju') extra = '<path d="M0 40Q15 30 30 36T60 34V40Z" fill="#fff"/>';
    if (s === 'panas') extra = '<circle cx="10" cy="24" r="1.8" fill="#ffd54a"/><circle cx="40" cy="27" r="1.8" fill="#fff"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40">' + tufts + extra + '</svg>';
  }
  function orn(s, p){
    var o = '';
    if (s === 'sakura') o = g(40, 44, .8, '<path d="M0 0V-14" stroke="#3e8e41" stroke-width="2"/><circle cx="0" cy="-16" r="5" fill="#f48fb1"/><circle cx="0" cy="-16" r="1.8" fill="#ffe082"/>') + g(150, 44, .7, lantern(p)) + g(210, 44, .6, '<path d="M0 0V-14" stroke="#3e8e41" stroke-width="2"/><circle cx="0" cy="-16" r="5" fill="#fff"/><circle cx="0" cy="-16" r="1.8" fill="#ffe082"/>');
    if (s === 'aki') o = g(40, 44, 1, '<path d="M-9 0Q-9 -9 0 -9Q9 -9 9 0Z" fill="#d9a066" stroke="#8a5a2b" stroke-width=".8"/><rect x="-2" y="-14" width="4" height="5" fill="#6b4a2a"/>') + g(150, 44, .5, lantern(p)) + g(205, 44, 1, '<path d="M-9 0Q-9 -7 0 -7Q9 -7 9 0Z" fill="#e8c4a0" stroke="#8a5a2b" stroke-width=".8"/><rect x="-2" y="-11" width="4" height="4" fill="#8a5a2b"/>');
    if (s === 'salju') o = g(50, 44, .6, snowman()) + g(150, 44, .5, lantern(p)) + g(210, 44, 1, '<path d="M-12 0Q-8 -9 0 -9Q8 -9 12 0Z" fill="#fff" stroke="#c4d6e4"/>');
    if (s === 'panas') o = g(40, 44, .8, sunflower(p)) + g(70, 44, .6, sunflower(p)) + g(160, 44, .6, '<path d="M-12 0A12 12 0 0 1 12 0Z" fill="#e53935"/><path d="M-12 0H12" stroke="#43a047" stroke-width="2.4"/><circle cx="-4" cy="-4" r=".8" fill="#222"/><circle cx="3" cy="-5" r=".8" fill="#222"/>') + g(215, 44, .7, sunflower(p));
    return '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="44" viewBox="0 0 240 44">' + o + '</svg>';
  }
  var BUT = '<svg viewBox="0 0 20 16"><g class="qsWing"><path d="M10 8Q2 0 1 6Q2 11 10 8Z" fill="COL"/><path d="M10 8Q18 0 19 6Q18 11 10 8Z" fill="COL"/></g><path d="M10 4V12" stroke="#4a3426" stroke-width="1.4"/></svg>';
  var DRG = '<svg viewBox="0 0 28 14"><g class="qsWing"><ellipse cx="9" cy="4" rx="7" ry="1.8" fill="rgba(200,230,255,.8)"/><ellipse cx="17" cy="4" rx="7" ry="1.8" fill="rgba(200,230,255,.8)"/></g><path d="M3 7H25" stroke="COL" stroke-width="2.2" stroke-linecap="round"/><circle cx="3.4" cy="7" r="2.2" fill="COL"/></svg>';
  var CRK = '<svg viewBox="0 0 20 14"><ellipse cx="9" cy="8" rx="6.4" ry="3.2" fill="#6b4a2a"/><circle cx="15.6" cy="7" r="2.3" fill="#6b4a2a"/><path d="M15.6 5Q18 1 19.6 2M5 10L2 13M9 11L8 13.4M12 10L14 13" stroke="#4a3426" stroke-width="1" fill="none" stroke-linecap="round"/></svg>';
  var LDY = '<svg viewBox="0 0 14 12"><ellipse cx="7" cy="7" rx="5.4" ry="4.4" fill="#e53935"/><path d="M7 2.6V11" stroke="#222" stroke-width=".8"/><circle cx="4.6" cy="6" r=".9" fill="#222"/><circle cx="9.4" cy="8" r=".9" fill="#222"/><circle cx="7" cy="2.6" r="1.8" fill="#222"/></svg>';
  var BRD = '<svg viewBox="0 0 20 16"><ellipse cx="9" cy="9" rx="6.5" ry="4.6" fill="#a98467"/><circle cx="15" cy="6.4" r="3.2" fill="#a98467"/><path d="M18 6.4L20 7L18 7.8Z" fill="#f2a65a"/><circle cx="15.8" cy="5.8" r=".7" fill="#222"/><path d="M3 9L-1 12" stroke="#7a5c43" stroke-width="2" stroke-linecap="round"/><path d="M8 13L8 15.6M11 13L11 15.6" stroke="#f2a65a" stroke-width="1"/></svg>';
  var FLY = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="rgba(210,255,120,.28)"/><circle cx="5" cy="5" r="1.6" fill="#e9ff7a"/></svg>';
  var SPK = '<svg viewBox="0 0 10 10"><path d="M5 0V10M0 5H10M1.6 1.6L8.4 8.4M8.4 1.6L1.6 8.4" stroke="#fff" stroke-width="1" stroke-linecap="round"/></svg>';
  function bug(svg, col, size, mode, top, dur, delay, night){
    return '<i class="qsI ' + mode + (night ? ' qsNight' : ' qsDay') + '" style="top:' + top + 'px;width:' + size + 'px;height:' + (size * .8) + 'px;animation-duration:' + dur + 's;animation-delay:-' + delay + 's">' + svg.replace(/COL/g, col) + '</i>';
  }
  function bugs(s, p){
    var o = '';
    if (s === 'sakura') {
      o += bug(BUT, '#f7a8c4', 20, 'qsFly', 6, 22, 3) + bug(BUT, '#fff', 17, 'qsFly', 18, 30, 14) + bug(BUT, '#9ec8ff', 15, 'qsFly', 10, 38, 22);
      o += bug(FLY, '', 10, 'qsGlow', 20, 3, 0, 1) + bug(FLY, '', 9, 'qsGlow', 28, 4, 1, 1) + bug(FLY, '', 10, 'qsGlow', 12, 3.5, 2, 1) + bug(FLY, '', 8, 'qsGlow', 34, 5, 0.5, 1);
    }
    if (s === 'aki') {
      o += bug(DRG, '#c8431c', 26, 'qsFly', 8, 20, 4) + bug(DRG, '#d9531e', 22, 'qsFly', 20, 28, 15);
      o += bug(CRK, '', 16, 'qsHop', 36, 1.8, 0) + bug(CRK, '', 14, 'qsHop qsHop2', 38, 2.6, 1.1);
      o += bug(FLY, '', 9, 'qsGlow', 18, 3.2, 0, 1) + bug(FLY, '', 9, 'qsGlow', 30, 4.2, 1.4, 1);
    }
    if (s === 'salju') {
      o += bug(BRD, '', 20, 'qsHop qsHop3', 32, 2.3, 0) + bug(BRD, '', 16, 'qsHop qsHop2', 34, 3, 1.5);
      o += bug(SPK, '', 8, 'qsGlow', 14, 2.6, 0, 1) + bug(SPK, '', 6, 'qsGlow', 26, 3.1, 1, 1) + bug(SPK, '', 7, 'qsGlow', 8, 3.7, 2, 1) + bug(SPK, '', 6, 'qsGlow', 34, 2.9, 0.4, 1);
    }
    if (s === 'panas') {
      o += bug(BUT, '#ffd54a', 18, 'qsFly', 8, 24, 5) + bug(DRG, '#2b8fd6', 26, 'qsFly', 18, 18, 11) + bug(LDY, '', 11, 'qsCrawl', 34, 26, 7);
      o += bug(FLY, '', 10, 'qsGlow', 14, 3, 0, 1) + bug(FLY, '', 9, 'qsGlow', 26, 4, 1, 1) + bug(FLY, '', 10, 'qsGlow', 8, 3.4, 2, 1) + bug(FLY, '', 8, 'qsGlow', 33, 4.6, 0.7, 1) + bug(FLY, '', 9, 'qsGlow', 20, 3.8, 1.6, 1);
    }
    return o;
  }

  /* ---------- Rakit ---------- */
  var hdrEl, ftrEl, botEl, bodyEl, fl = [], fr = [];
  function ensure(){
    var h = document.querySelector('header.mainH'), f = document.querySelector('footer.mainF');
    if (h && !hdrEl) { hdrEl = document.createElement('div'); hdrEl.className = 'qsH'; hdrEl.setAttribute('aria-hidden', 'true'); h.insertBefore(hdrEl, h.firstChild); }
    if (f && !ftrEl) { ftrEl = document.createElement('div'); ftrEl.className = 'qsF'; ftrEl.setAttribute('aria-hidden', 'true'); f.insertBefore(ftrEl, f.firstChild); }
    var bn = document.querySelector('.qBottom');
    if (bn && !botEl) { botEl = document.createElement('div'); botEl.className = 'qsBot'; botEl.setAttribute('aria-hidden', 'true'); bn.insertBefore(botEl, bn.firstChild); }
    if (!bodyEl) {
      bodyEl = document.createElement('div'); bodyEl.className = 'qsB'; bodyEl.setAttribute('aria-hidden', 'true');
      bodyEl.innerHTML = '<div class="qsBL"></div><div class="qsBR"></div>'; document.body.appendChild(bodyEl);
    }
  }
  var last = '';
  function render(){
    var s = S(), n = isNight(), de = document.documentElement;
    de.setAttribute('data-qn', n ? '1' : '0'); de.setAttribute('data-qs', s);
    var key = s + (n ? 'n' : 'd');
    if (key === last) return; last = key;
    try { window.dispatchEvent(new Event('qs-night')); } catch(e){}
    ensure();
    var on = s !== 'off' && P[s], p = P[s];
    if (hdrEl) hdrEl.innerHTML = on ? headerSVG(s, p) : '';
    if (ftrEl) {
      if (on) {
        ftrEl.innerHTML = '<div class="qsOrn"></div><div class="qsGr"></div>' + bugs(s, p);
        ftrEl.querySelector('.qsGr').style.backgroundImage = uri(grassTile(s, p));
        ftrEl.querySelector('.qsOrn').style.backgroundImage = uri(orn(s, p));
      } else ftrEl.innerHTML = '';
    }
    if (botEl) {
      if (on) { botEl.innerHTML = '<svg class="qsBs" viewBox="0 0 400 60" preserveAspectRatio="xMidYMid slice"><g class="qsN">' + stars(400, 40, 16) + '</g></svg><div class="qsGr"></div>'; botEl.querySelector('.qsGr').style.backgroundImage = uri(grassTile(s, p)); }
      else botEl.innerHTML = '';
    }
    if (bodyEl) {
      if (on) { bodyEl.firstChild.innerHTML = bodySVG(s, p, 'L'); bodyEl.lastChild.innerHTML = bodySVG(s, p, 'R'); bodyEl.style.setProperty('--qsTint', p.tint); }
      else { bodyEl.firstChild.innerHTML = ''; bodyEl.lastChild.innerHTML = ''; }
    }
    document.documentElement.classList.toggle('qsOn', !!on);
  }
  function start(){
    render();
    window.addEventListener('qfx-change', render);
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render); } catch(e){}
    var n = document.querySelector('.nB');
    if (n && window.MutationObserver) new MutationObserver(render).observe(n, {attributes: true, attributeFilter: ['data-theme']});
    setInterval(render, 4000);
  }
  window.qscene = {night: isNight, season: S};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
(function(){
  'use strict';
  /* Maskot kucing "Mochi": kucing asli buatan sendiri. Menemani belajar: sapaan kotoba, tidur kalau lama diam, aksesori ikut musim. */
  if (window.__qcat) return; window.__qcat = 1;
  var KEY = 'qcat_v1';
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  var st = {on: true, x: null, y: null};
  try { var sv = JSON.parse(lsGet(KEY) || '{}'); if (sv.on === false) st.on = false; if (typeof sv.x === 'number') st.x = sv.x; if (typeof sv.y === 'number') st.y = sv.y; } catch(e){}
  function save(){ lsSet(KEY, JSON.stringify(st)); }
  var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var WORDS = [
    ['\u304a\u75b2\u308c\u3055\u307e', 'otsukaresama', 'terima kasih atas kerja kerasmu'],
    ['\u9811\u5f35\u3063\u3066', 'ganbatte', 'semangat!'],
    ['\u732b', 'neko', 'kucing (itu aku!)'],
    ['\u3044\u305f\u3060\u304d\u307e\u3059', 'itadakimasu', 'selamat makan'],
    ['\u3054\u3061\u305d\u3046\u3055\u307e', 'gochisousama', 'terima kasih makanannya'],
    ['\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3057\u307e\u3059', 'yoroshiku onegaishimasu', 'mohon bantuannya'],
    ['\u3059\u307f\u307e\u305b\u3093', 'sumimasen', 'permisi / maaf'],
    ['\u5927\u4e08\u592b', 'daijoubu', 'tidak apa-apa / baik-baik saja'],
    ['\u3042\u308a\u304c\u3068\u3046', 'arigatou', 'terima kasih'],
    ['\u5206\u304b\u308a\u307e\u305b\u3093', 'wakarimasen', 'saya tidak mengerti'],
    ['\u3082\u3046\u4e00\u5ea6\u304a\u9858\u3044\u3057\u307e\u3059', 'mou ichido onegaishimasu', 'tolong ulangi sekali lagi'],
    ['\u3061\u3087\u3063\u3068\u5f85\u3063\u3066\u304f\u3060\u3055\u3044', 'chotto matte kudasai', 'tunggu sebentar'],
    ['\u5b89\u5168', 'anzen', 'keselamatan'],
    ['\u6c17\u3092\u3064\u3051\u3066', 'ki o tsukete', 'hati-hati'],
    ['\u4f11\u307f', 'yasumi', 'istirahat / libur'],
    ['\u4ed5\u4e8b', 'shigoto', 'pekerjaan'],
    ['\u52c9\u5f37', 'benkyou', 'belajar'],
    ['\u5831\u544a', 'houkoku', 'melapor'],
    ['\u78ba\u8a8d', 'kakunin', 'mengecek / konfirmasi'],
    ['\u6e96\u5099', 'junbi', 'persiapan']
  ];
  var TIPS = {
    bushu: ['Ketuk kartu untuk melihat jawabannya.', 'Tandai hapal kanji yang sudah kamu kuasai.'],
    jlpt: ['Pelan-pelan saja, mulai dari N5.', 'Ulang sedikit tiap hari lebih awet.'],
    tg2: ['Baca bab dulu, baru kerjakan kuis.', 'Materi bisa dibaca kapan saja.'],
    berita: ['Ada berita baru hari ini?', 'Cari kata apa saja, aku bantu temukan.', 'Sudah lihat kanji hari ini? Ada di kartu atas.', 'Cek cuaca dulu sebelum berangkat kerja ya.'],
    game: ['Main yuk! Sambil belajar juga.', 'Skor tinggi? Aku mau lihat dong!', 'Santai dulu, tapi jangan lupa target hari ini.']
  };
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  /* ---------- Gambar kucing (SVG) ---------- */
  var SVG = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<g class="qcTail"><path d="M45 54C58 54 60 40 54 34" fill="none" stroke="#5a3a22" stroke-width="7" stroke-linecap="round"/><path d="M45 54C58 54 60 40 54 34" fill="none" stroke="#f2a65a" stroke-width="4.6" stroke-linecap="round"/></g>' +
    '<ellipse cx="32" cy="50" rx="16" ry="12.5" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6"/>' +
    '<ellipse cx="32" cy="53" rx="8.5" ry="8" fill="#fff3e0"/>' +
    '<ellipse cx="25" cy="59.5" rx="5" ry="3" fill="#fff3e0" stroke="#5a3a22" stroke-width="1.3"/><ellipse cx="39" cy="59.5" rx="5" ry="3" fill="#fff3e0" stroke="#5a3a22" stroke-width="1.3"/>' +
    '<g class="qcHead">' +
      '<g class="qcEarL"><path d="M17.5 24L19 7.5L31 17.5Z" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6" stroke-linejoin="round"/><path d="M21 19L21.6 12.5L26.5 17Z" fill="#f7b6b6"/></g>' +
      '<g class="qcEarR"><path d="M46.5 24L45 7.5L33 17.5Z" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6" stroke-linejoin="round"/><path d="M43 19L42.4 12.5L37.5 17Z" fill="#f7b6b6"/></g>' +
      '<ellipse cx="32" cy="29" rx="16" ry="13.5" fill="#f2a65a" stroke="#5a3a22" stroke-width="1.6"/>' +
      '<path d="M32 16.5V21M27 17.5L28 21M37 17.5L36 21" stroke="#c9772e" stroke-width="1.6" stroke-linecap="round"/>' +
      '<ellipse cx="32" cy="34" rx="7.5" ry="5.2" fill="#fff3e0"/>' +
      '<g class="qcEyes"><ellipse cx="25" cy="28.5" rx="2.1" ry="2.8" fill="#3b2415"/><ellipse cx="39" cy="28.5" rx="2.1" ry="2.8" fill="#3b2415"/><circle cx="25.7" cy="27.4" r=".8" fill="#fff"/><circle cx="39.7" cy="27.4" r=".8" fill="#fff"/></g>' +
      '<g class="qcSleep"><path d="M22.5 29Q25 31.5 27.5 29M36.5 29Q39 31.5 41.5 29" fill="none" stroke="#3b2415" stroke-width="1.6" stroke-linecap="round"/></g>' +
      '<path d="M30.2 32.4H33.8L32 34.4Z" fill="#e58a8a"/><path d="M32 34.4V36M32 36Q30.3 37.6 28.6 36.3M32 36Q33.7 37.6 35.4 36.3" fill="none" stroke="#5a3a22" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M18 32L10.5 30.5M18 34.5L10.5 35.5M46 32L53.5 30.5M46 34.5L53.5 35.5" stroke="#5a3a22" stroke-width=".9" stroke-linecap="round" opacity=".55"/>' +
      '<g class="qcAcc qcSakura"><circle cx="43" cy="14.5" r="2" fill="#f9c7d4"/><circle cx="45.6" cy="16.2" r="2" fill="#f9c7d4"/><circle cx="45" cy="19" r="2" fill="#f9c7d4"/><circle cx="41.6" cy="18.4" r="2" fill="#f9c7d4"/><circle cx="41.2" cy="15.4" r="2" fill="#f9c7d4"/><circle cx="43.3" cy="16.9" r="1.2" fill="#f2a65a"/></g>' +
      '<g class="qcAcc qcAki"><path d="M42 13C47 12 49.5 16.5 47.5 20.5C43 20 41 17 42 13Z" fill="#c8431c" stroke="#7a2a10" stroke-width="1"/><path d="M42.5 14.5L46.8 19.6" stroke="#7a2a10" stroke-width=".8"/></g>' +
      '<g class="qcAcc qcSalju"><path d="M20 40Q32 46 44 40L44.5 44Q32 50 19.5 44Z" fill="#d6453d" stroke="#8a2420" stroke-width="1"/><path d="M40 43L42.5 52L46 51L44 43Z" fill="#d6453d" stroke="#8a2420" stroke-width="1" stroke-linejoin="round"/></g>' +
      '<g class="qcAcc qcPanas"><path d="M17 22Q32 14 47 22" fill="none" stroke="#e8c15a" stroke-width="3" stroke-linecap="round"/><path d="M13 22H51" stroke="#d9a93c" stroke-width="3.4" stroke-linecap="round"/><path d="M20 22Q32 8 44 22Z" fill="#f1d27a" stroke="#b88a24" stroke-width="1"/><path d="M20.5 20.5H43.5" stroke="#d6453d" stroke-width="2"/></g>' +
      '<g class="qcAcc qcNightCap"><path d="M19 20Q30 2 46 10Q40 14 46 22Z" fill="#5b6fd6" stroke="#2f3b8a" stroke-width="1"/><path d="M17 21Q32 25 47 21" fill="none" stroke="#e8ecff" stroke-width="3" stroke-linecap="round"/><circle cx="46.5" cy="10" r="2.6" fill="#fff"/><path d="M33 12l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L30 14.3 32 14Z" fill="#ffe27a"/></g>' +
    '</g>' +
    '<g class="qcNite"><path d="M54 3A6 6 0 1 0 54 15A4.8 4.8 0 0 1 54 3Z" fill="#fdf3c0"/><circle class="qcTw" cx="60" cy="20" r="1.1" fill="#fff6c8"/><circle class="qcTw qcTw2" cx="8" cy="8" r="1.2" fill="#fff6c8"/><circle class="qcTw" cx="4" cy="26" r=".9" fill="#fff6c8"/></g></svg>';

  /* ---------- Elemen ---------- */
  var el = document.createElement('div');
  el.id = 'qcat'; el.setAttribute('data-s', 'off'); el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', 'Mochi, kucing penemani belajar');
  el.innerHTML = '<div class="qcBub" hidden></div><div class="qcZ" aria-hidden="true">z</div><div class="qcZ qcZ2" aria-hidden="true">Z</div><div class="qcZ qcZ3" aria-hidden="true">Z</div>' + SVG;
  var bub = el.querySelector('.qcBub');
  var hideT = 0, sleepT = 0, awake = true, actx = null;

  function place(){
    var w = window.innerWidth, h = window.innerHeight;
    if (st.x == null) { el.style.left = ''; el.style.top = ''; el.style.bottom = ''; return; }
    var x = Math.max(4, Math.min(w - 68, st.x * w)), y = Math.max(4, Math.min(h - 72, st.y * h));
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.bottom = 'auto';
  }
  function bubbleSide(){
    var r = el.getBoundingClientRect();
    el.classList.toggle('qcR', r.left > window.innerWidth * 0.5);
    el.classList.toggle('qcBelow', r.top < 110);
  }
  function say(html, ms){
    bubbleSide(); bub.innerHTML = html; bub.hidden = false;
    clearTimeout(hideT); hideT = setTimeout(function(){ bub.hidden = true; }, ms || 5200);
  }
  function bounce(){
    if (reduce) return;
    el.classList.remove('qcHop'); void el.offsetWidth; el.classList.add('qcHop');
  }
  function wake(){
    clearTimeout(sleepT);
    if (!awake) { awake = true; el.classList.remove('qcSleeping'); }
    sleepT = setTimeout(sleep, night() ? 30000 : 50000);
  }
  function sleep(){ awake = false; el.classList.add('qcSleeping'); bub.hidden = true; }

  /* Suara "nyaa" pendek (disintesis, pelan). */
  function meow(){
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') actx.resume();
      var t = actx.currentTime, o = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(880, t + 0.09); o.frequency.exponentialRampToValueAtTime(430, t + 0.38);
      f.type = 'bandpass'; f.frequency.setValueAtTime(1100, t); f.frequency.linearRampToValueAtTime(1700, t + 0.1); f.frequency.linearRampToValueAtTime(900, t + 0.38); f.Q.value = 2.2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(f); f.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.45);
    } catch(e){}
  }

  function timeWord(){
    var h = new Date().getHours();
    return (h >= 4 && h < 11) ? ['\u304a\u306f\u3088\u3046', 'ohayou', 'selamat pagi'] : (h >= 11 && h < 18) ? ['\u3053\u3093\u306b\u3061\u306f', 'konnichiwa', 'selamat siang'] : ['\u3053\u3093\u3070\u3093\u306f', 'konbanwa', 'selamat malam'];
  }
  function greet(){
    var w;
    if (Math.random() < 0.3) { w = timeWord(); }
    else w = pick(WORDS);
    return '<b lang="ja">' + esc(w[0]) + '</b><i>' + esc(w[1]) + '</i><span>' + esc(w[2]) + '</span><u>nyaa~</u>';
  }

  /* ---------- Sentuh, geser, elus (tahan), ketuk beruntun ---------- */
  var drag = null, holdT = 0, purring = false, taps = [], purrT = 0;
  function night(){ return document.documentElement.getAttribute('data-qn') === '1'; }
  function heart(){
    if (reduce) return;
    var h = document.createElement('span'); h.className = 'qcHeart'; h.textContent = '\u2665';
    h.style.left = (8 + Math.random() * 40) + 'px'; h.style.animationDelay = (Math.random() * .2) + 's';
    el.appendChild(h); setTimeout(function(){ if (h.parentNode) h.parentNode.removeChild(h); }, 1700);
  }
  function purrSound(){
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!actx) actx = new AC(); if (actx.state === 'suspended') actx.resume();
      var t = actx.currentTime, o = actx.createOscillator(), l = actx.createOscillator(), lg = actx.createGain(), g = actx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 38; l.frequency.value = 22; lg.gain.value = 0.03;
      l.connect(lg); lg.connect(g.gain); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.15); g.gain.linearRampToValueAtTime(0.0001, t + 1.5);
      o.connect(g); g.connect(actx.destination); o.start(t); l.start(t); o.stop(t + 1.6); l.stop(t + 1.6);
    } catch(e){}
  }
  function startPurr(){
    purring = true; wake(); el.classList.add('qcPurr'); purrSound();
    say('<b>purr~ purr~</b><span>Enak diusap... terima kasih!</span>', 2600);
    var n = 0; clearInterval(purrT); purrT = setInterval(function(){ heart(); if (++n > 5) clearInterval(purrT); }, 260);
  }
  function stopPurr(){ purring = false; clearTimeout(holdT); setTimeout(function(){ el.classList.remove('qcPurr'); }, 400); }
  function spin(){
    if (reduce) return;
    el.classList.remove('qcSpin'); void el.offsetWidth; el.classList.add('qcSpin');
    for (var i = 0; i < 6; i++) setTimeout(heart, i * 90);
  }
  el.addEventListener('pointerdown', function(e){
    if (e.button) return;
    var r = el.getBoundingClientRect();
    drag = {sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false, id: e.pointerId};
    try { el.setPointerCapture(e.pointerId); } catch(x){}
    clearTimeout(holdT); holdT = setTimeout(function(){ if (drag && !drag.moved) { drag.held = true; startPurr(); } }, 520);
  });
  el.addEventListener('pointermove', function(e){
    if (!drag) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 8) { drag.moved = true; clearTimeout(holdT); el.classList.add('qcLift'); }
    if (drag.moved) {
      var w = window.innerWidth, h = window.innerHeight;
      st.x = Math.max(4, Math.min(w - 68, drag.ox + dx)) / w; st.y = Math.max(4, Math.min(h - 72, drag.oy + dy)) / h;
      place(); bub.hidden = true; e.preventDefault();
    }
  });
  function up(){
    if (!drag) return;
    var d = drag; drag = null; clearTimeout(holdT); el.classList.remove('qcLift');
    if (d.moved) { save(); wake(); say('<span>Wah, pemandangan baru!</span>', 1800); return; }
    if (d.held) { stopPurr(); return; }
    var was = awake; wake();
    var now = Date.now(); taps = taps.filter(function(x){ return now - x < 3000; }); taps.push(now);
    var quick = taps.length >= 2 && now - taps[taps.length - 2] < 380;
    if (!was && taps.length >= 3) { giggle(); meow(); say('<b>hihi~ geli!</b><span>Iya iya, aku bangun.</span>', 2400); return; }
    if (was && quick && taps.length < 5) { playYarn(); return; }
    if (taps.length >= 5) { taps = []; spin(); meow(); say('<b lang="ja">\u306b\u3083\u30fc\uff01</b><i>nyaa!</i><span>Wah, kamu suka sekali ya!</span>', 2800); return; }
    bounce(); meow();
    say(was ? greet() : '<b>nyaa~</b><span>Aku ketiduran, hehe. Ayo lanjut belajar!</span>');
  }
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', function(){ drag = null; clearTimeout(holdT); stopPurr(); el.classList.remove('qcLift'); });
  el.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drag = {moved: false}; up(); } });
  el.addEventListener('click', function(e){ e.stopPropagation(); });
  el.addEventListener('contextmenu', function(e){ e.preventDefault(); });


  /* ---------- Konfeti, sedih, bola benang, geli ---------- */
  function confetti(){
    if (reduce) return;
    var cols = ['#ef5b8a', '#f2a65a', '#5b6fd6', '#4cc38a', '#e8c15a'];
    for (var i = 0; i < 16; i++) {
      var c = document.createElement('span'); c.className = 'qcConf';
      c.style.background = cols[i % cols.length];
      c.style.setProperty('--dx', (Math.random() * 90 - 45).toFixed(0) + 'px');
      c.style.setProperty('--up', (-(50 + Math.random() * 40)).toFixed(0) + 'px');
      c.style.setProperty('--dn', (10 + Math.random() * 40).toFixed(0) + 'px');
      c.style.setProperty('--r', (Math.random() * 540 - 270).toFixed(0) + 'deg');
      c.style.animationDelay = (Math.random() * .25).toFixed(2) + 's';
      el.appendChild(c); (function(n){ setTimeout(function(){ if (n.parentNode) n.parentNode.removeChild(n); }, 2100); })(c);
    }
  }
  function sad(){
    if (reduce) return;
    el.classList.add('qcShiver'); setTimeout(function(){ el.classList.remove('qcShiver'); }, 1500);
  }
  function giggle(){
    if (reduce) return;
    el.classList.remove('qcGiggle'); void el.offsetWidth; el.classList.add('qcGiggle');
    for (var i = 0; i < 3; i++) setTimeout(heart, i * 120);
  }
  var playing = false;
  function playYarn(){
    if (playing) return; playing = true;
    var w = window.innerWidth, h = window.innerHeight;
    var tx = Math.round(w * (0.15 + Math.random() * 0.55)), ty = Math.round(h * (0.3 + Math.random() * 0.4));
    var y = document.createElement('span'); y.className = 'qcYarn'; y.textContent = '🧶'; y.style.left = tx + 'px'; y.style.top = ty + 'px';
    document.body.appendChild(y);
    if (reduce) { say('<b>nyaa!</b><span>Ada bola benang!</span>', 1800); setTimeout(function(){ if (y.parentNode) y.parentNode.removeChild(y); playing = false; }, 1800); return; }
    say('<b lang="ja">あっ！</b><i>a!</i><span>Bola benang!</span>', 1500);
    setTimeout(function(){
      el.style.transition = 'left .8s ease-in-out, top .8s ease-in-out';
      el.style.left = Math.max(4, Math.min(w - 68, tx - 24)) + 'px'; el.style.top = Math.max(4, Math.min(h - 72, ty - 30)) + 'px'; el.style.bottom = 'auto';
    }, 500);
    setTimeout(function(){
      if (y.parentNode) y.parentNode.removeChild(y);
      bounce(); meow(); heart(); heart();
      say('<b lang="ja">やった！</b><i>yatta!</i><span>Dapat! Mochi menang.</span>', 2200);
    }, 1400);
    setTimeout(function(){ place(); }, 3000);
    setTimeout(function(){ el.style.transition = ''; playing = false; }, 3900);
  }
  function dayHour(){ return new Date().getHours(); }

  /* ---------- Reaksi terhadap belajar (target harian, kuis) ---------- */
  var lastLearnSay = 0;
  window.addEventListener('qdaily', function(ev){
    var d = ev.detail || {}; if (!st.on) return;
    if (d.type === 'goal') {
      wake(); bounce(); confetti(); spin(); meow();
      say('<b lang="ja">すごい！</b><i>sugoi!</i><span>Target ' + d.goal + ' kartu tercapai hari ini!' + (d.streak > 1 ? ' Streak ' + d.streak + ' hari.' : '') + '</span>', 5200);
    } else if (d.type === 'learn') {
      var now = Date.now(); if (now - lastLearnSay < 2500 || !awake) return; lastLearnSay = now;
      bounce(); say('<b lang="ja">やった！</b><span>Hapal ' + d.n + ' dari ' + d.goal + ' kartu hari ini.</span>', 2200);
    } else if (d.type === 'quiz') {
      wake();
      if (d.pct >= 80) { bounce(); confetti(); meow(); say('<b lang="ja">やった！</b><i>yatta!</i><span>Skor ' + d.s + '/' + d.t + ', hebat banget!</span>', 4500); }
      else if (d.pct >= 50) { bounce(); say('<b lang="ja">いいね</b><i>ii ne</i><span>Skor ' + d.s + '/' + d.t + '. Ulangi sekali lagi, pasti naik.</span>', 4500); }
      else { sad(); say('<b lang="ja">大丈夫</b><i>daijoubu</i><span>Skor ' + d.s + '/' + d.t + '. Tidak apa-apa, ganbatte!</span>', 4500); }
    }
  });

  window.addEventListener('qnewpost', function(ev){
    if (!st.on) return; var d = ev.detail || {};
    wake(); bounce(); meow();
    say('<b lang="ja">\u65b0\u3057\u3044\u8a18\u4e8b</b><i>atarashii kiji</i><span>Ada artikel baru: ' + esc(d.title || '') + '</span>', 5500);
  });

  /* Mata mengikuti jari / kursor */
  var eyeT = 0;
  document.addEventListener('pointermove', function(e){
    if (!awake || eyeT) return;
    eyeT = setTimeout(function(){ eyeT = 0; }, 60);
    var r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .45), d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 160);
    eyes.setAttribute('transform', 'translate(' + (dx / d * 1.7 * k).toFixed(2) + ' ' + (dy / d * 1.1 * k).toFixed(2) + ')');
  }, {passive: true});
  var eyes = el.querySelector('.qcEyes');

  /* Obrolan iseng sesuai musim dan malam */
  var CHAT = {
    sakura: [['\u685c', 'sakura', 'bunga sakura, wangi ya'], ['\u82b1\u898b', 'hanami', 'melihat bunga sambil piknik']],
    aki: [['\u7d05\u8449', 'momiji', 'daun maple memerah'], ['\u79cb', 'aki', 'musim gugur']],
    salju: [['\u5bd2\u3044', 'samui', 'dingin!'], ['\u96ea', 'yuki', 'salju']],
    panas: [['\u66d1\u3044', 'atsui', 'panas!'], ['\u82b1\u706b', 'hanabi', 'kembang api']]
  };
  var NIGHT = [['\u304a\u3084\u3059\u307f', 'oyasumi', 'selamat tidur'], ['\u6708', 'tsuki', 'bulan'], ['\u661f', 'hoshi', 'bintang'], ['\u591c', 'yoru', 'malam']];
  function chatter(){
    if (!awake || drag || !bub.hidden) return;
    var w = night() && Math.random() < 0.6 ? pick(NIGHT) : (CHAT[season()] ? pick(CHAT[season()]) : null);
    if (!w) return;
    bounce(); say('<b lang="ja">' + esc(w[0]) + '</b><i>' + esc(w[1]) + '</i><span>' + esc(w[2]) + '</span>', 3800);
    if (season() === 'salju') { el.classList.add('qcShiver'); setTimeout(function(){ el.classList.remove('qcShiver'); }, 2600); }
  }
  setInterval(function(){ if (Math.random() < 0.5) chatter(); }, 45000);
  window.addEventListener('qs-night', function(){ el.classList.toggle('qcNight', night()); if (night()) { wake(); setTimeout(function(){ if (night() && bub.hidden) say('<b lang="ja">\u3053\u3093\u3070\u3093\u306f</b><i>konbanwa</i><span>Malam ya... ada bulan di sini.</span>', 3500); }, 600); } });

  /* ---------- Musim + rute ---------- */
  function season(){ return (window.__qfxSt && window.__qfxSt.fx) || 'off'; }
  function syncSeason(){ el.setAttribute('data-s', season()); el.classList.toggle('qcNight', night()); }
  window.addEventListener('qfx-change', syncSeason);
  var lastTab = '';
  window.addEventListener('hashchange', function(){
    var t = (location.hash || '').replace(/^#/, '').split(/[-?]/)[0];
    if (!TIPS[t] || t === lastTab) return; lastTab = t;
    wake();
    var hh = dayHour();
    if ((hh >= 23 || hh < 4) && Math.random() < 0.5) { bounce(); say('<b lang="ja">\u304a\u3084\u3059\u307f</b><i>oyasumi</i><span>Sudah larut, jangan begadang ya.</span>', 4200); return; }
    if (Math.random() < 0.45) { bounce(); say('<span>' + esc(pick(TIPS[t])) + '</span>', 4200); }
  });
  ['pointerdown', 'keydown', 'scroll'].forEach(function(ev){ document.addEventListener(ev, function(){ if (!awake && ev !== 'scroll') return; clearTimeout(sleepT); if (awake) sleepT = setTimeout(sleep, 50000); }, {passive: true, capture: true}); });
  window.addEventListener('resize', place);

  /* ---------- Kendali dari panel Suasana ---------- */
  function apply(){
    if (st.on) { if (!el.parentNode) document.body.appendChild(el); el.hidden = false; syncSeason(); place(); wake(); }
    else { el.hidden = true; }
  }
  window.qcat = {
    isOn: function(){ return st.on; },
    toggle: function(){ st.on = !st.on; save(); apply(); return st.on; },
    reset: function(){ st.x = st.y = null; save(); place(); },
    meow: meow
  };
  function init(){
    apply();
    if (st.on) setTimeout(function(){
      var d = window.qDaily ? window.qDaily.get() : null;
      if (d && d.streak >= 2 && d.n === 0 && bub.hidden) { bounce(); say('<b lang="ja">\u9811\u5f35\u3063\u3066</b><i>ganbatte</i><span>Streak ' + d.streak + ' hari. Jangan putus hari ini ya!</span>', 5000); }
    }, 9000);
    if (st.on) setTimeout(function(){ var tw = timeWord(); say('<b lang="ja">' + esc(tw[0]) + '</b><i>' + esc(tw[1]) + '</i><span>Aku Mochi. Ketuk aku ya!</span><u>nyaa~</u>', 4500); }, 2500);
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
(function(){
  'use strict';
  /* PC: tombol Menu melayang di kiri tombol suasana. Isinya sama dengan menu bawah di HP (Cari, Belajar, Menu, Game, Berita), tapi melayang. */
  if (window.__qnv) return; window.__qnv = 1;
  var IC = {"podcast": "<svg class=\"line\" viewBox=\"0 0 24 24\"><path d=\"M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z\"/><path d=\"M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6\"/></svg>", "belajar": "<svg class=\"line\" viewBox=\"0 0 24 24\"><g><path d=\"M88.12593,266.45868v2.07281a2.63233,2.63233,0,0,0,1.72393,2.47062l4.527,1.66448a2.63229,2.63229,0,0,0,1.81678,0l4.527-1.66448a2.63233,2.63233,0,0,0,1.72394-2.47062v-2.07434\" transform=\"translate(-83.28527 -252.69518)\"></path><path d=\"M95.28108,265.82755a3.322,3.322,0,0,1-1.09235-.18415l-7.74321-2.68462a1.72586,1.72586,0,0,1,.00046-3.26125l7.74879-2.68555a3.33183,3.33183,0,0,1,2.18332.00047l7.74693,2.68462a1.72586,1.72586,0,0,1-.00047,3.26125l-7.75251,2.686A3.33521,3.33521,0,0,1,95.28108,265.82755Z\" transform=\"translate(-83.28527 -252.69518)\"></path></g></svg>", "game": "<svg class=\"line\" viewBox=\"0 0 24 24\"><g transform=\"translate(2.000000, 1.977425)\"><line x1=\"7.25474269\" y1=\"10.085022\" x2=\"7.25474269\" y2=\"13.6602214\"></line><line x1=\"9.07928848\" y1=\"11.8722397\" x2=\"5.431535\" y2=\"11.8722397\"></line><line x1=\"13.477308\" y1=\"10.1936617\" x2=\"13.3751594\" y2=\"10.1936617\"></line><line x1=\"15.208106\" y1=\"13.6058057\" x2=\"15.1059574\" y2=\"13.6058057\"></line><path d=\"M6.5140228,0.238664844 L6.5140228,0.238664844 C6.52070542,0.952750059 7.10591161,1.52554569 7.81999683,1.51886307 L8.82811713,1.51886307 C9.93074871,1.51027114 10.8329018,2.39428572 10.8481764,3.4969173 L10.8481764,4.50408295\"></path><path d=\"M19.8121415,11.9178722 C19.8121415,6.35793599 17.4254931,4.50398748 10.2645931,4.50398748 C3.10273844,4.50398748 0.716089999,6.35793599 0.716089999,11.9178722 C0.716089999,17.4787631 3.10273844,19.3317569 10.2645931,19.3317569 C17.4254931,19.3317569 19.8121415,17.4787631 19.8121415,11.9178722 Z\"></path></g></svg>", "berita": "<svg class=\"line\" viewBox=\"0 0 24 24\"><path d=\"M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z\"/><path d=\"M7 8H17\"/><path d=\"M7 13H13\"/></svg>", "cari": "<svg class=\"line\" viewBox=\"0 0 24 24\"><path d=\"M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z\"/><path d=\"M22 22L20 20\"/></svg>", "menu": "<svg class=\"line\" viewBox=\"0 0 24 24\"><path d=\"M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z\"/><path d=\"M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z\"/><path d=\"M6 10C8.20914 10 10 8.20914 10 6C10 3.79086 8.20914 2 6 2C3.79086 2 2 3.79086 2 6C2 8.20914 3.79086 10 6 10Z\"/><path d=\"M18 22C20.2091 22 22 20.2091 22 18C22 15.7909 20.2091 14 18 14C15.7909 14 14 15.7909 14 18C14 20.2091 15.7909 22 18 22Z\"/></svg>"};
  function init(){
    if (document.getElementById('qnvFab')) return;
    var fab = document.createElement('button');
    fab.type = 'button'; fab.id = 'qnvFab'; fab.setAttribute('aria-label', 'Buka menu navigasi'); fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = IC.menu + '<span class="qnvL">Menu</span><span class="qnvX" aria-hidden="true">&#10005;</span>';
    var bar = document.createElement('nav');
    bar.id = 'qnvBar'; bar.hidden = true; bar.setAttribute('aria-label', 'Navigasi utama');
    function item(tag, k, label, href, cls){
      return '<' + tag + (tag === 'a' ? ' href="' + href + '"' : ' type="button"') + ' data-k="' + k + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + IC[k] + '<span>' + label + '</span></' + tag + '>';
    }
    bar.innerHTML = item('a', 'podcast', 'Podcast', '/#podcast') + item('a', 'belajar', 'Belajar', '/#belajar') + item('button', 'menu', 'Menu') + item('a', 'game', 'Game', '/#game') + item('a', 'berita', 'Berita', '/#berita', 'qNavBerita');
    document.body.appendChild(bar); document.body.appendChild(fab);
    function inHome(){ return typeof window.qhGo === 'function' && document.body.classList.contains('home') && location.pathname === '/'; }
    function mark(){
      var home = document.body.classList.contains('home') && location.pathname === '/';
      var t = (location.hash || '').replace(/^#/, '').split(/[-?]/)[0], key = '';
      if (home) {
        if (t === 'game') key = 'game';
        else if (t === 'berita') key = 'berita';
        else if (t === 'podcast') key = 'podcast';
        else key = 'belajar';
      }
      Array.prototype.forEach.call(bar.querySelectorAll('[data-k]'), function(el){ el.classList.toggle('on', el.getAttribute('data-k') === key); });
    }
    function close(){ bar.hidden = true; fab.classList.remove('on'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-label', 'Buka menu navigasi'); }
    function open(){ mark(); bar.hidden = false; fab.classList.add('on'); fab.setAttribute('aria-expanded', 'true'); fab.setAttribute('aria-label', 'Tutup menu navigasi'); }
    fab.addEventListener('click', function(){ if (bar.hidden) open(); else close(); });
    document.addEventListener('click', function(e){ if (!bar.hidden && !bar.contains(e.target) && !fab.contains(e.target)) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !bar.hidden) close(); });
    window.addEventListener('hashchange', function(){ mark(); close(); });
    bar.addEventListener('click', function(e){
      var el = e.target.closest ? e.target.closest('[data-k]') : null; if (!el) return;
      var k = el.getAttribute('data-k');
      if (k === 'cari') {
        e.preventDefault(); close();
        var si = document.getElementById('forSearch');
        if (si && si.focus) { try { si.scrollIntoView({block: 'center'}); } catch(x){} si.focus(); }
      } else if (k === 'menu') {
        e.preventDefault(); close();
        var nv = document.getElementById('forNav'); if (nv) nv.checked = !nv.checked;
      } else if (k === 'belajar') {
        var jp = document.getElementById('forJepang'); /* popup ada di beranda dan halaman biasa; di artikel pakai tautan ke tab Belajar */
        if (jp) { e.preventDefault(); jp.checked = true; }
        else if (inHome()) { e.preventDefault(); window.qhGo('belajar'); window.scrollTo(0, 0); }
        close();
      } else if (k === 'game' || k === 'berita' || k === 'podcast') {
        /* di beranda cukup ganti tab (tanpa muat ulang halaman) */
        if (inHome()) { e.preventDefault(); window.qhGo(k); window.scrollTo(0, 0); }
        close();
      } else close();
    });
    mark();
    /* Naikkan tombol melayang saat footer masuk layar: tombol berhenti tepat di atas garis batas footer. */
    var ft = document.querySelector('footer.mainF'), raf = 0, cur = -1;
    function lift(){
      raf = 0;
      var v = 0;
      if (ft && window.innerWidth > 896) { var r = ft.getBoundingClientRect(); v = Math.max(0, Math.round(window.innerHeight - r.top - 10)); }
      if (v !== cur) { cur = v; document.documentElement.style.setProperty('--qLift', v + 'px'); document.documentElement.style.setProperty('--qLiftA', (v > 0 ? v + 2 : 0) + 'px'); }
    }
    function sched(){ if (!raf) raf = requestAnimationFrame(lift); }
    window.addEventListener('scroll', sched, {passive: true});
    window.addEventListener('resize', sched);
    window.addEventListener('hashchange', function(){ setTimeout(lift, 150); setTimeout(lift, 900); });
    setInterval(function(){ if (document.visibilityState === 'visible') lift(); }, 700);
    lift();
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
(function(){
  var SEL = ['.stickC','#HTML91','#HTML92','#HTML93','#HTML95','#HTML99'].map(function(x){ return x + ' iframe'; }).join(',');
  function idOf(f){
    var u = f.getAttribute('src') || f.getAttribute('data-src') || f.getAttribute('data-lazy-src') || '';
    var m = /(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{11})/.exec(u);
    return m ? m[1] : '';
  }
  /* Iklan (anchor HP dan sticky PC): daftar ID di atribut data-videos pada iframe widget; satu video acak per sesi, sama untuk kedua widget. Tanpa data-videos, dipakai ID di src */
  function pickAd(f){
    var list = (f.getAttribute('data-videos') || '').split(',').map(function(x){ return x.trim(); })
      .filter(function(x){ return /^[\w-]{11}$/.test(x); });
    if (!list.length) return '';
    var v = '';
    try { v = sessionStorage.getItem('qAdVid') || ''; } catch(e){}
    if (list.indexOf(v) < 0) {
      v = list[Math.floor(Math.random() * list.length)];
      try { sessionStorage.setItem('qAdVid', v); } catch(e){}
    }
    return v;
  }
  /* Pengunjung sudah menyentuh halaman? Kalau ya, autoplay boleh berbunyi */
  var touched = false;
  ['pointerdown','touchstart','keydown','click'].forEach(function(t){
    window.addEventListener(t, function(){ touched = true; }, {capture:true, passive:true, once:true});
  });
  function active(){ try { if (navigator.userActivation) return navigator.userActivation.hasBeenActive; } catch(e){} return touched; }
  function make(f){
    if (f.getAttribute('data-lz')) return;
    var id = idOf(f); if (!id) return;
    id = pickAd(f) || id;
    f.setAttribute('data-lz', '1');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ytLz'; b.setAttribute('aria-label', 'Putar video');
    b.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
    b.innerHTML = '<span class="ytLzP"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span>';
    var play = function(mute){
      var n = document.createElement('iframe');
      n.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&origin=' + encodeURIComponent(location.origin) + (mute === true ? '&mute=1' : '');
      n.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      n.title = f.getAttribute('title') || 'YouTube video';
      n.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      n.setAttribute('allowfullscreen', ''); n.setAttribute('data-lz', '1'); n.className = 'ytLzF';
      if (b.parentNode) b.parentNode.replaceChild(n, b);
    };
    b.addEventListener('click', function(){ play(false); });
    b.__auto = function(){ play(!active()); };
    if (f.parentNode) f.parentNode.replaceChild(b, f);
  }
  function run(){ try { Array.prototype.forEach.call(document.querySelectorAll(SEL), make); } catch(e){} }
  /* Iklan anchor mobile (HTML99): setelah tampil (jeda 10 dtk) video diputar otomatis. Berbunyi bila pengunjung sudah menyentuh halaman, kalau belum tanpa suara. Desktop tetap menunggu klik. */
  document.addEventListener('animationstart', function(e){
    return; /* HP: tidak putar otomatis, sama seperti PC (tunggu ketuk) */
    try { if (!e.target.closest('#HTML99')) return; var b = e.target.querySelector('.ytLz'); if (b && b.__auto) b.__auto(); } catch(x){}
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  setTimeout(run, 1500);
})();
(function(){
  'use strict';
  var CFG = {apiKey:'AIzaSyA1WrsQJfTo7dj_WfTh3j_E6Ecoko7rYX4', authDomain:'qategori.firebaseapp.com', projectId:'qategori', appId:'1:323434645943:web:5c0449e902b0f32655c032'};
  var G = 'https://www.gstatic.com/firebasejs/10.14.1/';
  var BIDANG = {kensetsu:'Konstruksi (kensetsu)', manufaktur:'Manufaktur (seizou)', jidousha:'Perawatan Mobil (jidousha seibi)', bisniskaria:'Bisnis Karir (bijinesu kyaria)'};
  /* Koleksi skor kuis. Tambah baris di sini kalau ada halaman kuis lain. */
  var RESULT_COLS = [
    {c:'results_bisniskaria_planning', n:'Bisnis Karir - Planning'},
    {c:'results_bisniskaria_operations', n:'Bisnis Karir - Operations'}
  ];
  var KEEP = /_prefs$|_archived_v1$|_fav_v1$|^kbq_theme_v1$|^qProgress/;
  var TG2 = '/p/materi-dan-soal-tg2-jlpt.html';

  var chk = document.getElementById('forProfil');
  var body = document.getElementById('qpBody');
  if (!chk || !body) return;

  var F = null, auth = null, db = null, booting = null;
  var user = null, checked = false, info = null, msg = '', busy = false, dip = null;
  var mode = 'choice', ev = '', pv = '';   // login email: choice | signin | signup
  window.qpUser = function(){ return user; };
  var LV = ['n5','n4','n3','n2','n1'];
  var LVN = {n5:'N5 Pemula', n4:'N4 Dasar', n3:'N3 Menengah', n2:'N2 Lanjut', n1:'N1 Mahir'};
  var syncing = false, syncErr = '', lastSig = null;
  var niho = [], nihoErr = '', flushing = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function el(id){ return document.getElementById(id); }
  function fmt(ts){ try { return ts && ts.toDate ? ts.toDate().toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : ''; } catch(e){ return ''; } }
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); dip = e; if (chk.checked) render(); });
  window.addEventListener('appinstalled', function(){ dip = null; standalone = true; if (chk.checked) render(); });

  /* ---------- Firebase (dimuat hanya saat dibutuhkan) ---------- */
  function boot(){
    if (booting) return booting;
    booting = Promise.all([import(G + 'firebase-app.js'), import(G + 'firebase-auth.js'), import(G + 'firebase-firestore.js')]).then(function(m){
      F = {app:m[0], auth:m[1], fs:m[2]};
      var a = F.app.getApps().length ? F.app.getApp() : F.app.initializeApp(CFG);
      auth = F.auth.getAuth(a); db = F.fs.getFirestore(a);
      F.auth.onAuthStateChanged(auth, onUser);
    }).catch(function(){ booting = null; msg = 'Gagal memuat layanan login. Periksa koneksi internet lalu buka lagi.'; render(); });
    return booting;
  }

  function onUser(u){
    user = u; checked = true; info = null;
    try { window.dispatchEvent(new Event('qp-user')); } catch(e){}
    lsSet('qpHint', u ? '1' : '0');
    paintSlot();
    lastSig = null; niho = []; nihoErr = '';
    if (u) { loadInfo(u); sync(); flushLog(); }
    render();
  }

  function loadInfo(u){
    var fs = F.fs, email = (u.email || '').toLowerCase();
    var mine = info = {role:null, bidang:null, results:[], loading:true, err:false};
    var p = fs.getDoc(fs.doc(db, 'admins', email)).then(function(a){
      if (a.exists()) { mine.role = 'admin'; return; }
      return fs.getDoc(fs.doc(db, 'members', email)).then(function(m){
        if (m.exists()) { mine.role = 'member'; var b = m.data().bidang; mine.bidang = Array.isArray(b) ? b : null; }
      });
    }).catch(function(){ mine.err = true; });
    var rs = RESULT_COLS.map(function(c){
      return fs.getDocs(fs.query(fs.collection(db, c.c), fs.where('uid', '==', u.uid))).then(function(s){
        if (!s.size) return;
        var rows = s.docs.map(function(d){ return d.data(); }).sort(function(a, b){ return ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0); });
        var best = 0; rows.forEach(function(r){ if (r.total) best = Math.max(best, Math.round(100 * r.skor / r.total)); });
        mine.results.push({n:c.n, count:rows.length, last:rows[0], best:best});
      }).catch(function(){});
    });
    Promise.all([p].concat(rs)).then(function(){ mine.loading = false; if (info === mine) render(); });
  }

  /* ---------- Tampilan slot (rel kiri / menu) ---------- */
  var ICON0 = el('qpAv') ? el('qpAv').innerHTML : '';
  function paintSlot(){
    var av = el('qpAv'), nm = el('qpName'), mn = el('qpMenuName'), lb = av && av.closest ? av.closest('label') : null;
    var name = user ? (user.displayName || user.email || '') : '';
    var first = name.split(' ')[0];
    document.documentElement.classList.toggle('qp-in', !!user);
    if (av) {
      if (user && user.photoURL) av.innerHTML = '<img alt="" referrerpolicy="no-referrer" src="' + esc(user.photoURL) + '"/>';
      else if (user && first) av.innerHTML = '<b class="qpIni">' + esc(first.charAt(0).toUpperCase()) + '</b>';
      else av.innerHTML = ICON0;
    }
    var bav = el('qbAv'); if (bav) { if (!bav.__d) bav.__d = bav.innerHTML; if (user && user.photoURL) bav.innerHTML = '<img alt="" referrerpolicy="no-referrer" src="' + esc(user.photoURL) + '"/>'; else if (user && first) bav.innerHTML = '<b class="qbIni">' + esc(first.charAt(0).toUpperCase()) + '</b>'; else bav.innerHTML = bav.__d; }
    if (nm) nm.textContent = 'Masuk';
    if (lb) { lb.setAttribute('aria-label', user ? 'Profil ' + name : 'Masuk dan lihat profil'); lb.setAttribute('title', user ? name : 'Masuk'); }
    if (mn) mn.textContent = user ? 'Profil saya (' + first + ')' : 'Profil saya';
  }

  /* ---------- Progres kotoba (kunci dibuat oleh halaman materi JLPT) ---------- */
  function kkey(l){ return l + '_kotoba_archived_v1'; }
  function readArr(raw){ try { var a = JSON.parse(raw); return Array.isArray(a) ? a.filter(function(x){ return typeof x === 'string'; }) : []; } catch(e){ return []; } }
  function readList(l){ return readArr(lsGet(kkey(l))); }
  function readSnap(l){ return readArr(lsGet('qSnap_' + l)); }
  function fkey(l){ return l + '_kotoba_fav_v1'; }
  function readFav(l){ return readArr(lsGet(fkey(l))); }
  function readSnapF(l){ return readArr(lsGet('qSnapF_' + l)); }
  function kk(l, t){ return l + '_kanji_' + t + '_v1'; }
  var KINDS = [
    {f:'kotoba', key:kkey, snap:'qSnap_'},
    {f:'fav', key:fkey, snap:'qSnapF_'},
    {f:'kanji', key:function(l){ return kk(l, 'archived'); }, snap:'qSnapK_'},
    {f:'kfav', key:function(l){ return kk(l, 'fav'); }, snap:'qSnapKF_'}
  ];
  function sig(){ return LV.map(function(l){ return KINDS.map(function(k){ return lsGet(k.key(l)) || ''; }).join('|'); }).join('#'); }
  function sameSet(a, b){ if (a.length !== b.length) return false; var m = {}; a.forEach(function(x){ m[x] = 1; }); return b.every(function(x){ return m[x]; }); }
  function totals(){
    var t = {}; try { t = JSON.parse(lsGet('qProgressTotals') || '{}') || {}; } catch(e){}
    var ch = false;
    LV.forEach(function(l){ var w = window[l.toUpperCase() + '_KOTOBA']; if (Array.isArray(w) && w.length && t[l] !== w.length) { t[l] = w.length; ch = true; } });
    if (ch) lsSet('qProgressTotals', JSON.stringify(t));
    return t;
  }
  /* Gabung tiga arah: yang ditambah di salah satu sisi ikut, yang dibuang di salah satu sisi ikut dibuang. */
  function merge3(base, L, R){
    var inB = {}, inL = {}, inR = {}; base.forEach(function(x){ inB[x] = 1; }); L.forEach(function(x){ inL[x] = 1; }); R.forEach(function(x){ inR[x] = 1; });
    var out = [], seen = {};
    L.concat(R).forEach(function(x){
      if (seen[x]) return; seen[x] = 1;
      var removed = inB[x] && (!inL[x] || !inR[x]);
      if (!removed) out.push(x);
    });
    return out;
  }
  function sync(){
    if (!user || !F || syncing) return;
    syncing = true; syncErr = ''; if (chk.checked) render();
    var fs = F.fs, ref = fs.doc(db, 'progress', user.uid), u = user;
    fs.getDoc(ref).then(function(snap){
      if (u !== user) return;
      var d0 = snap.exists() ? snap.data() : {};
      var payload = {}, push = !snap.exists();
      KINDS.forEach(function(k){
        var remote = d0[k.f] || {}, out = {};
        LV.forEach(function(l){
          var L = readArr(lsGet(k.key(l))), R = Array.isArray(remote[l]) ? remote[l] : [], B = readArr(lsGet(k.snap + l));
          var M = merge3(B, L, R);
          if (!sameSet(M, L)) lsSet(k.key(l), JSON.stringify(M));
          if (!sameSet(M, R)) push = true;
          lsSet(k.snap + l, JSON.stringify(M));
          out[l] = M;
        });
        payload[k.f] = out;
      });
      lastSig = sig();
      if (!push) return;
      payload.updatedAt = fs.serverTimestamp();
      return fs.setDoc(ref, payload, {merge:true});
    }).then(function(){ lsSet('qSyncAt', String(Date.now())); }).catch(function(e){
      syncErr = (e && e.code === 'permission-denied') ? 'Aturan Firestore belum mengizinkan koleksi "progress".' : 'Sinkron gagal. Coba lagi nanti.';
    }).then(function(){ syncing = false; if (chk.checked) render(); });
  }
  function watch(){
    if (user && F && !syncing && sig() !== lastSig) sync();
  }
  setInterval(watch, 20000);
  document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') watch(); });
  setTimeout(totals, 4000);

  function dailySec(){
    var d = window.qDaily ? window.qDaily.get() : null; if (!d) return '';
    var pct = Math.min(100, Math.round(100 * d.n / d.goal));
    return '<div class="qpSec"><h4>Target hari ini</h4><div class="qpGoal"><span>' + (d.met ? 'Tercapai! すごい (sugoi)' : 'Kartu dihapal hari ini') + '</span><b>' + d.n + ' / ' + d.goal + '</b><i class="qpBar"><u style="width:' + pct + '%"></u></i></div>' +
      '<p class="qpStreak">Streak: <b>' + d.streak + ' hari</b>' + (d.best > 1 ? ' &middot; terbaik ' + d.best + ' hari' : '') + '</p>' +
      '<p class="qpStreak"><button type="button" class="qpBtn sm" data-qp="goal">Ganti target (' + d.goal + ')</button></p></div>';
  }

  /* Pilihan level (chip menyamping) untuk kotoba dan kanji; level lain ditambah cukup lewat array LV. */
  var selLv = {kotoba:null, kanji:null};
  function pickLv(kind, rows){
    var cur = selLv[kind];
    if (!cur || LV.indexOf(cur) < 0) {
      cur = 'n5';
      for (var i = 0; i < rows.length; i++) { if (!rows[i].tot || rows[i].n < rows[i].tot) { cur = rows[i].l; break; } }
      selLv[kind] = cur;
    }
    return cur;
  }
  function lvBlock(kind, rows, favFn){
    var cur = pickLv(kind, rows), sel = null, sumN = 0, sumT = 0;
    rows.forEach(function(r){ sumN += r.n; sumT += r.tot; if (r.l === cur) sel = r; });
    var chips = '<div class="qpPick" role="tablist">' + rows.map(function(r){
      var pct = r.tot ? Math.min(100, Math.round(100 * r.n / r.tot)) : 0;
      return '<button type="button" role="tab" class="qpPk' + (r.l === cur ? ' on' : '') + '" aria-selected="' + (r.l === cur) + '" data-qp="lv:' + kind + ':' + r.l + '"><b>' + r.l.toUpperCase() + '</b><small>' + pct + '%</small></button>';
    }).join('') + '</div>';
    var pc = sel.tot ? Math.min(100, Math.round(100 * sel.n / sel.tot)) : 0;
    var one = '<div class="qpLv"><span>' + LVN[cur] + '</span><b>' + sel.n + (sel.tot ? ' / ' + sel.tot : '') + '</b><i class="qpBar"><u style="width:' + pc + '%"></u></i></div>';
    var fv = favFn(cur);
    var favRow = '<div class="qpFavs"><span>Favorit ' + cur.toUpperCase() + '</span>' + (fv ? '<i>' + fv + '</i>' : '<small>belum ada</small>') + '</div>';
    return chips + one + favRow + '<p class="qpNote">Semua level: ' + sumN + (sumT ? ' / ' + sumT : '') + ' dihapal.</p>';
  }

  function kotobaSec(){
    var t = totals(), any = false;
    var rows = LV.map(function(l){ var n = readList(l).length; if (n) any = true; return {l:l, n:n, tot:t[l] || 0}; });
    var st;
    if (!user) st = 'Belum masuk: progres hanya tersimpan di browser ini.';
    else if (syncing) st = 'Menyinkronkan ke akun...';
    else if (syncErr) st = syncErr;
    else { var at = +lsGet('qSyncAt'); st = at ? 'Tersinkron ke akunmu pukul ' + new Date(at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) + '.' : 'Belum disinkronkan.'; }
    return '<div class="qpSec"><h4>Kotoba dihapal (単語, tango)</h4>' +
      lvBlock('kotoba', rows, function(l){ var n = readFav(l).length; return n ? n + ' kartu' : ''; }) +
      '<p class="qpNote">' + (any ? '' : 'Belum ada kotoba yang ditandai hafal. Tandai lewat kartu hapalan di halaman materi JLPT. ') + esc(st) +
      (user && !syncing ? ' <a href="#" data-qp="sync">Sinkronkan sekarang</a>' : '') + '</p></div>';
  }

  function kanjiSec(){
    var t = {}; try { t = JSON.parse(lsGet('qProgressTotalsK') || '{}') || {}; } catch(e){}
    var any = false;
    var rows = LV.map(function(l){ var n = readArr(lsGet(kk(l, 'archived'))).length; if (n) any = true; return {l:l, n:n, tot:t[l] || 0}; });
    return '<div class="qpSec"><h4>Kanji dihapal (漢字, kanji)</h4>' +
      lvBlock('kanji', rows, function(l){ var n = readArr(lsGet(kk(l, 'fav'))).length; return n ? n + ' kartu' : ''; }) +
      '<p class="qpNote">' + (any ? '' : 'Belum ada kanji yang ditandai hapal. Tandai lewat Kartu hapalan di halaman Kuis Bushu.') + '</p></div>';
  }

  /* ---------- Skor kuis Nihongo (JLPT dan Bushu) ---------- */
  var LOGK = 'qProgressLog';
  var TIPE = {campuran:'Campuran', kanji_yomi:'Kanji yomi (baca kanji)', hyouki:'Hyouki (tulis kanji)', bunmyaku:'Bunmyaku (konteks)', bunpou:'Bunpou (tata bahasa)', kumitate:'Kumitate (susun kalimat)'};
  function readLog(){
    try { var a = JSON.parse(lsGet(LOGK) || '[]'); return Array.isArray(a) ? a.filter(function(x){ return x && typeof x.k === 'string' && isFinite(x.s) && isFinite(x.t) && isFinite(x.at); }) : []; } catch(e){ return []; }
  }
  function writeLog(a){
    while (a.length > 100) { var i = 0; for (var j = 0; j < a.length; j++) { if (a[j].u) { i = j; break; } } a.splice(i, 1); }
    lsSet(LOGK, JSON.stringify(a));
  }
  var lastRec = {};
  function record(k, n, s, t){
    s = +s; t = +t;
    if (!k || !isFinite(s) || !isFinite(t) || t <= 0 || s < 0 || s > t) return;
    var key = k + '|' + s + '|' + t, now = Date.now();
    if (lastRec[key] && now - lastRec[key] < 2500) return;
    lastRec[key] = now;
    var a = readLog(); a.push({k:k, n:n, s:s, t:t, at:now, u:0}); writeLog(a);
    if (user && F) flushLog(); else if (chk.checked) render();
  }
  window.qRecord = record;
  function loadNiho(u){
    if (!user || !F || u !== user) return Promise.resolve();
    var fs = F.fs;
    return fs.getDocs(fs.query(fs.collection(db, 'results_nihongo'), fs.where('uid', '==', u.uid))).then(function(s){
      if (u !== user) return;
      niho = s.docs.map(function(d){ var x = d.data(); return {k:x.k, n:x.n, s:x.skor, t:x.total, at:+x.ts || ((x.at && x.at.seconds) || 0) * 1000}; });
    }).catch(function(e){
      if (!nihoErr) nihoErr = (e && e.code === 'permission-denied') ? 'Aturan Firestore belum mengizinkan koleksi "results_nihongo".' : '';
    }).then(function(){ if (chk.checked) render(); });
  }
  function flushLog(){
    if (!user || !F || flushing) return Promise.resolve();
    flushing = true; nihoErr = '';
    var u = user, fs = F.fs, chain = Promise.resolve();
    readLog().filter(function(x){ return !x.u; }).forEach(function(x){
      chain = chain.then(function(){
        return fs.addDoc(fs.collection(db, 'results_nihongo'), {uid:u.uid, email:(u.email || '').toLowerCase(), nama:u.displayName || '', k:x.k, n:x.n, skor:x.s, total:x.t, ts:x.at, at:fs.serverTimestamp()}).then(function(){
          var a = readLog(); a.forEach(function(y){ if (y.at === x.at && y.k === x.k && !y.u) y.u = 1; }); writeLog(a);
        });
      });
    });
    return chain.catch(function(e){
      nihoErr = (e && e.code === 'permission-denied') ? 'Aturan Firestore belum mengizinkan koleksi "results_nihongo".' : 'Skor belum terkirim, akan dicoba lagi.';
    }).then(function(){ flushing = false; return loadNiho(u); });
  }
  function nihoSec(){
    var local = readLog(), rows = user ? niho.concat(local.filter(function(x){ return !x.u; })) : local, g = {};
    rows.forEach(function(r){
      var o = g[r.k] || (g[r.k] = {n:r.n || r.k, c:0, last:null, best:0});
      o.c++; if (!o.last || r.at > o.last.at) o.last = r;
      if (r.t) o.best = Math.max(o.best, Math.round(100 * r.s / r.t));
    });
    var list = Object.keys(g).map(function(k){ return g[k]; }).sort(function(a, b){ return b.last.at - a.last.at; }).slice(0, 8);
    var h = '<div class="qpSec"><h4>Skor kuis Nihongo</h4>';
    if (!list.length) h += '<p class="qpNote">Belum ada skor. Selesaikan kuis di halaman materi JLPT atau kuis Bushu.</p>';
    else h += list.map(function(o){
      var d = new Date(o.last.at).toLocaleDateString('id-ID', {day:'numeric', month:'short'});
      return '<div class="qpRow"><span>' + esc(o.n) + '<small>' + o.c + ' kali &middot; terakhir ' + esc(d) + '</small></span><b>' + o.last.s + '/' + o.last.t + '<small>terbaik ' + o.best + '%</small></b></div>';
    }).join('');
    if (nihoErr) h += '<p class="qpNote">' + esc(nihoErr) + '</p>';
    else if (!user && list.length) h += '<p class="qpNote">Masuk agar skor tersimpan di akunmu.</p>';
    return h + '</div>';
  }

  /* Halaman materi JLPT: baca hasil dari teks "Skor kamu: X / Y" tanpa mengubah file halaman */
  function hookJlpt(){
    var out = el('quizScoreText');
    if (!out) return false;
    if (out.__qp) return true;
    out.__qp = 1;
    new MutationObserver(function(){
      var m = /Skor kamu:\s*(\d+)\s*\/\s*(\d+)/.exec(out.textContent || ''); if (!m) return;
      var lv = null; ['5','4','3','2','1'].forEach(function(x){ if (!lv && window['N' + x + '_QUIZ']) lv = x; });
      if (!lv) { var p = /jlpt-n([1-5])/i.exec(location.pathname); lv = p && p[1]; }
      if (!lv) return;
      var r = document.querySelector('input[name=quizType]:checked'), ty = r ? r.value : 'campuran';
      record('jlpt-n' + lv + '-' + ty, 'JLPT N' + lv + ' · ' + (TIPE[ty] || ty), m[1], m[2]);
    }).observe(out, {childList:true, characterData:true, subtree:true});
    return true;
  }
  /* Halaman kuis Bushu: berjalan langsung di halaman Blogger (#kuis-kanji). Hasil dibaca dari layar "Hasil kuis Nx". */
  function hookBushu(){
    var app = el('kbq-app');
    if (!app) return false;
    if (app.__qp) return true;
    app.__qp = 1;
    var inRes = false;
    new MutationObserver(function(){
      var sc = app.querySelector('.kbq-score');
      if (!sc) { inRes = false; return; }
      if (inRes) return;
      var m = /(\d+)\s*\/\s*(\d+)/.exec(sc.textContent || ''), h = app.querySelector('h2'), lv = /Hasil kuis (N[1-5])/.exec(h ? h.textContent : '');
      if (!m || !lv) return;
      inRes = true;
      record('bushu-' + lv[1].toLowerCase(), 'Kanji Bushu ' + lv[1] + ' (\u90E8\u9996, bushu)', m[1], m[2]);
    }).observe(app, {childList:true, subtree:true});
    return true;
  }
  window.qpHook = function(){ hookJlpt(); hookBushu(); };
  var hookTries = 0, hookIv = setInterval(function(){ var a = hookJlpt(), b = hookBushu(); if (a || b || ++hookTries > 20) clearInterval(hookIv); }, 1000);

  /* Kuis Bushu (iframe GitHub Pages) mengirim hasilnya lewat postMessage */
  window.addEventListener('message', function(e){
    if (e.origin !== 'https://bshantoz.github.io') return;
    var d = e.data && e.data.qScore;
    if (!d || d.quiz !== 'bushu' || !/^N[1-5]$/.test(d.level)) return;
    record('bushu-' + d.level.toLowerCase(), 'Kanji Bushu ' + d.level + ' (部首, bushu)', d.skor, d.total);
  });

  /* ---------- Isi popup ---------- */
  var ICON_USER = '<svg class="line" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/></svg>';
  function tools(){
    var h = '<div class="qpSec"><h4>Alat</h4><div class="qpTools">' +
      '<button class="qpBtn" type="button" data-qp="backup">Cadangkan</button>' +
      '<button class="qpBtn" type="button" data-qp="restore">Pulihkan</button>';
    var ua = navigator.userAgent, inApp = /QategoriApp/.test(ua), apk = 'https://github.com/bshantoz/qategori/releases/download/terbaru/QategoriKartu.apk';
    if (!inApp) {
      if (/android/i.test(ua)) {
        h += '<a class="qpBtn wide" href="' + apk + '" style="text-decoration:none;display:block">Unduh aplikasi Android</a>';
        if (/TikTok|musical_ly|Bytedance|Instagram|FBAN|FBAV|Line\//i.test(ua)) h += '<p class="qpMsg" style="grid-column:1/-1">Kalau tidak terunduh, buka situs ini lewat Chrome lalu coba lagi.</p>';
      } else if (!standalone) h += '<button class="qpBtn wide" type="button" data-qp="install">Pasang aplikasi di layar utama</button>';
    }
    h += '</div>' + (msg ? '<p class="qpMsg">' + esc(msg) + '</p>' : '') + '</div>';
    return h;
  }
  function loginBlock(){
    var dis = busy ? ' disabled' : '';
    var inApp = /QategoriApp/.test(navigator.userAgent);
    var gBtn = inApp ? '<p class="qpNote">Di aplikasi, masuk lewat Email. Google tidak mengizinkan login di dalam aplikasi. Kalau akunmu dulu daftar dengan Google, pilih Masuk dengan Email lalu &quot;Lupa kata sandi?&quot; dengan email Google yang sama untuk membuat kata sandi.</p>' : '<p class="qpOr">atau</p><button class="qpBtn" type="button" data-qp="google"' + dis + '>Masuk dengan Google</button>';
    if (mode === 'choice') {
      return '<button class="qpBtn pr" type="button" data-qp="emailmode"' + dis + '>Masuk dengan Email</button>' +
        gBtn +
        (msg ? '<p class="qpMsg">' + esc(msg) + '</p>' : '');
    }
    var up = mode === 'signup';
    return '<div class="qpForm"><input class="qpIn" type="email" id="qpEmail" placeholder="Email" autocomplete="email" value="' + esc(ev) + '">' +
      '<input class="qpIn" type="password" id="qpPass" placeholder="Kata sandi" autocomplete="' + (up ? 'new-password' : 'current-password') + '" value="' + esc(pv) + '">' +
      '<button class="qpBtn pr" type="button" data-qp="emailgo"' + dis + '>' + (up ? 'Daftar dengan Email' : 'Masuk dengan Email') + '</button>' +
      '<button class="qpLink" type="button" data-qp="emailswitch">' + (up ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar') + '</button>' +
      '<button class="qpLink" type="button" data-qp="emailreset">Lupa kata sandi?</button>' +
      (msg ? '<p class="qpMsg">' + esc(msg) + '</p>' : '') +
      (inApp ? '' : '<p class="qpOr">atau</p><button class="qpBtn" type="button" data-qp="google"' + dis + '>Masuk dengan Google</button>') +
      '<button class="qpLink" type="button" data-qp="emailback">&larr; Kembali</button></div>';
  }
  function render(){
    var h = '';
    if (!checked) {
      h = '<p class="qpNote">' + (booting ? 'Memeriksa status login...' : 'Memuat...') + '</p>' + (msg ? '<p class="qpMsg">' + esc(msg) + '</p>' : '');
    } else if (!user) {
      h = '<div class="qpHero"><span class="qpHAv">' + ICON_USER + '</span><div><b>Belum masuk</b><small>Masuk untuk membuka kuis dan menyimpan progres belajarmu.</small></div></div>' +
        loginBlock() +
        '<p class="qpNote">Anggota terdaftar: masuk dengan email yang didaftarkan admin untuk membuka kuis TG2.</p>' + dailySec() + kotobaSec() + kanjiSec() + nihoSec() + tools();
    } else {
      var name = user.displayName || user.email;
      var img = user.photoURL ? '<img alt="" referrerpolicy="no-referrer" src="' + esc(user.photoURL) + '"/>' : esc((name || '?').charAt(0).toUpperCase());
      var role = info && info.role === 'admin' ? 'Admin' : (info && info.role === 'member' ? 'Anggota' : '');
      h = '<div class="qpHero"><span class="qpHAv">' + img + '</span><div><b>' + esc(name) + (role ? ' <i class="qpBadge">' + role + '</i>' : '') + '</b><small>' + esc(user.email || '') + '</small></div></div>';
      if (!user.emailVerified) h += '<p class="qpMsg">Email belum diverifikasi. <a href="' + TG2 + '">Selesaikan di halaman TG2</a>.</p>';
      h += '<div class="qpSec"><h4>Akses kuis</h4>';
      if (!info || info.loading) h += '<p class="qpNote">Memeriksa akses...</p>';
      else if (info.err) h += '<p class="qpNote">Tidak bisa memeriksa akses sekarang. Coba lagi nanti.</p>';
      else if (info.role === 'admin') h += '<p class="qpNote">Admin: semua bidang terbuka.</p>';
      else if (info.role === 'member') {
        if (!info.bidang) h += '<p class="qpNote">Anggota: semua bidang terbuka.</p>';
        else h += '<div class="qpChips">' + (info.bidang.length ? info.bidang.map(function(b){ return '<span>' + esc(BIDANG[b] || b) + '</span>'; }).join('') : '<span>Belum ada bidang</span>') + '</div>';
      } else h += '<p class="qpNote">Akunmu belum terdaftar sebagai anggota. <a href="' + TG2 + '">Lihat cara mendaftar</a>.</p>';
      h += '</div>';
      if (info && !info.loading) {
        h += '<div class="qpSec"><h4>Skor kuis</h4>';
        if (!info.results.length) h += '<p class="qpNote">Belum ada skor. Selesaikan satu kuis dulu.</p>';
        else h += info.results.map(function(r){
          var l = r.last || {};
          return '<div class="qpRow"><span>' + esc(r.n) + '<small>' + r.count + ' kali kuis' + (fmt(l.at) ? ' &middot; terakhir ' + esc(fmt(l.at)) : '') + '</small></span><b>' + esc(l.skor) + '/' + esc(l.total) + '<small>terbaik ' + r.best + '%</small></b></div>';
        }).join('');
        h += '</div>';
      }
      h += dailySec() + kotobaSec() + kanjiSec() + nihoSec() + tools() + '<button class="qpBtn out" type="button" data-qp="out">Keluar</button>';
    }
    body.innerHTML = h;
  }

  /* ---------- Aksi ---------- */
  var ERR = {'auth/popup-closed-by-user':'Jendela login ditutup.', 'auth/cancelled-popup-request':'Jendela login ditutup.', 'auth/popup-blocked':'Popup diblokir browser. Izinkan popup lalu coba lagi.', 'auth/unauthorized-domain':'Domain ini belum diizinkan di Firebase.', 'auth/network-request-failed':'Koneksi bermasalah. Coba lagi.', 'auth/invalid-credential':'Email atau kata sandi salah.', 'auth/wrong-password':'Email atau kata sandi salah.', 'auth/user-not-found':'Email belum terdaftar. Pakai Daftar dulu.', 'auth/email-already-in-use':'Email ini sudah terdaftar. Pakai Masuk.', 'auth/weak-password':'Kata sandi minimal 6 karakter.', 'auth/invalid-email':'Format email belum benar.', 'auth/missing-password':'Isi kata sandinya.', 'auth/too-many-requests':'Terlalu banyak percobaan. Tunggu sebentar.'};
  function collect(){
    var o = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (KEEP.test(k)) o[k] = localStorage.getItem(k); } } catch(e){}
    return o;
  }
  function backup(){
    var data = {app:'qategori', v:1, at:new Date().toISOString(), email:user ? user.email : null, local:collect(), skor:info ? info.results : []};
    var blob = new Blob([JSON.stringify(data, null, 1)], {type:'application/json'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'qategori-cadangan-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
    msg = 'Cadangan diunduh. Simpan filenya di tempat aman.';
    render();
  }
  function restore(file){
    var r = new FileReader();
    r.onload = function(){
      try {
        var d = JSON.parse(r.result);
        if (!d || d.app !== 'qategori' || !d.local || typeof d.local !== 'object') throw 0;
        var n = 0;
        Object.keys(d.local).forEach(function(k){
          if (!KEEP.test(k) || typeof d.local[k] !== 'string') return;
          var cur = lsGet(k), next = d.local[k];
          try {
            var a = JSON.parse(next), b = cur ? JSON.parse(cur) : null;
            if (Array.isArray(a) && Array.isArray(b)) { var seen = {}; b.forEach(function(x){ seen[JSON.stringify(x)] = 1; }); next = JSON.stringify(b.concat(a.filter(function(x){ return !seen[JSON.stringify(x)]; }))); }
            else if (cur) return;
          } catch(e){ if (cur) return; }
          lsSet(k, next); n++;
        });
        msg = n ? 'Pulihkan berhasil: ' + n + ' data digabung.' : 'Tidak ada data baru yang perlu dipulihkan.';
        lastSig = null; setTimeout(watch, 300);
      } catch(e){ msg = 'File tidak dikenali. Pakai file cadangan dari Qategori.'; }
      render();
    };
    r.readAsText(file);
  }
  function install(){
    if (dip) { dip.prompt(); dip.userChoice.then(function(){ dip = null; render(); }); return; }
    msg = isIOS ? 'Di Safari: ketuk tombol Bagikan, lalu pilih "Tambah ke Layar Utama".' : 'Di Chrome: buka menu (tiga titik), lalu pilih "Instal aplikasi" atau "Tambahkan ke layar utama".';
    render();
  }

  body.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-qp]') : null;
    if (!b) return;
    var a = b.getAttribute('data-qp');
    msg = '';
    var ei = el('qpEmail'), pi = el('qpPass'); if (ei) ev = ei.value.trim(); if (pi) pv = pi.value;
    if (a === 'emailmode') { mode = 'signin'; render(); return; }
    else if (a === 'emailback') { mode = 'choice'; render(); return; }
    else if (a === 'emailswitch') { mode = mode === 'signup' ? 'signin' : 'signup'; render(); return; }
    else if (a === 'emailgo' || a === 'emailreset') {
      if (!F) return;
      if (!ev) { msg = 'Isi emailnya dulu.'; render(); return; }
      if (a === 'emailgo' && !pv) { msg = 'Isi kata sandinya.'; render(); return; }
      busy = true; render();
      var A = F.auth, pr;
      if (a === 'emailreset') pr = A.sendPasswordResetEmail(auth, ev).then(function(){ msg = 'Tautan atur ulang kata sandi sudah dikirim. Cek folder spam juga.'; });
      else if (mode === 'signup') pr = A.createUserWithEmailAndPassword(auth, ev, pv).then(function(c){ pv = ''; return A.sendEmailVerification(c.user).then(function(){ msg = 'Akun dibuat. Link verifikasi dikirim ke emailmu; buka link itu lalu muat ulang halaman.'; }); });
      else pr = A.signInWithEmailAndPassword(auth, ev, pv).then(function(){ pv = ''; mode = 'choice'; });
      pr.catch(function(err){ msg = ERR[err && err.code] || 'Gagal. Coba lagi.'; }).then(function(){ busy = false; render(); });
      return;
    }
    if (a === 'google') {
      if (!F) return;
      busy = true; render();
      F.auth.signInWithPopup(auth, new F.auth.GoogleAuthProvider()).catch(function(err){ msg = ERR[err && err.code] || 'Gagal masuk. Coba lagi.'; }).then(function(){ busy = false; render(); });
    } else if (a === 'out') { if (F) F.auth.signOut(auth); }
    else if (a === 'backup') backup();
    else if (a === 'restore') { var f = el('qpFile'); if (f) f.click(); }
    else if (a === 'install') install();
    else if (a === 'sync') { e.preventDefault(); sync(); return; }
    else if (a && a.indexOf('lv:') === 0) { var pp = a.split(':'); if (selLv.hasOwnProperty(pp[1]) && LV.indexOf(pp[2]) >= 0) { selLv[pp[1]] = pp[2]; render(); } return; }
    else if (a === 'goal') { if (window.qDaily) window.qDaily.nextGoal(); render(); return; }
  });
  var file = el('qpFile');
  if (file) file.addEventListener('change', function(){ if (file.files && file.files[0]) restore(file.files[0]); file.value = ''; });

  window.addEventListener('qdaily', function(){ var ae = document.activeElement; if (chk.checked && !(ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName))) render(); });
  chk.addEventListener('change', function(){ if (chk.checked) { render(); boot().then(watch); } });
  window.addEventListener('pageshow', function(){ chk.checked = false; });
  render();

  /* Pengguna yang pernah masuk: muat login di waktu senggang supaya foto muncul di slot. */
  if (lsGet('qpHint') === '1') {
    var go = function(){ boot(); };
    if (window.requestIdleCallback) requestIdleCallback(go, {timeout:3000}); else setTimeout(go, 1500);
  }
})();
/* tema + penanda (bookmark), versi statis */
(function(){
  var nB=document.body;
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  window.setTheme=function(m){
    var v=(m==='dark'||m==='light')?m:'default';
    ls('q_theme',v);nB.setAttribute('data-theme',v);
    if(v==='default')document.documentElement.removeAttribute('data-q');else document.documentElement.setAttribute('data-q',v);
    var c=document.getElementById('forDark');if(c)c.checked=false;
  };
  var DEL="<svg class=\"line\" viewBox=\"0 0 24 24\"><path d=\"M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998\"/><path d=\"M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97\"/><path d=\"M18.85 9.14001L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79002C6.00002 22 5.91002 20.78 5.80002 19.21L5.15002 9.14001\"/><!--<path d=\"M10.33 16.5H13.66\"/><path d=\"M9.5 12.5H14.5\"/>--></svg>";
  function load(){try{return JSON.parse(ls('ignielBookmark'))||[]}catch(e){return[]}}
  function save(a){ls('ignielBookmark',JSON.stringify(a))}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function bid(p){return String(p).replace(/\W/g,'').slice(-24)}
  var ICONS="<svg class='line' viewBox='0 0 24 24'><path d='M14.5 10.6499H9.5' stroke-miterlimit='10'/><path d='M12 8.20996V13.21' stroke-miterlimit='10'/><path d='M16.8199 2H7.17995C5.04995 2 3.31995 3.74 3.31995 5.86V19.95C3.31995 21.75 4.60995 22.51 6.18995 21.64L11.0699 18.93C11.5899 18.64 12.4299 18.64 12.9399 18.93L17.8199 21.64C19.3999 22.52 20.6899 21.76 20.6899 19.95V5.86C20.6799 3.74 18.9499 2 16.8199 2Z'/></svg><svg viewBox='0 0 24 24'><path d='M16.8203 1.91016H7.18031C5.06031 1.91016 3.32031 3.65016 3.32031 5.77016V19.8602C3.32031 21.6602 4.61031 22.4202 6.19031 21.5502L11.0703 18.8402C11.5903 18.5502 12.4303 18.5502 12.9403 18.8402L17.8203 21.5502C19.4003 22.4302 20.6903 21.6702 20.6903 19.8602V5.77016C20.6803 3.65016 18.9503 1.91016 16.8203 1.91016ZM15.6203 9.03016L11.6203 13.0302C11.4703 13.1802 11.2803 13.2502 11.0903 13.2502C10.9003 13.2502 10.7103 13.1802 10.5603 13.0302L9.06031 11.5302C8.77031 11.2402 8.77031 10.7602 9.06031 10.4702C9.35031 10.1802 9.83031 10.1802 10.1203 10.4702L11.0903 11.4402L14.5603 7.97016C14.8503 7.68016 15.3303 7.68016 15.6203 7.97016C15.9103 8.26016 15.9103 8.74016 15.6203 9.03016Z'/></svg>";
  window.qBmBtn=function(path,title,img){
        var id=bid(path);
    return '<div class="ignielBookmarkPost tag addl"><input class="hidden addb" id="bm-'+id+'" name="bookmark" type="checkbox"><label aria-label="Tambah penanda" class="flex center op i16" data-img="'+esc(img||'')+'" data-title="'+esc(title)+'" data-url="'+esc(path)+'" for="bm-'+id+'">'+ICONS+'</label></div>';
  };
  function render(){
    var a=load(),inner=document.querySelector('.bookmark-inner'),bc=document.querySelector('.ignielBookmark label.bc');
    if(bc)bc.setAttribute('data-text',a.length);
    var all=document.querySelector('.ignielBookmarks'),page=location.pathname==='/p/bookmark.html'||!!all;
    var max=page?100:5,h=a.slice(0,max).map(function(e){
      return '<div class="flex" data-id="'+esc(e.id)+'"><div class="bm-thumb shrink"><a href="'+esc(e.url)+'"><img class="bm-im" loading="lazy" alt="'+esc(e.title)+'" src="'+esc(e.img||'')+'"></a></div><div class="bm-title grow"><a class="clamp" href="'+esc(e.url)+'" title="'+esc(e.title)+'">'+esc(e.title)+'</a></div><div class="bm-delete flex center shrink op i18" role="button">'+DEL+'</div></div>'}).join('');
    var empty='<span class="fontM">Belum ada penanda</span>';
    if(inner){
      if(!a.length)inner.innerHTML=empty;
      else if(page)inner.innerHTML='<span class="fontM">Anda sedang di laman Daftar Bacaan</span>';
      else inner.innerHTML='<div class="book flex column">'+h+'</div>'+(a.length>max?'<div class="more fontS"><a href="/p/bookmark.html"><span>Tampilkan</span><span class="fontSm opacity">(+'+(a.length-max)+')</span></a></div>':'');
    }
    if(all)all.innerHTML=a.length?'<div class="book all flex wrap">'+h+'</div>':empty;
    sync();
  }
  function sync(){
    var ids={};load().forEach(function(e){ids[e.id]=1});
    document.querySelectorAll('.ignielBookmarkPost input').forEach(function(i){i.checked=!!ids[i.id.replace('bm-','')]});
  }
  document.addEventListener('change',function(ev){
    var i=ev.target;if(!i.matches||!i.matches('.ignielBookmarkPost input'))return;
    var id=i.id.replace('bm-',''),l=i.parentNode.querySelector('label'),a=load(),k=a.findIndex(function(e){return e.id===id});
    if(k>=0)a.splice(k,1);else a.push({id:id,img:l.getAttribute('data-img'),title:l.getAttribute('data-title'),url:l.getAttribute('data-url')});
    save(a);render();
  });
  document.addEventListener('click',function(ev){
    var d=ev.target.closest&&ev.target.closest('.bm-delete');if(!d)return;
    var id=d.parentNode.getAttribute('data-id');save(load().filter(function(e){return e.id!==id}));render();
  });
  var mo=new MutationObserver(function(){clearTimeout(mo.t);mo.t=setTimeout(function(){var al=document.querySelector('.ignielBookmarks');if(al&&/Memuat daftar penanda/.test(al.textContent))render();else sync()},80)});
  mo.observe(document.body,{childList:true,subtree:true});
  /* tutup popup tema/penanda kalau tap di luar */
  document.addEventListener('click',function(ev){
    var t=ev.target;if(!t.closest)return;
    if(t.closest('.settB')||t.closest('.headB')||t.closest('.bm-delete'))return;
    var cp=t.closest('[data-copy]');if(cp){var inp=document.getElementById('getLink');if(inp){try{navigator.clipboard.writeText(inp.value)}catch(e){inp.select();try{document.execCommand('copy')}catch(e2){}}cp.textContent='Tersalin';setTimeout(function(){cp.textContent='Salin'},1500)}return}
    var sh=document.getElementById('forShare');if(sh&&sh.checked&&t.id!=='forShare'&&!t.closest('.shareB .popIn')&&!t.closest('.qShare')){sh.checked=false}
    ['forDark','forBook'].forEach(function(id){var c=document.getElementById(id);if(c&&c.checked)c.checked=false});
  });
  /* hanya satu popup terbuka */
  document.addEventListener('change',function(ev){
    var t=ev.target;if(t.id==='forDark'&&t.checked){var b=document.getElementById('forBook');if(b)b.checked=false}
    if(t.id==='forBook'&&t.checked){var d=document.getElementById('forDark');if(d)d.checked=false}
  });
  render();
})();

/* Mochi & tombol Suasana tidak boleh menutupi footer (sosmed & kredit): naik di atas garis footer */
(function(){
  var ids=['qcat','qfxFab'],raf=0;
  function run(){
    raf=0;
    var f=document.querySelector('.qFoot'),line=f?f.getBoundingClientRect().top:1e9;
    ids.forEach(function(id){
      var e=document.getElementById(id);if(!e)return;
      var cur=parseFloat(e.style.getPropertyValue('--qlift'))||0;
      var r=e.getBoundingClientRect();if(!r.width)return;
      var base=r.bottom+cur,lim=line-8,need=base>lim?Math.ceil(base-lim):0;
      if(need!==cur){if(need)e.style.setProperty('--qlift',need);else e.style.removeProperty('--qlift')}
    });
  }
  function q(){if(!raf)raf=requestAnimationFrame(run)}
  addEventListener('scroll',q,{passive:true});addEventListener('resize',q);
  addEventListener('load',q);setInterval(q,1000);q();
})();
