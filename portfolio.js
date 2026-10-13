/* ==========================================================
   PORTFÓLIO · Davi Ramos — JavaScript novo (sem dependências)
   1 Tema · 2 Menu · 3 Digitação · 4 Reveal · 5 Contadores
   6 Filtro · 7 Brilho nos cards · 8 Scroll (nav, spy, topo) · 9 Compartilhar
   ========================================================== */
(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* 1. TEMA claro/escuro (salvo no navegador) ---------------- */
  const themeBtn = $('#theme'), themeMeta = $('meta[name=theme-color]');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    if (themeMeta) themeMeta.setAttribute('content', t === 'light' ? '#faf7f2' : '#0a0a0f');
    themeBtn.setAttribute('aria-label', t === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
  };
  applyTheme(root.dataset.theme || 'dark');
  themeBtn.addEventListener('click', () => {
    const t = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(t);
    try { localStorage.setItem('theme', t); } catch (e) { /* modo privado */ }
  });

  /* 2. MENU MOBILE ------------------------------------------- */
  const nav = $('#nav'), burger = $('#burger');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('.links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 820) setMenu(false); }, { passive: true });

  /* 3. TEXTO DIGITADO NO HERO -------------------------------- */
  const typed = $('#typed');
  const roles = ['Desenvolvedor Front-End', 'UX/UI Designer', 'Criador de interfaces'];
  if (!reduce) {
    let r = 0, c = 0, del = false;
    (function tick() {
      if (document.hidden) return setTimeout(tick, 600);
      const word = roles[r];
      c += del ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let wait = del ? 35 : 75;
      if (!del && c === word.length) { del = true; wait = 1500; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  }

  /* 4. REVEAL AO ROLAR --------------------------------------- */
  const reveals = $$('.reveal');
  if (hasIO) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const sibs = [...e.target.parentElement.children].filter((n) => n.classList.contains('reveal'));
      e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 70 + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    }), { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('in'));

  /* 5. CONTADORES -------------------------------------------- */
  const count = (el) => {
    const end = +el.dataset.n, t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 1300);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const nums = $$('[data-n]');
  if (hasIO && !reduce) {
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); }
    }), { threshold: .6 });
    nums.forEach((n) => { n.textContent = '0'; cio.observe(n); });
  }

  /* 6. FILTRO DE PROJETOS ------------------------------------ */
  const filters = $$('.filter'), projs = $$('.proj');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => b.setAttribute('aria-pressed', b === btn));
    let n = 0;
    projs.forEach((p) => {
      const show = btn.dataset.f === 'all' || p.dataset.cat === btn.dataset.f;
      p.hidden = !show;
      if (!show) return;
      p.classList.add('in');
      p.style.transitionDelay = '0ms';
      p.style.setProperty('--i', n++);
      p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
    });
  }));

  /* 7. BRILHO QUE SEGUE O MOUSE (só desktop) ----------------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.card').forEach((card) => {
      let raf = 0, ev;
      card.addEventListener('pointermove', (e) => {
        ev = e; if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100) + '%');
          card.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100) + '%');
        });
      }, { passive: true });
    });
  }

  /* 8. SCROLL: borda da nav, botão topo e seção ativa -------- */
  const toTop = $('#totop'); let tick = false;
  const onScroll = () => {
    tick = false;
    nav.classList.toggle('scrolled', scrollY > 8);
    toTop.classList.toggle('show', scrollY > 700);
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  if (hasIO) {
    const links = $$('.links a[href^="#"]');
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* 9. COMPARTILHAR (menu nativo do celular; copia o link no desktop) */
  const toast = $('#toast'); let toastT;
  const say = (msg) => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2400);
  };
  $('#share').addEventListener('click', async () => {
    const data = {
      title: document.title,
      text: 'Conheça o portfólio de Davi Ramos',
      url: location.href.split('#')[0]          /* sempre o link limpo da página */
    };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      say('Link copiado ✓');
    } catch (err) {
      if (err && err.name === 'AbortError') return;   /* usuário fechou o menu */
      window.prompt('Copie o link:', data.url);        /* último recurso (http/file) */
    }
  });

  $('#year').textContent = new Date().getFullYear();
})();
