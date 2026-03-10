// FILE: /premium-white/script.js
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // year
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // mobile nav
  const nav = $('[data-nav]');
  const toggle = $('[data-nav-toggle]');
  const header = $('[data-header]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
    document.addEventListener('click', (e) => {
      if (!header) return;
      if (!header.contains(e.target) && nav.classList.contains('is-open')) nav.classList.remove('is-open');
    });
    nav.addEventListener('click', (e) => {
      if (e.target instanceof HTMLAnchorElement) nav.classList.remove('is-open');
    });
  }

  // reveal
  const revealEls = $$('.reveal');
  const rio = new IntersectionObserver((entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        ent.target.classList.add('is-in');
        rio.unobserve(ent.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => rio.observe(el));

  // counters
  const countersRoot = $('[data-counters]');
  if (countersRoot) {
    const counterEls = $$('[data-count]', countersRoot);
    const animate = (el) => {
      const target = Number(el.getAttribute('data-count') || 0);
      const start = performance.now();
      const dur = 900;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const cio = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        counterEls.forEach(animate);
        cio.disconnect();
      }
    }, { threshold: 0.4 });
    cio.observe(countersRoot);
  }

  // gallery
  const galleryGrid = $('[data-gallery-grid]');
  const images = ['g1.jpg','g2.jpg','g3.jpg','g4.jpg','g5.jpg','g6.jpg'];

  const lightbox = $('[data-lightbox]');
  const lbImg = $('[data-lightbox-img]');
  const lbClose = $('[data-lightbox-close]');
  const lbPrev = $('[data-lightbox-prev]');
  const lbNext = $('[data-lightbox-next]');
  let idx = 0;

  const setImg = (i) => {
    idx = (i + images.length) % images.length;
    if (lbImg) lbImg.src = `./assets/gallery/${images[idx]}`;
  };

  const open = (i) => {
    if (!lightbox) return;
    setImg(i);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev) lbPrev.addEventListener('click', () => open(idx - 1));
  if (lbNext) lbNext.addEventListener('click', () => open(idx + 1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(idx - 1);
    if (e.key === 'ArrowRight') open(idx + 1);
  });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
  }

  if (galleryGrid) {
    const classes = ['b1','b2','b3','b4','b5','b6'];
    galleryGrid.innerHTML = '';
    images.forEach((name, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `bitem ${classes[i] || 'b3'}`;
      btn.setAttribute('aria-label', `Bild ${i + 1} öffnen`);

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `Galeriebild ${i + 1}`;
      img.src = `./assets/gallery/${name}`;

      btn.appendChild(img);
      btn.addEventListener('click', () => open(i));
      galleryGrid.appendChild(btn);
    });
  }

  // form (mailto preview)
  const form = $('[data-lead-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const topic = String(fd.get('topic') || '').trim();
      const msg = String(fd.get('message') || '').trim();
      const privacy = Boolean(fd.get('privacy'));

      const issues = [];
      if (name.length < 2) issues.push('Bitte Namen angeben.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push('Bitte gültige E-Mail angeben.');
      if (!topic) issues.push('Bitte Anliegen auswählen.');
      if (msg.length < 10) issues.push('Bitte Nachricht (mind. 10 Zeichen).');
      if (!privacy) issues.push('Datenschutz bestätigen.');

      if (issues.length) return alert(issues.join('\n'));

      const subject = encodeURIComponent(`Anfrage (${topic})`);
      const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${msg}\n`);
      window.location.href = `mailto:info@beispiel.de?subject=${subject}&body=${body}`;
    });
  }
})();
