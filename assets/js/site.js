// Ramp Schools site. Every interaction enhances content already on the page; with no JS, all of it reads in order.
(() => {
  'use strict';
  const d = document, body = d.body, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = RM.matches;
  RM.addEventListener && RM.addEventListener('change', (e) => { reduce = e.matches; });
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const phone = () => innerWidth < 760;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const CH = { live: 'Live', built: 'Built', coming: 'Coming' };

  // JS-only controls appear once the script runs.
  $$('.menu-btn, .cycle-btn, .segs, .road-stops, .flip-btn, .mplay, .kctl, .scrub, .chat-ctl, .ring-btns, .ipa-hint, .gdemo, .tap-hint, .mq, .mpick').forEach((el) => { el.hidden = false; });
  $$('.mcard .before').forEach((el) => { el.hidden = true; });

  /* ---------- reveal on scroll: one observer, once ---------- */
  const onSeen = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      const fn = onSeen.get(e.target);
      if (fn) fn(e.target);
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  const seen = (el, fn) => { if (!el) return; onSeen.set(el, fn); io.observe(el); };
  $$('.reveal').forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* ---------- play-once demos: run only after the reader stops on them, reset if they leave early, re-arm once gone ---------- */
  const demos = new Map();
  const dio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const D = demos.get(e.target);
      if (!D || D.touched) continue;
      const enough = e.isIntersecting && (e.intersectionRatio >= D.ratio || e.intersectionRect.height >= innerHeight * 0.55);
      if (enough) {
        if (D.state === 'idle' && !D.timer) D.timer = setTimeout(() => {
          D.timer = 0; D.state = 'playing';
          Promise.resolve(D.start(D)).then(() => { if (D.state === 'playing') D.state = 'done'; });
        }, D.dwell);
      } else {
        if (D.timer) { clearTimeout(D.timer); D.timer = 0; }
        if (D.state === 'playing' || (D.state === 'done' && !e.isIntersecting)) { D.run++; D.reset(D); D.state = 'idle'; }
      }
    }
  }, { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] });
  const demo = (el, o) => {
    const D = { start: o.start, reset: o.reset || (() => {}), dwell: o.dwell || 450, ratio: o.ratio || 0.5, state: 'idle', timer: 0, touched: false, run: 0 };
    D.touch = () => { D.touched = true; D.run++; if (D.timer) { clearTimeout(D.timer); D.timer = 0; } D.state = 'done'; };
    if (el && !reduce) { demos.set(el, D); dio.observe(el); }
    return D;
  };

  /* ---------- nav: menu, the trail road, long jumps ---------- */
  const nav = $('#nav'), menu = $('#menu'), menuBtn = $('.menu-btn'), hero = $('#top');
  const setMenu = (open, focus) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    if (!open && focus) menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('click', (e) => { if (menu.classList.contains('open') && !menu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false, true); });

  // Jumps longer than three screens skip the smooth scroll, so the demos in between are not used up on the way.
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const t = id.length > 1 && d.getElementById(id.slice(1));
    if (!t) return;
    if (reduce || Math.abs(t.getBoundingClientRect().top) > innerHeight * 3) {
      root.style.scrollBehavior = 'auto';
      setTimeout(() => { root.style.scrollBehavior = ''; }, 80);
    }
    if (a.dataset.open) { const b = $('[data-for="' + a.dataset.open + '"]'); if (b) b.click(); }
  });

  const road = $('.trail-road'), mask = $('.trail-mask'), pin = $('.trail-pin');
  const stops = $$('.trail .stop').map((a) => ({ a, sec: $(a.getAttribute('href')), f: 0 }));
  let maxS = 1, x0 = 0, tw = 1, heroH = 600;
  const layout = () => {
    maxS = Math.max(1, root.scrollHeight - innerHeight);
    x0 = road.offsetLeft; tw = road.offsetWidth; heroH = hero.offsetHeight;
    stops.forEach((s, i) => {
      s.f = i === stops.length - 1 ? 1 : clamp((s.sec.offsetTop - 90) / maxS, 0, 1);
      s.a.style.left = (x0 + s.f * tw) + 'px';
    });
    tick();
  };
  let ticking = false;
  const tick = () => {
    ticking = false;
    const y = scrollY, p = clamp(y / maxS, 0, 1);
    mask.style.transform = 'translateX(' + (p * 100).toFixed(2) + '%)';
    pin.style.translate = (x0 + p * tw).toFixed(1) + 'px 0';
    pin.className = 'trail-pin' + (p > 0.66 ? ' g' : p > 0.33 ? ' s' : '');
    stops.forEach((s) => s.a.classList.toggle('on', p >= s.f - 0.002));
    nav.classList.toggle('top', y < heroH - 90);
    heroScroll(y);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  let rz = 0;
  const relayout = () => { clearTimeout(rz); rz = setTimeout(layout, 120); };
  addEventListener('resize', relayout);
  addEventListener('load', layout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(body);

  // the section in the middle of the screen marks its nav link
  const navMap = { minute: '#minute', different: '#different', english: '#english', grammar: '#english', sounds: '#english', kept: '#english', subjects: '#subjects', teachers: '#teachers', giup: '#giup', safety: '#safety', parents: '#parents' };
  const links = $$('.nav-links a');
  const secIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const h = navMap[e.target.id];
      links.forEach((l) => (l.getAttribute('href') === h ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach((s) => secIO.observe(s));

  /* ---------- hero: tilt, the screen cycle, and a tap-through of real screens ---------- */
  const stage = $('#stage');
  let tiltOn = !reduce;
  if (fine) {
    let px = 0, py = 0, pend = false;
    const apply = () => { pend = false; stage.style.setProperty('--px', px.toFixed(3)); stage.style.setProperty('--py', py.toFixed(3)); };
    hero.addEventListener('pointermove', (e) => {
      if (reduce || !tiltOn) return;
      const r = stage.getBoundingClientRect();
      px = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.9), -1, 1);
      py = clamp((e.clientY - (r.top + r.height / 3)) / (innerHeight * 0.6), -1, 1);
      if (!pend) { pend = true; requestAnimationFrame(apply); }
    });
    hero.addEventListener('pointerleave', () => { px = 0; py = 0; requestAnimationFrame(apply); });
  }
  function heroScroll(y) {
    if (fine || reduce || y > heroH) return;
    const p = y / heroH;
    stage.style.setProperty('--px', (p * 0.9).toFixed(3));
    stage.style.setProperty('--py', (-p * 1.2).toFixed(3));
  }

  const cyc = $('#cycle'), scr = $('.scr', cyc), imgs = $$('img', scr), cap = $('.cc-t'), chip = $('.cycle-cap .st'), cbtn = $('.cycle-btn');
  const tapEnd = $('.tap-end', cyc), tapHint = $('.tap-hint');
  const byId = {}; imgs.forEach((i) => { byId[i.dataset.id] = i; });
  const loopImgs = imgs.filter((i) => !('solo' in i.dataset));
  const hot = d.createElement('button');
  hot.type = 'button'; hot.className = 'tap-hot'; scr.appendChild(hot);
  let curImg = imgs.find((i) => i.classList.contains('on')), ctimer = 0, userPaused = reduce, hoverPaused = false, offscreen = false, tapMode = false;
  const showScreen = (img) => {
    if (curImg) curImg.classList.remove('on');
    curImg = img; img.classList.add('on'); img.loading = 'eager';
    cap.textContent = img.dataset.cap;
    chip.className = 'st ' + img.dataset.st; chip.textContent = CH[img.dataset.st];
    const h = img.dataset.hot;
    hot.hidden = !h;
    if (h) {
      const [l, t, w, hh] = h.split(' ');
      Object.assign(hot.style, { left: l + '%', top: t + '%', width: w + '%', height: hh + '%' });
      hot.setAttribute('aria-label', 'Press ' + img.dataset.tip + ' on this screen');
    }
    tapHint.textContent = h ? 'Try it: press ' + img.dataset.tip + ' on the phone.' : '';
  };
  const runCycle = () => {
    clearInterval(ctimer); ctimer = 0;
    const paused = userPaused || tapMode || hoverPaused || offscreen || d.hidden;
    cbtn.setAttribute('aria-pressed', String(userPaused || tapMode));
    cbtn.setAttribute('aria-label', userPaused || tapMode ? 'Play the screens' : 'Pause the screens');
    if (!paused) ctimer = setInterval(() => {
      const i = loopImgs.indexOf(curImg);
      showScreen(loopImgs[(i + 1) % loopImgs.length]);
    }, 3400);
  };
  hot.addEventListener('click', () => {
    tapMode = true; runCycle();
    const go = curImg.dataset.go;
    if (go === 'end') { tapEnd.hidden = false; hot.hidden = true; $('a', tapEnd).focus({ preventScroll: true }); tapHint.textContent = 'That is the practice. Start again, or see how a word is kept.'; }
    else showScreen(byId[go]);
  });
  $('.tap-again', tapEnd).addEventListener('click', () => { tapEnd.hidden = true; showScreen(byId.home); hot.focus({ preventScroll: true }); });
  cbtn.addEventListener('click', () => {
    if (userPaused || tapMode) { userPaused = false; tapMode = false; tapEnd.hidden = true; showScreen(byId.word); }
    else userPaused = true;
    runCycle();
  });
  stage.addEventListener('pointerenter', () => { if (fine) { hoverPaused = true; runCycle(); } });
  stage.addEventListener('pointerleave', () => { if (fine) { hoverPaused = false; runCycle(); } });
  stage.addEventListener('focusin', () => { hoverPaused = true; runCycle(); });
  stage.addEventListener('focusout', () => { hoverPaused = false; runCycle(); });
  d.addEventListener('visibilitychange', runCycle);
  new IntersectionObserver(([e]) => { offscreen = !e.isIntersecting; tiltOn = e.isIntersecting && !reduce; runCycle(); }).observe(stage);
  showScreen(curImg);

  /* ---------- switches: See it as, road levels, grammar map, lesson lists, teacher loop, risk, start steps ---------- */
  $$('[data-switch]').forEach((box) => {
    const btns = $$('[data-for]', box), panels = $$('[data-panel]', box);
    const show = (id, focus) => {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.for === id)));
      panels.forEach((p) => (p.id === id ? p.removeAttribute('data-off') : p.setAttribute('data-off', '')));
      const i = btns.findIndex((b) => b.dataset.for === id);
      if (box.id === 'loop') $('.ring-arc', box).style.strokeDasharray = (i + 1) * 20 + ' 100';
      box.dataset.on = id;
      if (focus) btns[i].focus();
    };
    box._show = show;
    btns.forEach((b, i) => {
      b.addEventListener('click', () => { show(b.dataset.for); if (box._demo) box._demo.touch(); });
      b.addEventListener('keydown', (e) => {
        const k = e.key, n = btns.length;
        const j = k === 'ArrowRight' || k === 'ArrowDown' ? (i + 1) % n : k === 'ArrowLeft' || k === 'ArrowUp' ? (i - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
        if (j < 0) return;
        e.preventDefault(); show(btns[j].dataset.for, true); if (box._demo) box._demo.touch();
      });
    });
    show(btns[0].dataset.for);
  });

  // the teacher loop goes round once by itself when the reader stops on it
  const loop = $('#loop');
  if (loop) {
    const ids = $$('[data-for]', loop).map((b) => b.dataset.for);
    loop._demo = demo(loop, {
      dwell: 700,
      start: async (D) => {
        const me = D.run;
        for (let i = 1; i < ids.length; i++) { await wait(2200); if (me !== D.run) return; loop._show(ids[i]); }
      },
      reset: () => loop._show(ids[0]),
    });
    // only a real hand on it stops the round: a pointer that actually moves, a press, or focus
    loop.addEventListener('pointermove', (e) => { if (e.movementX || e.movementY) loop._demo.touch(); });
    ['pointerdown', 'focusin'].forEach((ev) => loop.addEventListener(ev, () => loop._demo.touch()));
  }

  /* ---------- the status legend is a filter ---------- */
  const fbtns = $$('.lg-btn'), pill = $('#fpill'), pillT = $('#fpill-t');
  const setFilter = (f) => {
    if (f) body.dataset.filter = f; else delete body.dataset.filter;
    fbtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    pill.hidden = !f;
    if (f) pillT.textContent = CH[f];
  };
  fbtns.forEach((b) => b.addEventListener('click', () => setFilter(body.dataset.filter === b.dataset.filter ? null : b.dataset.filter)));
  $('#fpill-x').addEventListener('click', () => setFilter(null));

  /* ---------- How Ramp is different: each card flips once it has been read for a second ---------- */
  $$('.flip').forEach((f) => {
    const b = $('.flip-btn', f);
    const set = (on) => { f.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); };
    const D = demo(f, { dwell: 1000, ratio: 0.6, start: () => set(true), reset: () => set(false) });
    b.addEventListener('click', () => { D.touch(); set(!f.classList.contains('on')); });
  });

  /* ---------- count-up product facts ---------- */
  $$('.count').forEach((el) => {
    const to = +el.dataset.to;
    seen(el, () => {
      if (reduce) return;
      const t0 = performance.now(), dur = 1300;
      const step = (t) => {
        const k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(2, -10 * k);
        el.textContent = String(Math.round(to * (k === 1 ? 1 : e)));
        if (k < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  });

  /* ---------- grammar playground: do each change yourself, or watch it ---------- */
  $$('.mcard').forEach((card) => {
    const btn = $('.mplay', card), lab = $('span', btn), morph = $('.morph', card), task = card.dataset.task;
    const say = d.createElement('p'); say.className = 'mhint'; say.setAttribute('aria-live', 'polite');
    (($('.mpick', card)) || morph).after(say);
    const done = morph.getAttribute('aria-label').split(' becomes ')[1];
    morph.removeAttribute('aria-label');
    const finish = (auto) => { card.classList.add('done'); lab.textContent = auto ? 'Try it yourself' : 'Again'; say.textContent = auto ? '' : 'Yes: ' + done + '.'; };
    const reset = () => {
      card.classList.add('snap');
      card.classList.remove('done', 'a-off', 'l-up');
      $$('.mpick button', card).forEach((b) => b.setAttribute('aria-pressed', 'false'));
      void card.offsetWidth; card.classList.remove('snap');
      lab.textContent = 'Show me'; say.textContent = '';
    };
    let check = () => {};
    if (task === 'cap') {
      const a = $('.m-a', card), f = $('.m-flip', card), rest = $('.m-rest', card);
      rest.removeAttribute('aria-hidden'); $('.up', f).setAttribute('aria-hidden', 'true'); $('.lo', f).setAttribute('aria-hidden', 'true');
      [...rest.childNodes].filter((n) => n.nodeType === 3).forEach((n) => { const sp = d.createElement('span'); sp.setAttribute('aria-hidden', 'true'); n.replaceWith(sp); sp.append(n); });
      a.removeAttribute('aria-hidden');
      [[a, 'Drop the a', 'a-off'], [f, 'Make the l a capital L', 'l-up']].forEach(([el, name, cls]) => {
        el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', name); el.classList.add('tapme');
        const go = () => {
          if (card.classList.contains('done')) return;
          D.touch();
          if (cls === 'a-off') card.style.setProperty('--aw', a.getBoundingClientRect().width + 'px');
          card.classList.add(cls); check();
        };
        el.addEventListener('click', go);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      check = () => { if (card.classList.contains('a-off') && card.classList.contains('l-up')) setTimeout(() => finish(false), 500); else say.textContent = card.classList.contains('a-off') ? 'Now the l.' : 'Now the a.'; };
    } else {
      $$('.mpick button', card).forEach((b) => {
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          if (card.classList.contains('done')) return;
          D.touch();
          if (b.dataset.end === card.dataset.right) { b.setAttribute('aria-pressed', 'true'); finish(false); }
          else say.textContent = 'Not this one. Try another ending.';
        });
      });
    }
    const solve = async (auto) => {
      if (task === 'cap') {
        card.style.setProperty('--aw', $('.m-a', card).getBoundingClientRect().width + 'px');
        card.classList.add('a-off'); await wait(reduce ? 0 : 450); card.classList.add('l-up'); await wait(reduce ? 0 : 500);
      } else {
        const r = $('.mpick [data-end="' + card.dataset.right + '"]', card); if (r) r.setAttribute('aria-pressed', 'true');
      }
      finish(auto);
    };
    btn.addEventListener('click', () => { D.touch(); if (card.classList.contains('done')) reset(); else solve(false); });
    const D = demo(card, { dwell: 600, start: () => solve(true), reset });
  });

  /* ---------- the 44 sounds ---------- */
  // every tile plays its example word (assets/audio/w/<word>.mp3, the app's own chart clip in its British teaching voice);
  // the nine vowels with data-clip can also be heard alone (Commons reference samples)
  const tiles = $$('#ipa button'), card = $('.ipa-card'), icK = $('#ic-k'), icS = $('#ic-s'), icW = $('#ic-w'), icN = $('#ic-note');
  const icP = $('#ic-play'), icPL = $('#ic-play span'), icA = $('#ic-alone');
  const CR = { ii: ['Denelson83', '3.0'], i: ['Denelson83', '3.0'], e: ['Peter Roach (User:RoachPeter)', '4.0'], ae: ['Peter Roach (User:RoachPeter)', '4.0'], aa: ['Denelson83', '3.0'], o: ['Peter Roach (User:RoachPeter)', '4.0'], oo: ['Peter Roach (User:RoachPeter)', '4.0'], u: ['Denelson83', '3.0'], uu: ['Denelson83', '3.0'] };
  const narrow = matchMedia('(max-width: 999px)');
  const audio = new Audio();
  audio.preload = 'none';
  const ext = audio.canPlayType('audio/mpeg') ? 'mp3' : 'ogg';
  let cur = null, on = null, seq = 0, noteWas = '';
  const quiet = () => { if (on) on.classList.remove('playing'); on = null; };
  audio.addEventListener('ended', quiet);
  audio.addEventListener('error', quiet);
  const play = (src) => {
    if (!cur) return;
    quiet();
    const id = ++seq, t = cur;   // a rejected play() only clears the marker if no newer play() started
    audio.src = src;
    void t.offsetWidth; t.classList.add('playing'); on = t;
    audio.play().catch(() => { if (id === seq) quiet(); });
  };
  const wordOf = (t) => $('i', t).textContent.trim();
  const playWord = () => cur && play('assets/audio/w/' + encodeURIComponent(wordOf(cur)) + '.mp3');
  const playAlone = () => cur && cur.dataset.clip && play('assets/audio/' + cur.dataset.clip + '.' + ext);
  const note = (c) => {
    const html = (narrow.matches
      ? 'British text-to-speech voice.' + (c ? ' Vowel alone: IPA sample by ' + c[0] + ', CC BY-SA ' + c[1] + ', Wikimedia Commons, close to the British vowel.' : '')
      : 'Said by a British text-to-speech voice from Ramp\'s sound lessons.' + (c ? ' Vowel alone: IPA sample by ' + c[0] + ', CC BY-SA ' + c[1] + ', Wikimedia Commons; close to the British vowel, not the same.' : ''))
      + ' <a href="credits.html">Credits</a>';
    if (html !== noteWas) { icN.innerHTML = html; noteWas = html; }   // only rewrite when it changes, so the live region stays quiet
  };
  // keep the chosen tile in view: below the sticky header, and above the card where it sticks to the bottom (phones)
  const navEl = $('#nav');
  const lift = (t) => {   // reading the rects forces layout, so the card's new height after pick() is already counted
    const r = t.getBoundingClientRect(), c = card.getBoundingClientRect();
    const under = getComputedStyle(card).position === 'sticky' && r.right > c.left && r.left < c.right;
    const bottom = (under ? Math.min(c.top, innerHeight) : innerHeight) - 12, top = (navEl ? navEl.getBoundingClientRect().bottom : 0) + 12;
    const dy = r.bottom > bottom ? r.bottom - bottom : r.top < top ? r.top - top : 0;
    if (dy) scrollBy({ top: dy, behavior: reduce ? 'auto' : 'smooth' });
  };
  const pick = (t, sound) => {
    tiles.forEach((x) => { x.setAttribute('aria-pressed', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
    cur = t;
    const w = wordOf(t), c = CR[t.dataset.clip];
    icK.textContent = t.dataset.k;
    icS.textContent = $('b', t).textContent;
    icW.textContent = w;
    icPL.textContent = 'Hear ' + w;
    icP.hidden = false;
    icA.hidden = !c;
    note(c);
    if (sound) playWord();
  };
  tiles.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', () => { pick(t, true); lift(t); });
    t.addEventListener('keydown', (e) => {
      const k = e.key, n = tiles.length;
      const j = k === 'ArrowRight' || k === 'ArrowDown' ? (i + 1) % n : k === 'ArrowLeft' || k === 'ArrowUp' ? (i - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (j < 0) return;
      e.preventDefault(); tiles[j].focus({ preventScroll: true }); pick(tiles[j], false); lift(tiles[j]);
    });
  });
  icP.addEventListener('click', playWord);
  icA.addEventListener('click', playAlone);
  narrow.addEventListener && narrow.addEventListener('change', () => cur && note(CR[cur.dataset.clip]));
  pick(tiles[0], false);

  /* ---------- a word counts only when it is kept ---------- */
  const kp = $('#keptplay'), ks = $$('#ksteps li'), kmsg = $('#kmsg'), kclock = $('#kclock'), kdots = $$('.kdots i');
  const kNext = $('#k-next'), kPeek = $('#k-peek'), kMiss = $('#k-miss');
  const KS = [
    { clock: 'Today', msg: 'Met today. The first recall waits at least 20 hours, about a day.', next: 'Recall it a day later' },
    { clock: 'A day later', msg: 'Recalled a day later from its picture. Now about a week passes, with no peek in between.', next: 'Recall it a week later' },
    { clock: 'About a week later', msg: 'Recalled again, with no first-letter help. Kept: Đã giữ được một tuần, kept for a week.', next: 'Start again' },
  ];
  let kpos = 0;
  const kset = (n, msg, clockNote) => {
    kpos = n;
    ks.forEach((li, i) => { li.classList.toggle('done', i <= n); li.classList.toggle('cur', i === n + 1 && n < 2); });
    kdots.forEach((dot, i) => dot.classList.toggle('on', i <= n || n === 2));
    kp.classList.toggle('kept', n === 2);
    kmsg.textContent = msg || KS[n].msg;
    kclock.textContent = KS[n].clock + (clockNote ? ' · ' + clockNote : '');
    kclock.parentElement.classList.remove('snap'); void kclock.offsetWidth;
    if (clockNote) kclock.parentElement.classList.add('snap');
    $('span', kNext).textContent = KS[n].next;
    kPeek.disabled = n === 2; kMiss.disabled = n === 2;
  };
  kNext.addEventListener('click', () => kset(kpos === 2 ? 0 : kpos + 1, kpos === 2 ? 'A new word. ' + KS[0].msg : null));
  kPeek.addEventListener('click', () => kset(kpos, kpos === 0 ? 'You looked again, so the recall moves back about a day.' : 'You looked again, so Ramp counts a week again before it is kept.', 'the wait starts again'));
  kMiss.addEventListener('click', () => kset(0, kpos === 0 ? 'Missed. The word stays in learning and comes back the next day.' : 'A missed recall sends the word back to learning.', 'back to learning'));
  kset(0, 'Try it: taxi was met today. Walk it to kept.');

  /* ---------- the whole return ladder ---------- */
  const gapR = $('#gap-r'), gapO = $('#gap-o'), arcs = $$('#gaps .arcs path'), lbls = $$('#gaps .lbls text'), ball = $('#gaps .hop-ball'), gchips = $$('#gaps .gapchips li');
  const GX = [20, 78, 148, 234, 340, 476, 650];
  const GT = [
    'Gap 1 of 6: 1 day from meeting the word to its first recall.',
    'Gap 2 of 6: about 6 days to the second recall. Pass it and the word is kept.',
    'Gap 3 of 6: 14 days after it was kept, it comes back.',
    'Gap 4 of 6: then 30 days.',
    'Gap 5 of 6: then 60 days.',
    'Gap 6 of 6: then 120 days, and every 120 days after that.',
  ];
  const gset = (v) => {
    gapR.value = v;
    arcs.forEach((a, i) => { a.classList.toggle('on', i < v); a.classList.toggle('cur', i === v - 1); });
    lbls.forEach((l, i) => l.classList.toggle('cur', i === v - 1));
    gchips.forEach((c, i) => { c.classList.toggle('cur', i === v - 1); const b = $('button', c); if (b) b.setAttribute('aria-pressed', String(i === v - 1)); });
    ball.setAttribute('transform', 'translate(' + GX[v] + ' 112)');
    gapO.textContent = GT[v - 1]; gapR.setAttribute('aria-valuetext', GT[v - 1]);
  };
  gchips.forEach((c, i) => {
    const b = d.createElement('button'); b.type = 'button'; b.textContent = c.textContent; c.textContent = ''; c.append(b);
    b.addEventListener('click', () => { gD.touch(); gset(i + 1); });
  });
  gapR.addEventListener('input', () => { gD.touch(); gset(+gapR.value); });
  ball.setAttribute('transform', 'translate(20 112)');
  gset(1);
  const gD = demo($('#gaps'), {
    dwell: 500,
    start: async (D) => { const me = D.run; for (let v = 2; v <= 6; v++) { await wait(620); if (me !== D.run) return; gset(v); } },
    reset: () => gset(1),
  });

  /* ---------- the Guide me chat, two ways it can go ---------- */
  const chat = $('#chat .chat'), msgs = $('#msgs'), items = $$('li', msgs), stuckc = $('#stuckc'), cplay = $('#chat-play'), pathBtns = $$('[data-path]', chat);
  let path = 'stuck', crun = 0;
  const inPath = (li) => !li.dataset.p || li.dataset.p === path;
  const staticChat = () => {
    crun++;
    chat.classList.remove('armed');
    items.forEach((li) => { li.hidden = !inPath(li); li.classList.add('shown'); });
    stuckc.textContent = path === 'stuck' ? 'Stuck replies: 3 of 3' : 'Worked it out';
    stuckc.classList.toggle('full', path === 'stuck');
    $('span', cplay).textContent = 'Play the chat';
  };
  const toBottom = () => { msgs.scrollTo({ top: msgs.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }); };
  const playChat = async () => {
    const me = ++crun;
    chat.classList.add('armed');
    items.forEach((li) => { li.hidden = !inPath(li); li.classList.remove('shown'); });
    msgs.scrollTop = 0;
    let stuck = 0;
    stuckc.textContent = path === 'stuck' ? 'Stuck replies: 0 of 3' : 'Thinking it through'; stuckc.classList.remove('full');
    for (const li of items) {
      if (!inPath(li)) continue;
      if (me !== crun) return;
      if (li.classList.contains('rp') && !reduce) {
        const ty = d.createElement('li'); ty.className = 'typing'; ty.setAttribute('aria-hidden', 'true'); ty.innerHTML = '<i></i><i></i><i></i>';
        msgs.insertBefore(ty, li); toBottom(); await wait(800); ty.remove();
        if (me !== crun) return;
      } else await wait(reduce ? 0 : 650);
      li.classList.add('shown'); toBottom();
      if (li.classList.contains('stuck')) { stuck++; stuckc.textContent = 'Stuck replies: ' + stuck + ' of 3'; stuckc.classList.toggle('full', stuck === 3); }
      if (li.classList.contains('win')) stuckc.textContent = 'Worked it out';
    }
    $('span', cplay).textContent = 'Play again';
  };
  const cD = demo(chat, { dwell: 500, start: playChat, reset: staticChat });
  cplay.addEventListener('click', () => { cD.touch(); playChat(); });
  pathBtns.forEach((b) => b.addEventListener('click', () => {
    path = b.dataset.path;
    pathBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cD.touch(); playChat();
  }));
  staticChat();

  /* ---------- the safety pipeline: one message travels once ---------- */
  const pipe = $('#pipe');
  demo(pipe, { dwell: 400, start: () => pipe.classList.add('go'), reset: () => pipe.classList.remove('go') });

  /* ---------- hotspots on real screens ---------- */
  $$('[data-hs]').forEach((fig) => {
    const dots = $$('.hs-dot', fig);
    const list = fig.nextElementSibling && fig.nextElementSibling.classList.contains('hs-notes') ? fig.nextElementSibling : fig.parentElement.querySelector('.hs-notes');
    const notes = list ? $$('li', list) : [];
    const bub = d.createElement('div'); bub.className = 'hs-bub'; bub.setAttribute('role', 'status'); fig.appendChild(bub);
    dots.forEach((dot, i) => dot.setAttribute('aria-label', 'Note ' + (i + 1) + ': ' + (notes[i] ? notes[i].textContent : '')));
    const close = () => { dots.forEach((x) => x.setAttribute('aria-expanded', 'false')); notes.forEach((n) => n.classList.remove('on')); bub.classList.remove('on'); };
    dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dot.getAttribute('aria-expanded') !== 'true';
      close();
      if (!open) return;
      dot.setAttribute('aria-expanded', 'true');
      if (notes[i]) notes[i].classList.add('on');
      bub.textContent = notes[i] ? notes[i].textContent : '';
      // the bubble sits in the half away from the dot, so it never covers what the dot points at
      bub.classList.toggle('low', parseFloat(dot.style.top) < 50);
      bub.classList.add('on');
    }));
    d.addEventListener('click', (e) => { if (!fig.contains(e.target)) close(); });
    fig.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    seen(fig, () => fig.classList.add('seen'));
  });

  /* ---------- tap to enlarge desktop screens ---------- */
  const dlg = d.createElement('dialog'); dlg.className = 'zoom-dlg'; dlg.setAttribute('aria-label', 'Enlarged screen');
  dlg.innerHTML = '<button type="button" class="zx">Close</button><div class="zimgs"></div>';
  body.appendChild(dlg);
  $('.zx', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $$('[data-zoom]').forEach((fig) => {
    const b = d.createElement('button'); b.type = 'button'; b.className = 'zoom-btn'; b.textContent = 'Tap to enlarge';
    fig.appendChild(b);
    const open = () => {
      const box = $('.zimgs', dlg); box.textContent = '';
      $$('img', fig).forEach((im) => { const c = new Image(); c.src = im.currentSrc || im.src; c.alt = im.alt; box.append(c); });
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    };
    b.addEventListener('click', open);
    $$('img', fig).forEach((im) => im.addEventListener('click', open));
  });

  /* ---------- Giúp, shown on this page: Chỉ cho mình rings a real button ---------- */
  const gbtn = $('#gdemo');
  if (gbtn) {
    const steps = [
      { el: () => $('#giup .ring-ph .hs-dot'), line: 'On this page: open the first note on the Show me screen.' },
      { el: () => $('.nav-pdf'), line: 'On this page: take the explainer with you as a PDF.' },
    ];
    const ringEl = d.createElement('div'); ringEl.className = 'gd-ring'; ringEl.hidden = true;
    const card = d.createElement('div'); card.className = 'gd-card'; card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Chỉ cho mình, Show me');
    card.innerHTML = '<p class="gd-h"><b>Bấm vào đây</b><span class="en">Press here</span></p><p class="gd-l"></p><p class="gd-s"></p><button type="button" class="gd-stop">Thôi<span class="en">Stop</span></button>';
    body.append(ringEl, card);
    let gi = -1, tgt = null, raf = 0;
    const place = () => {
      raf = 0;
      if (!tgt) return;
      const r = tgt.getBoundingClientRect(), pad = 6;
      Object.assign(ringEl.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
      const cw = Math.min(300, innerWidth - 32), below = r.bottom + 16 + 170 < innerHeight;
      card.style.width = cw + 'px';
      card.style.left = clamp(r.left + r.width / 2 - cw / 2, 16, innerWidth - cw - 16) + 'px';
      card.style.top = (below ? r.bottom + 16 : Math.max(16, r.top - 16 - card.offsetHeight)) + 'px';
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(place); };
    const onTarget = () => { const i = gi; setTimeout(() => { if (gi === i) go(i + 1); }, 700); };
    const stop = () => {
      if (tgt) tgt.removeEventListener('click', onTarget);
      gi = -1; tgt = null; ringEl.hidden = true; card.hidden = true; body.classList.remove('gd-on');
      removeEventListener('scroll', req); removeEventListener('resize', req);
      gbtn.focus({ preventScroll: true });
    };
    const go = (i) => {
      if (tgt) tgt.removeEventListener('click', onTarget);
      if (i >= steps.length) return stop();
      gi = i; tgt = steps[i].el();
      if (!tgt) return stop();
      tgt.addEventListener('click', onTarget);
      $('.gd-l', card).textContent = steps[i].line;
      $('.gd-s', card).textContent = 'Bước ' + (i + 1) + ' trên ' + steps.length + ' · Step ' + (i + 1) + ' of ' + steps.length;
      body.classList.add('gd-on'); ringEl.hidden = false; card.hidden = false;
      if (i === 0) tgt.scrollIntoView({ block: 'center', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      place(); setTimeout(place, reduce ? 0 : 450);
      tgt.focus({ preventScroll: true });
    };
    gbtn.addEventListener('click', () => { addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); go(0); });
    $('.gd-stop', card).addEventListener('click', stop);
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && gi > -1) stop(); });
    d.addEventListener('pointerdown', (e) => { if (gi > -1 && !card.contains(e.target) && !(tgt && tgt.contains(e.target))) stop(); }, true);
  }

  /* ---------- disclosure rows start folded on phones ---------- */
  if (phone()) $$('details.df, details.role, details.bwys').forEach((x) => { x.open = false; });

  /* ---------- small delights ---------- */
  if (fine) $$('.magnetic').forEach((m) => {
    m.addEventListener('pointermove', (e) => {
      if (reduce) return;
      const r = m.getBoundingClientRect();
      m.style.translate = ((e.clientX - r.left - r.width / 2) / r.width * 12).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) / r.height * 10).toFixed(1) + 'px';
    });
    m.addEventListener('pointerleave', () => { m.style.translate = ''; });
  });
  seen($('#close'), () => {});

  layout();
  runCycle();
})();
