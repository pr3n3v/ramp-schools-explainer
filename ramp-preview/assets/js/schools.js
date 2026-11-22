// Ramp Schools landing: nav and its trail road, teacher steps, Giúp's Chỉ cho mình shown on this page,
// and alt text that follows the VI | EN switch. Every query is guarded; with no JS the page reads in order.
(() => {
  'use strict';
  const d = document, root = d.documentElement, body = d.body;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isEn = () => root.dataset.lang === 'en';

  $$('[data-js]').forEach((el) => { el.hidden = false; });

  /* alt text and labels follow the page language */
  const swap = () => {
    const en = isEn();
    $$('[data-alt-en]').forEach((el) => {
      if (el.dataset.altVi === undefined) el.dataset.altVi = el.getAttribute('alt') || '';
      el.setAttribute('alt', en ? el.dataset.altEn : el.dataset.altVi);
    });
    $$('[data-label-en]').forEach((el) => {
      if (el.dataset.labelVi === undefined) el.dataset.labelVi = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', en ? el.dataset.labelEn : el.dataset.labelVi);
    });
  };
  swap();
  new MutationObserver(swap).observe(root, { attributes: true, attributeFilter: ['data-lang'] });

  /* nav: menu on narrow screens, jade over the hero, the trail road */
  const nav = $('#nav'), menu = $('#menu'), menuBtn = $('.menu-btn'), hero = $('#top');
  if (nav && menu && menuBtn) {
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
  }

  const road = $('.trail-road'), mask = $('.trail-mask'), pin = $('.trail-pin');
  const stops = $$('.trail .stop').map((a) => ({ a, sec: $(a.getAttribute('href')), f: 0 })).filter((s) => s.sec);
  let maxS = 1, x0 = 0, tw = 1, heroH = 600, ticking = false;
  const tick = () => {
    ticking = false;
    const y = scrollY, p = clamp(y / maxS, 0, 1);
    if (mask) mask.style.transform = 'translateX(' + (p * 100).toFixed(2) + '%)';
    if (pin) {
      pin.style.translate = (x0 + p * tw).toFixed(1) + 'px 0';
      pin.className = 'trail-pin' + (p > 0.66 ? ' g' : p > 0.33 ? ' s' : '');
    }
    stops.forEach((s) => s.a.classList.toggle('on', p >= s.f - 0.002));
    if (nav) {
      const top = y < heroH - 90;
      nav.classList.toggle('top', top);
      nav.classList.toggle('on-dark', top);
    }
  };
  const layout = () => {
    maxS = Math.max(1, root.scrollHeight - innerHeight);
    heroH = hero ? hero.offsetHeight : 600;
    if (road) { x0 = road.offsetLeft; tw = road.offsetWidth; }
    stops.forEach((s, i) => {
      s.f = i === stops.length - 1 ? 1 : clamp((s.sec.offsetTop - 90) / maxS, 0, 1);
      s.a.style.left = (x0 + s.f * tw) + 'px';
    });
    tick();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  let rz = 0;
  const relayout = () => { clearTimeout(rz); rz = setTimeout(layout, 120); };
  addEventListener('resize', relayout);
  addEventListener('load', layout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(body);
  layout();

  // the section in the middle of the screen marks its nav link
  const links = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && links.length) {
    const secIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const h = '#' + e.target.id;
        links.forEach((l) => (l.getAttribute('href') === h ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section').forEach((s) => secIO.observe(s));
  }

  /* the close band draws its road when it comes into view */
  const close = $('#close');
  if (close) {
    if (RM.matches || !('IntersectionObserver' in window)) close.classList.add('in');
    else {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { close.classList.add('in'); io.disconnect(); } }), { rootMargin: '0px 0px -20% 0px' });
      io.observe(close);
    }
  }

  /* teachers: three steps, one picture at a time */
  const tbtns = $$('.tbtn');
  const showStep = (b) => {
    tbtns.forEach((x) => {
      const on = x === b;
      x.setAttribute('aria-pressed', String(on));
      const p = d.getElementById(x.getAttribute('aria-controls'));
      if (p) p.toggleAttribute('data-off', !on);
    });
  };
  tbtns.forEach((b) => b.addEventListener('click', () => showStep(b)));
  if (tbtns.length) showStep(tbtns[0]);

  /* Giúp, shown on this page: Chỉ cho mình rings a real button */
  const gbtn = $('#gdemo');
  if (gbtn) {
    const steps = [
      { el: () => $('.nav .lang'), vi: 'Trên trang này: đổi ngôn ngữ của trang giữa tiếng Việt và tiếng Anh.', en: 'On this page: switch the page between Vietnamese and English.' },
      { el: () => $('#walk'), vi: 'Trên trang này: hẹn xem Ramp cùng nhóm Ramp.', en: 'On this page: ask the Ramp team for a walk-through.' },
    ];
    const ringEl = d.createElement('div'); ringEl.className = 'gd-ring'; ringEl.hidden = true;
    const card = d.createElement('div'); card.className = 'gd-card'; card.hidden = true;
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Chỉ cho mình, Show me');
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
      $('.gd-l', card).textContent = isEn() ? steps[i].en : steps[i].vi;
      $('.gd-s', card).textContent = 'Bước ' + (i + 1) + ' trên ' + steps.length + ' · Step ' + (i + 1) + ' of ' + steps.length;
      body.classList.add('gd-on'); ringEl.hidden = false; card.hidden = false;
      const r = tgt.getBoundingClientRect();
      if (r.top < 80 || r.bottom > innerHeight - 20) tgt.scrollIntoView({ block: 'center', inline: 'nearest', behavior: RM.matches ? 'auto' : 'smooth' });
      place(); setTimeout(place, RM.matches ? 0 : 500);
      const f = tgt.matches('a, button') ? tgt : $('button, a', tgt);
      if (f) f.focus({ preventScroll: true });
    };
    gbtn.addEventListener('click', () => { addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); go(0); });
    $('.gd-stop', card).addEventListener('click', stop);
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && gi > -1) stop(); });
    d.addEventListener('pointerdown', (e) => { if (gi > -1 && !card.contains(e.target) && !(tgt && tgt.contains(e.target))) stop(); }, true);
  }

  /* small delight: the main buttons lean toward a mouse */
  if (fine.matches) $$('.magnetic').forEach((m) => {
    m.addEventListener('pointermove', (e) => {
      if (RM.matches) return;
      const r = m.getBoundingClientRect();
      m.style.translate = ((e.clientX - r.left - r.width / 2) / r.width * 12).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) / r.height * 10).toFixed(1) + 'px';
    });
    m.addEventListener('pointerleave', () => { m.style.translate = ''; });
  });
})();
