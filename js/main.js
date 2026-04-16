/* ==========================================================
   MAIN.JS — Fine Lines Pavement LLC
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initScrollReveal();
  initSmoothScroll();
  initScrollSpy();
  initGalleryLightbox();
  initGalleryToggle();
  initContactForm();
  initBASlider('baSlider1', 'baAfter1', 'baHandle1');
  initBASlider('baSlider2', 'baAfter2', 'baHandle2');
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
  handler(); // run on load in case page is refreshed mid-scroll
}

/* ----------------------------------------------------------
   HAMBURGER MENU
   ---------------------------------------------------------- */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on any nav link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
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
    'before-after',
    'about',
    'process',
    'contact',
  ]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links    = document.querySelectorAll('.nav-links a[data-section]');

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
   BEFORE & AFTER DRAG SLIDER
   ---------------------------------------------------------- */
function initBASlider(sliderId, afterId, handleId) {
  const slider = document.getElementById(sliderId);
  const after  = document.getElementById(afterId);
  const handle = document.getElementById(handleId);
  if (!slider || !after || !handle) return;

  let dragging = false;
  let pct = 50; // start at 50%

  function setPct(x) {
    const rect = slider.getBoundingClientRect();
    pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
    after.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left     = `${pct}%`;
  }

  // Initialise at 50%
  after.style.clipPath = 'inset(0 50% 0 0)';
  handle.style.left    = '50%';

  slider.addEventListener('mousedown',  e => { dragging = true; setPct(e.clientX); });
  slider.addEventListener('touchstart', e => { dragging = true; setPct(e.touches[0].clientX); }, { passive: true });

  window.addEventListener('mousemove',  e => { if (dragging) setPct(e.clientX); });
  window.addEventListener('touchmove',  e => { if (dragging) setPct(e.touches[0].clientX); }, { passive: true });

  window.addEventListener('mouseup',    () => { dragging = false; });
  window.addEventListener('touchend',   () => { dragging = false; });

  // Keyboard accessibility
  handle.setAttribute('tabindex', '0');
  handle.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { pct = Math.max(0, pct - 2);   after.style.clipPath = `inset(0 ${100-pct}% 0 0)`; handle.style.left = `${pct}%`; }
    if (e.key === 'ArrowRight') { pct = Math.min(100, pct + 2); after.style.clipPath = `inset(0 ${100-pct}% 0 0)`; handle.style.left = `${pct}%`; }
  });
}

/* ----------------------------------------------------------
   GALLERY MOBILE TOGGLE — show/hide extra photos
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
    label.textContent = open ? 'Show Less' : `Show All ${extras.length + 6} Photos`;
    btn.classList.toggle('open', open);

    // Trigger reveal on newly shown items
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

    // Simulate submission (replace with real endpoint)
    showToast('Your request has been sent! We\'ll be in touch within 1 business day.');
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

  // Clear red border on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
}
