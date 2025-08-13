// Theme: system preference + toggle persistence
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

  function applyTheme(mode) {
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'auto');
    }
  }

  applyTheme(saved || 'auto');
  prefersLight.addEventListener('change', () => {
    if (!localStorage.getItem('theme') || localStorage.getItem('theme') === 'auto') {
      applyTheme('auto');
    }
  });

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }
})();

// Mobile nav toggle
(function initMenu() {
  const btn = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
  // close on link click
  menu.addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName === 'A') {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Smooth scrolling and active link highlighting
(function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  // smooth scroll for internal links
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', href);
        }
      }
    });
  });

  // intersection observer for active state
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = '#' + entry.target.id;
        const link = links.find((l) => l.getAttribute('href') === id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          });
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.6, 1] }
  );

  if (sections.length > 0) {
    sections.forEach((s) => observer.observe(s));
  } else {
    // Multi-page: highlight based on current path
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach((l) => {
      const href = (l.getAttribute('href') || '').toLowerCase();
      const isActive = href === current || (current === '' && href.endsWith('index.html'));
      if (isActive) {
        links.forEach((x) => {
          x.classList.remove('active');
          x.removeAttribute('aria-current');
        });
        l.classList.add('active');
        l.setAttribute('aria-current', 'page');
      }
    });
  }
})();

