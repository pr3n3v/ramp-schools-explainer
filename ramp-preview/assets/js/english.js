// Ramp English landing: nav colours and trail, the 44 sounds, the kept walk and the three-word try.
// Every part checks its own elements first, so a missing piece never stops the rest.
(() => {
  'use strict';
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const bi = (vi, en) => '<span data-l="vi" lang="vi">' + vi + '</span><span data-l="en" lang="en">' + en + '</span>';
  const lang = () => (root.dataset.lang === 'en' ? 'en' : 'vi');

  // Where Đăng ký and Đăng nhập go once the app has a public address. Empty: they stay on this page.
  const APP = { signup: '', login: '' };
  $$('[data-app]').forEach((a) => { const u = APP[a.dataset.app]; if (u) a.href = u; });

  $$('[data-js]').forEach((el) => { el.hidden = false; });

  /* alt text and labels follow the VI | EN switch */
  const sync = () => {
    const k = lang() === 'en' ? 'En' : 'Vi';
    $$('[data-alt-vi]').forEach((el) => { el.alt = el.dataset['alt' + k]; });
    $$('[data-aria-vi]').forEach((el) => el.setAttribute('aria-label', el.dataset['aria' + k]));
  };
  sync();
  if ('MutationObserver' in window) new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-lang'] });

  /* nav: hero colours while the hero is under it; the seven-step trail fills as the page scrolls */
  const nav = $('#nav'), hero = $('#top'), fill = $('.etrail i');
  if (nav) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const onHero = hero ? hero.getBoundingClientRect().bottom > nav.offsetHeight : false;
      nav.classList.toggle('top', onHero);
      nav.classList.toggle('on-dark', onHero);
      if (fill) {
        const max = root.scrollHeight - innerHeight;
        fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0).toFixed(4) + ')';
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* one shared player for every clip on the page */
  const audio = new Audio();
  audio.preload = 'none';
  const ext = audio.canPlayType('audio/mpeg') ? 'mp3' : 'ogg';
  let playingEl = null, seq = 0;
  const quiet = () => { if (playingEl) playingEl.classList.remove('playing'); playingEl = null; };
  audio.addEventListener('ended', quiet);
  audio.addEventListener('error', quiet);
  const play = (src, el) => {
    quiet();
    const id = ++seq;
    audio.src = src;
    if (el) { void el.offsetWidth; el.classList.add('playing'); playingEl = el; }
    const p = audio.play();
    if (p && p.catch) p.catch(() => { if (id === seq) quiet(); });
  };
  const wordClip = (w) => 'assets/audio/w/' + encodeURIComponent(w) + '.mp3';

  /* the 44 sounds: every tile plays its example word; the nine vowels with a clip can be heard alone */
  const tiles = $$('#ipa button'), card = $('.ipa-card');
  const icK = $('#ic-k'), icS = $('#ic-s'), icW = $('#ic-w'), icN = $('#ic-note'), icP = $('#ic-play'), icPT = $('#ic-play-t'), icA = $('#ic-alone');
  if (tiles.length && card && icK && icS && icW && icN && icP && icPT && icA) {
    const CR = { ii: ['Denelson83', '3.0'], i: ['Denelson83', '3.0'], e: ['Peter Roach (User:RoachPeter)', '4.0'], ae: ['Peter Roach (User:RoachPeter)', '4.0'], aa: ['Denelson83', '3.0'], o: ['Peter Roach (User:RoachPeter)', '4.0'], oo: ['Peter Roach (User:RoachPeter)', '4.0'], u: ['Denelson83', '3.0'], uu: ['Denelson83', '3.0'] };
    let cur = null, noteWas = '';
    const wordOf = (t) => $('i', t).textContent.trim();
    const playWord = () => cur && play(wordClip(wordOf(cur)), cur);
    const playAlone = () => cur && cur.dataset.clip && play('assets/audio/' + cur.dataset.clip + '.' + ext, cur);
    const note = (c) => {
      const html = bi('Từ ví dụ đọc bằng giọng máy kiểu Anh của các bài âm trong Ramp.', 'The example word is said in the British text-to-speech voice of Ramp\'s sound lessons.')
        + (c ? ' ' + bi('Nguyên âm riêng: mẫu IPA của ' + c[0] + ', CC BY-SA ' + c[1] + ', Wikimedia Commons; gần với nguyên âm kiểu Anh, không hoàn toàn giống.', 'Vowel alone: IPA sample by ' + c[0] + ', CC BY-SA ' + c[1] + ', Wikimedia Commons; close to the British vowel, not the same.') : '')
        + ' <a href="credits.html">' + bi('Nguồn', 'Credits') + '</a>';
      if (html !== noteWas) { icN.innerHTML = html; noteWas = html; }   // rewrite only on change, so the live region stays quiet
    };
    const lift = (t) => {   // keep the chosen tile in view: under the nav, and above the card where it sticks (phones)
      const r = t.getBoundingClientRect(), c = card.getBoundingClientRect();
      const under = getComputedStyle(card).position === 'sticky' && r.right > c.left && r.left < c.right;
      const bottom = (under ? Math.min(c.top, innerHeight) : innerHeight) - 12, top = (nav ? nav.getBoundingClientRect().bottom : 0) + 12;
      const dy = r.bottom > bottom ? r.bottom - bottom : r.top < top ? r.top - top : 0;
      if (dy) scrollBy({ top: dy, behavior: RM.matches ? 'auto' : 'smooth' });
    };
    const pick = (t, sound) => {
      tiles.forEach((x) => { x.setAttribute('aria-pressed', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
      cur = t;
      const w = wordOf(t), c = CR[t.dataset.clip];
      icK.innerHTML = bi(t.dataset.kv, t.dataset.ke);
      icS.textContent = $('b', t).textContent;
      icW.textContent = w;
      icPT.innerHTML = bi('Nghe ' + w, 'Hear ' + w);
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
    pick(tiles[0], false);
    icK.innerHTML = bi('Chạm vào một âm', 'Tap a sound');
  }

  /* a word counts only when it is kept: walk taxi from today to kept */
  const kp = $('#keptplay'), ks = $$('#ksteps li'), kmsg = $('#kmsg'), kclock = $('#kclock'), kweek = $$('.kctl .kweek i');
  const kNext = $('#k-next'), kNextT = $('#k-next-t'), kPeek = $('#k-peek'), kMiss = $('#k-miss');
  if (kp && ks.length === 4 && kmsg && kclock && kNext && kNextT && kPeek && kMiss) {
    const KS = [
      { clock: bi('Hôm nay', 'Today'), days: 0, msg: bi('Hôm nay gặp từ. Lần nhớ lại đầu tiên chờ ít nhất 20 giờ, khoảng một ngày.', 'Met today. The first recall waits at least 20 hours, about a day.'), next: bi('Một ngày sau', 'A day later') },
      { clock: bi('Một ngày sau', 'A day later'), days: 1, msg: bi('Nhớ lại được từ hình của nó. Giờ chờ khoảng một tuần, không xem lại ở giữa.', 'Recalled from its picture. Now about a week passes, with no peek in between.'), next: bi('Khoảng một tuần sau', 'About a week later') },
      { clock: bi('Khoảng một tuần sau', 'About a week later'), days: 7, msg: bi('Nhớ lại lần nữa, không có gợi ý chữ cái đầu. Giữ được: đã giữ được một tuần.', 'Recalled again, with no first-letter help. Kept: kept for a week.'), next: bi('Làm lại', 'Start again') },
    ];
    let pos = 0;
    const set = (n, msg, clockNote) => {
      pos = n;
      ks.forEach((li, i) => { li.classList.toggle('done', i <= n); li.classList.toggle('cur', i === n + 1 && n < 2); });
      kweek.forEach((b, i) => b.classList.toggle('on', i < KS[n].days));
      kp.classList.toggle('kept', n === 2);
      kmsg.innerHTML = msg || KS[n].msg;
      kclock.innerHTML = KS[n].clock + (clockNote ? ' · ' + clockNote : '');
      kNextT.innerHTML = KS[n].next;
      kPeek.disabled = n === 2; kMiss.disabled = n === 2;
    };
    kNext.addEventListener('click', () => set(pos === 2 ? 0 : pos + 1, pos === 2 ? bi('Một từ mới. ', 'A new word. ') + KS[0].msg : null));
    kPeek.addEventListener('click', () => set(pos, pos === 0
      ? bi('Bạn xem lại, nên lần nhớ lại lùi thêm khoảng một ngày.', 'You looked again, so the recall moves back about a day.')
      : bi('Bạn xem lại, nên Ramp đếm lại một tuần trước khi tính là giữ được.', 'You looked again, so Ramp counts a week again before it is kept.'), bi('chờ lại từ đầu', 'the wait starts again')));
    kMiss.addEventListener('click', () => set(0, pos === 0
      ? bi('Chưa nhớ ra. Từ vẫn đang học và quay lại vào ngày hôm sau.', 'Missed. The word stays in learning and comes back the next day.')
      : bi('Quên một lần hỏi thì từ quay lại học.', 'A missed recall sends the word back to learning.'), bi('quay lại học', 'back to learning')));
    set(0, bi('Thử xem: hôm nay bạn gặp từ taxi. Đưa nó đến “giữ được”.', 'Try it: taxi was met today. Walk it to kept.'));
  }

  /* the three-word try: hear today, write tomorrow */
  const tc = $('#try-card');
  const tDay = $('#tc-day'), sToday = $('#tc-today'), sTom = $('#tc-tomorrow'), sDone = $('#tc-done');
  const tGo = $('#tc-go'), tMean = $('#tc-mean'), tN = $('#tc-n'), tForm = $('#tc-form'), tIn = $('#tc-in'), tFb = $('#tc-fb'), tNext = $('#tc-next'), tScore = $('#tc-score'), tAgain = $('#tc-again'), tCheck = $('#tc-check');
  if (tc && tDay && sToday && sTom && sDone && tGo && tMean && tN && tForm && tIn && tFb && tNext && tScore && tAgain && tCheck) {
    const WORDS = [{ w: 'milk', m: 'sữa' }, { w: 'chair', m: 'cái ghế' }, { w: 'water', m: 'nước' }];
    const bars = $$('.kweek i', tc);
    let i = 0, right = 0, answered = false;
    $$('.tc-play', tc).forEach((b) => b.addEventListener('click', () => play(wordClip(b.dataset.w), b)));
    const stage = (s) => { [sToday, sTom, sDone].forEach((x) => { x.hidden = x !== s; }); };
    const ask = () => {
      answered = false;
      tMean.innerHTML = WORDS[i].m + '<sup>*</sup>';
      tN.textContent = '(' + (i + 1) + '/3)';
      tIn.value = ''; tIn.disabled = false; tCheck.disabled = false;
      tFb.innerHTML = '';
      tNext.hidden = true;
    };
    const norm = (v) => v.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!]+$/, '');
    tGo.addEventListener('click', () => {
      i = 0; right = 0;
      tDay.innerHTML = bi('Ngày mai', 'Tomorrow');
      bars.forEach((b, k) => b.classList.toggle('on', k < 1));
      stage(sTom); ask(); tIn.focus();
    });
    tForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (answered) return;
      const v = norm(tIn.value);
      if (!v) { tFb.innerHTML = bi('Viết từ đó trước đã.', 'Write the word first.'); tIn.focus(); return; }
      answered = true;
      tIn.disabled = true; tCheck.disabled = true;
      const w = WORDS[i].w;
      if (v === w) { right++; tFb.innerHTML = '<span class="ok">' + bi('Đúng rồi: <b lang="en">' + w + '</b>. Khoảng một tuần sau, Ramp sẽ hỏi lần nữa.', 'Right: <b lang="en">' + w + '</b>. About a week from now, Ramp asks once more.') + '</span>'; }
      else tFb.innerHTML = '<span class="miss">' + bi('Chưa đúng. Từ đó là <b lang="en">' + w + '</b>. Từ này quay lại học, không sao cả.', 'Not quite. The word is <b lang="en">' + w + '</b>. It goes back to learning, and that is fine.') + '</span>';
      tNext.hidden = false;
      tNext.innerHTML = (i < 2 ? bi('Từ tiếp theo', 'Next word') : bi('Xem kết quả', 'See how you did')) + (tNext.dataset.ic || '');
      tNext.focus();
    });
    tNext.dataset.ic = (tNext.querySelector('svg') || { outerHTML: '' }).outerHTML;
    tNext.addEventListener('click', () => {
      if (i < 2) { i++; ask(); tIn.focus(); return; }
      tDay.innerHTML = bi('Xong', 'Done');
      tScore.innerHTML = bi('Bạn nhớ được ' + right + ' trên 3 từ.', 'You remembered ' + right + ' of 3 words.');
      stage(sDone);
      tScore.setAttribute('tabindex', '-1'); tScore.focus();
    });
    tAgain.addEventListener('click', () => {
      tDay.innerHTML = bi('Hôm nay', 'Today');
      bars.forEach((b) => b.classList.remove('on'));
      stage(sToday); tGo.focus();
    });
  }

  /* "Thử ngay" beside the card brings the card into view and gives it focus */
  const tryGo = $('#try-go');
  if (tryGo && tc) {
    tryGo.addEventListener('click', (e) => {
      e.preventDefault();
      tc.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'center' });
      tc.focus({ preventScroll: true });
    });
  }
})();
