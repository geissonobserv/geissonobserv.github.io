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

  /* ---------- Ano dinâmico no rodapé (mantém atualizado) ---------- */
  // O texto fixo é 2026; aqui apenas garantimos consistência caso queira automatizar.
})();
