/**
 * THE GOONIES - CINEMATIC 3D PARALLAX & DEEP ZOOM FLY-THROUGH ENGINE
 */

(function () {
  'use strict';

  // State
  const state = {
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scrollProgress: 0,
    isLoaded: false,
    audioPlaying: false,
    audioCtx: null,
    droneNodes: null
  };

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const homeSection = document.getElementById('home');
  const stickyContainer = document.querySelector('.sticky-container');
  const bgMain = document.getElementById('bgMain');
  const bgScroll = document.getElementById('bgScroll');
  const bgOverlay = document.getElementById('bgOverlay');
  const heroParent = document.getElementById('heroParent');
  const heroCharWrap = document.getElementById('heroCharWrap');
  const floatingProps = document.querySelectorAll('.floating-prop');
  const scrollImgWrap = document.getElementById('scrollImgWrap');
  const introParent = document.getElementById('introParent');
  const drawLineInner = document.getElementById('drawLineInner');
  const cursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('customCursorDot');
  const soundBtn = document.getElementById('soundToggleBtn');
  const mapModal = document.getElementById('mapModal');
  const riddleBtn = document.getElementById('riddleBtn');
  const mapCloseBtn = document.getElementById('mapCloseBtn');
  const canvas = document.getElementById('particlesCanvas');

  /* ==========================================================================
     1. PRELOADER & INTRO COUNT-UP
     ========================================================================== */
  function initPreloader() {
    const urlParams = new URLSearchParams(window.location.search);
    const testScroll = urlParams.get('test_scroll');
    if (testScroll !== null) {
      if (preloader) preloader.style.display = 'none';
      state.isLoaded = true;
      document.body.style.overflowY = 'auto';
      const targetY = parseInt(testScroll, 10);
      window.scrollTo(0, targetY);
      updateScroll();
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          if (preloader) preloader.classList.add('loaded');
          state.isLoaded = true;
          document.body.style.overflowY = 'auto';
          updateScroll();
        }, 300);
      }
      if (loaderFill) loaderFill.style.width = progress + '%';
      if (loaderPercent) loaderPercent.textContent = progress + '%';
    }, 45);
  }

  /* ==========================================================================
     2. MOUSE TRACKING & CUSTOM CURSOR
     ========================================================================== */
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetCursorX = cursorX;
  let targetCursorY = cursorY;

  window.addEventListener('mousemove', (e) => {
    targetCursorX = e.clientX;
    targetCursorY = e.clientY;

    // Normalized from -1 to 1
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    state.mouse.targetX = normX;
    state.mouse.targetY = normY;
  });

  // Mobile Gyroscope / Device Orientation Support
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        state.mouse.targetX = Math.max(-1, Math.min(1, e.gamma / 25));
        state.mouse.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
      }
    });
  }

  // Cursor hover animations
  document.querySelectorAll('a, button, .img-parent, .floating-prop, .map-hotspot, .cast-drawer-close').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (cursor) {
        cursor.style.width = '48px';
        cursor.style.height = '48px';
        cursor.style.backgroundColor = 'rgba(229, 176, 68, 0.2)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (cursor) {
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        cursor.style.backgroundColor = 'transparent';
      }
    });
  });

  /* ==========================================================================
     3. GUARANTEED VIEWPORT PINNING & SCROLL PROGRESSION
     ========================================================================== */
  function updateScroll() {
    if (!homeSection || !stickyContainer) return;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const homeTop = homeSection.offsetTop;
    const homeHeight = homeSection.offsetHeight;
    const winHeight = window.innerHeight;
    const totalScrollable = homeHeight - winHeight;

    const progress = Math.max(0, Math.min(1, (scrollY - homeTop) / totalScrollable));
    state.scrollProgress = progress;

    // Enforce bulletproof viewport pinning: NEVER let sticky container slide up during zoom
    if (scrollY < homeTop) {
      stickyContainer.style.position = 'absolute';
      stickyContainer.style.top = '0px';
      stickyContainer.style.bottom = 'auto';
      stickyContainer.style.left = '0px';
      stickyContainer.style.width = '100%';
    } else if (scrollY <= homeTop + totalScrollable) {
      stickyContainer.style.position = 'fixed';
      stickyContainer.style.top = '0px';
      stickyContainer.style.bottom = 'auto';
      stickyContainer.style.left = '0px';
      stickyContainer.style.width = '100vw';
      stickyContainer.style.height = '100vh';
    } else {
      stickyContainer.style.position = 'absolute';
      stickyContainer.style.top = totalScrollable + 'px';
      stickyContainer.style.bottom = 'auto';
      stickyContainer.style.left = '0px';
      stickyContainer.style.width = '100%';
    }
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });

  /* ==========================================================================
     4. RENDER LOOP (60FPS LERP 3D PARALLAX & IN-SCENE DEEP ZOOM SEQUENCE)
     ========================================================================== */
  function render() {
    // Smooth lerp mouse
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.08;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.08;

    // Smooth lerp cursor
    cursorX += (targetCursorX - cursorX) * 0.2;
    cursorY += (targetCursorY - cursorY) * 0.2;

    if (cursor && cursorDot) {
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      cursorDot.style.left = targetCursorX + 'px';
      cursorDot.style.top = targetCursorY + 'px';
    }

    const mx = state.mouse.x;
    const my = state.mouse.y;
    const sp = state.scrollProgress; // 0.0 to 1.0 within #home.scroll-container

    /* ------------------------------------------------------------------------
       STAGE A: HERO ZOOM DEEP FLY-THROUGH (sp: 0.00 to 0.42)
       ------------------------------------------------------------------------ */
    const zoomPhase = Math.min(1, sp / 0.42);
    const easeZoom = Math.pow(zoomPhase, 1.3);

    // 1. Background Layers (Zoom deeply into the coastal sea stacks)
    if (bgMain) {
      const bgMoveX = mx * -18;
      const bgMoveY = my * -14;
      // Massive deep zoom: 1.0 -> 2.5x
      const bgScale = 1.0 + easeZoom * 1.5;
      bgMain.style.transform = `translate3d(${bgMoveX}px, ${bgMoveY}px, 0) scale(${bgScale})`;
    }

    if (bgScroll) {
      const scrollScale = 1.0 + easeZoom * 1.2;
      bgScroll.style.transform = `scale(${scrollScale})`;
    }

    // 2. Hero Parent (Title, Cutout Character, and 3D Overlapping Props)
    if (heroParent) {
      if (zoomPhase < 1) {
        heroParent.style.display = 'flex';
        heroParent.style.pointerEvents = 'auto';

        // MASSIVE 3D ZOOM FLY-THROUGH: scales up from 1.0 to 5.2x!
        // Flies directly towards the user and past the screen borders!
        const heroScale = 1.0 + easeZoom * 4.2;
        const heroMoveX = mx * 35;
        const heroMoveY = my * 25;
        const heroOpacity = Math.max(0, 1 - Math.pow(zoomPhase, 1.1) * 1.3);

        heroParent.style.transform = `translate3d(${heroMoveX}px, ${heroMoveY}px, 0) scale(${heroScale}) rotateY(${mx * 3}deg) rotateX(${-my * 2.5}deg)`;
        heroParent.style.opacity = heroOpacity;

        // Cutout character tilts dynamically
        if (heroCharWrap) {
          const charMoveX = mx * 15;
          const charMoveY = my * 10;
          heroCharWrap.style.transform = `translate(-50%, -42%) translate3d(${charMoveX}px, ${charMoveY}px, 0) scale(${1 + easeZoom * 0.8})`;
        }

        // Floating 3D Props scatter outward off-screen
        if (floatingProps.length > 0) {
          floatingProps.forEach((prop) => {
            const speed = parseFloat(prop.dataset.speed || '1.0');
            const origScatterX = parseFloat(prop.dataset.scatterX || '0');
            const origScatterY = parseFloat(prop.dataset.scatterY || '0');
            const scatterMult = Math.pow(zoomPhase, 1.15) * 3.8;

            const propX = mx * 40 * speed + origScatterX * scatterMult;
            const propY = my * 30 * speed + origScatterY * scatterMult;
            const propScale = 1.0 + easeZoom * 2.6;
            const propRot = mx * 10 * speed + (origScatterX > 0 ? 1 : -1) * easeZoom * 60;

            prop.style.transform = `translate3d(${propX}px, ${propY}px, 0) scale(${propScale}) rotateZ(${propRot}deg)`;
            prop.style.opacity = Math.max(0, 1 - Math.pow(zoomPhase, 1.2) * 1.4);
          });
        }

        // Scroll Prompter fades out fast
        if (scrollImgWrap) {
          scrollImgWrap.style.opacity = Math.max(0, 1 - zoomPhase * 4.0);
        }
      } else {
        heroParent.style.display = 'none';
        heroParent.style.pointerEvents = 'none';
      }
    }

    /* ------------------------------------------------------------------------
       STAGE B: IN-SCENE "PLOT" REVELATION (sp: 0.38 to 0.82)
       ------------------------------------------------------------------------ */
    if (introParent) {
      if (sp >= 0.38 && sp <= 0.86) {
        introParent.style.display = 'flex';

        let plotOpacity = 0;
        let plotTranslateY = 0;

        if (sp >= 0.38 && sp < 0.52) {
          // Fade in and gently rise into center
          const p = (sp - 0.38) / 0.14;
          plotOpacity = Math.pow(p, 1.2);
          plotTranslateY = (1 - p) * 50;
        } else if (sp >= 0.52 && sp <= 0.70) {
          // Full solid visibility right in the deep zoomed scene
          plotOpacity = 1;
          plotTranslateY = 0;
        } else if (sp > 0.70 && sp <= 0.86) {
          // Fade out as scroll continues towards the next section
          const p = (sp - 0.70) / 0.16;
          plotOpacity = Math.max(0, 1 - p);
          plotTranslateY = p * -40;
        }

        introParent.style.opacity = plotOpacity;
        introParent.style.transform = `translate3d(${mx * 12}px, calc(${my * 8}px + ${plotTranslateY}px), 0)`;

        // Draw Line Animation (draws downward)
        if (drawLineInner) {
          if (sp >= 0.44 && sp <= 0.70) {
            const lineProgress = (sp - 0.44) / 0.26; // -100% to 0%
            const lineY = -100 + lineProgress * 100;
            drawLineInner.style.transform = `translateY(${lineY}%)`;
          } else if (sp > 0.70) {
            const lineExit = (sp - 0.70) / 0.14;
            drawLineInner.style.transform = `translateY(${lineExit * 100}%)`;
          } else {
            drawLineInner.style.transform = `translateY(-100%)`;
          }
        }
      } else {
        introParent.style.display = 'none';
      }
    }

    /* ------------------------------------------------------------------------
       STAGE C: TRANSITION OVERLAY (sp: 0.82 to 1.00)
       ------------------------------------------------------------------------ */
    if (bgOverlay) {
      if (sp >= 0.82) {
        const overlayP = (sp - 0.82) / 0.18;
        bgOverlay.style.opacity = Math.min(0.85, overlayP * 0.85);
      } else {
        bgOverlay.style.opacity = 0;
      }
    }

    requestAnimationFrame(render);
  }

  /* ==========================================================================
     5. AMBIENT PARTICLES CANVAS
     ========================================================================== */
  function initParticles() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        color: Math.random() > 0.3 ? 'rgba(229, 176, 68, ' : 'rgba(255, 255, 255, ',
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.2,
        pulse: Math.random() * Math.PI
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      const sp = state.scrollProgress;
      const zoomSpeed = 1 + Math.pow(Math.min(1, sp * 2.5), 1.5) * 4;

      particles.forEach((p) => {
        p.x += (p.speedX + state.mouse.x * 0.2) * zoomSpeed;
        p.y += (p.speedY + state.mouse.y * 0.2) * zoomSpeed;
        p.pulse += 0.02 * zoomSpeed;

        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
        const radius = p.radius * (1 + sp * 1.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentAlpha + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#e5b044';
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================================================
     6. WEB AUDIO API SYNTHESIZER
     ========================================================================== */
  function createAudioEngine() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const ctx = new AudioContext();

    function startAmbientDrone() {
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      lfo.start();

      return { masterGain, osc1, osc2, lfo, ctx };
    }

    function playCoinClink() {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3600, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }

    function playMysteryChime() {
      if (ctx.state === 'suspended') ctx.resume();
      const freqs = [587.33, 880, 1174.66, 1760];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8 + idx * 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + 0.9 + idx * 0.06);
      });
    }

    return { startAmbientDrone, playCoinClink, playMysteryChime };
  }

  let audioEngine = null;

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (!audioEngine) {
        audioEngine = createAudioEngine();
      }

      if (!state.audioPlaying) {
        state.droneNodes = audioEngine.startAmbientDrone();
        state.audioPlaying = true;
        soundBtn.classList.add('playing');
      } else {
        if (state.droneNodes) {
          state.droneNodes.masterGain.gain.exponentialRampToValueAtTime(
            0.001,
            state.droneNodes.ctx.currentTime + 0.4
          );
          setTimeout(() => {
            state.droneNodes.osc1.stop();
            state.droneNodes.osc2.stop();
            state.droneNodes.lfo.stop();
            state.droneNodes = null;
          }, 450);
        }
        state.audioPlaying = false;
        soundBtn.classList.remove('playing');
      }
    });
  }

  floatingProps.forEach((prop) => {
    prop.addEventListener('click', () => {
      if (!audioEngine) audioEngine = createAudioEngine();
      audioEngine.playCoinClink();
      prop.style.transform += ' scale(1.2)';
    });
    prop.addEventListener('mouseenter', () => {
      if (audioEngine && state.audioPlaying) {
        audioEngine.playMysteryChime();
      }
    });
  });

  /* ==========================================================================
     7. CAST DRAWER INTERACTION
     ========================================================================== */
  document.querySelectorAll('.img-parent').forEach((card) => {
    const btn = card.querySelector('.btn-parent');
    const drawer = card.querySelector('.cast-drawer');
    const closeBtn = card.querySelector('.cast-drawer-close');

    if (btn && drawer) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.add('active');
        if (!audioEngine) audioEngine = createAudioEngine();
        audioEngine.playMysteryChime();
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.remove('active');
      });
    }
  });

  /* ==========================================================================
     8. SECRET RIDDLE MAP MODAL
     ========================================================================== */
  function openMap() {
    if (mapModal) {
      mapModal.classList.add('active');
      if (!audioEngine) audioEngine = createAudioEngine();
      audioEngine.playMysteryChime();
    }
  }

  function closeMap() {
    if (mapModal) {
      mapModal.classList.remove('active');
    }
  }

  if (riddleBtn) riddleBtn.addEventListener('click', openMap);
  if (mapCloseBtn) mapCloseBtn.addEventListener('click', closeMap);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMap();
  });

  document.querySelectorAll('.map-hotspot').forEach((spot) => {
    spot.addEventListener('click', () => {
      if (!audioEngine) audioEngine = createAudioEngine();
      audioEngine.playCoinClink();
    });
  });

  /* ==========================================================================
     9. INTERACTIVE BOOKSHELF & PERSISTENCE ENGINE (BOOKS OF HER CHOICE)
     ========================================================================== */
  const DEFAULT_BOOKS = [
    {
      id: 'book_goonies_1985',
      title: 'The Goonies',
      author: 'James Kahn',
      genre: 'Adventure',
      year: '1985',
      rating: 5,
      theme: 'theme-leather',
      notes: 'The official 1985 novelization based on Steven Spielberg\'s story and Chris Columbus\'s screenplay. Packed with One-Eyed Willy\'s riddles and rich background lore.'
    },
    {
      id: 'book_treasure_island',
      title: 'Treasure Island',
      author: 'Robert Louis Stevenson',
      genre: 'Classic',
      year: '1883',
      rating: 5,
      theme: 'theme-ocean',
      notes: 'The legendary high-seas adventure of Jim Hawkins, Long John Silver, and Captain Flint\'s buried treasure that inspired Mikey\'s quest.'
    },
    {
      id: 'book_neverending_story',
      title: 'The Neverending Story',
      author: 'Michael Ende',
      genre: 'Fantasy',
      year: '1979',
      rating: 5,
      theme: 'theme-emerald',
      notes: 'A mystical journey into the realm of Fantastica. A tribute to boundless wonder, courage, and stories that never truly end.'
    }
  ];

  const STORAGE_KEY = 'goonies_books_shelf';

  function getSavedBooks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = jsonParseSafe(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    // Default fallback
    saveBooks(DEFAULT_BOOKS);
    return [...DEFAULT_BOOKS];
  }

  function jsonParseSafe(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  function saveBooks(books) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  let currentBooks = [];
  let currentSearchFilter = '';
  let currentGenreFilter = 'All';

  const booksGrid = document.getElementById('booksGrid');
  const booksCountLabel = document.getElementById('booksCountLabel');
  const bookSearchInput = document.getElementById('bookSearchInput');
  const genreFilterPills = document.getElementById('genreFilterPills');
  const bookModalBackdrop = document.getElementById('bookModalBackdrop');
  const openAddBookBtn = document.getElementById('openAddBookBtn');
  const closeBookModalBtn = document.getElementById('closeBookModalBtn');
  const cancelAddBookBtn = document.getElementById('cancelAddBookBtn');
  const addBookForm = document.getElementById('addBookForm');
  const starRatingPicker = document.getElementById('starRatingPicker');

  const THEME_EMBLEMS = {
    'theme-leather': '☠',
    'theme-ocean': '⚓',
    'theme-crimson': '🗡',
    'theme-emerald': '🌲',
    'theme-obsidian': '💎'
  };

  function renderBooks() {
    if (!booksGrid) return;

    let filtered = currentBooks.filter((b) => {
      const matchSearch =
        !currentSearchFilter ||
        b.title.toLowerCase().includes(currentSearchFilter) ||
        b.author.toLowerCase().includes(currentSearchFilter) ||
        (b.notes && b.notes.toLowerCase().includes(currentSearchFilter));

      const matchGenre =
        currentGenreFilter === 'All' ||
        b.genre.toLowerCase() === currentGenreFilter.toLowerCase();

      return matchSearch && matchGenre;
    });

    if (booksCountLabel) {
      booksCountLabel.textContent = `Showing ${filtered.length} of ${currentBooks.length} Book${currentBooks.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      booksGrid.innerHTML = `
        <div class="books-empty-state">
          <div class="empty-icon">📖</div>
          <h3 class="empty-title">No Books Found</h3>
          <p class="empty-desc">No books match your current search or filter. Add a new book of her choice or reset the filter!</p>
        </div>
      `;
      return;
    }

    booksGrid.innerHTML = filtered
      .map((book) => {
        const emblem = THEME_EMBLEMS[book.theme] || '📖';
        const starsHtml = '★'.repeat(book.rating || 5) + '☆'.repeat(5 - (book.rating || 5));

        return `
          <div class="book-card" data-id="${book.id}">
            <div class="book-card-header">
              <div class="book-spine-preview ${book.theme || 'theme-leather'}">
                <span class="book-spine-emblem">${emblem}</span>
              </div>
              <div class="book-header-info">
                <span class="book-tag">${escapeHtml(book.genre || 'Adventure')}</span>
                <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
                <div class="book-card-author">by ${escapeHtml(book.author)}${book.year ? ` • ${book.year}` : ''}</div>
                <div class="book-card-stars" title="${book.rating || 5} out of 5 stars">${starsHtml}</div>
              </div>
            </div>

            <div class="book-card-body">
              <div class="book-card-notes">
                "${escapeHtml(book.notes || 'A cherished story chosen for this collection.')}"
              </div>
              <div class="book-card-footer">
                <span>Her Bookshelf Choice</span>
                <button class="btn-delete-book" data-delete-id="${book.id}" title="Remove from list" aria-label="Delete book">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Attach delete listeners
    booksGrid.querySelectorAll('.btn-delete-book').forEach((delBtn) => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = delBtn.dataset.deleteId;
        if (confirm('Remove this book from her bookshelf?')) {
          currentBooks = currentBooks.filter((b) => b.id !== id);
          saveBooks(currentBooks);
          renderBooks();
          if (!audioEngine) audioEngine = createAudioEngine();
          audioEngine.playCoinClink();
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initBookshelf() {
    currentBooks = getSavedBooks();
    renderBooks();

    // Search filter input
    if (bookSearchInput) {
      bookSearchInput.addEventListener('input', (e) => {
        currentSearchFilter = e.target.value.trim().toLowerCase();
        renderBooks();
      });
    }

    // Genre filter pills
    if (genreFilterPills) {
      genreFilterPills.querySelectorAll('.filter-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          genreFilterPills.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          currentGenreFilter = pill.dataset.genre || 'All';
          renderBooks();
          if (!audioEngine) audioEngine = createAudioEngine();
          audioEngine.playCoinClink();
        });
      });
    }

    // Open Modal
    if (openAddBookBtn && bookModalBackdrop) {
      openAddBookBtn.addEventListener('click', () => {
        bookModalBackdrop.classList.add('active');
        if (!audioEngine) audioEngine = createAudioEngine();
        audioEngine.playMysteryChime();
        const titleInput = document.getElementById('bookTitle');
        if (titleInput) setTimeout(() => titleInput.focus(), 100);
      });
    }

    // Close Modal
    function closeBookModal() {
      if (bookModalBackdrop) {
        bookModalBackdrop.classList.remove('active');
      }
      if (addBookForm) addBookForm.reset();
      resetStarPicker();
    }

    if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', closeBookModal);
    if (cancelAddBookBtn) cancelAddBookBtn.addEventListener('click', closeBookModal);

    // Star rating picker
    if (starRatingPicker) {
      const stars = starRatingPicker.querySelectorAll('.star-pick');
      stars.forEach((s) => {
        s.addEventListener('click', () => {
          const val = parseInt(s.dataset.val, 10);
          starRatingPicker.dataset.rating = val;
          stars.forEach((star) => {
            const starVal = parseInt(star.dataset.val, 10);
            if (starVal <= val) {
              star.classList.add('active');
            } else {
              star.classList.remove('active');
            }
          });
          if (!audioEngine) audioEngine = createAudioEngine();
          audioEngine.playCoinClink();
        });
      });
    }

    function resetStarPicker() {
      if (starRatingPicker) {
        starRatingPicker.dataset.rating = '5';
        starRatingPicker.querySelectorAll('.star-pick').forEach((star) => star.classList.add('active'));
      }
    }

    // Form submission
    if (addBookForm) {
      addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = (document.getElementById('bookTitle')?.value || '').trim();
        const author = (document.getElementById('bookAuthor')?.value || '').trim();
        const genre = document.getElementById('bookGenre')?.value || 'Adventure';
        const year = (document.getElementById('bookYear')?.value || '').trim();
        const rating = parseInt(starRatingPicker?.dataset.rating || '5', 10);
        const selectedTheme = document.querySelector('input[name="coverTheme"]:checked')?.value || 'theme-leather';
        const notes = (document.getElementById('bookNotes')?.value || '').trim();

        if (!title || !author) {
          alert('Please enter both book title and author!');
          return;
        }

        const newBook = {
          id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title,
          author,
          genre,
          year,
          rating,
          theme: selectedTheme,
          notes: notes || 'A book of her choice added to the Goonies bookshelf.'
        };

        // Prepend to list and persist
        currentBooks.unshift(newBook);
        saveBooks(currentBooks);
        renderBooks();

        closeBookModal();

        // Sound effect
        if (!audioEngine) audioEngine = createAudioEngine();
        audioEngine.playMysteryChime();

        // Scroll to the book card smoothly
        setTimeout(() => {
          const newCard = booksGrid.querySelector(`[data-id="${newBook.id}"]`);
          if (newCard) {
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newCard.style.outline = '2px solid var(--accent-gold)';
            setTimeout(() => {
              newCard.style.outline = 'none';
            }, 1800);
          }
        }, 150);
      });
    }
  }

  /* ==========================================================================
     10. INITIALIZATION
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initParticles();
    initBookshelf();
    render();
    updateScroll();
  });
})();

