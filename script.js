/* ==============================================================
   Ali Kashani — Portfolio
   Single vanilla JS file. No dependencies.
   ============================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Footer year
     ---------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     2. Mobile nav toggle
     ---------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu after clicking a link
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     3. Sticky-nav border-on-scroll
     ---------------------------------------------------------- */
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 8) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ----------------------------------------------------------
     4. Active nav link based on visible section
     ---------------------------------------------------------- */
  const navLinkEls = Array.from(document.querySelectorAll('.nav__link'));
  const sectionMap = new Map(); // id -> link element

  navLinkEls.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      sectionMap.set(href.slice(1), link);
    }
  });

  if (sectionMap.size > 0 && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible entry currently intersecting.
        let best = null;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (!best) return;
        const id = best.target.id;
        navLinkEls.forEach((l) => l.classList.remove('is-active'));
        const activeLink = sectionMap.get(id);
        if (activeLink) activeLink.classList.add('is-active');
      },
      {
        // Trigger when the section is roughly in the middle band of the viewport.
        rootMargin: '-40% 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionMap.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  /* ----------------------------------------------------------
     5. Section reveal on scroll
     ---------------------------------------------------------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     6. Filterable card grids
     Buttons specify data-filter (tag) + data-target (grid id).
     Cards in the grid declare data-tags="python ml ..." (space-sep).
     ---------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter[data-target]');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const filter = (btn.getAttribute('data-filter') || 'all').toLowerCase();
      const grid = document.getElementById(targetId);
      if (!grid) return;

      // Update active state across this filter group only
      grid.parentElement
        .querySelectorAll(`.filter[data-target="${targetId}"]`)
        .forEach((b) => b.classList.toggle('is-active', b === btn));

      // Show / hide cards
      grid.querySelectorAll('[data-tags]').forEach((card) => {
        const tags = (card.getAttribute('data-tags') || '').toLowerCase().split(/\s+/);
        const match = filter === 'all' || tags.includes(filter);
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ----------------------------------------------------------
     7. Card "Read more" toggle
     ---------------------------------------------------------- */
  document.querySelectorAll('.js-toggle-more').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card) return;
      const more = card.querySelector('.card__more');
      if (!more) return;
      const isHidden = more.hasAttribute('hidden');
      if (isHidden) {
        more.removeAttribute('hidden');
        btn.textContent = 'Read less';
        btn.setAttribute('aria-expanded', 'true');
      } else {
        more.setAttribute('hidden', '');
        btn.textContent = 'Read more';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ----------------------------------------------------------
     8. Location map (Leaflet + OpenStreetMap / Carto tiles)
     ---------------------------------------------------------- */
  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    const TORONTO = [43.6532, -79.3832];

    const map = L.map(mapEl, {
      center: TORONTO,
      zoom: 4,
      minZoom: 2,
      maxZoom: 19,
      worldCopyJump: true,
      scrollWheelZoom: true,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    const pin = L.circleMarker(TORONTO, {
      radius: 9,
      color: '#1f1b16',
      weight: 2,
      fillColor: '#c25a3a',
      fillOpacity: 1,
    }).addTo(map);

    pin.bindPopup('<strong>Toronto, Canada</strong>').openPopup();

    // Recompute size if the map becomes visible / window resizes.
    window.addEventListener('resize', () => map.invalidateSize());
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) map.invalidateSize();
        });
      });
      io.observe(mapEl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