// Motion One animations (by Framer): reveal on enter, hovers, page transitions
(function initMotion() {
  const motion = window.motion || {};
  const animate = motion.animate;
  const inView = motion.inView;
  const stagger = motion.stagger;
  if (!animate || !inView) return;

  // Page load reveal
  const overlay = document.getElementById('pageTransition');
  if (overlay) {
    overlay.style.transform = 'translateY(0%)';
    animate(overlay, { y: ['0%', '100%'] }, { duration: 0.6, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }

  // Section fade-in + slide-up on enter
  const sections = document.querySelectorAll('section.section');
  sections.forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(18px)';
    inView(
      section,
      () => {
        // Stagger children a bit for a nicer effect
        const children = section.querySelectorAll('h1, h2, p, .cta-row > *, .projects-grid > *, .skills > *, .form-field, .card-actions');
        if (children.length) {
          children.forEach((el) => (el.style.opacity = '0'));
          animate(children, { opacity: [0, 1], y: [10, 0] }, { duration: 0.6, delay: stagger(0.06), easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        }
        animate(section, { opacity: 1, y: 0 }, { duration: 0.7, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      },
      { amount: 0.2, once: true }
    );
  });

  // Generic fade-in on scroll for elements marked with [data-reveal] or .reveal
  const revealables = document.querySelectorAll('[data-reveal], .reveal');
  revealables.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    inView(
      el,
      () => {
        animate(el, { opacity: [0, 1], y: [12, 0] }, { duration: 0.55, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      },
      { amount: 0.15, once: true }
    );
  });

  // Hover effects on buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach((el) => {
    el.addEventListener('mouseenter', () => animate(el, { scale: 1.03 }, { duration: 0.2 }));
    el.addEventListener('mouseleave', () => animate(el, { scale: 1.0 }, { duration: 0.2 }));
    el.addEventListener('mousedown', () => animate(el, { scale: 0.98 }, { duration: 0.08 }));
    el.addEventListener('mouseup', () => animate(el, { scale: 1.03 }, { duration: 0.12 }));
  });

  // Hover effects on project cards
  const cards = document.querySelectorAll('.card.project');
  cards.forEach((el) => {
    el.style.transformOrigin = 'center';
    el.addEventListener('mouseenter', () => animate(el, { scale: 1.02, y: -4 }, { duration: 0.25 }));
    el.addEventListener('mouseleave', () => animate(el, { scale: 1, y: 0 }, { duration: 0.25 }));
  });

  // Card tilt interaction
  cards.forEach((card) => {
    let bounds;
    const maxTilt = 10; // deg
    card.addEventListener('pointerenter', () => (bounds = card.getBoundingClientRect()));
    card.addEventListener('pointermove', (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const relX = (e.clientX - bounds.left) / bounds.width - 0.5;
      const relY = (e.clientY - bounds.top) / bounds.height - 0.5;
      const rx = (+relY * maxTilt).toFixed(2);
      const ry = (-relX * maxTilt).toFixed(2);
      animate(card, { rotateX: rx, rotateY: ry }, { duration: 0.2 });
    });
    ['pointerleave', 'pointerdown', 'pointerup'].forEach((ev) =>
      card.addEventListener(ev, () => animate(card, { rotateX: 0, rotateY: 0 }, { duration: 0.25 }))
    );
  });

  // Logo subtle breathing + hover glow
  const logo = document.querySelector('.logo-img');
  if (logo) {
    animate(logo, { boxShadow: [
      '0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent)',
      '0 0 0 6px color-mix(in oklab, var(--accent) 18%, transparent)'
    ] }, { duration: 2.2, direction: 'alternate', repeat: Infinity, easing: 'ease-in-out' });

    logo.addEventListener('mouseenter', () => {
      animate(logo, { scale: 1.06, filter: ['saturate(110%) brightness(1)', 'saturate(125%) brightness(1.08)'] }, { duration: 0.25 });
    });
    logo.addEventListener('mouseleave', () => {
      animate(logo, { scale: 1.0, filter: ['saturate(125%) brightness(1.08)', 'saturate(100%) brightness(1)'] }, { duration: 0.25 });
    });
  }

  // Smooth page transitions for real navigations
  const links = document.querySelectorAll('a[href]:not([target="_blank"])');
  links.forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) return; // internal anchor handled by smooth scroll
    // SPA navigation inside index.html only, to keep music playing
    a.addEventListener('click', async (e) => {
      const url = a.getAttribute('href');
      if (!url) return;
      if (!/^(about|projects|contact)\.html$/i.test(url)) return; // allow external links default
      e.preventDefault();
      const spaView = document.getElementById('spaView');
      const homeContent = document.getElementById('homeContent');
      if (!spaView || !homeContent) return;
      homeContent.style.display = 'none';
      try {
        const res = await fetch(url, { cache: 'no-store' });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const main = doc.querySelector('main');
        spaView.innerHTML = '';
        if (main) {
          // grab the first section only for simplicity
          const section = main.querySelector('section');
          spaView.appendChild(section ? section : document.createElement('div'));
          // animate in
          animate(spaView, { opacity: [0, 1], y: [10, 0] }, { duration: 0.35 });
        }
        history.pushState({ spa: true, url }, '', '#' + url.replace('.html', ''));
      } catch (_) {
        homeContent.style.display = '';
      }
    });
  });

  // Handle back button
  window.addEventListener('popstate', () => {
    const spaView = document.getElementById('spaView');
    const homeContent = document.getElementById('homeContent');
    if (location.hash === '' || location.hash === '#home') {
      spaView && (spaView.innerHTML = '');
      homeContent && (homeContent.style.display = '');
    }
  });

  // Cursor-following neon glow
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    let targetX = 0, targetY = 0, x = 0, y = 0;
    const lerp = (a, b, n) => (1 - n) * a + n * b;
    window.addEventListener('pointermove', (e) => { targetX = e.clientX; targetY = e.clientY; });
    const tick = () => {
      x = lerp(x, targetX, 0.12);
      y = lerp(y, targetY, 0.12);
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
      requestAnimationFrame(tick);
    };
    tick();
  }

  // Magnetic buttons (slight attraction to cursor)
  const magneticButtons = document.querySelectorAll('.btn');
  magneticButtons.forEach((btn) => {
    let rect;
    btn.addEventListener('pointerenter', () => (rect = btn.getBoundingClientRect()));
    btn.addEventListener('pointermove', (e) => {
      if (!rect) rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      animate(btn, { x: relX * 0.08, y: relY * 0.16 }, { duration: 0.2 });
    });
    ['pointerleave', 'pointerdown', 'pointerup', 'blur'].forEach((ev) =>
      btn.addEventListener(ev, () => animate(btn, { x: 0, y: 0 }, { duration: 0.2 }))
    );
  });

  // Subtle hero parallax
  const heroLogo = document.querySelector('.hero-logo');
  if (heroLogo) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.03;
      heroLogo.style.transform = `translateY(${Math.max(-16, -offset)}px)`;
    }, { passive: true });
  }
})();

