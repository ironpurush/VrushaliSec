/* ==================================================================
   PORTFOLIO SCRIPT
   Organized into independent modules. Each module checks that its
   target elements exist before running, so removing a section from
   index.html will never break the rest of the page.
   ================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initFooterYear();
  initNavToggle();
  initNavScrollSpy();
  initScrollReveal();
  initSkillBars();
  initGlitchBoot(function () {
    initTerminalTyping();
    initThreeBackground(); // Three.js — safe no-op if canvas missing or WebGL unavailable
  });
});

/* ------------------------------------------------------------------
   FOOTER YEAR
   ------------------------------------------------------------------ */
function initFooterYear() {
  var el = document.getElementById('footerYear');
  if (!el) return;
  el.textContent = new Date().getFullYear();
}

/* ------------------------------------------------------------------
   MOBILE NAV TOGGLE
   ------------------------------------------------------------------ */
function initNavToggle() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu after a link is tapped (mobile)
  links.querySelectorAll('a[data-nav]').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ------------------------------------------------------------------
   NAV SCROLL SPY — highlights the active section link
   ------------------------------------------------------------------ */
function initNavScrollSpy() {
  var navLinks = document.querySelectorAll('a[data-nav]');
  if (!navLinks.length || !('IntersectionObserver' in window)) return;

  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href');
    if (!id || id.charAt(0) !== '#') return;
    var section = document.querySelector(id);
    if (section) sections.push({ link: link, section: section });
  });
  if (!sections.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var match = sections.find(function (s) { return s.section === entry.target; });
      if (!match) return;
      if (entry.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        match.link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s.section); });
}

/* ------------------------------------------------------------------
   SCROLL REVEAL — fades/raises section content into view
   Add the "reveal" class to any element in index.html to opt it in.
   ------------------------------------------------------------------ */
function initScrollReveal() {
  // Auto-tag common content blocks so editing HTML doesn't require
  // remembering to add the "reveal" class manually.
  var autoTargets = document.querySelectorAll(
    '.section__eyebrow, .section__title, .impact__intro, .impact__card, ' +
    '.skills__card, .timeline__item, .findings__card, .cert__chip, ' +
    '.edu__item, .contact__card, .contact__intro'
  );
  autoTargets.forEach(function (el) { el.classList.add('reveal'); });

  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything if IO isn't supported
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(function (el) { observer.observe(el); });
}

/* ------------------------------------------------------------------
   SKILL BARS — fills each proficiency bar to its --pct value once
   it scrolls into view. The percentage itself is set inline on each
   .skillbar element in index.html (style="--pct: 92"), so editing a
   number there is all that's needed to change a bar's length.
   ------------------------------------------------------------------ */
