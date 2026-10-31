/* Tippy Typing - drawn artwork (SVG), so it looks the same on every device */
(function () {
  'use strict';

  const BALLOON_COLORS = [
    { l: '#ffb3cb', m: '#ff4f86', d: '#b81852' }, // pink
    { l: '#c9bcff', m: '#7a5cff', d: '#3f24c2' }, // purple
    { l: '#a5f3c0', m: '#22c55e', d: '#117a36' }, // green
    { l: '#fff0a8', m: '#fbbf24', d: '#b97c05' }, // yellow
    { l: '#b5ecff', m: '#1fb4f0', d: '#0a6b9c' }, // blue
    { l: '#ffd2b0', m: '#fb7a2a', d: '#b4470b' }, // orange
    { l: '#ffb4b4', m: '#ef4444', d: '#a51b1b' }  // red
  ];

  // Shared gradients, injected once per page.
  function defs() {
    if (document.getElementById('tk-defs')) return;
    const bal = BALLOON_COLORS.map((c, i) => `<radialGradient id="bal${i}" cx="34%" cy="26%" r="82%"><stop offset="0" stop-color="${c.l}"/><stop offset=".42" stop-color="${c.m}"/><stop offset="1" stop-color="${c.d}"/></radialGradient>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `<svg id="tk-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${bal}
      <radialGradient id="fur" cx="42%" cy="30%" r="78%"><stop offset="0" stop-color="#ffb871"/><stop offset=".55" stop-color="#ff8a2b"/><stop offset="1" stop-color="#d9560a"/></radialGradient>
      <radialGradient id="cream" cx="50%" cy="20%" r="90%"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#f6e6d4"/></radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a6"/><stop offset=".5" stop-color="#ffcc33"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
      <radialGradient id="cloudG" cx="45%" cy="25%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f4f9ff"/><stop offset="1" stop-color="#d4e6fa"/></radialGradient>
      <radialGradient id="sunG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff9c4"/><stop offset=".6" stop-color="#ffd84d"/><stop offset="1" stop-color="#ffb627"/></radialGradient>
      <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9be38a"/><stop offset="1" stop-color="#5cc46b"/></linearGradient>
      <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd36a"/><stop offset="1" stop-color="#2f9e4a"/></linearGradient>
      <radialGradient id="tree" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5fd17a"/><stop offset="1" stop-color="#1f7a3a"/></radialGradient>
      <radialGradient id="rock" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#c2a891"/><stop offset=".55" stop-color="#7e6553"/><stop offset="1" stop-color="#3f3128"/></radialGradient>
      <linearGradient id="hull" x1="0" x2="1"><stop offset="0" stop-color="#b9c4d8"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#97a5bf"/></linearGradient>
      <linearGradient id="redPaint" x1="0" x2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".5" stop-color="#ef4444"/><stop offset="1" stop-color="#b91c1c"/></linearGradient>
      <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#ffd23f"/><stop offset=".75" stop-color="#ff6a1f"/><stop offset="1" stop-color="#ff3d00" stop-opacity="0"/></linearGradient>
      <radialGradient id="glass" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#bfe3ff"/><stop offset=".5" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient>
      <radialGradient id="planet" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffc2e2"/><stop offset=".5" stop-color="#c26bff"/><stop offset="1" stop-color="#4b1f8f"/></radialGradient>
      <radialGradient id="moon" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9aa6c2"/></radialGradient>
      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="#f2b48a"/></linearGradient>
    </defs></svg>`);
  }

  // ===== Tippy the fox =====
  function fox(mood) {
    defs();
    const mouth = mood === 'oops'
      ? '<ellipse cx="100" cy="154" rx="6" ry="7" fill="#6e241c"/>'
      : mood === 'wow'
        ? '<path d="M84 147 Q100 176 116 147 Z" fill="#a82a24"/><path d="M91 158 Q100 168 109 158 Q100 154 91 158Z" fill="#ff8f8f"/>'
        : '<path d="M100 145 Q99 153 89 154 M100 145 Q101 153 111 154" stroke="#3a2418" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
    const ear = '<path d="M42 108 L48 26 Q54 12 68 20 L114 70 Z" fill="url(#fur)"/><path d="M57 40 L59 88 L94 70 Z" fill="#4a2616"/><path d="M60 46 L61 80 L84 68 Z" fill="#fff" opacity=".25"/>';
    return `<svg class="fox fox-${mood || 'happy'}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g class="fox-ear-l">${ear}</g>
      <g class="fox-ear-r" transform="translate(200 0) scale(-1 1)">${ear}</g>
      <path d="M100 52 C153 52 183 86 181 121 C179 157 142 184 100 184 C58 184 21 157 19 121 C17 86 47 52 100 52Z" fill="url(#fur)"/>
      <path d="M100 124 C83 110 49 112 24 133 C37 166 69 184 100 184 C131 184 163 166 176 133 C151 112 117 110 100 124Z" fill="url(#cream)"/>
      <path d="M100 58 C95 78 95 96 100 114 C105 96 105 78 100 58Z" fill="#ffd2a3" opacity=".55"/>
      <g class="fox-eyes">
        <ellipse cx="70" cy="106" rx="11.5" ry="14.5" fill="#24160f"/><circle cx="74.5" cy="100" r="5" fill="#fff"/><circle cx="66" cy="112" r="2.2" fill="#fff" opacity=".75"/>
        <ellipse cx="130" cy="106" rx="11.5" ry="14.5" fill="#24160f"/><circle cx="134.5" cy="100" r="5" fill="#fff"/><circle cx="126" cy="112" r="2.2" fill="#fff" opacity=".75"/>
      </g>
      <ellipse cx="50" cy="136" rx="12" ry="7" fill="#ff7d8e" opacity=".5"/><ellipse cx="150" cy="136" rx="12" ry="7" fill="#ff7d8e" opacity=".5"/>
      <path d="M87 133 Q100 124 113 133 Q109 145 100 146 Q91 145 87 133Z" fill="#24160f"/><ellipse cx="95" cy="131" rx="4.5" ry="2.2" fill="#fff" opacity=".55"/>
      ${mouth}
    </svg>`;
  }

  // ===== Balloon =====
  function balloon(ci, letter) {
    defs();
    const c = BALLOON_COLORS[ci % BALLOON_COLORS.length];
    return `<svg class="balloon-svg" viewBox="0 0 100 172" aria-hidden="true" focusable="false">
      <path d="M50 4 C77 4 95 27 95 55 C95 85 72 107 53 112 L47 112 C28 107 5 85 5 55 C5 27 23 4 50 4Z" fill="url(#bal${ci % BALLOON_COLORS.length})"/>
      <path d="M78 30 C88 46 88 70 76 88" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="31" cy="33" rx="10" ry="19" fill="#fff" opacity=".32" transform="rotate(-28 31 33)"/>
      <ellipse cx="27" cy="25" rx="3.6" ry="7.5" fill="#fff" opacity=".9" transform="rotate(-28 27 25)"/>
      <path d="M42 119 Q50 107 58 119 Q50 123 42 119Z" fill="${c.d}"/>
      <path class="bstring" d="M50 121 C40 133 60 141 50 153 C42 162 56 166 50 172" stroke="rgba(55,65,85,.55)" stroke-width="1.6" fill="none"/>
      ${letter ? `<text x="50" y="72" text-anchor="middle" class="bletter">${letter}</text>` : ''}
    </svg>`;
  }

  // ===== Cloud =====
  function cloud() {
    defs();
    return `<svg class="cloud-svg" viewBox="0 0 220 112" aria-hidden="true" focusable="false">
      <ellipse cx="112" cy="104" rx="88" ry="7" fill="#7aa7d6" opacity=".18"/>
      <g fill="url(#cloudG)"><circle cx="60" cy="70" r="34"/><circle cx="104" cy="50" r="44"/><circle cx="152" cy="64" r="34"/><circle cx="182" cy="82" r="20"/><rect x="34" y="66" width="164" height="36" rx="18"/></g>
      <ellipse cx="92" cy="34" rx="18" ry="9" fill="#fff" opacity=".9"/>
    </svg>`;
  }

  // ===== Rocket =====
  function rocket() {
    defs();
    return `<svg class="rocket-svg" viewBox="0 0 80 150" aria-hidden="true" focusable="false">
      <g class="flame"><path d="M26 112 Q40 162 54 112 Z" fill="url(#flame)"/><path d="M33 112 Q40 140 47 112 Z" fill="#fffbe0"/></g>
      <path d="M21 84 L4 120 Q4 124 9 122 L24 112 Z" fill="url(#redPaint)"/>
      <path d="M59 84 L76 120 Q76 124 71 122 L56 112 Z" fill="url(#redPaint)"/>
      <path d="M40 3 C59 21 63 54 60 112 L20 112 C17 54 21 21 40 3Z" fill="url(#hull)" stroke="#8592ab" stroke-width="1.2"/>
      <path d="M40 3 C50 12 55 22 58 34 L22 34 C25 22 30 12 40 3Z" fill="url(#redPaint)"/>
      <rect x="21" y="34" width="38" height="4" fill="#cbd5e1"/>
      <circle cx="40" cy="60" r="12.5" fill="#cbd5e1"/><circle cx="40" cy="60" r="9.5" fill="url(#glass)"/><ellipse cx="36.5" cy="56" rx="3.5" ry="2.5" fill="#fff" opacity=".85"/>
      <path d="M37.5 88 L42.5 88 L44 116 L36 116 Z" fill="url(#redPaint)"/>
      <rect x="22" y="106" width="36" height="8" rx="3" fill="#64748b"/>
    </svg>`;
  }

  // ===== Asteroid (shape depends on seed) =====
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function asteroid(seed) {
    defs();
    const R = rng(seed || 1), n = 12, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 36 + R() * 10; pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]); }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = 'M' + mid(pts[0], pts[1]).map(v => v.toFixed(1)).join(' ');
    for (let i = 1; i <= n; i++) { const p = pts[i % n], m = mid(p, pts[(i + 1) % n]); d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }
    let craters = '';
    for (let i = 0; i < 4; i++) {
      const cx = 30 + R() * 40, cy = 30 + R() * 40, r = 4 + R() * 6;
      craters += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#4a3a2f" opacity=".75"/><path d="M${(cx - r * .8).toFixed(1)} ${(cy + r * .3).toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${(cx + r * .8).toFixed(1)} ${(cy + r * .3).toFixed(1)}" stroke="#d4bca6" stroke-width="1.6" fill="none" opacity=".6"/>`;
    }
    return `<svg class="rock-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="${d}" fill="url(#rock)" stroke="#2f241d" stroke-width="2"/>${craters}<path d="M28 30 Q38 20 52 18" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  }

  function planet() {
    defs();
    return `<svg class="planet-svg" viewBox="0 0 200 140" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="74" rx="92" ry="20" fill="none" stroke="#ffd7f0" stroke-opacity=".5" stroke-width="7" transform="rotate(-14 100 74)"/>
      <circle cx="100" cy="70" r="46" fill="url(#planet)"/>
      <path d="M58 60 Q100 48 142 62 M56 80 Q100 70 144 84" stroke="#fff" stroke-opacity=".18" stroke-width="7" fill="none"/>
      <path d="M8 74 A92 20 0 0 0 192 74" fill="none" stroke="#ffd7f0" stroke-opacity=".85" stroke-width="7" transform="rotate(-14 100 74)"/>
    </svg>`;
  }

  // ===== Little scene characters =====
  function bird(col) {
    return `<svg class="bird-svg" viewBox="0 0 60 40" aria-hidden="true" focusable="false">
      <path class="wing back" d="M28 20 Q20 4 6 8 Q18 14 24 22Z" fill="${col}" opacity=".7"/>
      <ellipse cx="32" cy="23" rx="13" ry="8" fill="${col}"/>
      <circle cx="44" cy="18" r="7" fill="${col}"/>
      <path d="M50 17 L57 19 L50 21Z" fill="#ffb020"/>
      <circle cx="46" cy="16.5" r="1.6" fill="#1d1d2b"/>
      <path d="M20 22 L9 20 L12 26Z" fill="${col}"/>
      <path class="wing front" d="M30 21 Q24 2 10 4 Q22 12 26 24Z" fill="${col}" stroke="#fff" stroke-opacity=".35"/>
    </svg>`;
  }
  function hotAir() {
    return `<svg viewBox="0 0 80 120" aria-hidden="true" focusable="false">
      <path d="M40 4 C64 4 76 22 76 40 C76 62 54 76 48 88 L32 88 C26 76 4 62 4 40 C4 22 16 4 40 4Z" fill="#ff7a59"/>
      <path d="M40 4 C50 4 56 22 56 40 C56 62 46 76 44 88 L36 88 C34 76 24 62 24 40 C24 22 30 4 40 4Z" fill="#ffd166"/>
      <path d="M40 4 C44 4 46 22 46 40 C46 62 42 76 41 88 L39 88 C38 76 34 62 34 40 C34 22 36 4 40 4Z" fill="#06d6a0"/>
      <ellipse cx="24" cy="26" rx="5" ry="10" fill="#fff" opacity=".3" transform="rotate(-20 24 26)"/>
      <path d="M33 88 L34 100 M47 88 L46 100" stroke="#7a4b2a" stroke-width="1.5"/>
      <rect x="32" y="99" width="16" height="12" rx="3" fill="#a0672f"/><rect x="32" y="99" width="16" height="3" fill="#7a4b2a"/>
    </svg>`;
  }
  function ufo() {
    return `<svg viewBox="0 0 120 70" aria-hidden="true" focusable="false">
      <path class="beam" d="M44 44 L24 70 L96 70 L76 44Z" fill="#9dfcff" opacity=".18"/>
      <ellipse cx="60" cy="26" rx="20" ry="18" fill="url(#glass)" opacity=".95"/>
      <circle cx="60" cy="27" r="7" fill="#7cf29a"/><circle cx="57.5" cy="25" r="1.6" fill="#1d1d2b"/><circle cx="62.5" cy="25" r="1.6" fill="#1d1d2b"/><path d="M57 29.5 Q60 32 63 29.5" stroke="#1d1d2b" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="54" cy="18" rx="5" ry="3" fill="#fff" opacity=".6"/>
      <ellipse cx="60" cy="38" rx="52" ry="12" fill="url(#hull)" stroke="#8592ab"/>
      <ellipse cx="60" cy="34" rx="34" ry="5" fill="#fff" opacity=".35"/>
      <g class="ufo-lights"><circle cx="22" cy="40" r="3.4" fill="#ffd23f"/><circle cx="41" cy="45" r="3.4" fill="#ff5df0"/><circle cx="60" cy="47" r="3.4" fill="#7df9ff"/><circle cx="79" cy="45" r="3.4" fill="#ffd23f"/><circle cx="98" cy="40" r="3.4" fill="#ff5df0"/></g>
    </svg>`;
  }
  function rainbow() {
    const cols = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];
    return `<svg viewBox="0 0 400 210" aria-hidden="true" focusable="false">${cols.map((c, i) => `<path d="M${20 + i * 14} 210 A${180 - i * 14} ${180 - i * 14} 0 0 1 ${380 - i * 14} 210" stroke="${c}" stroke-width="14" fill="none" opacity=".85"/>`).join('')}</svg>`;
  }

  // ===== Scenes behind the games =====
  function skyScene(stage) {
    defs();
    const clouds = [[8, 1, 70], [22, .7, 95], [4, .55, 120], [36, .85, 85]].map(([top, s, dur], i) =>
      `<div class="sky-cloud" style="top:${top}%;--s:${s};animation-duration:${dur}s;animation-delay:${-dur * (i * .27 + .1)}s">${cloud()}</div>`).join('');
    let trees = '';
    [[90, 150], [160, 140], [700, 128], [780, 136], [880, 146]].forEach(([x, y]) => {
      trees += `<rect x="${x - 3}" y="${y}" width="6" height="22" fill="#7a4b2a"/><circle cx="${x}" cy="${y - 6}" r="17" fill="url(#tree)"/>`;
    });
    stage.insertAdjacentHTML('afterbegin', `<div class="scene" aria-hidden="true">
      <svg class="sun" viewBox="0 0 200 200"><g class="rays">${Array.from({ length: 12 }, (_, i) => `<rect x="96" y="6" width="8" height="34" rx="4" fill="#ffd84d" opacity=".75" transform="rotate(${i * 30} 100 100)"/>`).join('')}</g><circle cx="100" cy="100" r="48" fill="url(#sunG)"/><circle cx="84" cy="96" r="5" fill="#a86a00"/><circle cx="116" cy="96" r="5" fill="#a86a00"/><path d="M84 114 Q100 128 116 114" stroke="#a86a00" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="74" cy="112" rx="7" ry="4" fill="#ff9e7a" opacity=".6"/><ellipse cx="126" cy="112" rx="7" ry="4" fill="#ff9e7a" opacity=".6"/></svg>
      <div class="rainbow">${rainbow()}</div>
      <div class="hot-air">${hotAir()}</div>
      ${clouds}
      <div class="sky-bird b1">${bird('#3d5a80')}</div>
      <div class="sky-bird b2">${bird('#e76f51')}</div>
    </div>`);
    stage.insertAdjacentHTML('beforeend', `<svg class="hills" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 120 Q160 60 330 110 T660 100 T1000 90 V200 H0Z" fill="url(#hillBack)"/>
      ${trees}
      <path d="M0 160 Q220 110 450 150 T1000 140 V200 H0Z" fill="url(#hillFront)"/>
      ${[[60, 178, '#ff8fab'], [230, 170, '#fff'], [300, 176, '#ffd84d'], [420, 166, '#ff8fab'], [520, 172, '#fff'], [620, 168, '#c77dff'], [760, 174, '#ffd84d'], [900, 178, '#fff']].map(([x, y, c], i) =>
        `<g class="flower" style="animation-delay:${-i * .37}s"><path d="M${x} ${y + 14} Q${x - 2} ${y + 7} ${x} ${y}" stroke="#2f9e44" stroke-width="2" fill="none"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(x + Math.cos(a * Math.PI / 180) * 3.6).toFixed(1)}" cy="${(y + Math.sin(a * Math.PI / 180) * 3.6).toFixed(1)}" r="3" fill="${c}"/>`).join('')}<circle cx="${x}" cy="${y}" r="2" fill="#f59f00"/></g>`).join('')}
    </svg>`);
  }

  function spaceScene(stage) {
    defs();
    stage.insertAdjacentHTML('afterbegin', `<div class="scene" aria-hidden="true">
      <div class="nebula"></div>
      <div class="planet">${planet()}</div>
      <div class="ufo">${ufo()}</div>
      <svg class="moon" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="url(#moon)"/><circle cx="22" cy="24" r="5" fill="#8b96b3" opacity=".6"/><circle cx="38" cy="36" r="7" fill="#8b96b3" opacity=".5"/><circle cx="36" cy="18" r="3" fill="#8b96b3" opacity=".6"/></svg>
    </div>`);
  }

  // Fill placeholders such as <span data-fox="happy"> and <span data-balloon="2" data-letter="A">
  function fill(root) {
    (root || document).querySelectorAll('[data-fox]').forEach(n => { n.innerHTML = fox(n.dataset.fox); });
    (root || document).querySelectorAll('[data-balloon]').forEach(n => { n.innerHTML = balloon(+n.dataset.balloon, n.dataset.letter || ''); });
    (root || document).querySelectorAll('[data-art]').forEach(n => {
      const a = n.dataset.art;
      n.innerHTML = a === 'rocket' ? rocket() : a === 'asteroid' ? asteroid(+(n.dataset.seed || 7)) : a === 'cloud' ? cloud() : a === 'planet' ? planet() : '';
    });
  }
  document.addEventListener('DOMContentLoaded', () => { defs(); fill(); });

  window.TKArt = { BALLOON_COLORS, defs, fox, balloon, cloud, rocket, asteroid, planet, bird, hotAir, ufo, rainbow, skyScene, spaceScene, fill };
})();