// Contact form: client-side validation + mailto handoff
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  function setError(input, message) {
    const wrap = input.closest('.form-field');
    const error = wrap ? wrap.querySelector('.error') : null;
    if (error) error.textContent = message || '';
  }

  function validate() {
    let valid = true;
    const name = form.name;
    const email = form.email;
    const message = form.message;

    if (!name.value.trim()) {
      setError(name, 'Please enter your name');
      valid = false;
    } else setError(name, '');

    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      setError(email, 'Enter a valid email');
      valid = false;
    } else setError(email, '');

    if (!message.value.trim()) {
      setError(message, 'Please enter a message');
      valid = false;
    } else setError(message, '');

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    const to = 'you@example.com';
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    status.textContent = 'Opening your email client…';
  });
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();


// Logo fallback if image path is missing or incorrect
(function initLogoFallback() {
  const img = document.querySelector('.logo-img');
  if (!img) return;
  img.setAttribute('decoding', 'async');

  const tryPaths = [
    img.getAttribute('src') || '',
    'assets/SANDEEP.png',
    './assets/SANDEEP.png',
    'SANDEEP.png',
    'assets/logo.png',
    'logo.png',
    './logo.png',
    './assets/logo.png'
  ].filter(Boolean);

  function useFallback() {
    const svg = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>" +
        "<defs><radialGradient id='g' cx='50%' cy='50%' r='60%'>" +
          "<stop offset='0%' stop-color='%2364d2ff'/><stop offset='100%' stop-color='transparent'/></radialGradient></defs>" +
        "<rect width='64' height='64' rx='16' fill='%237aa2ff'/>" +
        "<circle cx='32' cy='32' r='28' fill='url(%23g)' opacity='0.35'/>" +
        "<text x='32' y='40' font-family='Segoe UI, system-ui, -apple-system, Roboto, Helvetica, Arial' font-weight='800' font-size='28' text-anchor='middle' fill='white'>S</text>" +
      "</svg>"
    );
    img.src = `data:image/svg+xml,${svg}`;
    img.alt = 'SANDEEP logo';
  }

  function testAndSet(pathIndex) {
    if (pathIndex >= tryPaths.length) return useFallback();
    const path = tryPaths[pathIndex];
    const probe = new Image();
    probe.onload = () => {
      img.src = path;
      if (!img.alt) img.alt = 'SANDEEP logo';
    };
    probe.onerror = () => testAndSet(pathIndex + 1);
    probe.src = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();
  }

  // If already loaded but failed (naturalWidth = 0), or not complete yet, verify and set
  if (img.complete) {
    if (img.naturalWidth === 0) {
      testAndSet(0);
    }
  } else {
    img.addEventListener('error', () => testAndSet(0), { once: true });
    img.addEventListener('load', () => {
      if (img.naturalWidth === 0) testAndSet(0);
    }, { once: true });
  }
})();


