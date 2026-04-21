/* ============================================================
   POOL BUILDERS TEMPLATE — main.js
   Vanilla JS: mobile nav, FAQ accordion, carousel,
   gallery lightbox, count-up stats, form validation
   ============================================================ */

/* ── Utility ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Header scroll shadow ────────────────────────────────────── */
function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile nav ──────────────────────────────────────────────── */
function initMobileNav() {
  const hamburger = $('.hamburger');
  const mobileNav = $('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  let isOpen = false;

  function openNav() {
    isOpen = true;
    hamburger.classList.add('is-open');
    mobileNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    isOpen = false;
    hamburger.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => isOpen ? closeNav() : openNav());

  // Close on nav link tap
  $$('a', mobileNav).forEach(link => link.addEventListener('click', closeNav));

  // Close on Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) { closeNav(); hamburger.focus(); }
  });
}

/* ── FAQ Accordion ───────────────────────────────────────────── */
function initFaq() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = $('.faq-btn', item);
    const answer = $('.faq-answer', item);
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // One-open-at-a-time: close others
      items.forEach(other => {
        if (other !== item) {
          const otherBtn    = $('.faq-btn', other);
          const otherAnswer = $('.faq-answer', other);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.removeAttribute('data-open');
        }
      });

      btn.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        answer.setAttribute('data-open', 'true');
      } else {
        answer.removeAttribute('data-open');
      }
    });
  });
}

/* ── Testimonials Carousel ───────────────────────────────────── */
function initCarousel() {
  const track   = $('.carousel-track');
  const prevBtn = $('.carousel-btn[data-dir="prev"]');
  const nextBtn = $('.carousel-btn[data-dir="next"]');
  if (!track) return;

  function getVisibleCount() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768)  return 2;
    return 1;
  }

  function getCardWidth() {
    const card = track.firstElementChild;
    if (!card) return 0;
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  function scrollBy(dir) {
    track.scrollBy({ left: dir * getCardWidth(), behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollBy(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollBy(1));

  // Keyboard
  if (prevBtn) prevBtn.addEventListener('keydown', e => e.key === 'Enter' && scrollBy(-1));
  if (nextBtn) nextBtn.addEventListener('keydown', e => e.key === 'Enter' && scrollBy(1));
}

/* ── Count-Up Stats ──────────────────────────────────────────── */
function initCountUp() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const duration = 1800;

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = Math.min(now - start, duration);
      const progress = ease(elapsed / duration);
      const value    = target * progress;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (elapsed < duration) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

/* ── Gallery Lightbox ────────────────────────────────────────── */
function initLightbox() {
  const lightbox  = $('#lightbox');
  const lbImg     = lightbox && $('#lightbox-img', lightbox);
  const lbClose   = lightbox && $('.lightbox__close', lightbox);
  const lbPrev    = lightbox && $('.lightbox__prev', lightbox);
  const lbNext    = lightbox && $('.lightbox__next', lightbox);
  const lbCaption = lightbox && $('.lightbox__caption', lightbox);
  if (!lightbox || !lbImg) return;

  const items = $$('.gallery-item[data-src]');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = items[index];
    lbImg.src = item.dataset.src;
    lbImg.alt = item.dataset.alt || '';
    if (lbCaption) lbCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose && lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    items[currentIndex] && items[currentIndex].focus();
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + items.length) % items.length;
    const item = items[currentIndex];
    lbImg.src = item.dataset.src;
    lbImg.alt = item.dataset.alt || '';
    if (lbCaption) lbCaption.textContent = item.dataset.caption || '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', item.dataset.alt || `View image ${i + 1}`);
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  if (lbPrev) lbPrev.addEventListener('click', () => navigate(-1));
  if (lbNext) lbNext.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ── Gallery Filter Tabs ─────────────────────────────────────── */
function initGalleryFilter() {
  const tabs  = $$('.filter-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      // All images visible (filter is cosmetic in static template)
    });
  });
}

/* ── Form Validation ─────────────────────────────────────────── */
function initForms() {
  $$('form[data-validate]').forEach(form => {
    const successEl = form.parentElement.querySelector('.form-success');

    function validateField(input) {
      const errorEl = document.getElementById(input.getAttribute('aria-describedby'));
      const val     = input.value.trim();
      let   msg     = '';

      if (input.required && !val) {
        msg = 'This field is required.';
      } else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = 'Please enter a valid email address.';
      } else if (input.dataset.type === 'phone' && val && !/^[\d\s\-\+\(\)]{7,}$/.test(val)) {
        msg = 'Please enter a valid phone number.';
      }

      if (msg) {
        input.classList.add('is-error');
        if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('visible'); }
        return false;
      } else {
        input.classList.remove('is-error');
        if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('visible'); }
        return true;
      }
    }

    // Live validation on blur
    $$('input, textarea, select', form).forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-error')) validateField(input);
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Honeypot check
      const hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) return;

      let isValid = true;
      $$('input:not([type=hidden]):not([name="_gotcha"]), textarea, select', form).forEach(input => {
        if (!validateField(input)) isValid = false;
      });
      if (!isValid) return;

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        const data = new FormData(form);
        const res  = await fetch(form.action, {
          method: 'POST',
          body:   data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        } else {
          throw new Error('Server error');
        }
      } catch {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        }
        const errRegion = form.querySelector('[aria-live]');
        if (errRegion) errRegion.textContent = 'Something went wrong. Please call us directly.';
      }
    });
  });
}

/* ── Newsletter Form ─────────────────────────────────────────── */
function initNewsletter() {
  $$('form[data-newsletter]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const emailInput = form.querySelector('[type="email"]');
      const btn        = form.querySelector('button');
      const msg        = form.querySelector('.newsletter-msg');

      if (!emailInput || !emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        if (msg) { msg.textContent = 'Please enter a valid email.'; msg.style.color = 'var(--color-error)'; }
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

      try {
        await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
        if (msg) { msg.textContent = 'You\'re subscribed — thanks!'; msg.style.color = 'var(--color-success)'; }
        emailInput.value = '';
      } catch {
        if (msg) { msg.textContent = 'Could not subscribe. Try again later.'; msg.style.color = 'var(--color-error)'; }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
      }
    });
  });
}

/* ── Smooth anchor scroll (respects reduced motion) ──────────── */
function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initFaq();
  initCarousel();
  initCountUp();
  initLightbox();
  initGalleryFilter();
  initForms();
  initNewsletter();
  initSmoothScroll();
});
