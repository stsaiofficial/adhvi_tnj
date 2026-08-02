document.addEventListener('DOMContentLoaded', () => {

  /* ---------- THEME TOGGLE ---------- */
  const root = document.documentElement;
  const THEME_KEY = 'adhvi-theme';
  const themeToggles = document.querySelectorAll('.theme-toggle');

  const storeTheme = (theme) => {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    themeToggles.forEach(btn => {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      const label = btn.querySelector('.theme-toggle-label');
      if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
    });
  };

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  });

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hide'), 400);
    });
    setTimeout(() => preloader.classList.add('hide'), 2000);
  }

  /* ---------- STICKY NAV SCROLL ---------- */
  const nav = document.getElementById('nav');
  const onScrollNav = () => {
    if (window.scrollY > 50) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- MOBILE DRAWER WITH EXPLICIT CLOSE BUTTON ---------- */
  const hamburger = document.getElementById('hamburger');
  const drawerClose = document.getElementById('drawerClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  const openDrawer = () => {
    hamburger?.classList.add('open');
    mobileDrawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    hamburger?.classList.remove('open');
    mobileDrawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', () => {
    if (mobileDrawer?.classList.contains('open')) closeDrawer();
    else openDrawer();
  });

  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  mobileDrawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ---------- ACTIVE NAV LINK ON SCROLL ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"], .drawer-links a[href^="#"]');

  const setActiveNav = () => {
    let current = sections[0]?.id;
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 140) current = sec.id;
    });
    navAnchors.forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === '#' + current);
    });
  };
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- SCROLL REVEAL ANIMATION ---------- */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- COUNT UP STATS ---------- */
  const nums = document.querySelectorAll('.num');
  const countUp = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        statIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => statIO.observe(n));

  /* ---------- HERO VIDEO BACKGROUND CYCLING ---------- */
  const heroSlides = document.querySelectorAll('.hero-video-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  let currentHeroSlide = 0;
  let heroInterval = null;

  const switchHeroSlide = (idx) => {
    heroSlides.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
      if (i === idx) {
        // Preload and play
        s.preload = 'auto';
        s.play().catch(() => {});
      } else {
        s.pause();
      }
    });
    document.querySelectorAll('.hero-dot').forEach((d, i) => d?.classList.toggle('active', i === idx));
    currentHeroSlide = idx;
  };

  if (heroSlides.length > 0) {
    // Play first video immediately
    heroSlides[0].play().catch(() => {});

    // Auto-cycle every 8 seconds
    heroInterval = setInterval(() => {
      const next = (currentHeroSlide + 1) % heroSlides.length;
      switchHeroSlide(next);
    }, 8000);

    // Dots click
    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
      dot?.addEventListener('click', () => {
        clearInterval(heroInterval);
        switchHeroSlide(i);
        heroInterval = setInterval(() => {
          const next = (currentHeroSlide + 1) % heroSlides.length;
          switchHeroSlide(next);
        }, 8000);
      });
    });
  }

  /* ---------- REELS FILTER TABS (PORT = PORTFOLIO) ---------- */
  const reelTabs = document.querySelectorAll('.reel-tab');
  const reelItems = document.querySelectorAll('.reel-card-item');
  const featuredBanner = document.querySelector('.featured-reels-banner');

  reelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      reelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;

      // Show/hide featured banner (port-05, 06, 07) only when featured or all is selected
      if (featuredBanner) {
        featuredBanner.style.display = (filter === 'all' || filter === 'featured') ? '' : 'none';
      }

      // Filter carousel reel items
      reelItems.forEach(item => {
        const cat = item.dataset.category || '';
        const show = filter === 'all' || cat.split(' ').includes(filter);
        item.style.display = show ? '' : 'none';
        item.style.opacity = show ? '1' : '0';
        if (show) {
          item.style.removeProperty('display');
          item.style.display = '';
        }
      });

      // After filtering, check if track has items and scroll to start
      if (reelsTrack) reelsTrack.scrollTo({ left: 0, behavior: 'smooth' });
    });
  });

  /* Reels Carousel Navigation */
  const reelsTrack = document.getElementById('reelsTrack');
  const reelPrev = document.getElementById('reelPrev');
  const reelNext = document.getElementById('reelNext');

  if (reelsTrack && reelPrev && reelNext) {
    const getScrollWidth = () => {
      const firstVisible = reelsTrack.querySelector('.reel-card-item:not([style*="display: none"])');
      return firstVisible ? firstVisible.offsetWidth + 18 : 280;
    };
    reelPrev.addEventListener('click', () => reelsTrack.scrollBy({ left: -getScrollWidth(), behavior: 'smooth' }));
    reelNext.addEventListener('click', () => reelsTrack.scrollBy({ left: getScrollWidth(), behavior: 'smooth' }));
  }

  /* Auto Play Preview Videos on Scroll/Hover */
  const videoElements = document.querySelectorAll('.video-preview-wrap video, .reel-media-box video');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.play().catch(() => {});
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.4 });
  videoElements.forEach(v => videoObserver.observe(v));

  /* ---------- VIDEO REEL LIGHTBOX MODAL ---------- */
  const videoModal = document.getElementById('videoModal');
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');
  const videoModalClose = document.getElementById('videoModalClose');
  const modalVideo = document.getElementById('modalVideo');
  const modalVideoTitle = document.getElementById('modalVideoTitle');
  const modalVideoLikes = document.getElementById('modalVideoLikes');

  const openVideoModal = (src, title, likes) => {
    if (!videoModal || !modalVideo) return;
    modalVideo.src = src;
    modalVideo.muted = false; // Unmute sound in lightbox modal
    if (modalVideoTitle) modalVideoTitle.textContent = title || 'Bridal Transformation Reel';
    if (modalVideoLikes) modalVideoLikes.textContent = `❤️ ${likes || 'Viral'} Likes`;

    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalVideo.play().catch(() => {
      modalVideo.muted = true; // Fallback if browser blocks unmuted autoplay
      modalVideo.play();
    });
  };

  const closeVideoModal = () => {
    if (!videoModal || !modalVideo) return;
    videoModal.classList.remove('open');
    modalVideo.pause();
    modalVideo.src = '';
    document.body.style.overflow = '';
  };

  /* Attach click events to Featured Banner & Reel Cards */
  document.querySelectorAll('.featured-reel-card, .reel-card-item').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.video;
      const title = card.dataset.title;
      const likes = card.dataset.likes;
      if (src) openVideoModal(src, title, likes);
    });
  });

  videoModalClose?.addEventListener('click', closeVideoModal);
  videoModalBackdrop?.addEventListener('click', closeVideoModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal?.classList.contains('open')) {
      closeVideoModal();
    }
  });

  /* ---------- INTERACTIVE ESTIMATOR CALCULATOR — ENHANCED ---------- */
  const calcOccasion = document.getElementById('calcOccasion');
  const calcFinish = document.getElementById('calcFinish');
  const calcAddons = document.getElementById('calcAddons');
  const resTitle = document.getElementById('resTitle');
  const resDesc = document.getElementById('resDesc');
  const resPrice = document.getElementById('resPrice');
  const calcBookBtn = document.getElementById('calcBookBtn');

  let selectedOccasion = 'Muhurtham Bridal';
  let selectedOccasionPrice = 8000;
  let selectedFinish = 'HD Airbrush (18hr Stay)';
  let selectedFinishPrice = 3000;
  let selectedAddons = [];

  // Description lookup
  const occasionDescriptions = {
    'Muhurtham Bridal': 'Traditional silk sari, 18-hour airbrush base, saree pleating & jewellery placement for your muhurtham ceremony.',
    'Reception Glam': 'Camera-ready luminous skin, soft smoky eye, HD finish & reception-ready hair styling.',
    'Engagement': 'Dewy soft glam, subtle contouring & elegant hair styling for your engagement ceremony.',
    'Party / Guest': 'Quick glam makeover with bold lips, defined eyes & stylish hair for parties & events.'
  };

  const finishDescriptions = {
    'HD Airbrush (18hr Stay)': 'Featherlight micro-mist airbrush — sweat, tear & humidity proof for 18+ hours. Perfect for 4K video.',
    'Traditional Ultra HD': 'Expert hand-blended HD foundation with flawless skin-like finish ideal for all lighting.',
    'Glass Skin Dewy': 'Skin-first glass skin prep with luminous dewy glow — hydrated, healthy, poreless finish.'
  };

  const formatPrice = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const updateEstimator = () => {
    if (!resTitle || !resDesc || !resPrice) return;

    // Calculate add-ons total
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const totalPrice = selectedOccasionPrice + selectedFinishPrice + addonsTotal;

    // Update title
    resTitle.textContent = `${selectedOccasion} — ${selectedFinish}`;

    // Update description
    const oDesc = occasionDescriptions[selectedOccasion] || '';
    const fDesc = finishDescriptions[selectedFinish] || '';
    const addonsText = selectedAddons.length > 0
      ? ` Includes: ${selectedAddons.map(a => a.name).join(', ')}.`
      : '';
    resDesc.textContent = oDesc + ' ' + fDesc + addonsText;

    // Update price with animation
    resPrice.style.transform = 'scale(1.15)';
    resPrice.style.color = '#F0C992';
    setTimeout(() => {
      resPrice.textContent = formatPrice(totalPrice);
      resPrice.style.transform = 'scale(1)';
      resPrice.style.color = '';
    }, 150);
  };

  // Occasion chips — single select
  calcOccasion?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      calcOccasion.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedOccasion = chip.dataset.val;
      selectedOccasionPrice = parseInt(chip.dataset.price || '0', 10);
      updateEstimator();
    });
  });

  // Finish chips — single select
  calcFinish?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      calcFinish.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedFinish = chip.dataset.val;
      selectedFinishPrice = parseInt(chip.dataset.price || '0', 10);
      updateEstimator();
    });
  });

  // Add-on chips — multi select toggle
  calcAddons?.querySelectorAll('.chip-addon').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const name = chip.dataset.val;
      const price = parseInt(chip.dataset.price || '0', 10);
      if (chip.classList.contains('active')) {
        selectedAddons.push({ name, price });
      } else {
        selectedAddons = selectedAddons.filter(a => a.name !== name);
      }
      updateEstimator();
    });
  });

  // Book button — opens WhatsApp with full details
  calcBookBtn?.addEventListener('click', () => {
    const addonsStr = selectedAddons.length > 0
      ? `%0AAdd-ons: ${selectedAddons.map(a => a.name).join(', ')}`
      : '';
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const totalPrice = selectedOccasionPrice + selectedFinishPrice + addonsTotal;
    const text = encodeURIComponent(
      `Hi Adhvi Bridal Studio! 💄\n\nI'm interested in booking the following package:\n\n` +
      `🌸 Occasion: ${selectedOccasion}\n` +
      `✨ Finish: ${selectedFinish}` +
      (selectedAddons.length > 0 ? `\n🎀 Add-ons: ${selectedAddons.map(a => a.name).join(', ')}` : '') +
      `\n💰 Est. Budget: ${formatPrice(totalPrice)}\n\nPlease share available dates and final pricing. Thank you!`
    );
    window.open(`https://wa.me/919865280281?text=${text}`, '_blank');
  });

  // Initialize estimator display
  updateEstimator();

  /* ---------- QUICK BOOKING MODAL DRAWER ---------- */
  const bookingModal = document.getElementById('bookingModal');
  const bookingModalBackdrop = document.getElementById('bookingModalBackdrop');
  const bookingModalClose = document.getElementById('bookingModalClose');
  const mService = document.getElementById('mService');

  const openBookingModal = (serviceName) => {
    if (!bookingModal) return;
    if (serviceName && mService) {
      mService.value = serviceName;
    }
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeBookingModal = () => {
    if (!bookingModal) return;
    bookingModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.open-booking-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const service = btn.dataset.service;
      openBookingModal(service);
    });
  });

  bookingModalClose?.addEventListener('click', closeBookingModal);
  bookingModalBackdrop?.addEventListener('click', closeBookingModal);

  /* Modal Form Submit */
  const modalForm = document.getElementById('modalBookingForm');
  modalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('mName')?.value.trim();
    const phone = document.getElementById('mPhone')?.value.trim();
    const service = document.getElementById('mService')?.value;
    const date = document.getElementById('mDate')?.value;
    const message = document.getElementById('mMessage')?.value.trim();

    if (!name || !phone || !service) {
      showToast('Please fill in your Name, Phone and Service.');
      return;
    }

    let text = `Hi Adhvi Bridal Studio! I'd like to book an appointment.%0A%0A`;
    text += `*Name:* ${encodeURIComponent(name)}%0A`;
    text += `*Phone:* ${encodeURIComponent(phone)}%0A`;
    text += `*Service:* ${encodeURIComponent(service)}%0A`;
    if (date) text += `*Date:* ${encodeURIComponent(date)}%0A`;
    if (message) text += `*Notes:* ${encodeURIComponent(message)}%0A`;

    window.open(`https://wa.me/919865280281?text=${text}`, '_blank');
    showToast('Opening WhatsApp with your enquiry...');
    closeBookingModal();
    modalForm.reset();
  });

  /* ---------- GALLERY LIGHTBOX ---------- */
  const galleryTrack = document.getElementById('galleryTrack');
  const galPrev = document.getElementById('galPrev');
  const galNext = document.getElementById('galNext');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (galleryTrack && galPrev && galNext) {
    const scrollGal = () => 320;
    galPrev.addEventListener('click', () => galleryTrack.scrollBy({ left: -scrollGal(), behavior: 'smooth' }));
    galNext.addEventListener('click', () => galleryTrack.scrollBy({ left: scrollGal(), behavior: 'smooth' }));
  }

  galleryTrack?.querySelectorAll('button[data-full]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.full;
      const img = btn.querySelector('img');
      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = img?.alt || '';
      }
      lightbox?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  lightboxClose?.addEventListener('click', () => {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- CONTACT SECTION FORM ---------- */
  const bookingForm = document.getElementById('bookingForm');
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = bookingForm.querySelector('[name="name"]')?.value.trim();
    const phone = bookingForm.querySelector('[name="phone"]')?.value.trim();
    const service = bookingForm.querySelector('[name="service"]')?.value;
    const date = bookingForm.querySelector('[name="date"]')?.value;
    const message = bookingForm.querySelector('[name="message"]')?.value.trim();

    if (!name || !phone || !service) {
      showToast('Please fill in Name, Phone and Service.');
      return;
    }

    let text = `Hi Adhvi Bridal Studio! I'd like to make an enquiry.%0A%0A`;
    text += `*Name:* ${encodeURIComponent(name)}%0A`;
    text += `*Phone:* ${encodeURIComponent(phone)}%0A`;
    text += `*Service:* ${encodeURIComponent(service)}%0A`;
    if (date) text += `*Preferred Date:* ${encodeURIComponent(date)}%0A`;
    if (message) text += `*Venue / Notes:* ${encodeURIComponent(message)}%0A`;

    window.open(`https://wa.me/919865280281?text=${text}`, '_blank');
    showToast('Opening WhatsApp with your details...');
    bookingForm.reset();
  });

  /* ---------- TOAST ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById('backToTop');
  const toggleBackToTop = () => {
    const show = window.scrollY > 400;
    if (backToTop) {
      backToTop.hidden = false;
      backToTop.classList.toggle('show', show);
    }
  };
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
