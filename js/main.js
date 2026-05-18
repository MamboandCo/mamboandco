/* ── Curseur ── */
(function () {
  var cursor = document.getElementById('cursor');
  if (!cursor) return;
  /* On gère position + centrage (-50%,-50%) entièrement en JS via transform */
  cursor.style.left = '0';
  cursor.style.top  = '0';
  var cx = 0, cy = 0, rafCursor = false;
  document.addEventListener('mousemove', function (e) {
    cx = e.clientX; cy = e.clientY;
    if (rafCursor) return;
    rafCursor = true;
    requestAnimationFrame(function () {
      cursor.style.transform = 'translate(calc(' + cx + 'px - 50%), calc(' + cy + 'px - 50%))';
      rafCursor = false;
    });
  }, { passive: true });
})();

/* ── Header scroll + on-dark detection ── */
(function () {
  var header = document.getElementById('header');
  var toggle = document.getElementById('menuToggle');

  /* ── Hide on scroll down / show on scroll up ── */
  var lastScrollY   = window.scrollY;
  var ticking       = false;
  var THRESHOLD     = 8;
  var TOP_ZONE      = 80;

  function handleHeaderVisibility() {
    var currentY = window.scrollY;
    var delta    = currentY - lastScrollY;

    if (header) {
      if (currentY <= TOP_ZONE) {
        header.classList.remove('header-hidden');
      } else if (delta > THRESHOLD) {
        header.classList.add('header-hidden');
        header.classList.remove('menu-open');
      } else if (delta < -THRESHOLD) {
        header.classList.remove('header-hidden');
      }
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    if (!ticking) {
      requestAnimationFrame(handleHeaderVisibility);
      ticking = true;
    }
  }, { passive: true });

  /* Sections à fond navy */
  if (header) {
    var darkSections = document.querySelectorAll('[data-theme="dark"]');
    if (darkSections.length) {
      var headerH = header.offsetHeight + 20;
      var io = new IntersectionObserver(function (entries) {
        var anyDark = false;
        darkSections.forEach(function (sec) {
          var r = sec.getBoundingClientRect();
          if (r.top <= headerH && r.bottom >= 0) anyDark = true;
        });
        header.classList.toggle('on-dark', anyDark);
      }, { threshold: 0, rootMargin: '-0px 0px -' + (window.innerHeight - headerH - 20) + 'px 0px' });
      darkSections.forEach(function (sec) { io.observe(sec); });
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
    document.querySelectorAll('.mobile-link, .mobile-cta').forEach(function (el) {
      el.addEventListener('click', function () { header.classList.remove('menu-open'); });
    });
  }
})();

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var href = a.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var header = document.getElementById('header');
    if (header) header.classList.remove('menu-open');
  });
});

/* ── Reveal IntersectionObserver ── */
(function () {
  var els = document.querySelectorAll('.reveal');

  /*
   * Stagger propre : on groupe les éléments par section parente.
   * Chaque section a son propre compteur d'index, de sorte que le délai
   * repart de 0 à chaque nouvelle section visible — pas de cumul global.
   */
  var io = new IntersectionObserver(function (entries) {
    /* Ne traiter que les entrées qui deviennent visibles */
    var visible = entries.filter(function (e) { return e.isIntersecting; });
    if (!visible.length) return;

    /* Regrouper par section parente (id) pour stagger indépendant */
    var groups = {};
    visible.forEach(function (entry) {
      var section = entry.target.closest('section[id]') || entry.target.closest('[id]') || document.body;
      var key = section.id || 'root';
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry.target);
    });

    Object.keys(groups).forEach(function (key) {
      /* Trier par position verticale pour un reveal de haut en bas */
      groups[key].sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });
      groups[key].forEach(function (el, i) {
        var delay = Math.min(i * 90, 360); /* max 360 ms de stagger */
        setTimeout(function () { el.classList.add('visible'); }, delay);
        io.unobserve(el);
      });
    });
  }, {
    threshold: 0.10,
    rootMargin: '0px 0px -40px 0px' /* déclenche un peu avant le bord */
  });

  els.forEach(function (el) { io.observe(el); });
})();

/* ── FAQ Accordion ── */
(function () {
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn    = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        el.querySelector('.faq-answer').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();