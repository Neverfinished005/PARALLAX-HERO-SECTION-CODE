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
  pillarLeft: document.getElementById('pillarLeft'),
  pillarRight: document.getElementById('pillarRight'),
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
    impact: document.getElementById('dotImpact'),
    work: document.getElementById('dotWork'),
    services: document.getElementById('dotServices'),
    team: document.getElementById('dotTeam'),
    contact: document.getElementById('dotContact'),
  },
  navLinks: {
    plot: document.getElementById('navPlot'),
    impact: document.getElementById('navImpact'),
    work: document.getElementById('navWork'),
    services: document.getElementById('navServices'),
    team: document.getElementById('navTeam'),
    contact: document.getElementById('navContact'),
  },
  
  // Section DOM elements for sticky snapping engine
  impactSec: document.getElementById('impact'),
  workSec: document.getElementById('work'),
  servicesSec: document.getElementById('services'),
  teamSec: document.getElementById('team'),
  contactSec: document.getElementById('contact'),

  // Alphakore Modals & Interactive Elements
  projectModalBackdrop: document.getElementById('projectModalBackdrop'),
  projectModalContent: document.getElementById('projectModalContent'),
  toastContainer: document.getElementById('toastContainer')
};

// ============================================================================
// 2. PARALLAX SCROLL CHOREOGRAPHY (CINEMATIC PILLARS PARTING)
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
  // FOREGROUND CARVED STONE PILLARS (Grounded Architectural Frame)
  // Gently widens to aperture frame from p=0.10 to 0.55 and holds in place
  // --------------------------------------------------------------------------
  let pillarScale = 1.0;
  if (p >= 0.10 && p <= 0.55) {
    const t = (p - 0.10) / 0.45;
    pillarScale = 1.0 + t * 0.28; // 1.0 -> 1.28
  } else if (p > 0.55) {
    pillarScale = 1.28;
  }

  if (elements.bgScroll) {
    elements.bgScroll.style.transform = `scale(${pillarScale})`;
    elements.bgScroll.style.opacity = '1';
  }
  if (elements.pillarLeft) {
    elements.pillarLeft.style.transform = `scale(${pillarScale})`;
    elements.pillarLeft.style.opacity = '1';
  }
  if (elements.pillarRight) {
    elements.pillarRight.style.transform = `scale(${pillarScale})`;
    elements.pillarRight.style.opacity = '1';
  }

  // --------------------------------------------------------------------------
  // BACKGROUND SCENE & TRAVELER (bg-main)
  // Camera gently pushes in, holds firmly in place with full opacity
  // --------------------------------------------------------------------------
  let oceanScale = 1.0;
  if (p >= 0.10 && p <= 0.55) {
    const t = (p - 0.10) / 0.45;
    oceanScale = 1.0 + t * 0.18; // 1.0 -> 1.18
  } else if (p > 0.55) {
    oceanScale = 1.18;
  }

  if (elements.bgMain) {
    elements.bgMain.style.transform = `scale(${oceanScale})`;
    elements.bgMain.style.opacity = '1';
  }

  // --------------------------------------------------------------------------
  // TITLE: ALPHAKORE HERO BRANDING (hero-parent)
  // --------------------------------------------------------------------------
  let titleOpacity = 1.0;
  let titleScale = 1.0;

  if (p <= 0.14) {
    titleOpacity = 1.0;
    titleScale = 1.0;
  } else if (p > 0.14 && p <= 0.32) {
    const t = (p - 0.14) / 0.18;
    titleOpacity = Math.max(0, 1.0 - t);
    titleScale = 1.0 + t * 0.10;
  } else {
    titleOpacity = 0.0;
  }

  if (elements.heroParent) {
    elements.heroParent.style.opacity = titleOpacity;
    elements.heroParent.style.transform = `scale(${titleScale})`;
  }

  // Scroll mouse indicator fades out early
  if (elements.scrollImg) {
    const scrollIconOp = p < 0.12 ? 1.0 - (p / 0.12) : 0;
    elements.scrollImg.style.opacity = scrollIconOp;
  }

  // --------------------------------------------------------------------------
  // PLOT HEADLINE & SYNOPSIS (intro-parent)
  // Fades in and slides up by p=0.55, then stays 100% solid & visible
  // The hero section finishes in this exact state, ready for Section 2
  // --------------------------------------------------------------------------
  let plotOpacity = 0.0;
  let plotTranslateY = 35;

  if (p >= 0.24 && p <= 0.55) {
    const t = (p - 0.24) / 0.31;
    plotOpacity = t;
    plotTranslateY = 35 * (1 - t);
  } else if (p > 0.55) {
    plotOpacity = 1.0;
    plotTranslateY = 0;
  } else {
    plotOpacity = 0.0;
  }

  if (elements.introParent) {
    elements.introParent.style.opacity = plotOpacity;
    elements.introParent.style.transform = `translate3d(0, ${plotTranslateY}px, 0)`;
  }

  // --------------------------------------------------------------------------
  // OVERLAY DISABLED & DESCENDING VERTICAL LINE
  // --------------------------------------------------------------------------
  if (elements.heroOverlay) {
    elements.heroOverlay.style.opacity = '0';
    elements.heroOverlay.style.display = 'none';
  }

  // Vertical line draw below Plot
  let lineY = -100;
  if (p >= 0.36 && p <= 0.58) {
    const t = (p - 0.36) / 0.22;
    lineY = -100 + t * 100; // -100% -> 0%
  } else if (p > 0.58) {
    lineY = 0; // Stays fully drawn down
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

let isProgrammaticScroll = false;
let programmaticScrollTimer = null;
let lastScrollPosition = window.scrollY;
let lastScrollDirection = 'down';
let settleSnapTimer = null;

function onScroll() {
  const currentY = window.scrollY;
  if (Math.abs(currentY - lastScrollPosition) > 2) {
    lastScrollDirection = currentY >= lastScrollPosition ? 'down' : 'up';
    lastScrollPosition = currentY;
  }

  targetProgress = calculateProgress();
  if (!isTicking) {
    isTicking = true;
    requestAnimationFrame(updateParallax);
  }
  updateNavState();

  // Debounced settle snapper: if scrolling stops inside an intermediate dead zone, snap cleanly to section
  if (!isProgrammaticScroll) {
    clearTimeout(settleSnapTimer);
    settleSnapTimer = setTimeout(checkAndSettleSectionSnap, 130);
  }
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

  const impactSec = elements.impactSec || document.getElementById('impact');
  const workSec = elements.workSec || document.getElementById('work');
  const servicesSec = elements.servicesSec || document.getElementById('services');
  const teamSec = elements.teamSec || document.getElementById('team');
  const contactSec = elements.contactSec || document.getElementById('contact');

  let activeSection = 'plot';
  if (contactSec && scrollY >= contactSec.offsetTop - vh * 0.45) {
    activeSection = 'contact';
  } else if (teamSec && scrollY >= teamSec.offsetTop - vh * 0.45) {
    activeSection = 'team';
  } else if (servicesSec && scrollY >= servicesSec.offsetTop - vh * 0.45) {
    activeSection = 'services';
  } else if (workSec && scrollY >= workSec.offsetTop - vh * 0.45) {
    activeSection = 'work';
  } else if (impactSec && scrollY >= impactSec.offsetTop - vh * 0.45) {
    activeSection = 'impact';
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
// 3B. SECTION-WISE STICKY SCROLL & SNAP ENGINE
// Eliminates awkward halfway cut-offs; locks each section full-screen on scroll
// ============================================================================
function getSectionOffsets() {
  const vh = window.innerHeight;
  const heroContainer = elements.scrollContainer;
  const impactSec = elements.impactSec || document.getElementById('impact');
  const workSec = elements.workSec || document.getElementById('work');
  const servicesSec = elements.servicesSec || document.getElementById('services');
  const teamSec = elements.teamSec || document.getElementById('team');
  const contactSec = elements.contactSec || document.getElementById('contact');

  const heroClimax = heroContainer ? Math.max(0, heroContainer.offsetHeight - vh) : 0;
  const impactTop = impactSec ? impactSec.offsetTop : heroClimax + vh;
  const workTop = workSec ? workSec.offsetTop : impactTop + vh;
  const workEnd = workSec ? (workSec.offsetTop + Math.max(0, workSec.offsetHeight - vh)) : workTop;
  const servicesTop = servicesSec ? servicesSec.offsetTop : workEnd + vh;
  const teamTop = teamSec ? teamSec.offsetTop : servicesTop + vh;
  const contactTop = contactSec ? contactSec.offsetTop : teamTop + vh;

  return {
    heroStart: 0,
    heroClimax,
    impactTop,
    workTop,
    workEnd,
    servicesTop,
    teamTop,
    contactTop
  };
}

function smoothScrollTo(targetY, duration = 650) {
  if (Math.abs(window.scrollY - targetY) < 5) return;

  isProgrammaticScroll = true;
  clearTimeout(programmaticScrollTimer);

  window.scrollTo({
    top: targetY,
    behavior: 'smooth'
  });

  programmaticScrollTimer = setTimeout(() => {
    isProgrammaticScroll = false;
    targetProgress = calculateProgress();
    updateParallax();
    updateNavState();
  }, duration);
}

function checkAndSettleSectionSnap() {
  if (isProgrammaticScroll) return;

  const currentY = window.scrollY;
  const offsets = getSectionOffsets();

  // Zone 1: Trapped between Hero Climax and Impact (the primary reported issue)
  if (currentY > offsets.heroClimax + 30 && currentY < offsets.impactTop - 30) {
    if (lastScrollDirection === 'down') {
      smoothScrollTo(offsets.impactTop);
    } else {
      smoothScrollTo(offsets.heroClimax);
    }
    return;
  }

  // Zone 2: Trapped between Impact and Work start
  if (currentY > offsets.impactTop + 30 && currentY < offsets.workTop - 30) {
    if (lastScrollDirection === 'down') {
      smoothScrollTo(offsets.workTop);
    } else {
      smoothScrollTo(offsets.impactTop);
    }
    return;
  }

  // Zone 3: Trapped between Work end and Services
  if (currentY > offsets.workEnd + 30 && currentY < offsets.servicesTop - 30) {
    if (lastScrollDirection === 'down') {
      smoothScrollTo(offsets.servicesTop);
    } else {
      smoothScrollTo(offsets.workEnd);
    }
    return;
  }
}

function initSectionScrollManager() {
  // Wheel-based section sticking and snapping
  window.addEventListener('wheel', (e) => {
    if (isProgrammaticScroll) {
      e.preventDefault();
      return;
    }

    const offsets = getSectionOffsets();
    const currentY = window.scrollY;
    const delta = e.deltaY;
    const threshold = 40; // pixel tolerance for section boundary

    // 1. At or near Hero Climax (Plot Frame)
    if (Math.abs(currentY - offsets.heroClimax) <= threshold || 
        (currentY >= offsets.heroClimax - 10 && currentY < offsets.impactTop - 40)) {
      if (delta > 20) {
        e.preventDefault();
        smoothScrollTo(offsets.impactTop, 700);
        return;
      }
    }

    // 2. At or near Vision (#impact) - exactly 100vh stage
    if (Math.abs(currentY - offsets.impactTop) <= threshold) {
      if (delta > 20) {
        e.preventDefault();
        smoothScrollTo(offsets.workTop, 700);
        return;
      } else if (delta < -20) {
        e.preventDefault();
        smoothScrollTo(offsets.heroClimax, 700);
        return;
      }
    }

    // 3. At start of Work (#work)
    if (Math.abs(currentY - offsets.workTop) <= threshold) {
      if (delta < -20) {
        e.preventDefault();
        smoothScrollTo(offsets.impactTop, 700);
        return;
      }
    }

    // 4. At end of Work (after Card 05 is reached)
    if (Math.abs(currentY - offsets.workEnd) <= threshold || 
        (currentY >= offsets.workEnd - 10 && currentY < offsets.servicesTop - 40)) {
      if (delta > 20) {
        e.preventDefault();
        smoothScrollTo(offsets.servicesTop, 700);
        return;
      }
    }

    // 5. At top of Services (#services)
    if (Math.abs(currentY - offsets.servicesTop) <= threshold) {
      if (delta < -20) {
        e.preventDefault();
        smoothScrollTo(offsets.workEnd, 700);
        return;
      }
    }
  }, { passive: false });

  // Keyboard navigation for section hopping
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) {
      const offsets = getSectionOffsets();
      const currentY = window.scrollY;
      const threshold = 45;

      if (Math.abs(currentY - offsets.heroClimax) <= threshold) {
        e.preventDefault();
        smoothScrollTo(offsets.impactTop);
      } else if (Math.abs(currentY - offsets.impactTop) <= threshold) {
        e.preventDefault();
        smoothScrollTo(offsets.workTop);
      } else if (Math.abs(currentY - offsets.workEnd) <= threshold) {
        e.preventDefault();
        smoothScrollTo(offsets.servicesTop);
      }
    } else if (['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
      const offsets = getSectionOffsets();
      const currentY = window.scrollY;
      const threshold = 45;

      if (Math.abs(currentY - offsets.impactTop) <= threshold) {
        e.preventDefault();
        smoothScrollTo(offsets.heroClimax);
      } else if (Math.abs(currentY - offsets.workTop) <= threshold) {
        e.preventDefault();
        smoothScrollTo(offsets.impactTop);
      } else if (Math.abs(currentY - offsets.servicesTop) <= threshold) {
        e.preventDefault();
        smoothScrollTo(offsets.workEnd);
      }
    }
  });
}

function initNavClickSmoothScroll() {
  const navMap = {
    navPlot: () => 0,
    navImpact: () => getSectionOffsets().impactTop,
    navWork: () => getSectionOffsets().workTop,
    navServices: () => getSectionOffsets().servicesTop,
    navTeam: () => getSectionOffsets().teamTop,
    navContact: () => getSectionOffsets().contactTop
  };

  Object.keys(navMap).forEach(navId => {
    const el = document.getElementById(navId);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetY = navMap[navId]();
        smoothScrollTo(targetY, 750);
      });
    }
  });

  // Hero scroll mouse icon click handler
  const scrollImg = document.getElementById('scrollImg');
  if (scrollImg) {
    scrollImg.style.cursor = 'pointer';
    scrollImg.addEventListener('click', (e) => {
      e.preventDefault();
      const offsets = getSectionOffsets();
      if (window.scrollY < offsets.heroClimax * 0.5) {
        smoothScrollTo(offsets.heroClimax, 650);
      } else {
        smoothScrollTo(offsets.impactTop, 750);
      }
    });
  }

  // Vision circular explore button
  const impactCircleBtn = document.querySelector('.impact-circle-btn');
  if (impactCircleBtn) {
    impactCircleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo(getSectionOffsets().workTop, 750);
    });
  }
}
// ============================================================================
// 4. ALPHAKORE PROJECT DOSSIER DATA & MODAL SYSTEM
// ============================================================================
const projectDossiers = {
  prism: {
    title: 'PRISM',
    status: 'Live',
    tagline: 'AI Workflow Orchestration Engine',
    desc: 'Next-generation workflow orchestration engine visualizing real-time prompt topologies, multi-step LLM routing, and automated inference pipelines with zero latency bottlenecks.',
    architecture: 'Features a low-latency WebGL graph engine calculating real-time prompt token weightings, dynamic branch pruning, and asynchronous fallbacks across multi-cloud inference providers. Enables teams to monitor complex chained LLM flows with millisecond trace resolution.',
    tags: ['WebGL Canvas', 'AI Flow Topology', 'Streaming WebSockets', 'Edge Inference Routing', 'Multi-LLM Fallback', 'TypeScript'],
    link: 'https://prism-ai-flow.vercel.app/',
    linkLabel: 'Open PRISM Engine ↗'
  },
  delta: {
    title: 'DELTA',
    status: 'In Progress',
    tagline: 'Edge Infrastructure & Telemetry',
    desc: 'High-throughput data telemetry and edge infrastructure layer designed for autonomous cloud micro-services, distributed sensor feeds, and low-latency message queues.',
    architecture: 'Underlying zero-copy packet ingestion layer engineered with Rust primitives, compiling directly to edge worker nodes. Capable of handling over 250,000 telemetry events per second per cluster with distributed consensus and geo-redundancy.',
    tags: ['Rust Edge Primitives', 'Distributed Telemetry', 'Kafka / Redpanda Queues', 'Zero-Copy Serialization', 'Microservices'],
    link: 'https://delta-kappa-pink.vercel.app/',
    linkLabel: 'Inspect Edge Preview ↗'
  },
  lazycook: {
    title: 'LAZYCOOK',
    status: 'Live',
    tagline: 'Autonomous Terminal Assistant',
    desc: 'An autonomous multi-agent AI assistant that runs natively in your terminal. Powered by Gemini 2.5 Flash with a four-agent architecture — engineered for maximum output with minimum human intervention.',
    architecture: 'Architected around a hierarchical supervisor model where an Executive Planner decomposes natural language intents and dynamically orchestrates specialized sub-agents: Code Synthesizer, Shell Operator, Diagnostics Inspector, and Documentation Oracle. Operates locally within sandbox isolation with zero external memory leaks.',
    tags: ['Gemini 2.5 Flash', 'Autonomous Agents', 'Terminal CLI', 'Multi-Agent Supervisor', 'Python / Node.js', 'Zero-Latency RPC'],
    link: 'https://thelazycook.in/',
    linkLabel: 'Launch Live Assistant ↗'
  },
  rezum: {
    title: 'REZUM',
    status: 'Live',
    tagline: 'Machine-Readable Portfolio Protocol',
    desc: 'An AI-readable portfolio builder that turns your resume into a machine-optimized format — so recruiters’ AI tools and ATS systems parse your experience exactly as intended.',
    architecture: 'Generates dual-layered assets: human-crafted editorial typographic presentations paired with machine-optimized structured data schema (JSON-LD, microdata, vector embeddings). Bypasses legacy ATS truncation bugs and guarantees parsing fidelity across modern LLM recruiting pipelines.',
    tags: ['AI Schema Optimization', 'JSON-LD Architecture', 'Vector Normalization', 'ATS Parsing Fidelity', 'Next.js Edge'],
    link: 'https://rezum-alphakore.vercel.app/',
    linkLabel: 'Generate Machine Resume ↗'
  },
  '3f1': {
    title: '3F1',
    status: 'Live',
    tagline: 'Bespoke Spatial Digital Commerce',
    desc: 'Bespoke digital commerce platform and brand experience built with cinematic 3D product visualizers, responsive spatial physics, and luxury architectural typography.',
    architecture: 'Combines GPU-accelerated Three.js shader pipelines with instant micro-checkout transactions. Features custom PBR materials that replicate real-world light caustics on mobile browsers with consistent 60fps performance.',
    tags: ['Three.js WebGL', 'Custom PBR Shaders', 'Headless Commerce', 'Spatial Physics', 'Ultra-Low Latency UX'],
    link: 'https://www.3f1.in/',
    linkLabel: 'Experience 3F1 ↗'
  }
};

