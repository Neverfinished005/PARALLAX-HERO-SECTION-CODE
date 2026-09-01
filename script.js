/**
 * THE STORY OF THE GOONIES — CINEMATIC PARALLAX ENGINE
 * Exact 1-to-1 recreation of the Awwwards Site of the Day Experience
 * With permanent "Books of Her Choice" Bookshelf & Web Audio
 */

// ============================================================================
// 1. STATE & DOM REFERENCES
// ============================================================================
const elements = {
  scrollContainer: document.getElementById('plot'),
  bgMain: document.getElementById('bgMain'),
  bgScroll: document.getElementById('bgScroll'),
  heroParent: document.getElementById('heroParent'),
  heroLogo: document.getElementById('heroLogo'),
  introParent: document.getElementById('introParent'),
  heroOverlay: document.getElementById('heroOverlay'),
  drawLineInner: document.getElementById('drawLineInner'),
  scrollImg: document.getElementById('scrollImg'),
  navBar: document.getElementById('mainNav'),
  musicToggle: document.getElementById('musicToggle'),
  speakerIcon: document.getElementById('speakerIcon'),
  
  // Nav links & dots
  dots: {
    plot: document.getElementById('dotPlot'),
    goonies: document.getElementById('dotGoonies'),
    credits: document.getElementById('dotCredits'),
    books: document.getElementById('dotBooks'),
  },
  navLinks: {
    plot: document.getElementById('navPlot'),
    goonies: document.getElementById('navGoonies'),
    credits: document.getElementById('navCredits'),
    books: document.getElementById('navBooks'),
  },
  
  // Bookshelf elements
  booksGridContainer: document.getElementById('booksGridContainer'),
  bookSearchInput: document.getElementById('bookSearchInput'),
  openAddBookBtn: document.getElementById('openAddBookBtn'),
  closeBookModalBtn: document.getElementById('closeBookModalBtn'),
  cancelBookBtn: document.getElementById('cancelBookBtn'),
  bookModalBackdrop: document.getElementById('bookModalBackdrop'),
  addBookForm: document.getElementById('addBookForm'),
  bookCountDisplay: document.getElementById('bookCountDisplay'),
  starPicker: document.getElementById('starPicker'),
  bookRating: document.getElementById('bookRating'),
  filterPills: document.querySelectorAll('.filter-pill'),
  
  // Character modal
  charModalBackdrop: document.getElementById('charModalBackdrop'),
  modalContent: document.getElementById('modalContent')
};

// ============================================================================
// 2. PARALLAX SCROLL CHOREOGRAPHY (EXACT MATCH TO 5 REFERENCE SCREENSHOTS)
// ============================================================================
let currentProgress = 0;
let targetProgress = 0;
let isTicking = false;

function calculateProgress() {
  if (!elements.scrollContainer) return 0;
  const rect = elements.scrollContainer.getBoundingClientRect();
  const totalScroll = elements.scrollContainer.offsetHeight - window.innerHeight;
  if (totalScroll <= 0) return 0;
  return Math.min(Math.max(-rect.top / totalScroll, 0), 1);
}