// Simple music player for Home
(function initMusic() {
  const audio = document.getElementById('audio');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const title = document.getElementById('trackTitle');
  const artist = document.getElementById('trackArtist');
  const bar = document.getElementById('progressBar');
  const fill = document.getElementById('progressFill');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const playlist = document.getElementById('playlist');
  const eq = document.getElementById('eq');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const volumeRange = document.getElementById('volumeRange');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  if (!audio || !playPauseBtn || !playlist) return;

  const tracks = Array.from(playlist.querySelectorAll('li')).map((li) => ({
    src: li.getAttribute('data-src'),
    yt: li.getAttribute('data-yt'),
    title: li.getAttribute('data-title'),
    artist: li.getAttribute('data-artist'),
    img: li.getAttribute('data-img'),
    el: li,
  })).filter((t) => t.src || t.yt);

  let index = 0;
  let isPlaying = false;
  let isMuted = false;
  let shuffle = false;
  let repeat = false;

  function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // YouTube IFrame API integration (audio via video element)
  let ytPlayer; let ytReady = false;
  function currentIsYouTube() { return !!tracks[index]?.yt; }
  function setupYouTube(id) {
    const host = document.getElementById('ytPlayer');
    if (!host) return;
    host.style.width = '1px'; host.style.height = '1px'; host.style.position = 'absolute'; host.style.left = '-9999px';
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = function () {
        ytReady = true; createOrLoad();
      };
    } else {
      ytReady = true;
    }
    function createOrLoad() {
      if (!ytReady) return;
      if (!ytPlayer) {
        ytPlayer = new YT.Player('ytPlayer', {
          height: '1', width: '1', videoId: id,
          playerVars: { controls: 0, modestbranding: 1 },
          events: {
            onReady: () => {/* noop */},
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) { load(index + 1); play(); }
              if (e.data === YT.PlayerState.PLAYING) { syncYTProgress(); }
            }
          }
        });
      } else {
        ytPlayer.loadVideoById(id);
      }
    }
    createOrLoad();
  }
  function teardownYouTube() {/* keep hidden player; no-op for faster switching */}
  function syncYTProgress() {
    if (!ytPlayer || !currentIsYouTube()) return;
    const dur = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
    const cur = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
    if (dur > 0) {
      const ratio = cur / dur;
      fill.style.width = `${ratio * 100}%`;
      currentTimeEl.textContent = formatTime(cur);
      durationEl.textContent = formatTime(dur);
      bar && bar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    }
    requestAnimationFrame(syncYTProgress);
  }

  function load(i) {
    index = (i + tracks.length) % tracks.length;
    const t = tracks[index];
    if (t.yt) {
      setupYouTube(t.yt);
      audio.src = '';
    } else {
      teardownYouTube();
      audio.src = t.src;
    }
    title.textContent = t.title || 'Track';
    artist.textContent = t.artist || '';
    const cover = document.querySelector('.cover-art');
    if (cover) {
      if (t.img) {
        cover.style.backgroundImage = `url('${t.img}')`;
        cover.classList.add('has-img');
      } else {
        cover.style.backgroundImage = '';
        cover.classList.remove('has-img');
      }
    }
    tracks.forEach((tr) => tr.el.classList.remove('active'));
    t.el.classList.add('active');
    fill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
  }

  function play() {
    if (currentIsYouTube()) {
      ytPlayer && ytPlayer.playVideo && ytPlayer.playVideo();
    } else {
      audio.play().catch(() => {});
    }
    isPlaying = true;
    playPauseBtn.setAttribute('aria-label', 'Pause');
    const icon = document.getElementById('playIcon');
    if (icon) icon.innerHTML = '<path d="M8 6h3v12H8zM13 6h3v12h-3z" fill="currentColor"/>';
    if (eq) {
      const bars = Array.from(eq.querySelectorAll('span'));
      bars.forEach((b, i) => {
        b.style.height = `${4 + (i % 3) * 3}px`;
        b.style.animation = `eq${i} 0.5s ease-in-out ${i * 0.05}s infinite alternate`;
      });
    }
  }

  function pause() {
    if (currentIsYouTube()) {
      ytPlayer && ytPlayer.pauseVideo && ytPlayer.pauseVideo();
    } else {
      audio.pause();
    }
    isPlaying = false;
    playPauseBtn.setAttribute('aria-label', 'Play');
    const icon = document.getElementById('playIcon');
    if (icon) icon.innerHTML = '<path d="M8 5v14l11-7-11-7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';
    if (eq) {
      const bars = Array.from(eq.querySelectorAll('span'));
      bars.forEach((b) => {
        b.style.animation = 'none';
        b.style.height = '4px';
      });
    }
  }

  function toggle() { (isPlaying ? pause : play)(); }

  function seekByClientX(clientX) {
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (currentIsYouTube()) {
      const dur = ytPlayer && ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
      if (dur > 0 && ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(dur * ratio, true);
    } else if (audio.duration) {
      audio.currentTime = audio.duration * ratio;
    }
  }

  // events
  playPauseBtn.addEventListener('click', toggle);
  prevBtn && prevBtn.addEventListener('click', () => { load(index - 1); play(); });
  nextBtn && nextBtn.addEventListener('click', () => { load(index + 1); play(); });
  muteBtn && muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (!currentIsYouTube()) {
      audio.muted = isMuted;
    } else if (ytPlayer) {
      isMuted ? ytPlayer.mute && ytPlayer.mute() : ytPlayer.unMute && ytPlayer.unMute();
    }
    muteBtn.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
    if (muteIcon) muteIcon.innerHTML = isMuted ? '<path d="M4 10v4h4l5 5V5l-5 5H4Zm11.45 4.95L14 13.5M16.5 11l4-4M16.5 17l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M4 10v4h4l5 5V5l-5 5H4Zm12.5 2a4.5 4.5 0 0 0-2.2-3.9l1-1.73A6.5 6.5 0 0 1 20.5 12a6.5 6.5 0 0 1-5.2 6.35l-1-1.74A4.5 4.5 0 0 0 16.5 12Z" fill="currentColor"/>';
  });
  volumeRange && volumeRange.addEventListener('input', () => {
    const v = Math.max(0, Math.min(1, volumeRange.value / 100));
    if (!currentIsYouTube()) { audio.volume = v; } else if (ytPlayer) { ytPlayer.setVolume && ytPlayer.setVolume(v * 100); }
  });
  shuffleBtn && shuffleBtn.addEventListener('click', () => {
    shuffle = !shuffle;
    shuffleBtn.setAttribute('aria-label', shuffle ? 'Shuffle on' : 'Shuffle off');
    shuffleBtn.style.filter = shuffle ? 'brightness(1.2)' : '';
  });
  repeatBtn && repeatBtn.addEventListener('click', () => {
    repeat = !repeat;
    repeatBtn.setAttribute('aria-label', repeat ? 'Repeat on' : 'Repeat off');
    repeatBtn.style.filter = repeat ? 'brightness(1.2)' : '';
  });
  playlist.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const i = tracks.findIndex((t) => t.el === li);
    if (i >= 0) { load(i); play(); }
  });
  bar && bar.addEventListener('click', (e) => seekByClientX(e.clientX));
  bar && bar.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') seekByClientX(bar.getBoundingClientRect().left);
    if (e.key === 'ArrowRight') seekByClientX(bar.getBoundingClientRect().right);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const ratio = audio.currentTime / audio.duration;
    fill.style.width = `${ratio * 100}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
    bar && bar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
  });
  audio.addEventListener('ended', () => {
    if (repeat) { play(); return; }
    if (shuffle) {
      const next = Math.floor(Math.random() * tracks.length);
      load(next); play();
    } else {
      load(index + 1); play();
    }
  });

  // Initialize
  if (tracks.length) load(0);
})();

// Hero logo fallback if the image is missing or path is wrong
(function initHeroLogoFallback() {
  const img = document.querySelector('.hero-logo');
  if (!img) return;
  img.setAttribute('decoding', 'async');

  const tryPaths = [
    img.getAttribute('src') || '',
    'assets/SANDEEP.png',
    './assets/SANDEEP.png',
    'SANDEEP.png',
    'assets/hero-logo.png',
    './assets/hero-logo.png',
    'hero-logo.png',
    './hero-logo.png',
    // fallbacks to general logo file names
    'assets/logo.png',
    './assets/logo.png',
    'logo.png',
    './logo.png'
  ].filter(Boolean);

  function useFallback() {
    const svg = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>" +
        "<defs>" +
          "<radialGradient id='g' cx='50%' cy='50%' r='60%'>" +
            "<stop offset='0%' stop-color='%2364d2ff'/>" +
            "<stop offset='100%' stop-color='transparent'/>" +
          "</radialGradient>" +
        "</defs>" +
        "<circle cx='80' cy='80' r='78' fill='%237aa2ff'/>" +
        "<circle cx='80' cy='80' r='70' fill='url(%23g)' opacity='0.35'/>" +
        "<text x='80' y='100' font-family='Segoe UI, system-ui, -apple-system, Roboto, Helvetica, Arial' font-weight='800' font-size='64' text-anchor='middle' fill='white'>S</text>" +
      "</svg>"
    );
    img.src = `data:image/svg+xml,${svg}`;
    img.alt = 'Hero logo';
  }

  function testAndSet(pathIndex) {
    if (pathIndex >= tryPaths.length) return useFallback();
    const path = tryPaths[pathIndex];
    const probe = new Image();
    probe.onload = () => {
      img.src = path;
      if (!img.alt) img.alt = 'Hero logo';
    };
    probe.onerror = () => testAndSet(pathIndex + 1);
    probe.src = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();
  }

  if (img.complete) {
    if (img.naturalWidth === 0) testAndSet(0);
  } else {
    img.addEventListener('error', () => testAndSet(0), { once: true });
    img.addEventListener('load', () => { if (img.naturalWidth === 0) testAndSet(0); }, { once: true });
  }
})();