function openProjectModal(projectId) {
  const data = projectDossiers[projectId];
  if (!data || !elements.projectModalBackdrop || !elements.projectModalContent) return;

  elements.projectModalContent.innerHTML = `
    <div class="project-modal-eyebrow">PROJECT SPECIFICATIONS</div>
    <h3 class="project-modal-title">${data.title}</h3>
    <span class="project-modal-status ${data.status.toLowerCase().includes('live') ? 'live' : 'progress'}">${data.status}</span>
    <p class="project-modal-desc">${data.desc}</p>
    
    <div class="project-modal-section-title">Architecture &amp; Design</div>
    <p class="project-modal-desc">${data.architecture}</p>

    <div class="project-modal-section-title">Engineered Stack</div>
    <div class="project-modal-tags">
      ${data.tags.map(t => `<span class="project-modal-tag">${t}</span>`).join('')}
    </div>

    <div class="project-modal-actions">
      <a href="${data.link}" target="_blank" rel="noopener noreferrer" class="work-btn-primary">${data.linkLabel}</a>
      <button class="work-btn-ghost" onclick="closeProjectModal()">Dismiss</button>
    </div>
  `;

  elements.projectModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  if (!elements.projectModalBackdrop) return;
  elements.projectModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;

if (elements.projectModalBackdrop) {
  elements.projectModalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.projectModalBackdrop) {
      closeProjectModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
  }
});