function updateParallax() {
  // Smooth lerp for buttery 60fps movement
  currentProgress += (targetProgress - currentProgress) * 0.14;
  if (Math.abs(targetProgress - currentProgress) < 0.0005) {
    currentProgress = targetProgress;
  }
  
  const p = currentProgress;

  // --------------------------------------------------------------------------
  // SCREENSHOT 1 -> 2: FOREGROUND TREES PARTING (bg-scroll)
  // Scale from 1.0 to 1.80 between p=0.15 and p=0.65
  // Because tree trunks are on left and right borders, scaling zooms them outward!
  // --------------------------------------------------------------------------
  let treeScale = 1.0;
  let treeTranslateY = 0;
  let treeOpacity = 1.0;

  if (p >= 0.15 && p <= 0.65) {
    const t = (p - 0.15) / 0.50;
    treeScale = 1.0 + t * 0.80; // 1.0 -> 1.80
  } else if (p > 0.65) {
    treeScale = 1.80;
  }

  // Move up offscreen after p=0.65
  if (p >= 0.65 && p <= 0.88) {
    const t = (p - 0.65) / 0.23;
    treeTranslateY = -t * 380; // 0 -> -380px
  } else if (p > 0.88) {
    treeTranslateY = -380;
  }

  // Fade out gently after p=0.74
  if (p >= 0.74) {
    treeOpacity = Math.max(0, 1 - (p - 0.74) / 0.16);
  }

  if (elements.bgScroll) {
    elements.bgScroll.style.transform = `translate3d(0, ${treeTranslateY}px, 0) scale(${treeScale})`;
    elements.bgScroll.style.opacity = treeOpacity;
  }

  // --------------------------------------------------------------------------
  // BACKGROUND OCEAN (bg-main)
  // Subtle camera push forward (1.0 -> 1.25)
  // --------------------------------------------------------------------------
  let oceanScale = 1.0;
  if (p >= 0.15 && p <= 0.72) {
    const t = (p - 0.15) / 0.57;
    oceanScale = 1.0 + t * 0.25; // 1.0 -> 1.25
  } else if (p > 0.72) {
    oceanScale = 1.25;
  }

  if (elements.bgMain) {
    elements.bgMain.style.transform = `scale(${oceanScale})`;
  }

  // --------------------------------------------------------------------------
  // TITLE: The story of THE GOONIES (hero-parent)
  // Screenshot 1: Full opacity at p <= 0.18
  // Screenshot 2: Logo fades from 1.0 -> 0 between p=0.18 and p=0.38
  // --------------------------------------------------------------------------
  let titleOpacity = 1.0;
  let titleScale = 1.0;

  if (p <= 0.18) {
    titleOpacity = 1.0;
    titleScale = 1.0;
  } else if (p > 0.18 && p <= 0.38) {
    const t = (p - 0.18) / 0.20;
    titleOpacity = Math.max(0, 1.0 - t);
    titleScale = 1.0 + t * 0.12;
  } else {
    titleOpacity = 0.0;
  }

  if (elements.heroParent) {
    elements.heroParent.style.opacity = titleOpacity;
    elements.heroParent.style.transform = `scale(${titleScale})`;
  }

  // Scroll mouse indicator fades out early
  if (elements.scrollImg) {
    const scrollIconOp = p < 0.14 ? 1.0 - (p / 0.14) : 0;
    elements.scrollImg.style.opacity = scrollIconOp;
  }

  // --------------------------------------------------------------------------
  // SCREENSHOTS 3 & 4: PLOT HEADLINE & SYNOPSIS (intro-parent)
  // Fades in at p=0.36, reaches 100% opacity at p=0.50, stays solid until p=0.72
  // --------------------------------------------------------------------------
  let plotOpacity = 0.0;
  let plotTranslateY = 45;

  if (p >= 0.36 && p <= 0.50) {
    const t = (p - 0.36) / 0.14;
    plotOpacity = t;
    plotTranslateY = 45 * (1 - t);
  } else if (p > 0.50 && p <= 0.72) {
    plotOpacity = 1.0;
    plotTranslateY = 0;
  } else if (p > 0.72 && p <= 0.86) {
    const t = (p - 0.72) / 0.14;
    plotOpacity = Math.max(0, 1.0 - t);
    plotTranslateY = -t * 25;
  } else {
    plotOpacity = 0.0;
  }

  if (elements.introParent) {
    elements.introParent.style.opacity = plotOpacity;
    elements.introParent.style.transform = `translate3d(0, ${plotTranslateY}px, 0)`;
  }

  // --------------------------------------------------------------------------
  // SCREENSHOT 5: DARKENING OVERLAY & DESCENDING VERTICAL LINE
  // Keeps ocean bright during Screenshots 3 & 4; darkens smoothly in Screenshot 5
  // --------------------------------------------------------------------------
  let overlayOpacity = 0.0;
  if (p >= 0.60 && p <= 0.80) {
    const t = (p - 0.60) / 0.20;
    overlayOpacity = t * 0.78; // 0 -> 0.78 (Screenshot 5)
  } else if (p > 0.80) {
    const t = Math.min(1, (p - 0.80) / 0.15);
    overlayOpacity = 0.78 + t * 0.22; // 0.78 -> 1.0 (Cast Section handoff)
  }

  if (elements.heroOverlay) {
    elements.heroOverlay.style.opacity = overlayOpacity;
  }

  // Vertical line draw below Plot
  let lineY = -100;
  if (p >= 0.62 && p <= 0.78) {
    const t = (p - 0.62) / 0.16;
    lineY = -100 + t * 100; // -100% -> 0% (drawing down!)
  } else if (p > 0.78 && p <= 0.90) {
    const t = (p - 0.78) / 0.12;
    lineY = t * 100; // 0% -> 100% (exits down)
  } else if (p > 0.90) {
    lineY = 100;
  }

  if (elements.drawLineInner) {
    elements.drawLineInner.style.transform = `translateY(${lineY}%)`;
  }

  // Request next frame if still interpolating
  if (Math.abs(targetProgress - currentProgress) > 0.0005) {
    requestAnimationFrame(updateParallax);
  } else {
    isTicking = false;
  }
}

