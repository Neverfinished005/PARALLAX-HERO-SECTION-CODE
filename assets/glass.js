/* Liquid glass for the nav and every button.
   Chrome / Edge: a real lens. A displacement map for a capsule with a bevelled rim bends the picture behind the element,
   split slightly per colour channel (dispersion). Safari / Firefox keep the frosted fallback from the CSS.
   Also: a spring-driven selection pill that slides behind the nav links as you scroll. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isChromium = (navigator.userAgentData && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand))) ||
                     (/Chrome\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent));

  /* ---------- 1) the lens ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(NS, 'svg'); defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.setAttribute('aria-hidden', 'true');
  defs.style.cssText = 'position:absolute'; document.body.prepend(defs);
  let uid = 0;
  const sdRound = (x, y, hx, hy, r) => { const qx = Math.abs(x) - hx + r, qy = Math.abs(y) - hy + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r; };
  function mapFor(w, h, r0) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), data = ctx.createImageData(w, h), hx = w / 2, hy = h / 2, r = r0, bevel = r * .55;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + .5 - hx, py = y + .5 - hy, d = sdRound(px, py, hx, hy, r);
      const gx = sdRound(px + 1, py, hx, hy, r) - sdRound(px - 1, py, hx, hy, r), gy = sdRound(px, py + 1, hx, hy, r) - sdRound(px, py - 1, hx, hy, r);
      const len = Math.hypot(gx, gy) || 1, nx = gx / len, ny = gy / len, rim = Math.min(1, Math.max(0, 1 + d / bevel)), bend = rim * rim * rim, i = (y * w + x) * 4;
      data.data[i] = Math.round(127.5 - nx * bend * 127.5); data.data[i + 1] = Math.round(127.5 - ny * bend * 127.5); data.data[i + 2] = 128; data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0); return c.toDataURL();
  }
  let lensDisabled = false;
  function lensOn(el) {
    if (!isChromium || lensDisabled) return;
    const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight); if (!w || !h) return;
    let L = el._lens;
    if (!L) { const f = document.createElementNS(NS, 'filter'); f.id = 'lens' + (++uid); f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('color-interpolation-filters', 'sRGB'); defs.appendChild(f); L = el._lens = { f, key: '' }; }
    const rad = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || h / 2, h / 2, w / 2), key = w + 'x' + h + 'r' + Math.round(rad);
    if (L.key !== key) {
      L.key = key; const k = el.dataset.k ? +el.dataset.k : h / 62;                                    /* the app's numbers are for a 62px bar: scale them to this element */
      L.f.setAttribute('width', w); L.f.setAttribute('height', h);
      L.f.innerHTML = `<feGaussianBlur in="SourceGraphic" stdDeviation="${(el.dataset.blur ? +el.dataset.blur : 1.6 * k).toFixed(2)}" result="soft"/>
        <feImage x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map" href="${mapFor(w, h, rad)}"/>
        <feDisplacementMap in="soft" in2="map" scale="${(39 * k).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="dR"/>
        <feDisplacementMap in="soft" in2="map" scale="${(32 * k).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="dG"/>
        <feDisplacementMap in="soft" in2="map" scale="${(25 * k).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="dB"/>
        <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
        <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
        <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
        <feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen" result="rgb"/>
        <feColorMatrix in="rgb" type="saturate" values="1.3"/>`;
    }
    el.style.webkitBackdropFilter = el.style.backdropFilter = `url(#${L.f.id})`; el.classList.add('lens');
  }
  function lensOff(el) { el.classList.remove('lens'); el.style.webkitBackdropFilter = el.style.backdropFilter = ''; }

  const nav = document.querySelector('.nav'), btns = [...document.querySelectorAll('.btn')];
  const covers = [...document.querySelectorAll('[data-lens]')];
  if (nav) { lensOn(nav); }
  if (isChromium) {
    /* buttons only get the lens while they are on screen (the filter is the expensive part) */
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? lensOn(e.target) : lensOff(e.target)), { rootMargin: '120px' });
    const ro = new ResizeObserver(es => es.forEach(e => { if (e.target === nav || e.target.classList.contains('lens')) lensOn(e.target); }));
    covers.forEach(c => { lensOn(c); ro.observe(c); });
    if (nav) ro.observe(nav); btns.forEach(b => ro.observe(b));
    document.fonts && document.fonts.ready.then(() => { covers.forEach(lensOn); if (nav) lensOn(nav); btns.forEach(b => b.classList.contains('lens') && lensOn(b)); });
  }

  /* ---------- 2) the selection pill behind the nav links: a spring (damping .6, stiffness 260) that stretches with its speed ---------- */
  const holder = document.querySelector('.nav .links'), links = holder ? [...holder.querySelectorAll('a')] : [];
  const secs = links.map(a => { const h = a.getAttribute('href') || ''; return h.startsWith('#') ? document.querySelector(h) : null; });
  if (holder && secs.some(Boolean)) {
    const pill = document.createElement('i'); pill.className = 'navpill'; holder.prepend(pill);
    const K = 260, C = 2 * .6 * Math.sqrt(K);
    let active = -1, cx = 0, v = 0, tcx = 0, tw = 0, th = 0, raf = 0, last = 0, shown = false;
    const geom = () => { const a = links[active]; if (!a) return false; tcx = a.offsetLeft + a.offsetWidth / 2; tw = a.offsetWidth; th = a.offsetHeight; return true; };
    const place = () => { const a = links[active]; if (!a) return; const s = Math.min(Math.abs(v) / 1400, .5), w = tw * (1 + s), h = th * (1 - s * .16);
      pill.style.width = w + 'px'; pill.style.height = h + 'px'; pill.style.transform = `translate(${cx - w / 2}px, ${a.offsetTop + (a.offsetHeight - h) / 2}px)`; };
    const step = t => { const dt = Math.min((t - last) / 1000 || .016, 1 / 30); last = t; v += (-K * (cx - tcx) - C * v) * dt; cx += v * dt; place();
      if (Math.abs(cx - tcx) < .2 && Math.abs(v) < 2) { cx = tcx; v = 0; place(); raf = 0; return; } raf = requestAnimationFrame(step); };
    const select = i => {
      if (i === active) return; active = i; links.forEach((l, k) => l.classList.toggle('cur', k === i));
      if (i < 0) { pill.style.opacity = 0; shown = false; return; }
      if (!holder.offsetWidth || !geom()) return;
      if (!shown || reduce) { cx = tcx; v = 0; shown = true; place(); pill.style.opacity = 1; return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    };
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) select(secs.indexOf(e.target)); }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => s && so.observe(s));
    addEventListener('scroll', () => { if (scrollY < innerHeight * .5) select(-1); }, { passive: true });
    addEventListener('resize', () => { if (active >= 0 && geom()) { cx = tcx; v = 0; place(); } });
  }

  /* ---------- keep scrolling smooth: pause animations off screen, and drop the bending lens if the device struggles ---------- */
  if ('IntersectionObserver' in window) {
    const po = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting)), { rootMargin: '60px' });
    document.querySelectorAll('.hero, #products, #team, footer.reveal, .vid').forEach(el => po.observe(el));
  }
  if (isChromium && !reduce) {
    let scrolling = false, st = 0, last = 0, frames = 0, slow = 0;
    addEventListener('scroll', () => { scrolling = true; clearTimeout(st); st = setTimeout(() => { scrolling = false; last = 0; }, 160); }, { passive: true });
    const tick = t => {
      if (lensDisabled) return;
      if (scrolling && last) { frames++; if (t - last > 40) slow++; if (frames >= 60) { if (slow >= 18) { lensDisabled = true; [nav, ...covers, ...btns].forEach(el => el && lensOff(el)); return; } frames = 0; slow = 0; } }
      last = scrolling ? t : 0; requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();

/* ---------- footer reveal: pin the footer behind the page when it fits the screen, and rise the wordmark as it is uncovered ---------- */
(() => {
  const foot = document.querySelector('footer.reveal'); if (!foot) return;
  const root = document.documentElement, reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function measure() { update(); }
  function update() {
    const fh = foot.offsetHeight, docH = document.documentElement.scrollHeight, seen = scrollY + innerHeight - (docH - fh);
    const p = Math.min(1, Math.max(0, seen / fh));
    foot.style.setProperty('--p', reduceM ? 1 : p.toFixed(3)); foot.classList.toggle('live', p > .15);
  }
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', measure); addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(foot);
  measure();
})();

/* ---------- phone menu: Esc or a tap outside closes it ---------- */
(() => {
  const menu = document.getElementById('menu'), sheet = document.getElementById('sheet'); if (!menu || !sheet) return;
  const close = () => { sheet.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('open')) { close(); menu.focus(); } });
  document.addEventListener('click', e => { if (sheet.classList.contains('open') && !sheet.contains(e.target) && !menu.contains(e.target)) close(); });
  addEventListener('resize', () => { if (innerWidth > 980) close(); });
})();

/* ---- scroll performance: do the cheap thing while the page is moving ---- */
(() => {
  const root = document.documentElement; let t = 0, on = false;
  addEventListener('scroll', () => { if (!on) { on = true; root.classList.add('scrolling'); } clearTimeout(t); t = setTimeout(() => { on = false; root.classList.remove('scrolling'); }, 140); }, { passive: true });
  if (matchMedia('(pointer: coarse), (max-width: 820px)').matches) root.classList.add('lite');
  /* only what is near the screen is allowed to animate */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('idle', !e.isIntersecting)), { rootMargin: '160px 0px' });
    document.querySelectorAll('.flow, .road, .diagram, .tmq, .hero, .marq, .legal, footer.reveal').forEach(el => io.observe(el));
  }
})();