// ============================================================================
// 5. SKIPER-17 GSAP STICKY ROTATING CARD DECK ANIMATION
// ============================================================================
let skiper17Timeline = null;

function initSkiper17CardStack() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not detected');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector('.skiper-deck-section');
  const cardElements = document.querySelectorAll('.skiper17-card');
  const counterEl = document.getElementById('skiper17Counter');
  const dots = document.querySelectorAll('.skiper17-dot');

  if (!section || !cardElements.length) return;

  const totalCards = cardElements.length;

  // Set initial states exactly matching Skiper-17:
  // Card 0 at y: "0%", scale: 1, rotation: 0
  // Next cards down below at y: "100%"
  gsap.set(cardElements[0], { y: '0%', x: '0%', scale: 1, rotation: 0, opacity: 1 });
  for (let i = 1; i < totalCards; i++) {
    gsap.set(cardElements[i], { y: '100%', x: '0%', scale: 1, rotation: 0, opacity: 1 });
  }

  if (skiper17Timeline) {
    skiper17Timeline.kill();
  }

  // Create scrubbed ScrollTrigger timeline synced to the native sticky stage
  skiper17Timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      snap: {
        snapTo: 1 / (totalCards - 1),
        duration: { min: 0.2, max: 0.45 },
        delay: 0.08,
        ease: 'power1.inOut'
      },
      onUpdate: (self) => {
        const activeIdx = Math.min(
          totalCards - 1,
          Math.floor(self.progress * (totalCards - 0.05))
        );
        if (counterEl) {
          counterEl.textContent = `0${activeIdx + 1} / 0${totalCards}`;
        }
        dots.forEach((dot, idx) => {
          if (idx === activeIdx) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    }
  });

  // Skiper-17 Card Stack Animation Loop:
  // Current card scales down, tilts in zigzag (+-2.5deg) and shifts (+-1.5%), while next card slides up to y: 0%
  for (let i = 0; i < totalCards - 1; i++) {
    const currentCard = cardElements[i];
    const nextCard = cardElements[i + 1];
    const position = i;

    // Current card scales down, tilts, and recedes cleanly into the stack without transparency bleed-through
    skiper17Timeline.to(
      currentCard,
      {
        scale: 0.92,
        rotation: i % 2 === 0 ? 2.5 : -2.5,
        x: i % 2 === 0 ? '-1.5%' : '1.5%',
        duration: 1,
        ease: 'none',
      },
      position
    );

    // Next card ascends smoothly from y: 100% to y: 0%
    skiper17Timeline.to(
      nextCard,
      {
        y: '0%',
        x: '0%',
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: 'none',
      },
      position
    );
  }

  // Allow clicking on dots to jump smoothly to that card
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const trigger = skiper17Timeline.scrollTrigger;
      if (trigger) {
        const targetScroll = trigger.start + (trigger.end - trigger.start) * (idx / (totalCards - 1));
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    });
  });

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}

// ============================================================================
// 5B. SKIPER-17 PERIMETER KINETIC TEXT RIBBON ANIMATION (INVERTED-U LOOP)
// ============================================================================
let cardRibbonAnimId = null;

function initCardPerimeterRibbon() {
  const viewport = document.getElementById('skiperDeckViewport');
  const path = document.getElementById('cardPerimeterPath');
  const guide = document.getElementById('cardPerimeterGuide');
  const textPath = document.getElementById('cardPerimeterTextPath');
  const workSection = document.getElementById('work');

  if (!viewport || !path || !textPath) return;

  // Single editorial phrase as requested from Section 3 header
  const singlePhrase = "✦ BUILT WITH PASSION & PRECISION ✦ A SMALL STUDIO BUILDING THE LAYER BETWEEN BOLD IDEAS AND WORKING SYSTEMS ✦ SOFTWARE, AUTOMATION & DIGITAL PRODUCTS ✦ SELECTED WORK ";
  const copies = 6;
  textPath.textContent = singlePhrase.repeat(copies);

  function updatePath() {
    const W = viewport.offsetWidth;
    const H = viewport.offsetHeight;
    const isMobile = window.innerWidth <= 768;
    const D = isMobile ? 18 : 28;
    const R = isMobile ? 26 : 36;
    const extraBottom = isMobile ? 24 : 36;

    // Inverted-U path starting from bottom-left, climbing up, across top, down to bottom-right:
    const d = `M ${-D} ${H + extraBottom} ` +
              `L ${-D} ${-D + R} ` +
              `A ${R} ${R} 0 0 1 ${-D + R} ${-D} ` +
              `L ${W + D - R} ${-D} ` +
              `A ${R} ${R} 0 0 1 ${W + D} ${-D + R} ` +
              `L ${W + D} ${H + extraBottom}`;

    path.setAttribute('d', d);
    if (guide) guide.setAttribute('d', d);
  }

  updatePath();
  window.addEventListener('resize', updatePath);

  // Kinetic Animation state
  let isWorkVisible = false;
  let hasStarted = false;
  let currentOffset = 0;
  let unitLen = 1400;
  let speed = 0.95; // px per frame (steady elegant reading pace)

  function measureAndInit() {
    try {
      const totalLen = textPath.getComputedTextLength();
      if (totalLen > 0) {
        unitLen = totalLen / copies;
        // Start leading character right at distance 0 (bottom-left entrance)
        currentOffset = -(copies - 1) * unitLen;
        textPath.setAttribute('startOffset', currentOffset);
      }
    } catch (e) {
      console.warn('Text measurement error', e);
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureAndInit);
  } else {
    setTimeout(measureAndInit, 150);
  }

  // Interactive hover: smoothly ease speed when hovering the cards or ribbon
  viewport.addEventListener('mouseenter', () => { speed = 0.35; });
  viewport.addEventListener('mouseleave', () => { speed = 0.95; });

  function tick() {
    if (isWorkVisible && hasStarted) {
      const loopThreshold = -unitLen * 2;
      currentOffset += speed;
      if (currentOffset > loopThreshold) {
        currentOffset = ((currentOffset - loopThreshold) % unitLen) + loopThreshold;
      }
      textPath.setAttribute('startOffset', currentOffset);
    }
    cardRibbonAnimId = requestAnimationFrame(tick);
  }

  if (cardRibbonAnimId) cancelAnimationFrame(cardRibbonAnimId);
  cardRibbonAnimId = requestAnimationFrame(tick);

  // Trigger as soon as the user lands on #work section
  if (typeof IntersectionObserver !== 'undefined' && workSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isWorkVisible = true;
            if (!hasStarted) {
              hasStarted = true;
              measureAndInit();
            }
          } else {
            isWorkVisible = false;
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(workSection);
  } else {
    isWorkVisible = true;
    hasStarted = true;
  }
}