function onScroll() {
  targetProgress = calculateProgress();
  if (!isTicking) {
    isTicking = true;
    requestAnimationFrame(updateParallax);
  }
  updateNavState();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  targetProgress = calculateProgress();
  updateParallax();
});

// ============================================================================
// 3. NAVIGATION ACTIVE STATE TRACKING
// ============================================================================
function updateNavState() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  
  if (scrollY > 50) {
    elements.navBar.classList.add('scrolled');
  } else {
    elements.navBar.classList.remove('scrolled');
  }

  const gooniesSec = document.getElementById('goonies');
  const booksSec = document.getElementById('books');
  const creditsSec = document.getElementById('credits');

  let activeSection = 'plot';
  if (creditsSec && scrollY >= creditsSec.offsetTop - vh * 0.4) {
    activeSection = 'credits';
  } else if (booksSec && scrollY >= booksSec.offsetTop - vh * 0.4) {
    activeSection = 'books';
  } else if (gooniesSec && scrollY >= gooniesSec.offsetTop - vh * 0.4) {
    activeSection = 'goonies';
  }

  Object.keys(elements.navLinks).forEach(sec => {
    const link = elements.navLinks[sec];
    const dot = elements.dots[sec];
    if (sec === activeSection) {
      if (link) link.classList.add('active');
      if (dot) {
        dot.className = 'pulse-dot-menu';
        dot.style.opacity = '1';
      }
    } else {
      if (link) link.classList.remove('active');
      if (dot) {
        dot.className = 'pulse-dot-0';
        dot.style.opacity = '0';
      }
    }
  });
}

// ============================================================================
// 4. PERMANENT BOOKSHELF LOGIC ("Books of Her Choice" with localStorage)
// ============================================================================
const STORAGE_KEY = 'goonies_books_of_her_choice';

const defaultBooks = [
  {
    id: 'b1',
    title: 'The Neverending Story',
    author: 'Michael Ende',
    year: '1979',
    genre: 'Fantasy',
    spine: 'spine-sea',
    rating: 5,
    notes: 'A lonely boy reads a magical book in an old bookstore attic and discovers that his own courage is needed to save the world of Fantastica from the Nothing.'
  },
  {
    id: 'b2',
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    year: '1883',
    genre: 'Adventure',
    spine: 'spine-amber',
    rating: 5,
    notes: 'The immortal tale of the Spanish Main, the sea chest, the dead man’s map, and Long John Silver that directly inspired Spielberg and Donner’s One-Eyed Willy.'
  },
  {
    id: 'b3',
    title: 'The Goonies: The Novel',
    author: 'James Kahn',
    year: '1985',
    genre: 'Lore',
    spine: 'spine-gold',
    rating: 5,
    notes: 'The definitive companion novel written alongside the 1985 screenplay, delving deep into One-Eyed Willy’s armada and the brotherhood of the Goon Docks.'
  }
];

function getBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBooks));
      return defaultBooks;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage access error:', e);
    return defaultBooks;
  }
}

function saveBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

let activeGenre = 'all';
let searchQuery = '';

function renderBookshelf() {
  const books = getBooks();
  const container = elements.booksGridContainer;
  if (!container) return;

  const filtered = books.filter(book => {
    const matchGenre = (activeGenre === 'all') || (book.genre.toLowerCase() === activeGenre.toLowerCase());
    const matchSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery) ||
      book.author.toLowerCase().includes(searchQuery) ||
      (book.notes && book.notes.toLowerCase().includes(searchQuery));
    return matchGenre && matchSearch;
  });

  if (elements.bookCountDisplay) {
    elements.bookCountDisplay.textContent = `Showing ${filtered.length} of ${books.length} Books`;
  }

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.2rem; font-family: var(--font-sharp); margin-bottom: 0.5rem;">No volumes found</p>
        <p style="font-size: 0.88rem; color: var(--text-dim);">Try a different search query or clear the filter.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(book => {
    const stars = '★'.repeat(book.rating || 5) + '☆'.repeat(5 - (book.rating || 5));
    const card = document.createElement('article');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-card-top">
        <div class="book-spine-badge ${book.spine || 'spine-gold'}">📖</div>
        <div class="book-meta">
          <span class="book-genre-tag">${book.genre}</span>
          <h4 class="book-title">${escapeHTML(book.title)}</h4>
          <p class="book-author">by ${escapeHTML(book.author)}${book.year ? ` • ${book.year}` : ''}</p>
        </div>
      </div>
      <div class="book-stars">${stars}</div>
      <div class="book-quote-box">"${escapeHTML(book.notes || 'A cherished volume chosen for the shelf.')}"</div>
      <div class="book-card-footer">
        <span>Permanently Saved</span>
        <button class="btn-remove-book" onclick="removeBook('${book.id}')">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

window.removeBook = function(id) {
  const books = getBooks();
  const updated = books.filter(b => b.id !== id);
  saveBooks(updated);
  renderBookshelf();
};

// Search & Filter Listeners
if (elements.bookSearchInput) {
  elements.bookSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderBookshelf();
  });
}

