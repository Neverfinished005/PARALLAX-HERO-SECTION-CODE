/* shared behaviour for the sub-pages: mobile menu, year, reveal */
(() => {
  const menu = document.getElementById('menu'), sheet = document.getElementById('sheet');
  if (menu && sheet) {
    menu.addEventListener('click', () => { const o = sheet.classList.toggle('open'); menu.setAttribute('aria-expanded', o); });
    sheet.addEventListener('click', e => { if (e.target.tagName === 'A') { sheet.classList.remove('open'); menu.setAttribute('aria-expanded', false); } });
  }
  const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
})();