// ============================================================================
// 5. SKIPER39 INTERACTIVE CROWD CANVAS SYSTEM
// ============================================================================
function initSkiper39CrowdCanvas() {
  const canvas = document.getElementById('crowdCanvas');
  const wrapper = document.getElementById('crowdWrapper');
  const dossier = document.getElementById('crowdDossierCard');
  if (!canvas || !wrapper) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configuration for 15 rows x 7 cols Open Peeps sprite sheet (3600 x 2268)
  const SPRITE_CONFIG = {
    src: 'images/peeps/all-peeps.png',
    rows: 15,
    cols: 7,
    cellWidth: 240,
    cellHeight: 324
  };

  // The 9 Core Team Members - All with guy with hoodie avatar (index 26) in distinctive studio colors
  const HOODIE_SPRITE_INDEX = 26; // Open Peeps iconic guy with hoodie
  const TEAM_MEMBERS = [
    {
      id: 'hitarth',
      name: 'Hitarth Trivedi',
      badge: 'Hitarth Trivedi · Lead Architect',
      role: 'Lead Architect & Full Stack',
      category: 'lead engineer',
      color: '#c84826', // Terracotta
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'HT',
      bio: 'Spearheading core architectural decisions, multi-agent frameworks, and distributed system design.',
      tags: ['Distributed Systems', 'Multi-Agent', 'Rust', 'TypeScript'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/hitarth-trivedi-ba1986300' },
        { label: 'gh', url: 'https://github.com/HitarthTrivedi' },
        { label: 'ig', url: 'https://www.instagram.com/htrivedi_' }
      ]
    },
    {
      id: 'harsh',
      name: 'Harsh Patel',
      badge: 'Harsh Patel · AI Architect',
      role: 'AI & Full-Stack Builder',
      category: 'engineer',
      color: '#d97706', // Amber Gold
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'HP',
      bio: 'Developing intelligent autonomous agent layers, prompt topology graphs, and LLM inference pipelines.',
      tags: ['LLM Routing', 'Agent Workflows', 'Prompt Graphs', 'Python'],
      links: [
        { label: 'in', url: 'http://www.linkedin.com/in/harsh8818198' },
        { label: '↗', url: 'https://harsh8818198portfolio.netlify.app/' },
        { label: 'ig', url: 'https://www.instagram.com/0_8818198' }
      ]
    },
    {
      id: 'meet',
      name: 'Meet Shah',
      badge: 'Meet Shah · Systems Engineer',
      role: 'Core Systems Engineer',
      category: 'engineer',
      color: '#059669', // Emerald Mint
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'MS',
      bio: 'Building robust algorithmic logic, performance-critical modules, and reliable database architectures.',
      tags: ['Algorithms', 'PostgreSQL', 'Distributed DB', 'C++'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/meetshah0656' },
        { label: 'gh', url: 'https://github.com/MeetShah0656' }
      ]
    },
    {
      id: 'het',
      name: 'Het Vaghela',
      badge: 'Het Vaghela · Creative Tech',
      role: 'Creative Technologist & Frontend',
      category: 'creative',
      color: '#0284c7', // Electric Blue
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'HV',
      bio: 'Crafting immersive interactive interfaces, responsive physics-based layouts, and motion design.',
      tags: ['Three.js', 'GSAP Motion', 'Creative Coding', 'Shaders'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/het-vaghela-8a8647339/' },
        { label: '↗', url: 'https://portfolio-website-sigma-lac-93.vercel.app/' }
      ]
    },
    {
      id: 'deep',
      name: 'Deep',
      badge: 'Deep · Creative Direction',
      role: 'Creative & Technical Direction',
      category: 'creative',
      color: '#7c3aed', // Royal Violet
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'DP',
      bio: 'Harmonizing cinematic aesthetics with software architecture to create memorable brand experiences.',
      tags: ['Creative Direction', 'Brand Strategy', '3D Vision', 'Design'],
      links: [
        { label: 'Studio', url: '#contact' }
      ]
    },
    {
      id: 'parth',
      name: 'Parth Soni',
      badge: 'Parth Soni · Cloud Architect',
      role: 'Systems & Cloud Engineer',
      category: 'lead engineer',
      color: '#e11d48', // Crimson Rose
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'PS',
      bio: 'Engineering low-latency backend infrastructure, cloud orchestration, and high-volume data streams.',
      tags: ['Cloud Infra', 'Zero-Copy Streams', 'Kafka', 'Docker'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/parth-soni-54a974288' },
        { label: '↗', url: 'https://parth-soni.vercel.app' },
        { label: 'ig', url: 'https://www.instagram.com/parth_soni3010' }
      ]
    },
    {
      id: 'om',
      name: 'Om Bhonsle',
      badge: 'Om Bhonsle · DevOps Engineer',
      role: 'DevOps & Cloud Systems',
      category: 'engineer',
      color: '#ca8a04', // Warm Gold
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'OB',
      bio: 'Managing continuous integration, zero-downtime deployment pipelines, and Kubernetes telemetry.',
      tags: ['Kubernetes', 'Telemetry', 'Cloud Deploy', 'Monitoring'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/om-bhonsle-a674133a3' },
        { label: 'ig', url: 'https://www.instagram.com/ombhonsle2306' }
      ]
    },
    {
      id: 'shlok',
      name: 'Shlok Patel',
      badge: 'Shlok Patel · Product Designer',
      role: 'Product Designer & UX',
      category: 'creative',
      color: '#c026d3', // Fuchsia
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'SP',
      bio: 'Designing intuitive human-machine interfaces, tactile user flows, and brand design systems.',
      tags: ['Product UX', 'Interface Design', 'Design Systems', 'Figma'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/shlok-patel-051b162b2' },
        { label: '↗', url: 'https://shlok-portfolio.com' },
        { label: 'ig', url: 'https://www.instagram.com/shlok_1125' }
      ]
    },
    {
      id: 'manav',
      name: 'Manav Patel',
      badge: 'Manav Patel · AI Researcher',
      role: 'Research & Engineering',
      category: 'engineer',
      color: '#0d9488', // Teal
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'MP',
      bio: 'Investigating next-generation neural architectures, latency optimization, and automated verification.',
      tags: ['Neural Research', 'Latency Tuning', 'Verification', 'Python'],
      links: [
        { label: 'in', url: 'http://www.linkedin.com/in/manav-patel-4930132a6' }
      ]
    },
    {
      id: 'rudra',
      name: 'Rudra Vable',
      badge: 'Rudra Vable · Developer & Builder',
      role: 'Developer & Automation Engineer',
      category: 'engineer',
      color: '#16a34a', // Forest Green
      spriteIndex: HOODIE_SPRITE_INDEX,
      initials: 'RV',
      bio: 'Builder obsessed with turning ideas into working systems — writing code, automating workflows, and pushing commits that actually ship.',
      tags: ['Automation', 'Full Stack', 'GitHub', 'Systems Thinking'],
      links: [
        { label: 'in', url: 'https://www.linkedin.com/in/rudra-vable' },
        { label: 'gh', url: 'https://github.com/Neverfinished005' },
        { label: 'ig', url: 'https://www.instagram.com/rudr_a.25' }
      ]
    }
  ];

  let currentFilter = 'all';
  let hoveredPeep = null;
  let isMouseInsideDossier = false;

  const stage = { width: 0, height: 0 };
  const allSprites = [];
  const crowd = [];

  // UTILITIES
  const randomRange = (min, max) => min + Math.random() * (max - min);
  const randomIndex = (array) => (Math.random() * array.length) | 0;

  // Offscreen pre-rendering of colored sprites for team members
  function createTintedSpriteCanvas(imageSource, rect, hexColor) {
    const [sx, sy, sw, sh] = rect;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = sw;
    offCanvas.height = sh;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return null;

    // 1. Draw source monochrome sprite
    offCtx.drawImage(imageSource, sx, sy, sw, sh, 0, 0, sw, sh);

    // 2. Multiply composite with color (white becomes color, black lines stay black)
    offCtx.globalCompositeOperation = 'multiply';
    offCtx.fillStyle = hexColor;
    offCtx.fillRect(0, 0, sw, sh);

    // 3. Keep original sprite's transparency
    offCtx.globalCompositeOperation = 'destination-in';
    offCtx.drawImage(imageSource, sx, sy, sw, sh, 0, 0, sw, sh);

    return offCanvas;
  }

  // Pre-generate all sprite rects from 15x7 grid and load custom hooded masked sprite
  const img = new Image();
  img.src = SPRITE_CONFIG.src;

  const maskedHoodieImg = new Image();
  maskedHoodieImg.src = 'images/peeps/peep_hoodie_masked.png';

  let loadedCount = 0;
  const onImageReady = () => {
    loadedCount++;
    if (loadedCount < 2) return;

    const { rows, cols, cellWidth, cellHeight } = SPRITE_CONFIG;
    const total = rows * cols; // 105

    for (let i = 0; i < total; i++) {
      allSprites.push([
        (i % rows) * cellWidth,
        ((i / rows) | 0) * cellHeight,
        cellWidth,
        cellHeight
      ]);
    }

    // Pre-tint team members with the custom hooded & face-covered sprite
    const maskedRect = [0, 0, 240, 324];
    TEAM_MEMBERS.forEach(member => {
      member.rect = maskedRect;
      member.monochromeImg = maskedHoodieImg;
      member.tintedCanvas = createTintedSpriteCanvas(maskedHoodieImg, maskedRect, member.color);
    });

    initSimulation();
  };

  img.onload = onImageReady;
  maskedHoodieImg.onload = onImageReady;
  img.onerror = () => console.error('Failed to load crowd spritesheet');
  maskedHoodieImg.onerror = () => console.error('Failed to load hooded masked sprite');

  // Peep factory
  function createPeep(options) {
    const { isTeam, teamData, rect, scale = 0.85 } = options;
    return {
      isTeam: !!isTeam,
      teamData: teamData || null,
      rect: rect,
      width: rect[2],
      height: rect[3],
      scale: scale,
      scaleX: 1,
      x: 0,
      y: 0,
      anchorY: 0,
      walk: null,
      bob: null,
      originalTimeScale: 1,
      isHovered: false
    };
  }

  function resetPeep(peep) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    // Walk paths span vertically across lower 50% of canvas with realistic perspective
    const depth = Math.random();
    // Scale: 0.72 in background to 0.94 in foreground
    peep.scale = 0.72 + depth * 0.22;

    const scaledWidth = peep.width * peep.scale;

    // Y position between 56% and 94% of stage height for comfortable ground line
    const startY = stage.height * 0.56 + depth * (stage.height * 0.38);
    peep.y = startY;
    peep.anchorY = startY;

    let startX, endX;
    if (direction === 1) {
      startX = -scaledWidth - randomRange(40, 160);
      endX = stage.width + scaledWidth + 60;
      peep.scaleX = 1;
    } else {
      startX = stage.width + scaledWidth + randomRange(40, 160);
      endX = -scaledWidth - 60;
      peep.scaleX = -1;
    }

    peep.x = startX;

    // Walking speed: calmed down and slowed for smooth, deliberate gait across full screen
    const walkDuration = peep.isTeam ? randomRange(34, 48) : randomRange(36, 54);
    const timeScale = randomRange(0.75, 0.92);
    peep.originalTimeScale = timeScale;

    // Kill existing animations if any
    if (peep.walk) peep.walk.kill();
    if (peep.bob) peep.bob.kill();

    // GSAP Walk timeline (horizontal movement)
    peep.walk = gsap.to(peep, {
      duration: walkDuration,
      x: endX,
      ease: 'none',
      onComplete: () => {
        resetPeep(peep);
      }
    });
    peep.walk.timeScale(timeScale);

    // GSAP Bobbing animation (vertical stepping motion naturally timed to relaxed walking pace)
    const bobDuration = 0.32 / timeScale;
    peep.bob = gsap.to(peep, {
      duration: bobDuration,
      y: startY - (6 * peep.scale),
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    return peep;
  }

  function initSimulation() {
    resizeCanvas();

    // 1. Add all 9 team members to crowd, distributed evenly across the full width
    TEAM_MEMBERS.forEach((member, i) => {
      const peep = createPeep({
        isTeam: true,
        teamData: member,
        rect: member.rect,
        scale: 0.85
      });
      resetPeep(peep);
      // Stagger them cleanly across the full screen width
      const initialProgress = 0.05 + (i / TEAM_MEMBERS.length) * 0.88;
      peep.walk.progress(initialProgress);
      crowd.push(peep);
    });

    // 2. Add 38 background crowd peeps from remaining non-hoodie sprites (lively, rich crowd)
    const bgSprites = allSprites.filter((_, idx) => idx !== HOODIE_SPRITE_INDEX);

    for (let i = 0; i < 38; i++) {
      const randomRect = bgSprites[randomIndex(bgSprites)];
      const peep = createPeep({
        isTeam: false,
        rect: randomRect,
        scale: 0.76
      });
      resetPeep(peep);
      // Evenly distribute progress across the full width with slight random jitter
      const progress = ((i / 38) + Math.random() * 0.05) % 1;
      peep.walk.progress(progress);
      crowd.push(peep);
    }

    // Start GSAP Ticker for rendering
    gsap.ticker.add(render);

    // Setup Event Listeners
    setupInteractions();
    setupFilters();
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    stage.width = wrapper.clientWidth;
    stage.height = wrapper.clientHeight;

    canvas.width = stage.width * dpr;
    canvas.height = stage.height * dpr;
    ctx.scale(dpr, dpr);
  }

  function render() {
    if (!stage.width || !stage.height) return;

    // Clear canvas
    ctx.clearRect(0, 0, stage.width, stage.height);

    // Sort crowd by anchorY (depth): background people drawn first, foreground in front
    crowd.sort((a, b) => a.anchorY - b.anchorY);

    // Render characters
    crowd.forEach(peep => {
      renderPeep(peep);
    });

    // Render floating head labels for team members with collision prevention tiers
    const activeTeamPeeps = crowd.filter(p => p.isTeam && (currentFilter === 'all' || p.teamData.category.includes(currentFilter)));
    // Sort left to right to assign non-overlapping tiers
    activeTeamPeeps.sort((a, b) => a.x - b.x);

    const tiers = new Map();
    for (let i = 0; i < activeTeamPeeps.length; i++) {
      let tier = 0;
      const curr = activeTeamPeeps[i];
      for (let j = 0; j < i; j++) {
        const prev = activeTeamPeeps[j];
        if (Math.abs(curr.x - prev.x) < 185) {
          const prevTier = tiers.get(prev) || 0;
          if (tier <= prevTier) {
            tier = (prevTier + 1) % 3;
          }
        }
      }
      tiers.set(curr, tier);
    }

    activeTeamPeeps.forEach(peep => {
      renderPeepLabel(peep, tiers.get(peep) || 0);
    });
  }

  function renderPeep(peep) {
    ctx.save();
    ctx.translate(peep.x, peep.y);

    const isMatch = currentFilter === 'all' || (peep.teamData && peep.teamData.category.includes(currentFilter));

    if (peep.isTeam && isMatch) {
      // 1. Draw glowing ground spotlight aura
      const auraRadius = 60 * peep.scale;
      const grad = ctx.createRadialGradient(0, -peep.height * peep.scale * 0.45, 10, 0, -peep.height * peep.scale * 0.45, auraRadius * 1.6);
      grad.addColorStop(0, hexToRgba(peep.teamData.color, peep.isHovered ? 0.45 : 0.22));
      grad.addColorStop(0.7, hexToRgba(peep.teamData.color, peep.isHovered ? 0.2 : 0.06));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, -peep.height * peep.scale * 0.45, auraRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Active selection ellipse at feet if hovered
      if (peep.isHovered) {
        ctx.strokeStyle = peep.teamData.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 45 * peep.scale, 10 * peep.scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Flip & Scale
    ctx.scale(peep.scaleX * peep.scale, peep.scale);

    // Opacity handling for filters
    if (peep.isTeam && !isMatch) {
      ctx.globalAlpha = 0.22;
    } else if (!peep.isTeam && currentFilter !== 'all') {
      ctx.globalAlpha = 0.35;
    } else {
      ctx.globalAlpha = 1;
    }

    // Draw sprite (anchored center-bottom)
    const drawX = -peep.width / 2;
    const drawY = -peep.height;

    if (peep.isTeam && isMatch && peep.teamData && peep.teamData.tintedCanvas) {
      // Draw colored hooded masked version
      ctx.drawImage(peep.teamData.tintedCanvas, drawX, drawY);
    } else if (peep.isTeam && peep.teamData && peep.teamData.monochromeImg) {
      // Draw monochrome hooded masked version for inactive team members
      ctx.drawImage(peep.teamData.monochromeImg, drawX, drawY);
    } else {
      // Draw monochrome version from source sprite sheet for background crowd
      ctx.drawImage(
        img,
        peep.rect[0], peep.rect[1], peep.rect[2], peep.rect[3],
        drawX, drawY, peep.width, peep.height
      );
    }

    ctx.restore();
  }

  function renderPeepLabel(peep, labelTier = 0) {
    const isMatch = currentFilter === 'all' || (peep.teamData && peep.teamData.category.includes(currentFilter));
    if (!isMatch) return;

    // Dynamic vertical offset based on collision tier (Prevents overlapping)
    const tierOffset = labelTier * 26;
    const headX = peep.x;
    const headY = peep.y - (peep.height * peep.scale) - 18 - tierOffset;

    ctx.save();

    // Connecting hairline anchor down to head
    ctx.beginPath();
    ctx.moveTo(headX, headY + 11);
    ctx.lineTo(headX, peep.y - (peep.height * peep.scale) + 2);
    ctx.strokeStyle = peep.isHovered ? peep.teamData.color : 'rgba(22, 20, 18, 0.24)';
    ctx.lineWidth = peep.isHovered ? 1.5 : 1;
    ctx.stroke();

    // Prepare text
    const nameText = peep.teamData.name;
    const roleText = '· ' + peep.teamData.role.split('&')[0].trim();

    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    const nameWidth = ctx.measureText(nameText).width;

    ctx.font = '500 9px "Space Mono", monospace';
    const roleWidth = ctx.measureText(roleText).width;

    const totalContentWidth = 14 + nameWidth + 6 + roleWidth + 14;
    const pillWidth = Math.max(totalContentWidth, 120);
    const pillHeight = 22;
    const pillX = headX - pillWidth / 2;
    const pillY = headY - pillHeight / 2;
    const radius = 11;

    // Subtle drop shadow for clarity
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Draw Rounded Pill
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, radius);

    if (peep.isHovered) {
      ctx.fillStyle = peep.teamData.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(22, 20, 18, 0.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';

    // Status Dot
    ctx.beginPath();
    ctx.arc(pillX + 11, pillY + 11, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = peep.isHovered ? '#ffffff' : peep.teamData.color;
    ctx.fill();

    // Name text
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = peep.isHovered ? '#ffffff' : '#151413';
    ctx.fillText(nameText, pillX + 20, pillY + 14.5);

    // Role text
    ctx.font = '500 9px "Space Mono", monospace';
    ctx.fillStyle = peep.isHovered ? 'rgba(255, 255, 255, 0.9)' : '#7a756c';
    ctx.fillText(roleText, pillX + 20 + nameWidth + 5, pillY + 14.5);

    ctx.restore();
  }

  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  function setupInteractions() {
    // Mouse Move Hit Testing
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;

      // Check team members in reverse order (foreground first)
      for (let i = crowd.length - 1; i >= 0; i--) {
        const peep = crowd[i];
        if (!peep.isTeam) continue;

        const isMatch = currentFilter === 'all' || (peep.teamData && peep.teamData.category.includes(currentFilter));
        if (!isMatch) continue;

        const halfW = (peep.width * peep.scale) / 2;
        const h = peep.height * peep.scale;

        // Body hit test
        const bodyHit = mouseX >= peep.x - halfW && mouseX <= peep.x + halfW && mouseY >= peep.y - h && mouseY <= peep.y;

        // Head & Badge hit test (covering tiered badge heights up to 90px above head)
        const badgeHit = mouseX >= peep.x - 90 && mouseX <= peep.x + 90 && mouseY >= peep.y - h - 85 && mouseY <= peep.y - h;

        if (bodyHit || badgeHit) {
          found = peep;
          break;
        }
      }

      if (found) {
        if (hoveredPeep !== found) {
          // Restore previous if any
          if (hoveredPeep) {
            hoveredPeep.isHovered = false;
            gsap.to(hoveredPeep.walk, { timeScale: hoveredPeep.originalTimeScale, duration: 0.4, overwrite: 'auto' });
            gsap.to(hoveredPeep.bob, { timeScale: 1.0, duration: 0.4, overwrite: 'auto' });
          }

          hoveredPeep = found;
          hoveredPeep.isHovered = true;

          // SLOW MOTION: Decelerate walking speed
          gsap.to(hoveredPeep.walk, { timeScale: 0.08, duration: 0.35, overwrite: 'auto' });
          gsap.to(hoveredPeep.bob, { timeScale: 0.08, duration: 0.35, overwrite: 'auto' });

          showDossier(hoveredPeep);
        } else {
          // Update position smoothly as person slowly steps
          updateDossierPosition(hoveredPeep);
        }
        canvas.style.cursor = 'pointer';
      } else {
        if (hoveredPeep && !isMouseInsideDossier) {
          hoveredPeep.isHovered = false;
          gsap.to(hoveredPeep.walk, { timeScale: hoveredPeep.originalTimeScale, duration: 0.4, overwrite: 'auto' });
          gsap.to(hoveredPeep.bob, { timeScale: 1.0, duration: 0.4, overwrite: 'auto' });
          hoveredPeep = null;
          hideDossier();
        }
        canvas.style.cursor = 'default';
      }
    });

    // Leave canvas
    canvas.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (!isMouseInsideDossier && hoveredPeep) {
          hoveredPeep.isHovered = false;
          gsap.to(hoveredPeep.walk, { timeScale: hoveredPeep.originalTimeScale, duration: 0.4, overwrite: 'auto' });
          gsap.to(hoveredPeep.bob, { timeScale: 1.0, duration: 0.4, overwrite: 'auto' });
          hoveredPeep = null;
          hideDossier();
        }
      }, 100);
    });

    // Dossier hover tracking so links remain clickable
    if (dossier) {
      dossier.addEventListener('mouseenter', () => {
        isMouseInsideDossier = true;
      });
      dossier.addEventListener('mouseleave', () => {
        isMouseInsideDossier = false;
        if (hoveredPeep) {
          hoveredPeep.isHovered = false;
          gsap.to(hoveredPeep.walk, { timeScale: hoveredPeep.originalTimeScale, duration: 0.4, overwrite: 'auto' });
          gsap.to(hoveredPeep.bob, { timeScale: 1.0, duration: 0.4, overwrite: 'auto' });
          hoveredPeep = null;
        }
        hideDossier();
      });
    }

    // Resize handling
    window.addEventListener('resize', () => {
      resizeCanvas();
    });
  }

  function formatSocialButton(link, color) {
    let iconSvg = '';
    let labelText = link.label;

    if (link.label === 'in') {
      labelText = 'LinkedIn';
      iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z"/></svg>`;
    } else if (link.label === 'gh') {
      labelText = 'GitHub';
      iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>`;
    } else if (link.label === 'ig') {
      labelText = 'Instagram';
      iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
    } else if (link.label === '↗') {
      labelText = 'Portfolio';
      iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>`;
    } else {
      labelText = link.label;
      iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>`;
    }

    return `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="dossier-social-chip">
        ${iconSvg}
        <span>${labelText}</span>
        <span class="chip-arrow">↗</span>
      </a>
    `;
  }

  function showDossier(peep) {
    if (!dossier) return;
    const data = peep.teamData;

    // Populate Dossier Content
    const frameEl = document.getElementById('dossierAvatarFrame');
    const avatarEl = document.getElementById('dossierAvatar');
    const nameEl = document.getElementById('dossierName');
    const roleEl = document.getElementById('dossierRole');
    const statusEl = document.getElementById('dossierStatus');
    const bioEl = document.getElementById('dossierBio');
    const bioBar = document.getElementById('dossierBioBar');
    const tagsEl = document.getElementById('dossierTags');
    const socialsEl = document.getElementById('dossierSocials');

    // 1. Render Hooded Avatar Canvas Thumbnail
    if (frameEl && data.tintedCanvas) {
      frameEl.style.borderColor = hexToRgba(data.color, 0.45);
      frameEl.style.boxShadow = `0 4px 16px ${hexToRgba(data.color, 0.22)}`;
      
      const thumb = document.createElement('canvas');
      thumb.width = 52;
      thumb.height = 52;
      const tCtx = thumb.getContext('2d');
      // TintedCanvas is 240x324, head is at sx: 35, sy: 8, sw: 170, sh: 170
      tCtx.drawImage(data.tintedCanvas, 35, 8, 170, 170, 0, 0, 52, 52);
      frameEl.innerHTML = '';
      frameEl.appendChild(thumb);
    } else if (avatarEl) {
      avatarEl.textContent = data.initials;
      avatarEl.style.backgroundColor = data.color;
    }

    // 2. Name & Role
    if (nameEl) nameEl.textContent = data.name;
    if (roleEl) {
      roleEl.textContent = data.role;
      roleEl.style.color = data.color;
      roleEl.style.borderColor = hexToRgba(data.color, 0.35);
      roleEl.style.backgroundColor = hexToRgba(data.color, 0.08);
    }

    // 3. Status Pill
    if (statusEl) {
      statusEl.style.borderColor = hexToRgba(data.color, 0.35);
      statusEl.style.color = data.color;
      statusEl.style.backgroundColor = hexToRgba(data.color, 0.09);
    }

    // 4. Bio with Accent Bar
    if (bioEl) bioEl.textContent = data.bio;
    if (bioBar) bioBar.style.backgroundColor = data.color;

    // 5. Domain Tags
    if (tagsEl) {
      tagsEl.innerHTML = data.tags.map(t => `<span class="dossier-tag"><span class="tag-hash">#</span>${t}</span>`).join('');
    }

    // 6. Formatted Social / Action Buttons
    if (socialsEl) {
      socialsEl.innerHTML = data.links.map(l => formatSocialButton(l, data.color)).join('');
    }

    // Dynamic Card Accent & Ambient Glow
    dossier.style.borderTopColor = data.color;
    dossier.style.borderBottomColor = data.color;
    dossier.style.background = `radial-gradient(circle at 90% 10%, ${hexToRgba(data.color, 0.12)} 0%, transparent 62%), #ffffff`;

    updateDossierPosition(peep);
    dossier.classList.add('visible');
  }

  function updateDossierPosition(peep) {
    if (!dossier) return;
    const cardRect = dossier.getBoundingClientRect();
    const cardWidth = cardRect.width || 310;
    const cardHeight = cardRect.height || 260;

    const peepHeadY = peep.y - (peep.height * peep.scale);
    const availableHeadroom = peepHeadY;

    // Flip card BELOW the character if headroom above head is insufficient (Prevents top clipping!)
    if (availableHeadroom < cardHeight + 40) {
      dossier.classList.add('flip-bottom');
      const targetY = Math.min(peep.y + 16, stage.height - cardHeight - 15);
      dossier.style.top = `${targetY}px`;
    } else {
      dossier.classList.remove('flip-bottom');
      dossier.style.top = `${peepHeadY - 14}px`;
    }

    // Horizontal clamping so card NEVER clips against left or right screen edges
    const halfCard = cardWidth / 2;
    const minX = halfCard + 24;
    const maxX = stage.width - halfCard - 24;
    const posX = Math.max(minX, Math.min(peep.x, maxX));

    dossier.style.left = `${posX}px`;
  }

  function hideDossier() {
    if (dossier) {
      dossier.classList.remove('visible');
    }
  }

  function setupFilters() {
    const teamBtns = document.querySelectorAll('.team-filter-btn');
    teamBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        teamBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-role') || 'all';

        // Close any active dossier on filter switch
        if (hoveredPeep) {
          hoveredPeep.isHovered = false;
          gsap.to(hoveredPeep.walk, { timeScale: hoveredPeep.originalTimeScale, duration: 0.4, overwrite: 'auto' });
          gsap.to(hoveredPeep.bob, { timeScale: 1.0, duration: 0.4, overwrite: 'auto' });
          hoveredPeep = null;
        }
        hideDossier();
      });
    });
  }
}