if (elements.filterPills) {
  elements.filterPills.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGenre = btn.dataset.genre || 'all';
      renderBookshelf();
    });
  });
}

// Modal open / close
function openBookModal() {
  if (elements.bookModalBackdrop) {
    elements.bookModalBackdrop.classList.add('open');
    elements.bookModalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeBookModal() {
  if (elements.bookModalBackdrop) {
    elements.bookModalBackdrop.classList.remove('open');
    elements.bookModalBackdrop.setAttribute('aria-hidden', 'true');
    if (elements.addBookForm) elements.addBookForm.reset();
    setRating(5);
  }
}

if (elements.openAddBookBtn) elements.openAddBookBtn.addEventListener('click', openBookModal);
if (elements.closeBookModalBtn) elements.closeBookModalBtn.addEventListener('click', closeBookModal);
if (elements.cancelBookBtn) elements.cancelBookBtn.addEventListener('click', closeBookModal);

// Star rating picker
function setRating(val) {
  if (elements.bookRating) elements.bookRating.value = val;
  const stars = elements.starPicker ? elements.starPicker.querySelectorAll('.star-pick') : [];
  stars.forEach((s, idx) => {
    if (idx < val) s.classList.add('active');
    else s.classList.remove('active');
  });
}

if (elements.starPicker) {
  elements.starPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('star-pick')) {
      const r = parseInt(e.target.dataset.rating, 10) || 5;
      setRating(r);
    }
  });
}

// Handle Add Book Submission
if (elements.addBookForm) {
  elements.addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const year = document.getElementById('bookYear').value.trim();
    const genre = document.getElementById('bookGenre').value;
    const spine = document.getElementById('bookSpine').value;
    const rating = parseInt(elements.bookRating.value, 10) || 5;
    const notes = document.getElementById('bookNotes').value.trim();

    if (!title || !author) return;

    const newBook = {
      id: 'book_' + Date.now(),
      title,
      author,
      year,
      genre,
      spine,
      rating,
      notes
    };

    const books = getBooks();
    books.unshift(newBook);
    saveBooks(books);
    closeBookModal();
    renderBookshelf();

    // Trigger celebratory chime if audio is running
    playCelebrationChime();
  });
}

// ============================================================================
// 5. CHARACTER DOSSIER MODALS
// ============================================================================
const characterDossiers = {
  mikey: {
    name: "Mikey Walsh",
    actor: "Sean Astin",
    tagline: "The Visionary & Leader",
    quote: "Our parents want the bestest stuff for us. But right now, they got to do what's right for them. Because it's their time. Their time! Up there! Down here, it's our time. It's our time down here!",
    lore: "Armed with his inhaler and an unshakeable belief in pirate lore, Mikey led his neighborhood friends into the treacherous cavern networks under Astoria to find One-Eyed Willy's fortune and save his home from destruction."
  },
  chunk: {
    name: "Lawrence 'Chunk' Cohen",
    actor: "Jeff Cohen",
    tagline: "Heart of the Goon Docks",
    quote: "First you make me do the Truffle Shuffle, then you put me in the cellar with a dead guy!",
    lore: "Accidentally captured by the Fratelli family, Chunk formed an unbreakable, legendary bond with Sloth over a shared Baby Ruth bar. His loyalty and empathy became the Goonies' greatest salvation."
  },
  sloth: {
    name: "Sloth Fratelli",
    actor: "John Matuszak",
    tagline: "The Gentle Giant",
    quote: "HEEEEY YOU GUUUUYS! ... Rocky Road? Heh-heh!",
    lore: "Chained away by his villainous family, Sloth found friendship with Chunk and took up a pirate bicorne hat to become the sworn protector of the Goonies, tearing open bars and breaking boards to save the children."
  },
  mouth: {
    name: "Clark 'Mouth' Devereaux",
    actor: "Corey Feldman",
    tagline: "The Translator & Wit",
    quote: "Yeah, but you know what? This one, this one right here... this was my dream, my wish. And it didn't come true. So I'm taking it back. I'm taking them all back.",
    lore: "The silver-tongued member of the group fluent in Spanish, Mouth translated the cryptic verses engraved upon Chester Copperpot's skeleton and the ancient Doubloon to guide the crew safely through deadly organ traps."
  },
  data: {
    name: "Richard 'Data' Wang",
    actor: "Ke Huy Quan",
    tagline: "The Gadgeteer Genius",
    quote: "Pinchers of Power! You guys, that was close! That was real close!",
    lore: "A relentless inventor equipped with a custom utility trench coat housing spring-loaded boxing gloves, Slick Shoes oil dispensers, and dental-wire ziplines that repeatedly cheated death across subterranean perils."
  }
};

