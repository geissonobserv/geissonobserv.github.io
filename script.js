/* =========================================================
   Geisson Sousa — Portfólio · script.js
   Navegação · Scroll reveal · Contadores · Progresso
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Navbar: efeito de scroll ---------- */
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    navbar.classList.toggle('scrolled', y > 40);

    // Barra de progresso
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (y / h) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  function closeMenu() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }

  toggle.addEventListener('click', function () {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  // Fecha menu ao clicar fora
  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') &&
        !links.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el, i) {
      // Stagger suave por proximidade no DOM
      el.style.transitionDelay = (i % 6) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contadores animados (hero stats) ---------- */
  const counters = document.querySelectorAll('.stat-num');
  let counted = false;

  function animateCounters() {
    counters.forEach(function (el) {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const val = (target * eased).toFixed(decimals);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      requestAnimationFrame(tick);
    });
  }

  const statsBlock = document.querySelector('.hero-stats');
  if (statsBlock && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counted) {
          counted = true;
          animateCounters();
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });
    statObserver.observe(statsBlock);
  } else if (statsBlock) {
    animateCounters();
  }

  /* ---------- Destaque do link ativo no menu ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = links.querySelectorAll('a');

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Preferências de movimento / toque ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  let liveTimer = null;

  /* ---------- Dashboard NOC ao vivo (hero) ---------- */
  (function liveDashboard() {
    const line = document.getElementById('sparkLine');
    const upEl = document.getElementById('liveUptime');
    const reqEl = document.getElementById('liveReq');
    const latEl = document.getElementById('liveLat');
    if (!line) return;

    const N = 16;
    let data = Array.from({ length: N }, () => 18 + Math.random() * 16);

    function render() {
      const w = 120, h = 40, pad = 3;
      const max = Math.max.apply(null, data), min = Math.min.apply(null, data);
      const span = (max - min) || 1;
      const pts = data.map(function (v, i) {
        const x = (i / (N - 1)) * w;
        const y = h - pad - ((v - min) / span) * (h - pad * 2);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      line.setAttribute('points', pts);
    }
    render();

    if (reduceMotion) return;

    liveTimer = setInterval(function () {
      data.push(16 + Math.random() * 20);
      data.shift();
      render();
      // valores numéricos simulados
      const up = (99.93 + Math.random() * 0.06).toFixed(2);
      const req = (0.9 + Math.random() * 0.8).toFixed(1);
      const lat = Math.round(30 + Math.random() * 18);
      if (upEl) upEl.textContent = up + '%';
      if (reqEl) reqEl.textContent = req + 'k';
      if (latEl) latEl.textContent = lat;
    }, 1800);
  })();

  /* ---------- Spotlight que segue o cursor ---------- */
  (function cursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || reduceMotion || isTouch) return;
    let raf = null, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      glow.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(function () {
        glow.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
        raf = null;
      });
    });
    document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  })();

  /* ---------- Tilt 3D + brilho nos cards ---------- */
  (function tiltCards() {
    if (reduceMotion || isTouch) return;
    const cards = document.querySelectorAll('.skill-card, .case-card, .service-card, .edu-card');
    cards.forEach(function (card) {
      card.classList.add('tilt');
      const sheen = document.createElement('div');
      sheen.className = 'sheen';
      card.appendChild(sheen);

      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -6;
        const ry = (px - 0.5) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-8px)';
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  })();

  /* ---------- Barras de uptime do painel de status ---------- */
  (function statusBars() {
    const rows = document.querySelectorAll('.sp-bars');
    if (!rows.length) return;
    const N = 26;
    rows.forEach(function (el) {
      const warn = parseInt(el.dataset.warn || '0', 10);
      const positions = new Set();
      let guard = 0;
      while (positions.size < warn && guard < 50) {
        positions.add(8 + Math.floor(Math.random() * (N - 10)));
        guard++;
      }
      let html = '';
      for (let i = 0; i < N; i++) {
        const cls = positions.has(i) ? 'seg warn' : 'seg';
        html += '<span class="' + cls + '" style="--d:' + (i * 16) + 'ms"></span>';
      }
      el.innerHTML = html;
    });
  })();

  /* ---------- Guia em tela cheia (dentro do site) ---------- */
  (function embedFullscreen() {
    const btn = document.getElementById('embedFs');
    const win = document.querySelector('.embed-window');
    const frame = document.getElementById('embedFrame');
    const loader = document.getElementById('embedLoader');

    // Esconde o loader quando o guia terminar de carregar
    if (frame && loader) {
      frame.addEventListener('load', function () { loader.classList.add('hide'); });
      // failsafe: esconde após 12s mesmo se o load não disparar
      setTimeout(function () { loader.classList.add('hide'); }, 12000);
    }
    if (!btn || !win) return;

    function setFs(on) {
      win.classList.toggle('fullscreen', on);
      document.body.classList.toggle('no-scroll', on);
      btn.innerHTML = on
        ? '<i class="fa-solid fa-xmark"></i> Fechar'
        : '<i class="fa-solid fa-up-right-from-square"></i> Tela cheia';
      btn.setAttribute('aria-label', on ? 'Fechar tela cheia' : 'Ver em tela cheia');
      // Pausa/retoma o gráfico ao vivo para não pesar enquanto o guia está aberto
      if (on && liveTimer) { clearInterval(liveTimer); liveTimer = null; }
    }
    btn.addEventListener('click', function () {
      setFs(!win.classList.contains('fullscreen'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && win.classList.contains('fullscreen')) setFs(false);
    });
  })();

  /* ---------- Botão voltar ao topo ---------- */
  (function backToTop() {
    const btn = document.getElementById('toTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  })();

})();