// ============================================================================
// 6. CONTACT & TOAST NOTIFICATION SYSTEM
// ============================================================================
function showToast(message) {
  if (!elements.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3200);
}

function playRubberStampSlam() {
  try {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const now = actx.currentTime;

    // 1. Heavy low-frequency wooden desk thud
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // 2. Paper strike friction snap (short burst of filtered noise)
    const bufferSize = Math.floor(actx.sampleRate * 0.08);
    const noiseBuffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (actx.sampleRate * 0.015));
    }

    const noise = actx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = actx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(2.0, now);

    const noiseGain = actx.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(actx.destination);
    noise.start(now);
  } catch (e) {
    // Audio unavailable fallback
  }
}

function playStampWiggleSound(vol = 0.06) {
  try {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, actx.currentTime + 0.08);
    gain.gain.setValueAtTime(vol, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
  } catch(e) {}
}

window.toggleDeliveredStamp = function() {
  const stamp = document.getElementById('deliveredStamp');
  const label = document.getElementById('stampToggleLabel');
  if (!stamp) return;

  const isStamped = stamp.classList.toggle('stamped');
  if (isStamped) {
    playRubberStampSlam();
    if (label) label.textContent = 'Hide DELIVERED Stamp';
    showToast('🏷️ DELIVERED Rubber Ink Stamp Applied!');
  } else {
    if (label) label.textContent = 'Show DELIVERED Stamp';
    showToast('DELIVERED Stamp Hidden.');
  }
};