function initSkillBars() {
  var bars = document.querySelectorAll('.skillbar');
  if (!bars.length) return;

  if (!('IntersectionObserver' in window)) {
    bars.forEach(function (bar) { bar.classList.add('is-filled'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-filled');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(function (bar) { observer.observe(bar); });
}

/* ------------------------------------------------------------------
   GLITCH BOOT — full-screen flickering "intrusion" overlay shown
   once per page load, before the site reveals itself. The whole
   screen flashes green on/off rapidly at first, gradually slowing
   down ("locking on"), while short text fragments (ACCESS GRANTED,
   IP DETECTED, CHECKING FOR BOTS, ...) flash on top throughout.
   Then everything fades into the real site. No grain/noise texture
   — the "static" feel comes from the flash toggle + scanlines only.

   EDIT:
     - glitchWords     -> the text fragments that flash during the glitch
     - FLICKER_COUNT   -> how many flicker flashes happen
     - flickerDelay()  -> the easing curve controlling flicker speed decay
     - HOLD_MS         -> pause on the final resolved frame before fading

   `onComplete` runs after the overlay finishes and unmounts — this
   is where the terminal animation + 3D background start, so they
   don't compete with the intrusion sequence for attention.
   ------------------------------------------------------------------ */
function initGlitchBoot(onComplete) {
  var boot = document.getElementById('glitchBoot');
  var textEl = document.getElementById('glitchText');

  // If the overlay markup was removed from index.html, skip straight
  // to onComplete so the rest of the site still works.
  if (!boot) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    boot.classList.add('is-hidden');
    setTimeout(function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, 50);
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Short fragments that flash briefly during the glitch — keep these
  // terse, they're only on screen for a frame or two each. Add/remove
  // freely; FLICKER_COUNT below has enough frames to cycle through all of them.
  var glitchWords = [
    'INITIATING CONNECTION',
    'IP DETECTED: 192.168.4.117',
    'TRACING ORIGIN',
    'CHECKING FOR BOTS',
    'BOT CHECK: CLEAR',
    'FIREWALL BYPASS DETECTED',
    'DECRYPTING CREDENTIALS',
    'ACCESS GRANTED',
    'WELCOME, VRUSHALISEC'
  ];

  var FLICKER_COUNT = 22; // how many flicker flashes total (decaying speed)
  var HOLD_MS = 240;      // pause on the clean resolved frame before fading

  document.body.style.overflow = 'hidden';

  // Eases from fast flickers to slow ones, so the screen feels like
  // it's "locking on" rather than just stopping abruptly.
  function flickerDelay(i) {
    var progress = i / (FLICKER_COUNT - 1);
    return Math.round(35 + Math.pow(progress, 1.6) * 170);
  }

  // Map each word to an evenly-spaced "flicker-on" frame, so every
  // word in the list reliably gets shown once (rather than leaving
  // it to chance, which could skip several words on an unlucky run).
  var eligibleFrames = [];
  for (var f = 0; f < FLICKER_COUNT; f += 2) { eligibleFrames.push(f); }

  var wordFrameMap = {};
  glitchWords.forEach(function (word, idx) {
    var span = Math.max(1, glitchWords.length - 1);
    var pos = Math.round(idx * (eligibleFrames.length - 1) / span);
    wordFrameMap[eligibleFrames[pos]] = word;
  });

  var flickerIndex = 0;

  function flickerFrame() {
    if (flickerIndex >= FLICKER_COUNT) {
      resolve();
      return;
    }

    // toggle the whole-screen flash so the screen itself flickers,
    // not just a texture layered on top of it
    var showFlicker = flickerIndex % 2 === 0;
    boot.classList.toggle('is-flash', showFlicker);

    if (textEl) {
      var wordForThisFrame = wordFrameMap[flickerIndex];
      if (showFlicker && wordForThisFrame) {
        textEl.textContent = wordForThisFrame;
        textEl.classList.add('is-visible');
      } else {
        textEl.classList.remove('is-visible');
      }
    }

    flickerIndex++;
    setTimeout(flickerFrame, flickerDelay(flickerIndex));
  }

  function resolve() {
    // settle into a clean frame before fading out
    boot.classList.remove('is-flash');
    if (textEl) textEl.classList.remove('is-visible');
    setTimeout(finish, HOLD_MS);
  }

  function finish() {
    boot.classList.add('is-hidden');
    document.body.style.overflow = '';
    // Remove from layout after the fade transition finishes so it
    // never blocks clicks/scrolls on the real page underneath.
    setTimeout(function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, 400);
    if (typeof onComplete === 'function') onComplete();
  }

  // Safety net: if anything goes wrong, never leave the user stuck
  // staring at a flickering screen forever.
  var safetyTimeout = setTimeout(function () {
    if (!boot.classList.contains('is-hidden')) finish();
  }, 9000);

  var originalOnComplete = onComplete;
  onComplete = function () {
    clearTimeout(safetyTimeout);
    if (typeof originalOnComplete === 'function') originalOnComplete();
  };

  flickerFrame();
}

/* ------------------------------------------------------------------
   HERO TERMINAL TYPING ANIMATION
   Edit the `lines` array below to change what the terminal prints.
   Each line: { text, className } — className is optional.
   ------------------------------------------------------------------ */
function initTerminalTyping() {
  var body = document.getElementById('terminalBody');
  if (!body) return;

  var lines = [
    { text: '$ running security_scan --target=full-stack' },
    { text: '> web application layer ......... checked', className: 'line-ok' },
    { text: '> mobile application layer ...... checked', className: 'line-ok' },
    { text: '> network infrastructure (900+) . checked', className: 'line-ok' },
    { text: '> API endpoints .................. checked', className: 'line-ok' },
    { text: '> false positives removed' },
    { text: '> risk prioritized & validated', className: 'line-warn' },
    { text: '$ status: vulnerabilities remediated', className: 'line-ok' }
  ];

  var lineIndex = 0;
  var charIndex = 0;
  var currentLineEl = null;

  function typeNext() {
    if (lineIndex >= lines.length) {
      // Restart after a pause for a continuous ambient effect
      setTimeout(function () {
        body.innerHTML = '';
        lineIndex = 0;
        charIndex = 0;
        typeNext();
      }, 2600);
      return;
    }

    var lineData = lines[lineIndex];

    if (charIndex === 0) {
      currentLineEl = document.createElement('div');
      if (lineData.className) currentLineEl.className = lineData.className;
      body.appendChild(currentLineEl);
    }

    if (charIndex < lineData.text.length) {
      currentLineEl.textContent = lineData.text.slice(0, charIndex + 1);
      charIndex++;
      setTimeout(typeNext, 16 + Math.random() * 20);
    } else {
      currentLineEl.innerHTML = lineData.text + (lineIndex === lines.length - 1 ? ' <span class="cursor"></span>' : '');
      lineIndex++;
      charIndex = 0;
      setTimeout(typeNext, lineIndex === lines.length ? 0 : 220);
    }
  }

  typeNext();
}

/* ------------------------------------------------------------------
   THREE.JS BACKGROUND — animated network / node graph
   Represents scanned systems: most nodes glow green (secure),
   a few cycle red -> amber -> green (a vulnerability being found,
   triaged, and closed) to visually echo the VAPT lifecycle.

   This entire module is wrapped defensively: if Three.js failed to
   load, or the browser has no WebGL, it exits quietly and the page
   still works perfectly with its static dark background.
   ------------------------------------------------------------------ */
function initThreeBackground() {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  if (typeof THREE === 'undefined') return;

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
  } catch (e) {
    return; // WebGL not available — fail silently, static background remains
  }
  if (!renderer) return;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 17);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ---- Colors (kept in sync with CSS variables) ----
  var COLOR_SAFE = 0x3ddc97;   // accent green
  var COLOR_WARN = 0xe8a23d;   // amber
  var COLOR_DANGER = 0xe8543d; // danger red
  var COLOR_LINE = 0x223038;

  // ---- Build node graph ----
  var NODE_COUNT = window.innerWidth < 720 ? 26 : 42;
  var SPREAD = window.innerWidth < 720 ? 9 : 13;

  var nodesGroup = new THREE.Group();
  scene.add(nodesGroup);

  var nodePositions = [];
  var nodeMeshes = [];
  var nodeStates = []; // 'safe' | 'danger' | 'warn' — drives the vuln-lifecycle pulse

  var sphereGeo = new THREE.SphereGeometry(0.085, 12, 12);

  for (var i = 0; i < NODE_COUNT; i++) {
    var pos = new THREE.Vector3(
      (Math.random() - 0.5) * SPREAD * 2,
      (Math.random() - 0.5) * SPREAD * 1.2,
      (Math.random() - 0.5) * 6
    );
    nodePositions.push(pos);

    var isFeatured = i % 9 === 0; // a handful of nodes will cycle through the vuln lifecycle
    var state = isFeatured ? 'danger' : 'safe';
    nodeStates.push(state);

    var material = new THREE.MeshBasicMaterial({
      color: state === 'danger' ? COLOR_DANGER : COLOR_SAFE,
      transparent: true,
      opacity: 0.9
    });
    var mesh = new THREE.Mesh(sphereGeo, material);
    mesh.position.copy(pos);
    mesh.userData.featured = isFeatured;
    mesh.userData.pulsePhase = Math.random() * Math.PI * 2;
    nodesGroup.add(mesh);
    nodeMeshes.push(mesh);
  }

  // ---- Connections between nearby nodes ----
  var lineMaterial = new THREE.LineBasicMaterial({
    color: COLOR_LINE,
    transparent: true,
    opacity: 0.5
  });

  var maxDist = SPREAD * 0.62;
  var linePositions = [];
  for (var a = 0; a < nodePositions.length; a++) {
    for (var b = a + 1; b < nodePositions.length; b++) {
      if (nodePositions[a].distanceTo(nodePositions[b]) < maxDist) {
        linePositions.push(
          nodePositions[a].x, nodePositions[a].y, nodePositions[a].z,
          nodePositions[b].x, nodePositions[b].y, nodePositions[b].z
        );
      }
    }
  }
  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  var lines = new THREE.LineSegments(lineGeo, lineMaterial);
  nodesGroup.add(lines);

  // ---- Lifecycle cycle for featured (vulnerable) nodes ----
  // danger (found) -> warn (triaged) -> safe (patched) -> stays safe a while -> repeats
  var LIFECYCLE = ['danger', 'warn', 'safe'];
  var lifecycleColors = {
    danger: new THREE.Color(COLOR_DANGER),
    warn: new THREE.Color(COLOR_WARN),
    safe: new THREE.Color(COLOR_SAFE)
  };

  function colorFor(state) {
    return lifecycleColors[state] || lifecycleColors.safe;
  }

  nodeMeshes.forEach(function (mesh) {
    if (!mesh.userData.featured) return;
    mesh.userData.lifecycleIndex = 0;
    mesh.userData.lifecycleTimer = Math.random() * 4; // stagger start times
  });

  // ---- Pointer parallax (desktop) ----
  var pointer = { x: 0, y: 0 };
  window.addEventListener('mousemove', function (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ---- Resize handling ----
  function handleResize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleResize);

  // ---- Animation loop ----
  var clock = new THREE.Clock();
  var rafId = null;

  function animate() {
    rafId = requestAnimationFrame(animate);
    var delta = clock.getDelta();
    var elapsed = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      nodesGroup.rotation.y += delta * 0.045;
      nodesGroup.rotation.x = Math.sin(elapsed * 0.05) * 0.08;

      // gentle camera parallax toward pointer
      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.02;
      camera.position.y += (-pointer.y * 1.0 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    }

    nodeMeshes.forEach(function (mesh) {
      // ambient pulse for all nodes
      var pulse = 0.85 + Math.sin(elapsed * 1.4 + mesh.userData.pulsePhase) * 0.15;
      mesh.scale.setScalar(pulse);

      if (!mesh.userData.featured) return;

      // drive the vulnerability lifecycle color transition
      mesh.userData.lifecycleTimer += delta;
      if (mesh.userData.lifecycleTimer > 2.4) {
        mesh.userData.lifecycleTimer = 0;
        mesh.userData.lifecycleIndex = (mesh.userData.lifecycleIndex + 1) % LIFECYCLE.length;
      }
      var targetColor = colorFor(LIFECYCLE[mesh.userData.lifecycleIndex]);
      mesh.material.color.lerp(targetColor, 0.04);
    });

    renderer.render(scene, camera);
  }

  // Pause rendering when tab is hidden to save battery/CPU
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (rafId === null) {
      animate();
    }
  });

  animate();
}
