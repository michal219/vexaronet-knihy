(function () {
  const K = window.KNIHY || [];
  let io;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = id => K.find(k => k.id === id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 3D kniha ---------- */
  function bookHTML(k, cls) {
    return `<div class="book3d ${cls || ''}" style="--spine:${k.hrbet};--acc:${k.akcent}" aria-label="${esc(k.nazev)}">
      <div class="b">
        <div class="f front"><img src="${k.obalka}" alt="Obálka: ${esc(k.nazev)}" draggable="false"></div>
        <div class="f back">${k.zadni ? `<img src="${k.zadni}" alt="" draggable="false">` : ''}</div>
        <div class="f spine"><span>${esc(k.nazev)}</span><i></i></div>
        <div class="f pages"></div><div class="f top"></div><div class="f bottom"></div>
      </div><div class="shadow"></div></div>`;
  }
  document.querySelectorAll('[data-book]').forEach(el => {
    const k = byId(el.dataset.book); if (!k) return;
    el.outerHTML = bookHTML(k, el.dataset.cls);
  });

  // naklánění podle myši (hover) a otáčení tažením
  function tilt(book, opts) {
    const b = book.querySelector('.b');
    const base = { rx: parseFloat(getComputedStyle(book).getPropertyValue('--rx')) || -8, ry: parseFloat(getComputedStyle(book).getPropertyValue('--ry')) || -28 };
    let dragging = false, sx = 0, sy = 0, ry = base.ry, rx = base.rx, sry = 0, srx = 0;
    const set = (x, y) => { book.style.setProperty('--rx', x + 'deg'); book.style.setProperty('--ry', y + 'deg'); book.style.setProperty('--shine', (50 - y) + '%'); };
    const area = opts.area || book;
    if (opts.drag) {
      book.classList.add('drag');
      book.addEventListener('pointerdown', e => { dragging = true; sx = e.clientX; sy = e.clientY; sry = ry; srx = rx; book.classList.add('live'); book.setPointerCapture(e.pointerId); });
      book.addEventListener('pointermove', e => { if (!dragging) return; ry = sry + (e.clientX - sx) * .5; rx = Math.max(-40, Math.min(40, srx - (e.clientY - sy) * .3)); set(rx, ry); });
      const end = () => { if (!dragging) return; dragging = false; book.classList.remove('live'); };
      book.addEventListener('pointerup', end); book.addEventListener('pointercancel', end);
      book.addEventListener('dblclick', () => { ry = base.ry; rx = base.rx; set(rx, ry); });
    }
    if (!reduce && matchMedia('(hover: hover)').matches) {
      area.addEventListener('pointermove', e => {
        if (dragging) return;
        const r = area.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        book.classList.add('live'); rx = base.rx - py * 16; ry = base.ry + px * 40; set(rx, ry);
      });
      area.addEventListener('pointerleave', () => { if (dragging) return; book.classList.remove('live'); rx = base.rx; ry = base.ry; set(rx, ry); });
    }
  }
  document.querySelectorAll('.card').forEach(c => { const b = c.querySelector('.book3d'); if (b) tilt(b, { area: c }); });

  /* ---------- nákupní tlačítka ---------- */
  let needGumroad = false;
  const STRIPE = (window.NAKLADATELSTVI || {}).platby === 'stripe';
  function wireBuy(root) {
    root.querySelectorAll('[data-buy]').forEach(a => {
      const k = byId(a.dataset.buy); if (!k) return;
      if (STRIPE && k.cena) { a.href = '/api/koupit?kniha=' + encodeURIComponent(k.id); }
      else if (k.gumroad) { a.href = k.gumroad; needGumroad = true; }
      else { a.removeAttribute('href'); a.classList.add('soon'); a.textContent = 'Brzy v prodeji'; }
    });
    root.querySelectorAll('[data-price]').forEach(e => { const k = byId(e.dataset.price); if (k && k.cena) e.textContent = (e.dataset.prefix || '') + k.cena; else e.remove(); });
  }

  /* ---------- katalog ---------- */
  const cat = document.getElementById('catalog');
  if (cat) {
    const N = window.NAKLADATELSTVI || {};
    const render = f => {
      cat.innerHTML = K.filter(k => f === 'vse' || k.kategorie === f).map(k => `
        <article class="card rv">
          <div class="shelf">${k.novinka ? '<span class="badge">Novinka</span>' : ''}${bookHTML(k)}</div>
          <div class="body"><small>${esc(k.kategorie)} · ${k.stran} stran</small>
            <h3>${esc(k.nazev)}</h3><p>${esc(k.perex)}</p>
            <div class="row"><span class="p" data-price="${k.id}"></span>
              <a class="btn ghost sm" href="${k.detail}">Detail</a>
              <a class="btn sm" data-buy="${k.id}">Koupit</a></div>
          </div></article>`).join('') + `
        <article class="card invite rv"><div class="ic">✍</div><h3>Další tituly připravujeme</h3>
          <p>Máte know-how, které by stálo za e-book? Napište nám a vydáme ho spolu.</p>
          <div class="row" style="justify-content:center"><a class="btn sm" href="mailto:${N.email}?subject=Vydání%20e-booku">Napsat nám</a></div></article>`;
      wireBuy(cat);
      cat.querySelectorAll('.card').forEach(c => { const b = c.querySelector('.book3d'); if (b) tilt(b, { area: c }); });
      observe(cat);
    };
    const fl = document.getElementById('filters');
    if (fl) {
      const kat = [...new Set(K.map(k => k.kategorie))];
      fl.innerHTML = '<button class="on" data-f="vse">Vše</button>' + kat.map(c => `<button data-f="${esc(c)}">${esc(c)}</button>`).join('');
      fl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; fl.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); render(b.dataset.f); });
    }
    render('vse');
    const cnt = document.getElementById('count'); if (cnt) cnt.textContent = K.length;
  }

  wireBuy(document);
  document.querySelectorAll('.stage .book3d').forEach(b => tilt(b, { drag: true, area: b.closest('.stage') }));
  if (needGumroad) { const s = document.createElement('script'); s.src = 'https://gumroad.com/js/gumroad.js'; document.body.appendChild(s); }

  /* ---------- reveal při scrollu ---------- */
  function observe(root) {
    if (reduce || !('IntersectionObserver' in window)) { root.querySelectorAll('.rv').forEach(e => e.classList.add('in')); return; }
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    root.querySelectorAll('.rv:not(.in)').forEach(e => io.observe(e));
  }
  observe(document);

  /* ---------- navigace a mobilní lišta ---------- */
  const nav = document.querySelector('.nav'), mbar = document.querySelector('.mbar');
  const onScroll = () => { const y = scrollY; nav && nav.classList.toggle('solid', y > 30); mbar && mbar.classList.toggle('on', y > 500); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- lightbox ---------- */
  const lb = document.getElementById('lb');
  if (lb) {
    const li = lb.querySelector('img');
    document.querySelectorAll('.pages img').forEach(i => i.addEventListener('click', () => { li.src = i.src; li.alt = i.alt; lb.classList.add('on'); }));
    lb.addEventListener('click', () => lb.classList.remove('on'));
    addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });
  }

  /* ---------- částice v pozadí hero ---------- */
  const cv = document.querySelector('.hero canvas, .dhero canvas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let W, H, P = [];
    const size = () => { const r = cv.getBoundingClientRect(); W = cv.width = r.width * devicePixelRatio; H = cv.height = r.height * devicePixelRatio; P = Array.from({ length: Math.min(90, Math.round(r.width / 14)) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.6 + .4) * devicePixelRatio, v: (Math.random() * .25 + .05) * devicePixelRatio, a: Math.random() * .6 + .15 })); };
    size(); addEventListener('resize', size);
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    (function loop() {
      if (vis) {
        ctx.clearRect(0, 0, W, H);
        for (const p of P) { p.y -= p.v; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = `rgba(46,196,182,${p.a})`; ctx.fill(); }
      }
      requestAnimationFrame(loop);
    })();
  }
})();

