/* =====================================================
   Start to Finish Construction LLC — main.js
   Handles: navbar, scroll animations, gallery lightbox,
            hamburger menu, form, smooth interactions
   ===================================================== */

(function () {
  'use strict';

  /* ─── NAVBAR: transparent → solid on scroll ──────── */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ─── HAMBURGER MENU ─────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ─── SCROLL-REVEAL (Intersection Observer) ──────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── GALLERY LIGHTBOX ───────────────────────────── */
  const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  let currentIndex    = 0;

  function getImageSrc(item) {
    const img = item.querySelector('img');
    return img ? img.src : '';
  }
  function getImageAlt(item) {
    const img = item.querySelector('img');
    return img ? img.alt : '';
  }

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = getImageSrc(galleryItems[index]);
    lightboxImg.alt = getImageAlt(galleryItems[index]);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    lightboxImg.src = getImageSrc(galleryItems[currentIndex]);
    lightboxImg.alt = getImageAlt(galleryItems[currentIndex]);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    lightboxImg.src = getImageSrc(galleryItems[currentIndex]);
    lightboxImg.alt = getImageAlt(galleryItems[currentIndex]);
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);

  // Close on backdrop click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  showNext();
    if (e.key === 'ArrowLeft')   showPrev();
  });

  /* ─── CONTACT FORM ───────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const toast       = document.getElementById('toast');

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn[type="submit"]');
    const btnText = btn.querySelector('.btn-text');

    // Simple validation
    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#EF4444';
        valid = false;
      }
    });
    if (!valid) return;

    // Loading state
    btnText.textContent = 'Sending…';
    btn.disabled = true;
    btn.style.opacity = '0.75';

    // Simulate async send (swap with real endpoint when ready)
    setTimeout(() => {
      btnText.textContent = 'Send My Request';
      btn.disabled = false;
      btn.style.opacity = '';
      contactForm.reset();
      showToast();
    }, 1400);
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  /* ─── ACTIVE NAV LINK on scroll ─────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function onScrollSpy() {
    const navHeight = navbar ? navbar.offsetHeight : 80;
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - navHeight - 10;
      if (window.scrollY >= top) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  // Simple scroll spy with throttle
  let spyTick = false;
  window.addEventListener('scroll', () => {
    if (!spyTick) {
      requestAnimationFrame(() => { onScrollSpy(); spyTick = false; });
      spyTick = true;
    }
  }, { passive: true });

  /* ─── SMOOTH SCROLL OFFSET (account for sticky nav) */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h').trim(), 10) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─── HERO: navbar always scrolled (no transparent) 
         when page loads mid-way (e.g. anchor links)  */
  if (window.scrollY > 10) updateNavbar();

})();
