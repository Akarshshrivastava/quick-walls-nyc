/* ==========================================================
   MAIN.JS — Quick Wall NYC
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initScrollReveal();
  initSmoothScroll();
  initScrollSpy();
  initBeforeAfterSliders();
  initGalleryLightbox();
  initGalleryToggle();
  initContactForm();
});

/* ----------------------------------------------------------
   NAVBAR — add .scrolled class after 60px
   ---------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const handler = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handler, { passive: true });
  handler();
}

/* ----------------------------------------------------------
   HAMBURGER MENU
   ---------------------------------------------------------- */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    btn.classList.add('open');
    links.classList.add('open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    isOpen = false;
    btn.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is tapped
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close when tapping outside the menu
  document.addEventListener('click', e => {
    if (isOpen && !btn.contains(e.target) && !links.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}

/* ----------------------------------------------------------
   SCROLL REVEAL
   ---------------------------------------------------------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => observer.observe(el));
}

/* ----------------------------------------------------------
   SMOOTH SCROLL — offset for fixed navbar
   ---------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight ?? 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ----------------------------------------------------------
   SCROLL SPY — highlight active nav link
   ---------------------------------------------------------- */
function initScrollSpy() {
  const sections = [
    'services',
    'gallery',
    'about',
    'contact',
  ]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links = document.querySelectorAll('.nav-links a[data-section]');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[data-section="${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  sections.forEach(s => observer.observe(s));
}

/* ----------------------------------------------------------
   BEFORE / AFTER COMPARE SLIDERS
   Each [data-compare] element contains:
     .ba-after (clipped layer)
     .ba-handle-track (the draggable line + button)
   ---------------------------------------------------------- */
function initBeforeAfterSliders() {
  document.querySelectorAll('[data-compare]').forEach(slider => {
    const afterLayer  = slider.querySelector('.ba-after');
    const handleTrack = slider.querySelector('.ba-handle-track');
    if (!afterLayer || !handleTrack) return;

    let dragging = false;

    function setPosition(clientX) {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(3, Math.min(97, pct));
      // Clip the "after" layer from the right — reveal grows left to right
      afterLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handleTrack.style.left = pct + '%';
    }

    // Start drag on handle button or anywhere on slider
    handleTrack.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
    slider.addEventListener('mousedown', e => { dragging = true; setPosition(e.clientX); });
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });

    // Touch support
    handleTrack.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
    document.addEventListener('touchend', () => { dragging = false; });
    document.addEventListener('touchmove', e => {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });

    // Initialise at 50%
    const rect = slider.getBoundingClientRect();
    setPosition(rect.left + rect.width / 2);
  });
}

/* ----------------------------------------------------------
   GALLERY LIGHTBOX
   ---------------------------------------------------------- */
function initGalleryLightbox() {
  const items    = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const img      = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn  = document.getElementById('lightboxPrev');
  const nextBtn  = document.getElementById('lightboxNext');
  if (!lightbox || !items.length) return;

  let current = 0;
  const srcs  = Array.from(items).map(el => el.querySelector('img').src);

  function open(idx) {
    current = (idx + srcs.length) % srcs.length;
    img.src = srcs[current];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => open(current - 1));
  nextBtn.addEventListener('click', () => open(current + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  open(current - 1);
    if (e.key === 'ArrowRight') open(current + 1);
  });
}

/* ----------------------------------------------------------
   GALLERY MOBILE TOGGLE
   ---------------------------------------------------------- */
function initGalleryToggle() {
  const btn    = document.getElementById('galleryToggleBtn');
  const label  = document.getElementById('galleryToggleLabel');
  const icon   = document.getElementById('galleryToggleIcon');
  const extras = document.querySelectorAll('.gallery-extra');
  if (!btn || !extras.length) return;

  let open = false;

  btn.addEventListener('click', () => {
    open = !open;
    extras.forEach(el => el.classList.toggle('shown', open));
    const baseCount = document.querySelectorAll('.gallery-item:not(.gallery-extra)').length;
    const total = baseCount + extras.length;
    label.textContent = open ? 'Show Less' : `Show All ${total} Photos`;
    btn.classList.toggle('open', open);

    if (open) {
      extras.forEach(el => {
        if (!el.classList.contains('visible')) el.classList.add('visible');
      });
    }
  });
}

/* ----------------------------------------------------------
   CONTACT FORM
   ---------------------------------------------------------- */
function initContactForm() {
  const form  = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toastMsg');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      const ok = field.value.trim() !== '' && (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
      field.style.borderColor = ok ? '' : '#CC1A1A';
      if (!ok) valid = false;
    });

    if (!valid) {
      showToast('Please fill in all required fields.', false);
      return;
    }

    showToast('Your request has been sent! We\'ll be in touch soon.');
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(f => f.style.borderColor = '');
  });

  function showToast(message, success = true) {
    msg.textContent = message;
    const icon = toast.querySelector('svg');
    icon.style.color = success ? '#22c55e' : '#CC1A1A';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
}