/* ======================= doplňky ======================= */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = window.KNIHY || [];

  /* průběh čtení */
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty('--p', h > 0 ? scrollY / h : 0); };
  addEventListener('scroll', prog, { passive: true }); prog();

  /* parallax štítků a kruhů v úvodu */
  const st = document.querySelector('.hero .stage');
  if (st && !reduce && matchMedia('(hover: hover)').matches) {
    const els = st.querySelectorAll('.chip, .ring');
    document.querySelector('.hero').addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      els.forEach((el, i) => { const k = el.classList.contains('ring') ? 10 : 22 + i * 6; el.style.translate = `${x * k}px ${y * k}px`; });
    });
  }

  /* magnetická tlačítka */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.hero .btn, .priceline .btn, .buybox .btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .15}px ${(e.clientY - r.top - r.height / 2) * .25}px`; });
      b.addEventListener('pointerleave', () => b.style.translate = '');
    });
  }

  /* ---------- listovací ukázka ---------- */
  let fb, book, L, R, leaf, F, Bk, cnt, prevB, nextB, pages = [], spread = 0, busy = false, single = false, kniha;
  const src = i => pages[i] || null;
  function setImg(el, s) { el.classList.toggle('empty', !s); el.innerHTML = s ? `<img src="${s}" alt="" draggable="false">` : ''; }
  function setLf(el, s) { el.innerHTML = s ? `<img src="${s}" alt="" draggable="false">` : ''; el.style.background = s ? '#fff' : '#f3efe6'; }
  // rozvržení: dvojstrana s = [levá 2s-1, pravá 2s]; jednostránkově: s = strana
  const maxS = () => single ? pages.length - 1 : Math.ceil(pages.length / 2);
  function draw() {
    if (single) { setImg(R, src(spread)); L.style.display = 'none'; book.style.setProperty('--shift', '0px'); }
    else {
      L.style.display = ''; setImg(L, src(2 * spread - 1)); setImg(R, src(2 * spread));
      // obálka a konec: kniha se posune, aby byla opticky uprostřed
      const pw = R.offsetWidth; book.style.setProperty('--shift', !src(2 * spread - 1) ? `-${pw / 2}px` : !src(2 * spread) ? `${pw / 2}px` : '0px');
    }
    const shown = single ? `${spread + 1} / ${pages.length}` : [2 * spread - 1, 2 * spread].filter(i => src(i)).map(i => i + 1).join('–') + ` / ${pages.length}`;
    cnt.textContent = 'Strana ' + shown;
    prevB.disabled = spread <= 0; nextB.disabled = spread >= maxS();
  }
  function flip(dir) {
    if (busy) return; const to = spread + dir; if (to < 0 || to > maxS()) return;
    if (reduce) { spread = to; draw(); return; }
    busy = true;
    let front, back;
    if (single) { if (dir > 0) { front = src(spread); back = null; setImg(R, src(to)); } else { front = src(to); back = null; } }
    else if (dir > 0) { front = src(2 * spread); back = src(2 * to - 1); setImg(R, src(2 * to)); }
    else { front = src(2 * to); back = src(2 * spread - 1); setImg(L, src(2 * to - 1)); }
    setLf(F, front); setLf(Bk, back);
    leaf.classList.remove('go'); leaf.style.display = 'block';
    leaf.style.transform = dir > 0 ? 'rotateY(0deg)' : 'rotateY(-180deg)';
    if (!single) { // posun knihy během otáčení (obálka / konec)
      const pw = R.offsetWidth; book.style.setProperty('--shift', !src(2 * to - 1) ? `-${pw / 2}px` : !src(2 * to) ? `${pw / 2}px` : '0px');
    }
    void leaf.offsetWidth;
    leaf.classList.add('go'); leaf.style.transform = dir > 0 ? 'rotateY(-180deg)' : 'rotateY(0deg)';
    F.style.setProperty('--sh', 1); Bk.style.setProperty('--sh', 1);
    setTimeout(() => { leaf.classList.remove('go'); leaf.style.display = 'none'; spread = to; draw(); busy = false; }, 760);
  }
  function layout() { single = innerWidth < 760; book.classList.toggle('single', single); }
  function build() {
    fb = document.createElement('div'); fb.className = 'fb'; fb.setAttribute('role', 'dialog'); fb.setAttribute('aria-label', 'Ukázka e-booku');
    fb.innerHTML = `<div class="fb-top"><div><b class="fb-t"></b>Ukázka vybraných stran</div><button class="fb-x" aria-label="Zavřít">×</button></div>
      <div class="fb-book"><div class="fb-pg fb-l"></div><div class="fb-pg fb-r"></div><div class="fb-leaf"><div class="lf front"></div><div class="lf back"></div></div></div>
      <div class="fb-nav"><button class="fb-p" aria-label="Předchozí strana">‹</button><span class="fb-c"></span><button class="fb-n" aria-label="Další strana">›</button><a class="btn fb-buy">Koupit celý e-book</a></div>
      <div class="fb-hint">Listujte šipkami, klávesnicí nebo kliknutím na stránku</div>`;
    document.body.appendChild(fb);
    book = fb.querySelector('.fb-book'); L = fb.querySelector('.fb-l'); R = fb.querySelector('.fb-r'); leaf = fb.querySelector('.fb-leaf');
    F = leaf.querySelector('.front'); Bk = leaf.querySelector('.back'); cnt = fb.querySelector('.fb-c'); prevB = fb.querySelector('.fb-p'); nextB = fb.querySelector('.fb-n');
    prevB.onclick = () => flip(-1); nextB.onclick = () => flip(1);
    fb.querySelector('.fb-x').onclick = close;
    fb.addEventListener('click', e => { if (e.target === fb) close(); });
    L.onclick = () => flip(-1); R.onclick = e => { if (single) { const r = R.getBoundingClientRect(); flip(e.clientX < r.left + r.width / 3 ? -1 : 1); } else flip(1); };
    let sx = null; book.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    book.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) flip(dx < 0 ? 1 : -1); sx = null; });
    addEventListener('keydown', e => { if (!fb.classList.contains('on')) return; if (e.key === 'ArrowRight') flip(1); if (e.key === 'ArrowLeft') flip(-1); if (e.key === 'Escape') close(); });
    addEventListener('resize', () => { if (fb.classList.contains('on')) { const p = single ? spread : 2 * spread; layout(); spread = single ? Math.max(0, p - 1) : Math.ceil(p / 2); spread = Math.min(spread, maxS()); draw(); } });
  }
  function open(id) {
    kniha = K.find(k => k.id === id); if (!kniha || !kniha.ukazka) return;
    if (!fb) build();
    pages = kniha.ukazka; pages.forEach(s => { const i = new Image(); i.src = s; });
    fb.querySelector('.fb-t').textContent = kniha.nazev;
    const buy = fb.querySelector('.fb-buy');
    if ((window.NAKLADATELSTVI || {}).platby === 'stripe' && kniha.cena) { buy.href = '/api/koupit?kniha=' + encodeURIComponent(kniha.id); buy.textContent = 'Koupit celý e-book'; buy.classList.remove('soon'); }
    else if (kniha.gumroad) { buy.href = kniha.gumroad; buy.textContent = 'Koupit celý e-book'; buy.classList.remove('soon'); }
    else { buy.href = kniha.detail + '#koupit'; buy.textContent = 'Celý e-book'; buy.onclick = close; }
    layout(); spread = 0; fb.classList.add('on'); requestAnimationFrame(() => { fb.classList.add('vis'); draw(); });
    document.body.style.overflow = 'hidden'; nextB.focus();
  }
  function close() { fb.classList.remove('vis'); setTimeout(() => fb.classList.remove('on'), 300); document.body.style.overflow = ''; }
  document.addEventListener('click', e => { const a = e.target.closest('[data-flip]'); if (a) { e.preventDefault(); open(a.dataset.flip); } });
  if (location.hash === '#listovat') { const a = document.querySelector('[data-flip]'); if (a) setTimeout(() => open(a.dataset.flip), 400); }
})();

/* ======================= simulace „zadání → web" ======================= */
(function () {
  const root = document.getElementById('demo'); if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = {
    kadernictvi: { lbl: '💇 Kadeřnictví', name: 'Salon Bella', icon: '✂️', obor: 'kadeřnictví', tag: 'Kadeřnictví v centru města',
      h: 'Vlasy, které vás budou bavit každý den', p: 'Střih, barvení i svatební účesy. Objednejte se online – zabere to minutu.',
      cta: 'Objednat termín', svc: [['✂️', 'Střih', 'Dámský, pánský i dětský'], ['🎨', 'Barvení', 'Melír, balayage, tónování'], ['👰', 'Svatby', 'Účesy na velký den']],
      c: { sb: '#fffaf7', sf: '#2b1d1a', sh: 'linear-gradient(135deg,#3b1f2b,#7a3b4f)', shf: '#fff', sa: '#e8a598', saf: '#2b1d1a', sc: '#f7ece8', sfont: 'Fraunces' }, styl: 'elegantní, teplé barvy' },
    kavarna: { lbl: '☕ Kavárna', name: 'Kavárna U Mlýna', icon: '☕', obor: 'kavárna', tag: 'Výběrová káva a domácí dorty',
      h: 'Dobrá káva. Pomalé ráno.', p: 'Pražíme v malém, pečeme každý den. Přijďte na snídani nebo si odneste kávu s sebou.',
      cta: 'Ukázat menu', svc: [['☕', 'Káva', 'Espresso, filtr, cold brew'], ['🥐', 'Snídaně', 'Každý den do 11:00'], ['🍰', 'Dorty', 'Na objednávku i v pultu']],
      c: { sb: '#f8f4ec', sf: '#2a2118', sh: 'linear-gradient(135deg,#3a2a1c,#6b4a2e)', shf: '#fff8ee', sa: '#d9a35b', saf: '#2a2118', sc: '#efe6d6', sfont: 'Fraunces' }, styl: 'útulný, hnědé a krémové tóny' },
    truhlar: { lbl: '🪚 Truhlářství', name: 'Truhlářství Marek', icon: '🪚', obor: 'truhlářství', tag: 'Nábytek na míru',
      h: 'Kuchyně a skříně na míru, které vám sednou', p: 'Navrhneme, vyrobíme a namontujeme. Ozvěte se a pošleme nezávaznou nabídku.',
      cta: 'Chci nabídku', svc: [['🍳', 'Kuchyně', 'Od návrhu po montáž'], ['🚪', 'Vestavěné skříně', 'Využijeme každý centimetr'], ['🪜', 'Schodiště', 'Dřevěná, odolná, na míru']],
      c: { sb: '#ffffff', sf: '#13233b', sh: 'linear-gradient(135deg,#0b2545,#13406f)', shf: '#fff', sa: '#2ec4b6', saf: '#071a33', sc: '#eef3f8', sfont: 'Inter' }, styl: 'čistý, tmavě modrá a tyrkysová' },
    fitness: { lbl: '🏋️ Osobní trenér', name: 'FitLab Petr', icon: '🏋️', obor: 'osobní trenér', tag: 'Osobní tréninky a výživa',
      h: 'Silnější za 12 týdnů. S plánem, který vydržíte.', p: 'Individuální tréninky, jídelníček a průběžná kontrola. První konzultace zdarma.',
      cta: 'Rezervovat konzultaci', svc: [['💪', 'Trénink 1:1', 'Ve fitku nebo venku'], ['🥗', 'Výživa', 'Jídelníček na míru'], ['📈', 'Online plán', 'Trénujte odkudkoli']],
      c: { sb: '#0f1115', sf: '#f1f5f9', sh: 'linear-gradient(135deg,#111827,#1f2937)', shf: '#fff', sa: '#a3e635', saf: '#0f1115', sc: '#1b1f27', sfont: 'Inter' }, styl: 'tmavý, sportovní, výrazná zelená' },
    fotograf: { lbl: '📷 Fotograf', name: 'Studio Světlo', icon: '📷', obor: 'fotograf', tag: 'Svatební a rodinná fotografie',
      h: 'Fotky, ke kterým se budete vracet', p: 'Svatby, rodiny a portréty. Přirozeně, bez strojených póz.',
      cta: 'Zjistit volný termín', svc: [['💍', 'Svatby', 'Celý den i obřad'], ['👨‍👩‍👧', 'Rodiny', 'Venku nebo u vás doma'], ['🙂', 'Portréty', 'Osobní i firemní']],
      c: { sb: '#fbfbfa', sf: '#1d1d1f', sh: 'linear-gradient(135deg,#1d1d1f,#3a3a3c)', shf: '#fff', sa: '#f5c26b', saf: '#1d1d1f', sc: '#f0efec', sfont: 'Fraunces' }, styl: 'minimalistický, hodně bílého místa' }
  };
  root.innerHTML = `
    <div class="demo-pick" role="group" aria-label="Vyberte obor">
      ${Object.entries(T).map(([k, v], i) => `<button class="ch${i === 2 ? ' on' : ''}" data-k="${k}">${v.lbl}</button>`).join('')}
      <input id="demo-name" maxlength="40" placeholder="Název vaší firmy (nepovinné)" aria-label="Název firmy">
      <button class="btn" id="demo-go">✦ Vytvořit web</button>
    </div>
    <div class="demo-grid">
      <div class="term"><div class="bar"><i></i><i></i><i></i>&nbsp; Terminál · Claude Code</div><pre aria-live="polite"><span class="dim">Vyberte obor a klikněte na „Vytvořit web“.</span><span class="cur"></span></pre></div>
      <div class="mock"><div class="bar"><i></i><i></i><i></i><span class="url">index.html</span><span class="dv"><button class="on" data-v="d" aria-label="Počítač">🖥</button><button data-v="m" aria-label="Mobil">📱</button></span></div>
        <div class="vp"><div class="site"></div></div></div>
    </div>
    <p class="demo-note">Toto je zjednodušená simulace pro představu, jak práce s AI probíhá. Skutečný web podle knihy tvoříte na svém počítači v Claude Code – a výsledek je bohatší.</p>`;
  const pre = root.querySelector('pre'), site = root.querySelector('.site'), mock = root.querySelector('.mock'), go = root.querySelector('#demo-go'), inp = root.querySelector('#demo-name');
  let key = 'truhlar', run = 0;
  root.querySelectorAll('.ch').forEach(b => b.onclick = () => { root.querySelectorAll('.ch').forEach(x => x.classList.toggle('on', x === b)); key = b.dataset.k; start(); });
  root.querySelectorAll('.dv button').forEach(b => b.onclick = () => { root.querySelectorAll('.dv button').forEach(x => x.classList.toggle('on', x === b)); mock.classList.toggle('mobile', b.dataset.v === 'm'); });
  go.onclick = start; inp.addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  async function start() {
    const my = ++run, t = T[key], name = (inp.value.trim() || t.name);
    const c = t.c; Object.entries(c).forEach(([k, v]) => site.style.setProperty('--' + k, v));
    site.innerHTML = ''; pre.innerHTML = '';
    const prompt = `Vytvoř jednoduchý web pro ${t.obor} „${name}“.\nStránky: úvod, služby, kontakt.\nStyl: ${t.styl}.\nMusí fungovat na mobilu a mít tlačítko „${t.cta}“.`;
    const line = h => { pre.insertAdjacentHTML('beforeend', h); pre.scrollTop = pre.scrollHeight; };
    line('<span class="u">› </span>');
    for (const ch of prompt) { if (my !== run) return; line(esc(ch)); await wait(ch === '\n' ? 120 : 14); }
    line('\n\n<span class="dim">Claude Code pracuje…</span>\n'); await wait(500);
    const parts = [
      ['Navrhuji strukturu stránek', () => `<header class="s-nav"><b><span>${t.icon}</span>${esc(name)}</b><nav><span>Úvod</span><span>Služby</span><span>Kontakt</span></nav></header>`],
      ['Píšu index.html – úvodní sekce', () => `<section class="s-hero"><small>${esc(t.tag)}</small><h3>${esc(t.h)}</h3><p>${esc(t.p)}</p><a>${esc(t.cta)}</a></section>`],
      ['Přidávám sekci Služby', () => `<section class="s-cards">${t.svc.map(s => `<div><span>${s[0]}</span><b>${esc(s[1])}</b>${esc(s[2])}</div>`).join('')}</section>`],
      ['Ladím style.css a mobilní verzi', null],
      ['Přidávám kontakt a tlačítko', () => `<section class="s-cta"><span>Máte dotaz? Ozvěte se nám.</span><a>${esc(t.cta)}</a></section>`]
    ];
    for (const [msg, html] of parts) {
      if (my !== run) return;
      line(`<span class="ok">✓</span> ${msg}\n`);
      if (html) { site.insertAdjacentHTML('beforeend', html()); const el = site.lastElementChild; await wait(30); el.classList.add('in'); }
      await wait(650);
    }
    line(`\n<span class="ok">Hotovo.</span> Otevřete index.html v prohlížeči.\n<span class="u">› </span><span class="cur"></span>`);
  }
  // spustit automaticky, když se sekce poprvé objeví
  const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: .35 });
  io.observe(root);
})();

/* ======================= před / po ======================= */
document.querySelectorAll('.ba').forEach(ba => {
  const r = ba.querySelector('input'); const set = v => ba.style.setProperty('--x', v + '%');
  r.addEventListener('input', () => set(r.value)); set(r.value);
  // jemná nápověda: posuvník se jednou sám pohne
  const io = new IntersectionObserver(e => { if (!e[0].isIntersecting) return; io.disconnect(); if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t0 = null; const anim = ts => { t0 = t0 || ts; const k = (ts - t0) / 1600; if (k >= 1) { set(50); r.value = 50; return; } const v = 50 + Math.sin(k * Math.PI * 2) * 22; set(v); r.value = v; requestAnimationFrame(anim); }; requestAnimationFrame(anim); }, { threshold: .5 });
  io.observe(ba);
});

/* naklánění knih v úvodu a v sekci Naše knihy podle myši */
document.querySelectorAll('.duo-books .db, .b2').forEach(el => {
  const book = el.querySelector('.book3d'); if (!book || !matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const base = { rx: parseFloat(getComputedStyle(book).getPropertyValue('--rx')) || -8, ry: parseFloat(getComputedStyle(book).getPropertyValue('--ry')) || -28 };
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    book.classList.add('live'); book.style.setProperty('--rx', (base.rx - py * 14) + 'deg'); book.style.setProperty('--ry', (base.ry + px * 36) + 'deg'); });
  el.addEventListener('pointerleave', () => { book.classList.remove('live'); book.style.setProperty('--rx', base.rx + 'deg'); book.style.setProperty('--ry', base.ry + 'deg'); });
});

/* ---- Přihlášení k novinkám (e-mail) ---- */
(function () {
  const holders = document.querySelectorAll('[data-signup]');
  if (!holders.length) return;
  const st = document.createElement('style');
  st.textContent = '.su{max-width:560px;margin:0 auto;text-align:left}.su h3{font-size:22px;margin-bottom:6px}.su p.s{font-size:15px;color:var(--g);margin-bottom:14px}.su form{display:flex;flex-direction:column;gap:12px}.su .r{display:flex;gap:10px;flex-wrap:wrap}.su input[type=email]{flex:1 1 220px;min-width:0;padding:15px 18px;border-radius:14px;border:2px solid var(--line);font:inherit;background:#fff;color:var(--ink)}.su input[type=email]:focus{outline:none;border-color:var(--t)}.su button{padding:15px 26px;border-radius:14px;border:0;background:var(--t);color:#05203a;font:inherit;font-weight:800;cursor:pointer}.su button:disabled{opacity:.6;cursor:default}.su label.c{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.45;color:var(--g);cursor:pointer}.su label.c input{margin-top:3px;flex:none;width:18px;height:18px;accent-color:#138a80}.su .m{font-size:15px;font-weight:700;min-height:22px}.su .m.ok{color:var(--td)}.su .m.er{color:#c0392b}.su .hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}.su a{color:var(--td)}.dark .su p.s,.dark .su label.c{color:#b9c8dc}';
  document.head.appendChild(st);
  holders.forEach(h => {
    const zdroj = h.getAttribute('data-signup') || location.pathname;
    h.innerHTML = '<div class="su"><h3 class="serif">Nové knihy a ukázky jako první</h3><p class="s">Pošleme ti nové e-booky, ukázky zdarma a slevy. Žádný spam, odhlásit se můžeš kdykoli.</p>' +
      '<form novalidate><div class="r"><input type="email" name="email" placeholder="tvuj@email.cz" autocomplete="email" required aria-label="E-mail"><button type="submit">Chci novinky</button></div>' +
      '<input class="hp" type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label class="c"><input type="checkbox" name="souhlas"><span>Souhlasím se zasíláním novinek, ukázek a slev na e-mail a potvrzuji, že mi je alespoň 15 let. Údaje zpracovává Veronika Hřivnáčová, IČO 18020844, popis najdeš v <a href="/soukromi/">zásadách soukromí</a>. Souhlas můžu kdykoli odvolat na <a href="/odhlaseni/">této stránce</a>.</span></label>' +
      '<div class="m" role="status" aria-live="polite"></div></form></div>';
    const f = h.querySelector('form'), m = h.querySelector('.m'), b = f.querySelector('button');
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const email = f.email.value.trim();
      m.className = 'm';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { m.classList.add('er'); m.textContent = 'Zadej prosím platný e-mail.'; return; }
      if (!f.souhlas.checked) { m.classList.add('er'); m.textContent = 'Zaškrtni prosím souhlas a potvrzení věku.'; return; }
      b.disabled = true; m.textContent = 'Odesíláme…';
      try {
        const r = await fetch('/api/prihlaska', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, souhlas: true, vek: true, zdroj, web: f.web.value }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) { m.classList.add('ok'); m.textContent = j.uz ? 'Tenhle e-mail už v seznamu máme. Díky!' : 'Hotovo, díky! Jsi v seznamu. 📬'; f.email.value = ''; }
        else { m.classList.add('er'); m.textContent = j.chyba || 'Něco se nepovedlo. Zkus to prosím znovu.'; }
      } catch (_) { m.classList.add('er'); m.textContent = 'Něco se nepovedlo. Zkus to prosím znovu.'; }
      b.disabled = false;
    });
  });
})();

/* ---- Slevový kód a časově omezená nabídka ---- */
(function () {
  const get = () => { try { return sessionStorage.getItem('kod') || ''; } catch (_) { return ''; } };
  const set = v => { try { v ? sessionStorage.setItem('kod', v) : sessionStorage.removeItem('kod'); } catch (_) {} };
  // kód z odkazu (?kod=...) se zapamatuje
  const q = new URLSearchParams(location.search).get('kod'); if (q) set(q.trim().toUpperCase().slice(0, 40));
  // každé tlačítko Koupit dostane uložený kód
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="/api/koupit"]');
    if (!a) return; const k = get(); if (!k || /[?&]kod=/.test(a.getAttribute('href'))) return;
    e.preventDefault(); location.href = a.getAttribute('href') + '&kod=' + encodeURIComponent(k);
  });
  // pole „Máš slevový kód?“ v nákupním boxu
  const st = document.createElement('style');
  st.textContent = '.kod{margin-top:12px;font-size:14px}.kod>button{background:none;border:0;color:inherit;opacity:.8;text-decoration:underline;cursor:pointer;font:inherit}.kod form{display:flex;gap:8px;margin-top:8px;justify-content:center}.kod input{flex:1;min-width:0;max-width:200px;padding:10px 12px;border-radius:10px;border:2px solid rgba(128,128,128,.4);font:inherit;text-transform:uppercase;background:rgba(255,255,255,.9);color:#0f203d}.kod form button{padding:10px 16px;border-radius:10px;border:0;background:#2ec4b6;color:#05203a;font-weight:800;cursor:pointer;font:inherit;font-weight:800}.kod .ok{margin-top:6px;font-weight:700}' +
    '#promobar{position:sticky;top:0;z-index:60;background:linear-gradient(90deg,#ff7a59,#ffb347);color:#1a1033;text-align:center;font-weight:800;font-size:15px;padding:9px 44px 9px 14px;line-height:1.35}#promobar a{color:inherit;text-decoration:underline}#promobar button{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;font-size:22px;cursor:pointer;color:inherit;line-height:1}';
  document.head.appendChild(st);
  document.querySelectorAll('.buybox').forEach(b => {
    const w = document.createElement('div'); w.className = 'kod';
    const cur = get();
    w.innerHTML = '<button type="button">Máš slevový kód?</button><form hidden><input type="text" placeholder="KÓD" maxlength="40" aria-label="Slevový kód"><button type="submit">Použít</button></form><div class="ok"></div>';
    const btn = w.querySelector('button'), f = w.querySelector('form'), ok = w.querySelector('.ok');
    if (cur) { ok.textContent = 'Kód ' + cur + ' je uložený, uplatní se při platbě.'; }
    btn.addEventListener('click', () => { f.hidden = !f.hidden; if (!f.hidden) f.querySelector('input').focus(); });
    f.addEventListener('submit', e => { e.preventDefault(); const v = f.querySelector('input').value.trim().toUpperCase(); if (!v) return; set(v); ok.textContent = 'Kód ' + v + ' je uložený. Uplatní se po kliknutí na Koupit.'; f.hidden = true; });
    b.appendChild(w);
  });
  // pruh s odpočtem, když běží nabídka
  if (location.pathname.startsWith('/nabidka')) return;
  const home = document.getElementById('nabidka-home');
  fetch('/api/nabidka').then(r => r.json()).then(s => {
    if (!s.aktivni) return;
    if (home) {
      const end0 = Date.parse(s.do), H = document.getElementById('nh-h'), M = document.getElementById('nh-m'), S = document.getElementById('nh-s');
      const tk = () => { const d = Math.max(0, Math.floor((end0 - Date.now()) / 1000)); if (!d) { home.hidden = true; return; } H.textContent = String(Math.floor(d / 3600)).padStart(2, '0'); M.textContent = String(Math.floor(d % 3600 / 60)).padStart(2, '0'); S.textContent = String(d % 60).padStart(2, '0'); };
      tk(); setInterval(tk, 1000); home.hidden = false; return;
    }
    const bar = document.createElement('div'); bar.id = 'promobar';
    bar.innerHTML = '🔥 Jen 48 hodin: <b>8 e-booků o podnikání za cenu jedné knihy (129 Kč)</b>. Zbývá <span id="pbt"></span> · <a href="/nabidka/">Zobrazit nabídku</a><button type="button" aria-label="Zavřít">×</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    const t = bar.querySelector('#pbt'); const end = Date.parse(s.do);
    const tick = () => { let d = Math.max(0, Math.floor((end - Date.now()) / 1000)); if (!d) { bar.remove(); return; } const h = Math.floor(d / 3600), m = Math.floor(d % 3600 / 60), sec = d % 60; t.textContent = h + ' h ' + String(m).padStart(2, '0') + ' min ' + String(sec).padStart(2, '0') + ' s'; };
    tick(); setInterval(tick, 1000);
    bar.querySelector('button').addEventListener('click', () => bar.remove());
  }).catch(() => {});
})();
