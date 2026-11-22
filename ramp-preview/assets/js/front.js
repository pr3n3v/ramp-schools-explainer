// Front page: the nav stays sun while the sun band is under it; a product under the pointer or focus lights its way on the road.
(() => {
  const d = document;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  const nav = d.getElementById('nav'), hero = d.getElementById('top');
  if (nav && hero) {
    let pend = false;
    const set = () => { pend = false; nav.classList.toggle('top', scrollY < hero.offsetHeight - 70); };
    addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(set); } }, { passive: true });
    addEventListener('resize', set);
    set();
  }

  const body = d.body;
  d.querySelectorAll('[data-way]').forEach((el) => {
    const on = () => { body.dataset.way = el.dataset.way; };
    const off = () => { delete body.dataset.way; };
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') on(); });
    el.addEventListener('pointerleave', off);
    el.addEventListener('focus', on);
    el.addEventListener('blur', off);
  });

  // the facts arrive one after another
  d.querySelectorAll('.fl > .reveal').forEach((el) => {
    const i = [...el.parentElement.children].indexOf(el);
    if (i > 0) el.style.transitionDelay = i * 90 + 'ms';
  });

  // the hero pills lean toward the pointer, as on the explainer
  if (fine.matches) d.querySelectorAll('.pillars a').forEach((m) => {
    m.addEventListener('pointermove', (e) => {
      if (RM.matches) return;
      const r = m.getBoundingClientRect();
      m.style.translate = ((e.clientX - r.left - r.width / 2) / r.width * 8).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) / r.height * 6 - 2).toFixed(1) + 'px';
    });
    m.addEventListener('pointerleave', () => { m.style.translate = ''; });
  });
})();
