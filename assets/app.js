/* Tippy Typing - shared code used by every page */
(function () {
  'use strict';

  // ===== Ads =====
  // Paste your AdSense publisher id here once AdSense approves the site, e.g. 'ca-pub-1234567890123456'.
  // Each <div class="ad-slot" data-ad-slot="..."> then needs its own ad unit id from AdSense.
  // Ads are never placed on game or lesson screens (Google policy: no ads near game controls).
  const ADSENSE_CLIENT = '';

  // ===== Storage (progress stays on this device only) =====
  const PREFIX = 'tk_';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(PREFIX + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const settings = Object.assign({ sound: true, voice: true, caps: false, music: true }, store.get('settings', {}));
  function saveSettings() { store.set('settings', settings); }

  // ===== Sound effects (generated, no audio files) =====
  let actx = null;
  function audio() {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, delay, slideTo) {
    if (!settings.sound) return;
    const c = audio(); if (!c) return;
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol) {
    if (!settings.sound) return;
    const c = audio(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = 700; g.gain.value = vol || 0.2;
    s.connect(f); f.connect(g); g.connect(c.destination); s.start();
  }
  const sfx = {
    tick() { tone(880, 0.05, 'triangle', 0.06); },
    wrong() { tone(240, 0.18, 'sine', 0.09, 0, 170); },
    pop() { noise(0.12, 0.22); tone(520, 0.09, 'triangle', 0.08, 0, 950); },
    zap() { tone(1400, 0.16, 'triangle', 0.06, 0, 380); },
    boom() { noise(0.35, 0.28); tone(130, 0.3, 'sine', 0.15, 0, 50); },
    hurt() { tone(330, 0.3, 'triangle', 0.08, 0, 110); },
    star() { [784, 988, 1175].forEach((f, i) => tone(f, 0.15, 'triangle', 0.1, i * 0.09)); },
    count() { tone(660, 0.12, 'triangle', 0.08); },
    go() { tone(990, 0.25, 'triangle', 0.09); tone(1320, 0.25, 'sine', 0.05, 0.05); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.11, i * 0.12)); }
  };

  // ===== Voice (helps children who can't read yet) =====
  const SPOKEN = { ' ': 'space', ';': 'semicolon', ',': 'comma', '.': 'dot' };
  // Browsers ship many voices; the default is often an old robotic one. Pick the most natural-sounding English voice.
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|superstar|trinoids|whisper|wobble|zarvox|fred|ralph|kathy|grandpa|grandma|rocko|shelley|eddy|flo|reed|sandy/i;
  function voiceScore(v) {
    const n = v.name, l = (v.lang || '').replace('_', '-').toLowerCase();
    if (!l.startsWith('en') || NOVELTY.test(n)) return -1;
    let s = l === 'en-us' ? 15 : /en-(gb|au|in|ie|ca|nz)/.test(l) ? 10 : 5;
    if (/natural|neural/i.test(n)) s += 100;            // Edge and Windows 11 natural voices (sound like a real person)
    if (/premium|enhanced/i.test(n)) s += 90;            // Apple's high-quality voices
    if (/^google/i.test(n)) s += 70;                     // Chrome's online voices
    if (/jenny|aria|ana\b|samantha|ava|allison|serena|karen|moira|libby|sonia|emma|michelle|zira|heera/i.test(n)) s += 12; // warm, friendly voices
    if (!v.localService) s += 8;
    if (/desktop|espeak/i.test(n)) s -= 30;              // the robotic ones
    return s;
  }
  let bestVoice = null;
  function pickVoice() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices().map(v => [voiceScore(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]);
    bestVoice = vs.length ? vs[0][1] : null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); }
  // Browser voice, only used if a recorded clip can't be loaded.
  function speakTTS(text) {
    if (!window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      if (!bestVoice) pickVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (bestVoice) { u.voice = bestVoice; u.lang = bestVoice.lang; }
      // Natural voices sound best untouched; older voices sound friendlier a little slower and brighter.
      const natural = bestVoice && /natural|neural|premium|enhanced|google/i.test(bestVoice.name);
      u.rate = natural ? 0.95 : 0.9;
      u.pitch = natural ? 1 : 1.1;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  // Recorded natural voice clips in assets/voice (made with the Kokoro neural voice), so every device hears the same friendly voice.
  const VOICE_DIR = 'assets/voice/';
  const clipBytes = {}, clipBuf = {};
  let voiceNode = null;
  function fetchClip(id) {
    if (!clipBytes[id]) clipBytes[id] = fetch(VOICE_DIR + id + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
    return clipBytes[id];
  }
  function preloadVoice(ids) { ids.forEach(id => fetchClip(id).catch(() => { delete clipBytes[id]; })); }
  function clipBuffer(id) {
    if (!clipBuf[id]) clipBuf[id] = fetchClip(id).then(b => new Promise((res, rej) => audio().decodeAudioData(b.slice(0), res, rej)));
    return clipBuf[id];
  }
  const clipOf = text => 'm-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function say(text, id) {
    if (!settings.voice) return;
    id = id || clipOf(text);
    const c = audio();
    if (!c) return speakTTS(text);
    clipBuffer(id).then(buf => {
      if (voiceNode) try { voiceNode.stop(); } catch (e) { /* already stopped */ }
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = buf; g.gain.value = 1;
      src.connect(g); g.connect(c.destination);
      src.start();
      voiceNode = src;
      if (window.TKMusic) TKMusic.duck(buf.duration);
    }).catch(() => { delete clipBuf[id]; delete clipBytes[id]; if (window.TKMusic) TKMusic.duck(2); speakTTS(text); });
  }
  const KEY_CLIP = { ' ': 'space', ';': 'semicolon', ',': 'comma', '.': 'dot' };
  const keyClip = ch => 'k-' + (KEY_CLIP[ch] || ch);
  function sayKey(ch) {
    say(ch === ' ' ? 'Press the space bar.' : /[a-z]/.test(ch) ? `Find the letter ${ch.toUpperCase()}.` : /\d/.test(ch) ? `Find the number ${ch}.` : `Find the ${SPOKEN[ch] || ch} key.`, keyClip(ch));
  }

  // ===== Fingers & keyboard =====
  const FINGER_KEYS = { lp: '1qaz', lr: '2wsx', lm: '3edc', li: '45rtfgvb', ri: '67yuhjnm', rm: '8ik,', rr: '9ol.', rp: '0p;', th: ' ' };
  const FINGER_NAME = { lp: 'left pinky', lr: 'left ring finger', lm: 'left middle finger', li: 'left pointer finger', ri: 'right pointer finger', rm: 'right middle finger', rr: 'right ring finger', rp: 'right pinky', th: 'thumb' };
  const FINGER_OF = {};
  Object.keys(FINGER_KEYS).forEach(f => { for (const ch of FINGER_KEYS[f]) FINGER_OF[ch] = f; });
  const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl;', 'zxcvbnm,.', ' '];

  function keyboard(el, opts) {
    opts = opts || {};
    el.classList.add('kb');
    el.innerHTML = '';
    const map = {};
    ROWS.forEach((row, ri) => {
      if (ri === 0 && opts.numbers === false) return;
      const r = document.createElement('div');
      r.className = 'kb-row kb-row' + ri;
      for (const ch of row) {
        const b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        b.className = 'key f-' + FINGER_OF[ch] + (ch === ' ' ? ' key-space' : '') + (ch === 'f' || ch === 'j' ? ' key-bump' : '');
        b.textContent = ch === ' ' ? 'space' : ch.toUpperCase();
        b.setAttribute('aria-label', ch === ' ' ? 'space' : ch);
        b.addEventListener('pointerdown', e => { e.preventDefault(); if (opts.onKey) opts.onKey(ch); });
        r.appendChild(b);
        map[ch] = b;
      }
      el.appendChild(r);
    });
    let lit = [];
    return {
      highlight(chars) {
        lit.forEach(b => b.classList.remove('lit'));
        lit = [];
        for (const c of chars || []) { const b = map[c]; if (b) { b.classList.add('lit'); lit.push(b); } }
      },
      flash(ch, ok) {
        const b = map[ch]; if (!b) return;
        const cls = ok ? 'hit' : 'miss';
        b.classList.remove('hit', 'miss'); void b.offsetWidth; b.classList.add(cls);
        setTimeout(() => b.classList.remove(cls), 220);
      }
    };
  }

  // Two hands; the finger for the next key lights up.
  function hands(el) {
    // [finger, x, y, width, height] for the left hand; the right hand is mirrored.
    const L = [['lp', 22, 46, 22, 58], ['lr', 47, 26, 23, 76], ['lm', 73, 16, 24, 84], ['li', 100, 26, 23, 76]];
    const MIRROR = { lp: 'rp', lr: 'rr', lm: 'rm', li: 'ri' };
    const finger = (id, x, y, w, h) => `<g class="finger f-${id}" data-f="${id}">
      <path class="farrow" d="M${x + w / 2 - 7} ${y - 16} h14 l-7 9 z"/>
      <rect class="fskin" fill="url(#skin)" x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}"/>
      <rect class="ftip" x="${x}" y="${y}" width="${w}" height="${w * 1.15}" rx="${w / 2}"/>
      <rect class="fnail" x="${x + 4.5}" y="${y + 4}" width="${w - 9}" height="${w * .62}" rx="${(w - 9) / 2}"/>
      <path class="fknuckle" d="M${x + 6} ${y + h * .62} q${w / 2 - 6} 4 ${w - 12} 0"/></g>`;
    const hand = right => {
      let s = '<path class="palm" fill="url(#skin)" d="M20 92 C20 80 30 74 44 76 L122 76 C134 76 142 86 140 100 L134 140 C132 150 122 156 110 156 L46 156 C32 156 22 148 21 136 Z"/>';
      L.forEach(([f, x, y, w, h]) => { s += finger(right ? MIRROR[f] : f, x, y, w, h); });
      s += `<g transform="rotate(52 144 108)">${finger('th', 132, 80, 24, 56)}</g>`;
      return right ? `<g transform="translate(330 0) scale(-1 1)">${s}</g>` : `<g>${s}</g>`;
    };
    el.innerHTML = `<svg class="hands" viewBox="0 -10 330 170" role="img" aria-label="Your two hands. The glowing finger shows which finger to use.">${hand(false)}${hand(true)}</svg>`;
    const fingers = el.querySelectorAll('.finger');
    return {
      highlight(f) { fingers.forEach(n => n.classList.toggle('lit', n.dataset.f === f)); }
    };
  }

  // One keydown listener per page. Letters arrive lowercased; Escape/Backspace/Enter pass through.
  function onType(handler) {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      let k = e.key === 'Spacebar' ? ' ' : e.key;
      if (k === 'Escape' || k === 'Backspace' || k === 'Enter') { handler(k, e); return; }
      if (!k || k.length !== 1) return;
      e.preventDefault();
      handler(k.toLowerCase(), e);
    });
  }

  function show(ch) { return settings.caps ? ch.toUpperCase() : ch; }

  // ===== Stars & sticker book =====
  const STICKERS = ['🐣', '🐶', '🐱', '🐰', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐧', '🦉', '🐢', '🐬', '🐙', '🦋', '🦄', '🐲', '🦖', '🌈', '🍦', '🎈', '🚀', '🪐', '⭐', '👑', '🏆'];
  const STARS_PER_STICKER = 3;
  function getStars() { return store.get('stars', {}); }
  function totalStars() { return Object.values(getStars()).reduce((a, b) => a + b, 0); }
  function stickersUnlocked(total) { return Math.min(STICKERS.length, Math.floor((total == null ? totalStars() : total) / STARS_PER_STICKER)); }
  // Saves the best star count for an activity; returns any newly unlocked sticker.
  function saveStars(id, n) {
    const before = stickersUnlocked();
    const s = getStars();
    if ((s[id] || 0) < n) { s[id] = n; store.set('stars', s); }
    const after = stickersUnlocked();
    return after > before ? STICKERS[after - 1] : null;
  }

  // ===== Result popup =====
  function showResult(o) {
    const m = document.createElement('div');
    m.className = 'modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    const starSvg = '<svg viewBox="0 0 100 100"><path d="M50 6 L62 36 L94 38 L69 59 L77 91 L50 73 L23 91 L31 59 L6 38 L38 36 Z" fill="url(#gold)" stroke="#e08a00" stroke-width="4" stroke-linejoin="round"/><path d="M40 30 L50 12 L54 26 Z" fill="#fff" opacity=".7"/></svg>';
    const stars = [0, 1, 2].map(i => `<span class="${i < o.stars ? 'on' : ''}" style="animation-delay:${i * .25}s">${starSvg}</span>`).join('');
    const fox = window.TKArt ? `<div class="modal-fox">${TKArt.fox(o.stars >= 2 ? 'wow' : 'happy')}</div>` : '';
    m.innerHTML = `<div class="card">
      ${fox}
      <h2>${o.title}</h2>
      <div class="stars" aria-label="${o.stars} out of 3 stars">${stars}</div>
      ${o.message ? `<p>${o.message}</p>` : ''}
      <div class="stats">${(o.stats || []).map(s => `<div>${s}</div>`).join('')}</div>
      ${o.sticker ? `<div class="new-sticker"><b>${o.sticker}</b>New sticker for your sticker book!</div>` : ''}
      <div class="actions"></div></div>`;
    const act = m.querySelector('.actions');
    (o.actions || []).forEach((a, i) => {
      const b = document.createElement(a.href ? 'a' : 'button');
      b.className = 'btn ' + (a.cls || (i === 0 ? '' : 'alt'));
      b.textContent = a.label;
      if (a.href) b.href = a.href; else { b.type = 'button'; b.addEventListener('click', () => { m.remove(); a.onClick && a.onClick(); }); }
      act.appendChild(b);
    });
    document.body.appendChild(m);
    const first = act.firstElementChild; if (first) first.focus();
    // Enter = first action
    const onKey = e => { if (!document.body.contains(m)) { document.removeEventListener('keydown', onKey, true); return; } if (e.key === 'Enter' && first) { e.preventDefault(); e.stopPropagation(); first.click(); } else if (e.key !== 'Tab') { e.stopPropagation(); } };
    document.addEventListener('keydown', onKey, true);
    for (let i = 0; i < o.stars; i++) setTimeout(sfx.star, 250 * i + 150);
    if (o.stars >= 2) { confetti(); sfx.win(); }
    if (o.say) say(o.say);
    return m;
  }

  // "3, 2, 1, Go!" over a game stage, then cb(). Keys pressed during the countdown are ignored by the games.
  function countdown(stage, cb) {
    const el = document.createElement('div');
    el.className = 'countdown';
    stage.appendChild(el);
    const steps = ['3', '2', '1', 'Go!'];
    let i = 0;
    (function next() {
      if (i === steps.length) { el.remove(); cb(); return; }
      el.innerHTML = `<b>${steps[i]}</b>`;
      i === steps.length - 1 ? sfx.go() : sfx.count();
      i++;
      setTimeout(next, i === steps.length ? 450 : 650);
    })();
  }

  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const x = c.getContext('2d');
    const cols = ['#6c4ff6', '#ff5d8f', '#ffc93c', '#22c55e', '#38bdf8', '#fb923c'];
    const ps = Array.from({ length: 140 }, () => ({ x: c.width / 2, y: c.height / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 4, s: Math.random() * 8 + 5, r: Math.random() * 6, c: cols[Math.random() * cols.length | 0] }));
    let t = 0;
    (function frame() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += .1; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (++t < 140) requestAnimationFrame(frame); else c.remove();
    })();
  }

  // ===== Helpers =====
  const pick = a => a[Math.random() * a.length | 0];
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ===== Header toggles (sound / voice / ABC) =====
  function initToggles() {
    document.querySelectorAll('[data-setting]').forEach(b => {
      const k = b.dataset.setting;
      const sync = () => b.setAttribute('aria-pressed', settings[k] ? 'true' : 'false');
      sync();
      b.addEventListener('click', () => {
        settings[k] = !settings[k]; saveSettings(); sync();
        if (k === 'sound' && settings.sound) sfx.tick();
        if (k === 'voice' && settings.voice) say('Hello!');
        document.dispatchEvent(new CustomEvent('tk-settings', { detail: k }));
        b.blur();
      });
    });
  }

  function initAds() {
    const slots = [...document.querySelectorAll('.ad-slot[data-ad-slot]')].filter(s => s.dataset.adSlot);
    if (!ADSENSE_CLIENT || !slots.length) return;
    // Site is for children: request non-personalised ads only. Also tag the site as
    // child-directed in your AdSense account settings (see README).
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = 1;
    const s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    document.head.appendChild(s);
    slots.forEach(slot => {
      slot.classList.add('on');
      slot.innerHTML = `<div class="ad-label">Advertisement</div><ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT}" data-ad-slot="${slot.dataset.adSlot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      window.adsbygoogle.push({});
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToggles();
    initAds();
    document.querySelectorAll('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });
  });

  window.TK = { audio, store, settings, sfx, say, sayKey, keyClip, preloadVoice, keyboard, hands, onType, show, FINGER_OF, FINGER_NAME, STICKERS, STARS_PER_STICKER, getStars, totalStars, stickersUnlocked, saveStars, showResult, countdown, confetti, pick, shuffle };
})();