function initContactForm() {
  const stampBox = document.querySelector('.postcard-stamp-box');
  if (stampBox) {
    stampBox.addEventListener('click', () => {
      stampBox.classList.add('stamp-wiggle');
      setTimeout(() => stampBox.classList.remove('stamp-wiggle'), 600);
      showToast('✉️ Ceylon 10¢ Commemorative Stamp — Authenticated & Affixed');
      playStampWiggleSound(0.06);
    });
  }

  const contactForm = document.getElementById('contactForm');
  const deliveredStamp = document.getElementById('deliveredStamp');
  const stampToggleLabel = document.getElementById('stampToggleLabel');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('contactFirstName')?.value.trim() || 'Sender';
      const lastName = document.getElementById('contactLastName')?.value.trim() || '';

      // Play authentic rubber stamp slam sound and celebration chime
      playRubberStampSlam();
      setTimeout(playCelebrationChime, 240);

      // Slam the DELIVERED stamp onto the card
      if (deliveredStamp) {
        deliveredStamp.classList.remove('stamped');
        void deliveredStamp.offsetWidth; // trigger reflow
        deliveredStamp.classList.add('stamped');
      }

      if (stampToggleLabel) {
        stampToggleLabel.textContent = 'Hide DELIVERED Stamp';
      }

      showToast(`📭 Postcard Dispatched! Marked DELIVERED for ${firstName} ${lastName}.`);
    });
  }
}

