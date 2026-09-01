/**
 * ALPHAKORE — CINEMATIC SPLIT-PANEL PARALLAX & DEEP ZOOM ENGINE
 * Multi-layer 60FPS Lerp Parallax • Viewport Lock • Procedural Web Audio • Persistent Bookshelf
 */

(() => {
  'use strict';

  /* ==========================================================================
     1. STATE MANAGEMENT
     ========================================================================== */
  const state = {
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    scrollProgress: 0,
    rawScrollY: 0,
    isLoaded: false,
    audioPlaying: false,
    lerpFactor: 0.08
  };

  /* ==========================================================================
     2. DOM ELEMENTS
     ========================================================================== */
  const homeSection = document.getElementById('home');
  const stickyContainer = document.getElementById('stickyContainer');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  const heroPortalWindow = document.getElementById('heroPortalWindow');
  const heroScenicImg = document.getElementById('heroScenicImg');
  const portalTitleStage = document.getElementById('portalTitleStage');
  const portalBrandTitle = document.getElementById('portalBrandTitle');
  const portalLogoMark = document.getElementById('portalLogoMark');
  const portalSubtitleRow = document.getElementById('portalSubtitleRow');
  const portalBottomCue = document.getElementById('portalBottomCue');

  const preloader = document.getElementById('preloader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const customCursor = document.getElementById('customCursor');
  const customCursorDot = document.getElementById('customCursorDot');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const particlesCanvas = document.getElementById('particlesCanvas');
  const siteNav = document.getElementById('siteNav');

  /* ==========================================================================
     3. PROCEDURAL WEB AUDIO ENGINE
     ========================================================================== */
  let audioEngine = null;

  function createAudioEngine() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();

    let droneGain = null;
    let masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Warm Ambient Meditative Synth Drone
    function startDrone() {
      if (ctx.state === 'suspended') ctx.resume();
      if (droneGain) return;

      droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 3);
      droneGain.connect(masterGain);

      // Warm root & fifth harmonic oscillators (A minor / warm heritage scale)
      const freqs = [110, 164.81, 220, 329.63];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Subtle slow frequency modulation (chorus)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.15 + i * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.8, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.25 / freqs.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(droneGain);
        osc.start();
      });
    }

    function stopDrone() {
      if (!droneGain) return;
      droneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      setTimeout(() => {
        if (droneGain) {
          droneGain.disconnect();
          droneGain = null;
        }
      }, 1600);
    }

    // Metallic chime for clicks and book additions
    function playChime() {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }

    return { ctx, startDrone, stopDrone, playChime };
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (!audioEngine) audioEngine = createAudioEngine();
      if (!state.audioPlaying) {
        if (audioEngine) audioEngine.startDrone();
        state.audioPlaying = true;
        soundToggleBtn.classList.add('playing');
      } else {
        if (audioEngine) audioEngine.stopDrone();
        state.audioPlaying = false;
        soundToggleBtn.classList.remove('playing');
      }
    });
  }

  /* ==========================================================================
     4. PARTICLES ENGINE (GOLDEN DUST & MIST)
     ========================================================================== */
  let particles = [];
  function initParticles() {
    if (!particlesCanvas) return;
    const ctx = particlesCanvas.getContext('2d');
    let width = (particlesCanvas.width = window.innerWidth);
    let height = (particlesCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = particlesCanvas.width = window.innerWidth;
      height = particlesCanvas.height = window.innerHeight;
    });

    const count = window.innerWidth < 768 ? 25 : 55;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.1,
        pulse: Math.random() * Math.PI * 2
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = Math.max(0, p.alpha + Math.sin(p.pulse) * 0.15);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 164, 89, ${dynamicAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(226, 164, 89, 0.4)';
        ctx.fill();
      });
      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  /* ==========================================================================
     5. SCROLL PINNING & SPLIT-PANEL DEEP ZOOM CHOREOGRAPHY
     ========================================================================== */
  function updateScroll() {
    if (!homeSection || !stickyContainer) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    state.rawScrollY = scrollY;
    const homeTop = homeSection.offsetTop;
    const totalScrollable = homeSection.offsetHeight - window.innerHeight;

    // Relative scroll offset within the hero section
    const relY = Math.max(0, Math.min(totalScrollable, scrollY - homeTop));
    const progress = totalScrollable > 0 ? relY / totalScrollable : 0;
    state.scrollProgress = progress;

    // HARD VIEWPORT LOCK:
    // Prevents any page slide or black gaps while inside the hero timeline
    if (scrollY <= homeTop + totalScrollable) {
      stickyContainer.style.position = 'fixed';
      stickyContainer.style.top = '0px';
      stickyContainer.style.left = '0px';
      stickyContainer.style.width = '100vw';
      stickyContainer.style.height = '100vh';
    } else {
      stickyContainer.style.position = 'absolute';
      stickyContainer.style.top = `${totalScrollable}px`;
      stickyContainer.style.left = '0px';
      stickyContainer.style.width = '100vw';
      stickyContainer.style.height = '100vh';
    }

    // Dynamic Nav Theme (Light theme when in Section 2: Impact)
    const impactSection = document.getElementById('impact');
    const booksSection = document.getElementById('books');
    if (siteNav && impactSection) {
      const impactTop = impactSection.offsetTop;
      const booksTop = booksSection ? booksSection.offsetTop : Infinity;
      if (scrollY >= impactTop - 60 && scrollY < booksTop - 60) {
        siteNav.classList.add('theme-light');
      } else {
        siteNav.classList.remove('theme-light');
      }
    }

    // ------------------------------------------------------------------------
    // PHASE 1: SPLIT PANELS PART WAYS (Progress 0.00 -> 0.45)
    // ------------------------------------------------------------------------
    const p1 = Math.min(1, Math.max(0, progress / 0.42));
    const panelEase = Math.pow(p1, 1.4); // Smooth acceleration outward

    if (leftPanel) {
      const leftShiftPercent = -panelEase * 140;
      leftPanel.style.transform = `translate3d(${leftShiftPercent}%, -50%, 0)`;
      leftPanel.style.opacity = Math.max(0, 1 - panelEase * 1.3).toString();
      leftPanel.style.pointerEvents = p1 > 0.8 ? 'none' : 'auto';
    }

    if (rightPanel) {
      const rightShiftPercent = panelEase * 140;
      rightPanel.style.transform = `translate3d(${rightShiftPercent}%, -50%, 0)`;
      rightPanel.style.opacity = Math.max(0, 1 - panelEase * 1.3).toString();
      rightPanel.style.pointerEvents = p1 > 0.8 ? 'none' : 'auto';
    }

    // ------------------------------------------------------------------------
    // CENTER PORTAL APERTURE EXPANSION (From 32vw x 74vh to 100vw x 100vh)
    // ------------------------------------------------------------------------
    if (heroPortalWindow) {
      const currentWidth = 32 + (100 - 32) * panelEase;
      const currentHeight = 74 + (100 - 74) * panelEase;
      const currentRadius = 20 * (1 - panelEase);
      const currentShadowAlpha = 0.88 * (1 - panelEase);

      heroPortalWindow.style.width = `${currentWidth}vw`;
      heroPortalWindow.style.height = `${currentHeight}vh`;
      heroPortalWindow.style.borderRadius = `${currentRadius}px`;
      heroPortalWindow.style.boxShadow = `0 35px 90px rgba(0, 0, 0, ${currentShadowAlpha})`;
      heroPortalWindow.style.border = panelEase > 0.95 ? 'none' : '1px solid rgba(226, 164, 89, 0.3)';
    }

    // ------------------------------------------------------------------------
    // PHASE 2: DEEP IN-SCENE ZOOM & 3D CAMERA PUSH (Progress 0.35 -> 0.95)
    // ------------------------------------------------------------------------
    const p2 = Math.min(1, Math.max(0, (progress - 0.30) / 0.60));
    const zoomEase = Math.pow(p2, 1.8);

    if (heroScenicImg) {
      const imgScale = 1.0 + 0.48 * zoomEase;
      heroScenicImg.style.transform = `scale(${imgScale})`;
    }

    if (portalBottomCue) {
      portalBottomCue.style.opacity = Math.max(0, 1 - p1 * 2.5).toString();
    }
  }

  window.addEventListener('scroll', updateScroll, { passive: true });

  /* ==========================================================================
     6. MOUSE TRACKING & 60FPS LERP PARALLAX
     ========================================================================== */
  window.addEventListener('mousemove', (e) => {
    state.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    if (customCursor && customCursorDot) {
      customCursor.style.left = `${e.clientX}px`;
      customCursor.style.top = `${e.clientY}px`;
      customCursorDot.style.left = `${e.clientX}px`;
      customCursorDot.style.top = `${e.clientY}px`;
    }
  });

  function renderParallax() {
    // Smooth lerp
    state.mouseX += (state.targetMouseX - state.mouseX) * state.lerpFactor;
    state.mouseY += (state.targetMouseY - state.mouseY) * state.lerpFactor;

    // Subtle 3D tilt on panels when at low scroll
    if (state.scrollProgress < 0.25) {
      if (leftPanel) {
        const tiltX = state.mouseY * 4;
        const tiltY = -state.mouseX * 6;
        leftPanel.style.transform = `translate3d(0, -50%, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
      if (rightPanel) {
        const tiltX = state.mouseY * 4;
        const tiltY = -state.mouseX * 6;
        rightPanel.style.transform = `translate3d(0, -50%, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    }

    requestAnimationFrame(renderParallax);
  }

  /* ==========================================================================
     7. PRELOADER
     ========================================================================== */
  function initPreloader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          if (preloader) preloader.classList.add('loaded');
          state.isLoaded = true;
          updateScroll();
        }, 300);
      }
      if (loaderFill) loaderFill.style.width = `${progress}%`;
      if (loaderPercent) loaderPercent.textContent = `${progress}%`;
    }, 45);
  }

  /* ==========================================================================
     8. ALPHAKORE INTERACTIVE BOOKSHELF & LOCALSTORAGE ENGINE (BOOKS OF HER CHOICE)
     ========================================================================== */
  const DEFAULT_ALPHAKORE_BOOKS = [
    {
      id: 'book_alchemist_1988',
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      genre: 'Philosophy',
      year: '1988',
      rating: 5,
      theme: 'theme-leather',
      notes: 'A timeless fable about following one\'s personal legend, listening to the signs of the universe, and discovering the treasure hidden within.'
    },
    {
      id: 'book_meditations_180',
      title: 'Meditations',
      author: 'Marcus Aurelius',
      genre: 'Classic',
      year: '180',
      rating: 5,
      theme: 'theme-obsidian',
      notes: 'Unfiltered private journals of an emperor. An immortal blueprint for inner stillness, architectural discipline, and living without vanity.'
    },
    {
      id: 'book_dune_1965',
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Sci-Fi',
      year: '1965',
      rating: 5,
      theme: 'theme-ocean',
      notes: 'A monumental epic of ecology, power, prophecy, and human potential across desert sands.'
    }
  ];

  const STORAGE_KEY = 'alphakore_books_shelf';

  function getSavedBooks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    saveBooks(DEFAULT_ALPHAKORE_BOOKS);
    return [...DEFAULT_ALPHAKORE_BOOKS];
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
    'theme-leather': '✦',
    'theme-ocean': '◈',
    'theme-crimson': '▲',
    'theme-emerald': '◆',
    'theme-obsidian': '■'
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
          <h3 class="empty-title">No Volumes Found</h3>
          <p class="empty-desc">No books match your current query or category filter. Add a new book of her choice to the library!</p>
        </div>
      `;
      return;
    }

    booksGrid.innerHTML = filtered
      .map((book) => {
        const emblem = THEME_EMBLEMS[book.theme] || '✦';
        const starsHtml = '★'.repeat(book.rating || 5) + '☆'.repeat(5 - (book.rating || 5));

        return `
          <div class="book-card" data-id="${book.id}">
            <div class="book-card-header">
              <div class="book-spine-preview ${book.theme || 'theme-leather'}">
                <span class="book-spine-emblem">${emblem}</span>
              </div>
              <div class="book-header-info">
                <span class="book-tag">${escapeHtml(book.genre || 'Philosophy')}</span>
                <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
                <div class="book-card-author">by ${escapeHtml(book.author)}${book.year ? ` • ${book.year}` : ''}</div>
                <div class="book-card-stars" title="${book.rating || 5} out of 5 stars">${starsHtml}</div>
              </div>
            </div>

            <div class="book-card-body">
              <div class="book-card-notes">
                "${escapeHtml(book.notes || 'A cherished volume chosen for the ALPHAKORE archive.')}"
              </div>
              <div class="book-card-footer">
                <span>Her Bookshelf Choice</span>
                <button class="btn-delete-book" data-delete-id="${book.id}" title="Remove volume" aria-label="Delete book">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Delete handlers
    booksGrid.querySelectorAll('.btn-delete-book').forEach((delBtn) => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = delBtn.dataset.deleteId;
        if (confirm('Remove this volume from her bookshelf?')) {
          currentBooks = currentBooks.filter((b) => b.id !== id);
          saveBooks(currentBooks);
          renderBooks();
          if (!audioEngine) audioEngine = createAudioEngine();
          if (audioEngine) audioEngine.playChime();
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

    // Search input
    if (bookSearchInput) {
      bookSearchInput.addEventListener('input', (e) => {
        currentSearchFilter = e.target.value.trim().toLowerCase();
        renderBooks();
      });
    }

    // Genre filters
    if (genreFilterPills) {
      genreFilterPills.querySelectorAll('.filter-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          genreFilterPills.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          currentGenreFilter = pill.dataset.genre || 'All';
          renderBooks();
          if (!audioEngine) audioEngine = createAudioEngine();
          if (audioEngine) audioEngine.playChime();
        });
      });
    }

    // Modal open/close
    function openModal() {
      if (bookModalBackdrop) {
        bookModalBackdrop.classList.add('active');
        if (!audioEngine) audioEngine = createAudioEngine();
        if (audioEngine) audioEngine.playChime();
        const titleInput = document.getElementById('bookTitle');
        if (titleInput) setTimeout(() => titleInput.focus(), 100);
      }
    }

    function closeModal() {
      if (bookModalBackdrop) {
        bookModalBackdrop.classList.remove('active');
      }
      if (addBookForm) addBookForm.reset();
      resetStarPicker();
    }

    if (openAddBookBtn) openAddBookBtn.addEventListener('click', openModal);
    if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', closeModal);
    if (cancelAddBookBtn) cancelAddBookBtn.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

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
          if (audioEngine) audioEngine.playChime();
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
        const genre = document.getElementById('bookGenre')?.value || 'Philosophy';
        const year = (document.getElementById('bookYear')?.value || '').trim();
        const rating = parseInt(starRatingPicker?.dataset.rating || '5', 10);
        const selectedTheme = document.querySelector('input[name="coverTheme"]:checked')?.value || 'theme-leather';
        const notes = (document.getElementById('bookNotes')?.value || '').trim();

        if (!title || !author) {
          alert('Please enter both volume title and author name!');
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
          notes: notes || 'A book of her choice added to the permanent ALPHAKORE collection.'
        };

        // Prepend and persist
        currentBooks.unshift(newBook);
        saveBooks(currentBooks);
        renderBooks();

        closeModal();

        if (!audioEngine) audioEngine = createAudioEngine();
        if (audioEngine) audioEngine.playChime();

        // Highlight newly added volume
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
     9. INITIALIZATION
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initParticles();
    initBookshelf();
    renderParallax();
    updateScroll();
  });
})();
