# ALPHAKORE — Cinematic Split-Panel Parallax & Deep Zoom Experience

A state-of-the-art interactive web experience featuring an Awwwards-style **Split-Component Portal Parallax Hero** that parts sideways on scroll to reveal a full-bleed ancient heritage scene with deep in-scene camera zoom, transitioning smoothly into the editorial **"WE TURN *SPARKS* INTO IMPACT"** architectural canvas and the permanent **"Books of Her Choice"** Bookshelf.

![ALPHAKORE Experience Preview](assets/alphakore_hero.jpg)

## ✨ Core Interactive Features

- **Split-Component Parting Curtain Parallax**:
  - **Left Component**: Architecture & Venture manifesto (`WORK FAST. LIVE SLOW.`, founding year, core mission).
  - **Right Component**: Philosophy statement, `EXPLORE ECOSYSTEM [↗]` action, social chips `[🌐 GLOBAL] [IN LINKEDIN] [𝕏 TWITTER]`, and scroll indicator.
  - **Center Portal Aperture**: Initially a framed vertical window (32vw × 74vh) framing the lone traveler looking across the calm river into the golden sunset over ancient temple ghats.
  - **On Scroll**:
    - Left component smoothly glides outward to the left (`translateX(-140%)`).
    - Right component smoothly glides outward to the right (`translateX(+140%)`).
    - Center portal expands to **100vw × 100vh** full-screen bleed without any jumping or black gaps.

- **Guaranteed Viewport-Pinned Deep In-Scene Zoom**:
  - Pinned viewport engine ensures 100% stable screen lock while inside the hero timeline.
  - The camera pushes deep forward into the ancient sandstone pillars, the traveler, and the golden misty river.

- **Editorial Section 2: "WE TURN *SPARKS* INTO IMPACT"**:
  - High-contrast editorial parchment canvas (`#fcf9f2`).
  - Bold typography with `SPARKS` in luxury serif italic.
  - Terracotta watercolor celestial sun sphere and ancient palace ghats.
  - Architectural drafting crosshairs, fine coordinates, and circular action trigger `(→)`.
  - Dynamic navbar color adaptation (transitions seamlessly to dark text on light parchment).

- **Section 3: Books of Her Choice (Interactive Bookshelf)**:
  - Curated library of literature and foundational thought.
  - Glassmorphic modal to add custom books with Title, Author, Genre, Publication Year, 1–5 Star rating, spine palette themes, and personal notes.
  - **Permanent Browser Storage (`localStorage`)**: Any book added by her is saved in `localStorage` and persistently displays in the bookshelf across all sessions and page refreshes.
  - Live search filter and category filter pills (*All, Adventure, Philosophy, Fantasy, Classic, Lore*).

- **Atmospheric Procedural Web Audio Engine**:
  - Warm analog ambient synthesizer drone tuned to meditative root and fifth harmonic frequencies.
  - Dynamic metallic chime feedback on button clicks and book additions.

## 🚀 Running Locally

```bash
# Using Python
python -m http.server 8080

# Or using Node / npx
npx serve .
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## 📁 Project Structure

```
├── index.html                  # Semantic HTML5 layout with split-panel hero & modal
├── styles.css                  # Luxury editorial tokens, 3D perspective, responsive styles
├── script.js                   # 60FPS lerp parallax, viewport pin engine, Bookshelf & Web Audio
├── assets/                     # High-resolution heritage artwork & vector logos
│   ├── alphakore_hero.jpg      # Scenic ancient temple ghats & lone traveler hero image
│   ├── alphakore_section2.jpg  # Terracotta watercolor sun & palace ramparts artwork
│   └── alphakore_logo.png      # Vector ALPHAKORE monogram emblem
└── README.md
```

## 📜 Authorship & License

Developed with precision and care for **Neverfinished005** (`vablerudra007@gmail.com`). Educational and creative portfolio showcase.