// ============================================================================
// 7. NUMERICAL BENCHMARK COUNTER ANIMATION
// ============================================================================
function initMetricCounters() {
  const metricValues = document.querySelectorAll('.metric-val');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        metricValues.forEach(el => {
          const target = parseFloat(el.getAttribute('data-target') || '0');
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const duration = 1600;
          const start = performance.now();

          function step(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            current = ease * target;

            el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = isDecimal ? target.toFixed(1) : target;
            }
          }

          requestAnimationFrame(step);
        });
      }
    });
  }, { threshold: 0.35 });

  const banner = document.querySelector('.metrics-banner');
  if (banner) observer.observe(banner);
}

// ============================================================================
// 8. PROCEDURAL ATMOSPHERIC AUDIO SYNTHESIZER (WEB AUDIO API)
// ============================================================================
let audioCtx = null;
let isAudioPlaying = false;
let audioNodes = [];

function toggleThemeAudio() {
  if (isAudioPlaying) {
    stopThemeAudio();
  } else {
    startThemeAudio();
  }
}

function startThemeAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isAudioPlaying = true;
  if (elements.musicToggle) elements.musicToggle.classList.add('playing');

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
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
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
// 8.5. SITE INTRO LOADER: VENGENCE UI KINETIC TEXT LOADER
// ============================================================================
let isLoaderDismissed = false;

function initSiteLoader() {
  const loader = document.getElementById('siteLoader');
  const percentEl = document.getElementById('loaderPercent');
  const progressBar = document.getElementById('loaderProgressBar');
  const enterBtn = document.getElementById('loaderEnterBtn');

  if (!loader) return;

  // Deep-link / direct section bypass: if URL hash or noloader flag is set, skip loader immediately
  if (window.location.hash || window.location.search.includes('noloader=1')) {
    loader.style.display = 'none';
    document.body.classList.remove('loading-active');
    document.body.style.overflow = '';
    isLoaderDismissed = true;
    return;
  }

  // Lock scroll while loader is visible
  document.body.classList.add('loading-active');
  window.scrollTo(0, 0);

  // Progressive count from 0 to 100%
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      if (enterBtn) {
        enterBtn.classList.add('ready');
      }
    }
    if (percentEl) percentEl.textContent = `${progress}%`;
    if (progressBar) progressBar.style.width = `${progress}%`;
  }, 35);

  function dismissLoader() {
    if (isLoaderDismissed) return;
    isLoaderDismissed = true;

    // Subtle harmonic audio feedback on user entry
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const g = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.15);
      g.gain.setValueAtTime(0.06, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.18);
      osc.connect(g);
      g.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.2);
    } catch (e) {}

    // Trigger cinematic landing text effect as curtain lifts
    animateHeroLanding();

    // Lift curtain to reveal Hero section
    if (typeof gsap !== 'undefined') {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          document.body.classList.remove('loading-active');
          document.body.style.overflow = '';

          // Refresh ScrollTrigger and prime parallax
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
          targetProgress = calculateProgress();
          currentProgress = targetProgress;
          updateParallax();
          updateNavState();
        }
      });
    } else {
      loader.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      loader.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.classList.remove('loading-active');
        document.body.style.overflow = '';
      }, 800);
    }
  }

  // Click anywhere on loader to open hero
  loader.addEventListener('click', dismissLoader);

  // Click on enter button
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissLoader();
    });
  }

  // Keyboard Enter or Space key
  document.addEventListener('keydown', function loaderKeyHandler(e) {
    if (!isLoaderDismissed && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      dismissLoader();
      document.removeEventListener('keydown', loaderKeyHandler);
    }
  });
}

