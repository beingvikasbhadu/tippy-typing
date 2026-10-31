/* Tippy Typing - particle effects and starfield drawn on a canvas */
(function () {
  'use strict';
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function canvasFor(host, cls) {
    const c = document.createElement('canvas');
    c.className = cls;
    host.appendChild(c);
    const x = c.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      const w = host.clientWidth, h = host.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.w = w; c.h = h;
    };
    size();
    window.addEventListener('resize', size);
    return { c, x, size };
  }

  // Short-lived particles: balloon shards, sparks, smoke, stars.
  function create(host) {
    const { c, x, size } = canvasFor(host, 'fx-canvas');
    let ps = [], running = false;

    function starPath(r) {
      x.beginPath();
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      x.closePath();
    }
    function loop() {
      x.clearRect(0, 0, c.w, c.h);
      ps = ps.filter(p => p.life > 0);
      for (const p of ps) {
        p.life--;
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        const k = p.life / p.max;
        x.save();
        x.globalAlpha = Math.max(0, Math.min(1, k * 1.6)) * p.alpha;
        x.translate(p.x, p.y); x.rotate(p.rot);
        x.fillStyle = p.color; x.strokeStyle = p.color;
        const s = p.s * (1 + (1 - k) * p.grow);
        if (p.shape === 'shard') { x.beginPath(); x.moveTo(0, -s); x.quadraticCurveTo(s * .9, -s * .2, s * .5, s * .7); x.lineTo(-s * .6, s * .5); x.closePath(); x.fill(); }
        else if (p.shape === 'star') { starPath(s); x.fill(); }
        else if (p.shape === 'spark') { x.fillRect(-s, -1.2, s * 2, 2.4); }
        else if (p.shape === 'string') { x.lineWidth = 1.6; x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-7, s * .3, 7, s * .6, 0, s); x.stroke(); }
        else if (p.shape === 'ring') { x.lineWidth = 3 * k + .5; x.beginPath(); x.arc(0, 0, s, 0, Math.PI * 2); x.stroke(); }
        else { x.beginPath(); x.arc(0, 0, s, 0, Math.PI * 2); x.fill(); }
        x.restore();
      }
      if (ps.length) requestAnimationFrame(loop); else { running = false; x.clearRect(0, 0, c.w, c.h); }
    }
    function add(o) {
      const life = o.life || 40;
      ps.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: .96, rot: 0, vr: 0, s: 4, color: '#fff', shape: 'circle', alpha: 1, grow: 0 }, o, { life, max: life }));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    const R = (a, b) => a + Math.random() * (b - a);
    const any = a => a[Math.random() * a.length | 0];

    return {
      resize: size,
      pop(px, py, col) {
        if (reduced) return;
        add({ x: px, y: py, shape: 'ring', s: 14, grow: 3, color: '#ffffff', life: 18, drag: 1 });
        for (let i = 0; i < 16; i++) {
          const a = R(0, Math.PI * 2), v = R(3, 8);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: .28, drag: .95, shape: 'shard', s: R(5, 10), color: any([col.m, col.d, col.l]), rot: R(0, 6), vr: R(-.3, .3), life: R(30, 48) | 0 });
        }
        for (let i = 0; i < 7; i++) {
          const a = R(0, Math.PI * 2), v = R(1.5, 4);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: .93, shape: 'star', s: R(3, 6), color: any(['#fff', '#ffe066', '#fff3b0']), vr: .1, life: R(25, 40) | 0 });
        }
      },
      // the balloon's string falls away after a pop
      string(px, py) {
        if (reduced) return;
        add({ x: px, y: py, vx: (Math.random() - .5) * 1.5, vy: -1, g: .22, drag: .97, shape: 'string', s: 48, color: 'rgba(55,65,85,.6)', vr: (Math.random() - .5) * .08, life: 50 });
      },
      // little bits fly off a space rock for every correct letter
      chips(px, py) {
        if (reduced) return;
        for (let i = 0; i < 5; i++) {
          const a = R(0, Math.PI * 2), v = R(2, 5);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .1, drag: .94, shape: 'shard', s: R(2.5, 5), rot: R(0, 6), vr: R(-.3, .3), color: any(['#a58a73', '#7e6553', '#d4bca6']), life: R(20, 32) | 0 });
        }
        for (let i = 0; i < 4; i++) {
          const a = R(0, Math.PI * 2), v = R(2, 4);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: .9, shape: 'star', s: R(2, 4), color: any(['#fff', '#b3a6ff', '#7df9ff']), vr: .2, life: R(16, 26) | 0 });
        }
      },
      // fire and smoke behind a rocket taking off
      exhaust(px, py) {
        if (reduced) return;
        for (let i = 0; i < 3; i++) add({ x: px + R(-6, 6), y: py, vx: R(-.8, .8), vy: R(2, 5), drag: .95, s: R(5, 10), grow: 1.4, color: any(['#fff4c2', '#ffd23f', '#ff9a2e']), life: R(14, 22) | 0 });
        add({ x: px + R(-8, 8), y: py + 10, vx: R(-1, 1), vy: R(1, 2), drag: .98, s: R(8, 13), grow: 2, alpha: .3, color: '#c3c9d9', life: R(35, 50) | 0 });
      },
      explode(px, py) {
        if (reduced) return;
        add({ x: px, y: py, shape: 'ring', s: 18, grow: 4, color: '#ffd28a', life: 20, drag: 1 });
        for (let i = 0; i < 14; i++) {
          const a = R(0, Math.PI * 2), v = R(.5, 3);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: .9, s: R(8, 16), grow: 1.5, color: any(['#fff4c2', '#ffd23f', '#ff9a2e', '#ff5a1f']), life: R(18, 30) | 0 });
        }
        for (let i = 0; i < 18; i++) {
          const a = R(0, Math.PI * 2), v = R(4, 10);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: .93, shape: 'spark', s: R(4, 9), rot: a, color: any(['#fff', '#ffe066', '#ffb347']), life: R(15, 28) | 0 });
        }
        for (let i = 0; i < 9; i++) {
          const a = R(0, Math.PI * 2), v = R(2, 6);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .12, drag: .97, shape: 'shard', s: R(4, 9), rot: R(0, 6), vr: R(-.25, .25), color: any(['#7e6553', '#5b4636', '#a58a73']), life: R(35, 55) | 0 });
        }
        for (let i = 0; i < 6; i++) {
          add({ x: px + R(-10, 10), y: py + R(-10, 10), vx: R(-.6, .6), vy: R(-1.2, -.3), drag: .99, s: R(10, 16), grow: 2, alpha: .35, color: '#9aa3b8', life: R(40, 60) | 0 });
        }
      },
      sparkle(px, py, n) {
        if (reduced) return;
        for (let i = 0; i < (n || 8); i++) {
          const a = R(0, Math.PI * 2), v = R(1, 3.5);
          add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: .05, drag: .95, shape: 'star', s: R(3, 6), color: any(['#ffe066', '#fff', '#ff9ad5', '#9be7ff']), vr: .15, life: R(25, 40) | 0 });
        }
      }
    };
  }

  // Endless starfield that scrolls down, as if the rocket were flying up.
  function starfield(host) {
    const { c, x, size } = canvasFor(host, 'stars-canvas');
    const layers = [[70, .15, .9], [45, .4, 1.4], [18, .9, 2.2]];
    const stars = [];
    layers.forEach(([n, v, s]) => { for (let i = 0; i < n; i++) stars.push({ x: Math.random(), y: Math.random(), v, s, tw: Math.random() * 6 }); });
    let speed = 1, shoot = null, t = 0;
    (function frame() {
      t++;
      x.clearRect(0, 0, c.w, c.h);
      for (const st of stars) {
        if (!reduced) st.y += st.v * speed / c.h;
        if (st.y > 1) { st.y = 0; st.x = Math.random(); }
        x.globalAlpha = .55 + .45 * Math.sin(t * .05 + st.tw);
        x.fillStyle = st.s > 2 ? '#fff6d8' : '#ffffff';
        x.beginPath(); x.arc(st.x * c.w, st.y * c.h, st.s, 0, Math.PI * 2); x.fill();
      }
      if (!shoot && !reduced && Math.random() < .004) shoot = { x: Math.random() * c.w * .7, y: Math.random() * c.h * .4, l: 0 };
      if (shoot) {
        shoot.l += 1;
        const len = 80, px = shoot.x + shoot.l * 9, py = shoot.y + shoot.l * 4;
        const g = x.createLinearGradient(px - len, py - len * .45, px, py);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.95)');
        x.globalAlpha = 1 - shoot.l / 40; x.strokeStyle = g; x.lineWidth = 2;
        x.beginPath(); x.moveTo(px - len, py - len * .45); x.lineTo(px, py); x.stroke();
        if (shoot.l > 40) shoot = null;
      }
      x.globalAlpha = 1;
      requestAnimationFrame(frame);
    })();
    return { resize: size, setSpeed(s) { speed = s; } };
  }

  window.TKFX = { create, starfield };
})();
