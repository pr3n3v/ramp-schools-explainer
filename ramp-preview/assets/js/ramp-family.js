// Ramp family behaviour: the VI | EN switch (remembered on this device), 3D tilt under a fine pointer, scroll reveal.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* language */
  let lang = 'vi';
  try { const s = localStorage.getItem('ramp-lang'); if (s === 'en' || s === 'vi') lang = s; } catch (e) { /* storage blocked: stay on vi */ }
  const setLang = (l) => {
    lang = l;
    root.dataset.lang = l;
    root.lang = l;
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.set === l)));
    const t = document.querySelector('meta[name="title-' + l + '"]');
    if (t) document.title = t.content;
    try { localStorage.setItem('ramp-lang', l); } catch (e) { /* not remembered, still switched */ }
  };
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.set)));
  setLang(lang);

  /* tilt: pointer position to --rx/--ry and the glare */
  const MAX = 8;
  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (RM.matches || !fine.matches || e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('tilting');
      el.style.setProperty('--ry', ((x - 0.5) * 2 * MAX).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 2 * MAX).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  /* reveal on scroll */
  const items = document.querySelectorAll('.reveal');
  if (RM.matches || !('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach((i) => io.observe(i));
})();