window.openModal = function(charKey) {
  const data = characterDossiers[charKey];
  if (!data || !elements.modalContent || !elements.charModalBackdrop) return;

  elements.modalContent.innerHTML = `
    <span class="eyebrow gold">// CHARACTER DOSSIER</span>
    <h3 class="modal-title" style="margin-top: 0.4rem;">${data.name}</h3>
    <p style="color: var(--accent-gold); font-size: 0.95rem; margin-bottom: 1.5rem; letter-spacing: 0.05em;">Portrayed by ${data.actor} • ${data.tagline}</p>
    <div style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--accent-cyan); padding: 1.2rem; border-radius: 4px; margin-bottom: 1.5rem; font-style: italic; line-height: 1.6; color: #fff;">
      "${data.quote}"
    </div>
    <p style="font-size: 0.92rem; line-height: 1.7; color: var(--text-muted);">${data.lore}</p>
  `;

  elements.charModalBackdrop.classList.add('open');
  elements.charModalBackdrop.setAttribute('aria-hidden', 'false');
};

window.closeModal = function() {
  if (elements.charModalBackdrop) {
    elements.charModalBackdrop.classList.remove('open');
    elements.charModalBackdrop.setAttribute('aria-hidden', 'true');
  }
};

if (elements.charModalBackdrop) {
  elements.charModalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.charModalBackdrop) closeModal();
  });
}

// ============================================================================
// 6. ATMOSPHERIC WEB AUDIO ENGINE (Dave Grusin Inspired Analog Theme)
// ============================================================================
let audioCtx = null;
let isAudioPlaying = false;
let audioNodes = [];

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
}

function toggleThemeAudio() {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (isAudioPlaying) {
    stopThemeAudio();
  } else {
    startThemeAudio();
  }
}

function startThemeAudio() {
  if (!audioCtx) return;
  isAudioPlaying = true;
  if (elements.musicToggle) elements.musicToggle.classList.add('playing');

  // Master Gain
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  audioNodes.push(masterGain);

  // Sea Breeze Pink Noise Generator
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99 * b0 + white * 0.05;
    b1 = 0.96 * b1 + white * 0.08;
    b2 = 0.88 * b2 + white * 0.12;
    output[i] = (b0 + b1 + b2) * 0.3;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(320, audioCtx.currentTime);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

  whiteNoise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  whiteNoise.start();
  audioNodes.push(whiteNoise, noiseGain);

  // Warm Synth Pad (Pentatonic harmony D - F# - A - B)
  const notes = [146.83, 220.00, 293.66, 369.99]; // D3, A3, D4, F#4
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    const padGain = audioCtx.createGain();
    padGain.gain.setValueAtTime(0.035, audioCtx.currentTime);

    // Subtle LFO vibrato
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.2 + idx * 0.1, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    osc.connect(padGain);
    padGain.connect(masterGain);
    osc.start();

    audioNodes.push(osc, padGain, lfo, lfoGain);
  });
}

function stopThemeAudio() {
  isAudioPlaying = false;
  if (elements.musicToggle) elements.musicToggle.classList.remove('playing');
  audioNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {}
  });
  audioNodes = [];
}

function playCelebrationChime() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  freqs.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);

    gain.gain.setValueAtTime(0.08, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.65);
  });
}

if (elements.musicToggle) {
  elements.musicToggle.addEventListener('click', toggleThemeAudio);
}

// ============================================================================
// 7. INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderBookshelf();
  targetProgress = calculateProgress();
  currentProgress = targetProgress;
  updateParallax();
  updateNavState();
});