// ============================================================================
// 8.5 INTERACTIVE PIXEL TRANSITION ENGINE (REACT BITS SPEC)
// ============================================================================
function initPixelTransitions() {
  const pixelCards = document.querySelectorAll('.pixel-card');
  if (!pixelCards.length) return;

  pixelCards.forEach((card) => {
    const gridContainer = card.querySelector('.pixel-card__grid');
    const defaultLayer = card.querySelector('.pixel-card__default');
    const activeLayer = card.querySelector('.pixel-card__active');
    if (!gridContainer || !defaultLayer || !activeLayer) return;

    // Read configured density & colors
    const cols = parseInt(card.getAttribute('data-grid-cols') || '10', 10);
    const rows = parseInt(card.getAttribute('data-grid-rows') || '7', 10);
    const pixelColor = card.getAttribute('data-pixel-color') || '#0b0d11';
    const totalTiles = cols * rows;

    // Configure CSS Grid template dynamically
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // Build the tiles
    gridContainer.innerHTML = '';
    const tiles = [];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.className = 'pixel-tile';
      tile.style.setProperty('--tile-color', pixelColor);
      fragment.appendChild(tile);
      tiles.push(tile);
    }
    gridContainer.appendChild(fragment);

    // Initial state setup
    if (typeof gsap !== 'undefined') {
      gsap.set(tiles, { opacity: 0, scale: 0.6 });
      gsap.set(defaultLayer, { opacity: 1 });
      gsap.set(activeLayer, { opacity: 0 });
    }

    let isFlipped = false;
    let currentTl = null;

    function flipToActive() {
      if (isFlipped) return;
      isFlipped = true;

      if (typeof gsap === 'undefined') {
        defaultLayer.style.opacity = '0';
        activeLayer.style.opacity = '1';
        activeLayer.style.pointerEvents = 'auto';
        return;
      }

      if (currentTl) currentTl.kill();

      currentTl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          gsap.set(tiles, { opacity: 0, scale: 0.6 });
        }
      });

      // 1. Pixels sweep in randomly with randomized stagger
      currentTl.to(tiles, {
        opacity: 1,
        scale: 1.02,
        duration: 0.16,
        stagger: {
          from: 'random',
          amount: 0.20
        }
      })
      // 2. Layer swap at peak pixel opacity
      .add(() => {
        defaultLayer.style.opacity = '0';
        defaultLayer.style.pointerEvents = 'none';
        activeLayer.style.opacity = '1';
        activeLayer.style.pointerEvents = 'auto';
      })
      // 3. Pixels sweep out randomly revealing the active information
      .to(tiles, {
        opacity: 0,
        scale: 0.6,
        duration: 0.16,
        stagger: {
          from: 'random',
          amount: 0.20
        }
      });
    }

    function flipToDefault() {
      if (!isFlipped) return;
      isFlipped = false;

      if (typeof gsap === 'undefined') {
        activeLayer.style.opacity = '0';
        activeLayer.style.pointerEvents = 'none';
        defaultLayer.style.opacity = '1';
        return;
      }

      if (currentTl) currentTl.kill();

      currentTl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          gsap.set(tiles, { opacity: 0, scale: 0.6 });
        }
      });

      // 1. Pixels sweep in randomly
      currentTl.to(tiles, {
        opacity: 1,
        scale: 1.02,
        duration: 0.16,
        stagger: {
          from: 'random',
          amount: 0.20
        }
      })
      // 2. Layer swap back to product image
      .add(() => {
        activeLayer.style.opacity = '0';
        activeLayer.style.pointerEvents = 'none';
        defaultLayer.style.opacity = '1';
        defaultLayer.style.pointerEvents = 'auto';
      })
      // 3. Pixels sweep out randomly revealing the pristine image
      .to(tiles, {
        opacity: 0,
        scale: 0.6,
        duration: 0.16,
        stagger: {
          from: 'random',
          amount: 0.20
        }
      });
    }

    // Mouse hover events (Desktop)
    card.addEventListener('mouseenter', flipToActive);
    card.addEventListener('mouseleave', flipToDefault);

    // Keyboard accessibility (focus / blur)
    card.setAttribute('tabindex', '0');
    card.addEventListener('focus', flipToActive);
    card.addEventListener('blur', flipToDefault);

    // Mobile / Touch tap toggle
    card.addEventListener('click', (e) => {
      // Don't toggle card state if clicking directly on link CTA
      if (e.target.closest('a')) return;
      if (isFlipped) {
        flipToDefault();
      } else {
        flipToActive();
      }
    });
  });
}

// ============================================================================
// 8.6. CINEMATIC HERO LANDING TEXT REVEAL EFFECT
// ============================================================================
let hasLandingAnimated = false;

function animateHeroLanding() {
  if (hasLandingAnimated) return;
  hasLandingAnimated = true;

  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');
  const heroEmblem = document.getElementById('heroEmblem');

  if (!heroTitle) return;

  // Split heroTitle into kinetic character spans
  if (!heroTitle.classList.contains('split-done')) {
    const text = heroTitle.textContent.trim();
    heroTitle.innerHTML = text
      .split('')
      .map((char, i) => `<span class="hero-char" data-index="${i}">${char}</span>`)
      .join('');
    heroTitle.classList.add('split-done');
  }

  const chars = heroTitle.querySelectorAll('.hero-char');

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Emblem drops in with golden ambient flare
    if (heroEmblem) {
      tl.fromTo(
        heroEmblem,
        { opacity: 0, y: -30, scale: 0.75, filter: 'drop-shadow(0 0 0px rgba(184,134,45,0))' },
        { opacity: 1, y: 0, scale: 1, filter: 'drop-shadow(0 4px 14px rgba(184,134,45,0.45))', duration: 0.95 },
        0.05
      );
    }

    // 2. Staggered 3D rising letters: rise from below, de-blur, settle into place
    if (chars.length > 0) {
      tl.fromTo(
        chars,
        {
          opacity: 0,
          y: 48,
          scale: 1.15,
          filter: 'blur(12px)',
          rotationX: 45
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          rotationX: 0,
          duration: 1.15,
          stagger: 0.055,
          ease: 'back.out(1.3)'
        },
        0.18
      );
    }

    // 3. Tagline floats in with letter-spacing expansion
    if (heroTagline) {
      tl.fromTo(
        heroTagline,
        { opacity: 0, y: 22, filter: 'blur(6px)', letterSpacing: '0.12em' },
        { opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: '0.28em', duration: 1.0, ease: 'power2.out' },
        0.65
      );
    }

    // 4. Subtle gold gleam sweep across the black letters as light catches them
    tl.to(
      chars,
      {
        color: '#b8862d',
        textShadow: '0 0 16px rgba(184, 134, 45, 0.75), 0 1px 12px rgba(255, 255, 255, 0.9)',
        duration: 0.28,
        stagger: {
          each: 0.035,
          yoyo: true,
          repeat: 1
        },
        ease: 'sine.inOut'
      },
      0.95
    );
  } else {
    // Fallback if GSAP is unavailable
    if (heroEmblem) heroEmblem.style.opacity = '1';
    chars.forEach((c) => (c.style.opacity = '1'));
    if (heroTagline) heroTagline.style.opacity = '1';
  }
}

// ============================================================================
// 8.7. SERVICES SECTION SINGLE-SENTENCE FADE-IN FROM LEFT OBSERVER
// ============================================================================
function initServicesHeadlineFade() {
  const headline = document.getElementById('servicesHeadline');
  const servicesSec = document.getElementById('services');
  if (!headline) return;

  if (typeof IntersectionObserver !== 'undefined' && servicesSec) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          headline.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08
    });

    observer.observe(servicesSec);
  } else {
    // Immediate fallback
    headline.classList.add('in-view');
  }
}

// ============================================================================
// 9. INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initSiteLoader();
  initSkiper17CardStack();
  initCardPerimeterRibbon();
  initPixelTransitions();
  initServicesHeadlineFade();
  initSkiper39CrowdCanvas();
  initContactForm();
  initMetricCounters();
  initSectionScrollManager();
  initNavClickSmoothScroll();
  
  targetProgress = calculateProgress();
  currentProgress = targetProgress;
  updateParallax();
  updateNavState();

  // If loader is not present or already hidden, trigger landing effect
  const loaderEl = document.getElementById('siteLoader');
  if (!loaderEl || loaderEl.style.display === 'none') {
    setTimeout(animateHeroLanding, 200);
  }

  // Ensure GSAP ScrollTrigger measures DOM correctly
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }
});

// ============================================================================
// BATMAN REVERT TRIGGER
// Type "batman" anywhere on the page to toggle the hero section
// back to original black-framed pillars (or re-apply the fixed version)
// ============================================================================
(function initBatmanTrigger() {
  const BATMAN_WORD = 'batman';
  let typedBuffer = '';
  let batmanActive = false; // false = fixed (transparent) pillars, true = original black pillars

  const ORIGINAL_PILLARS = 'assets/pillars_foreground.png';
  const FIXED_PILLARS    = 'assets/pillars_foreground_fixed.png';

  document.addEventListener('keyup', (e) => {
    if (e.key.length !== 1) { typedBuffer = ''; return; }
    typedBuffer += e.key.toLowerCase();
    if (typedBuffer.length > BATMAN_WORD.length) {
      typedBuffer = typedBuffer.slice(-BATMAN_WORD.length);
    }

    if (typedBuffer === BATMAN_WORD) {
      typedBuffer = '';
      batmanActive = !batmanActive;

      const bgScroll = document.getElementById('bgScroll');
      const stickyCont = document.querySelector('.sticky-container');

      if (batmanActive) {
        // REVERT to original black-framed pillars
        if (bgScroll) bgScroll.style.backgroundImage = `url('${ORIGINAL_PILLARS}')`;
        if (stickyCont) stickyCont.style.backgroundColor = '#f4eee6';
        showBatmanToast('🦇 BATMAN MODE — Original hero restored');
      } else {
        // RE-APPLY the transparent fixed pillars
        if (bgScroll) bgScroll.style.backgroundImage = `url('${FIXED_PILLARS}')`;
        if (stickyCont) stickyCont.style.backgroundColor = 'transparent';
        showBatmanToast('✨ FIXED MODE — Seamless hero active');
      }
    }
  });

  function showBatmanToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(10,10,10,0.88)',
      color: '#f0e6cc',
      padding: '0.75rem 1.6rem',
      borderRadius: '2rem',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '0.82rem',
      letterSpacing: '0.08em',
      zIndex: '99999',
      pointerEvents: 'none',
      opacity: '1',
      transition: 'opacity 0.4s ease'
    });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; }, 2200);
    setTimeout(() => { toast.remove(); }, 2700);
  }
})();
