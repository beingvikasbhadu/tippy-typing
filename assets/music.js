/* Tippy Typing - gentle background songs, played live with Web Audio (no audio files, no copyright issues).
   Each page picks a song with <body data-music="home|calm|sky|space">:
     home  - warm, happy piano (home and info pages)
     calm  - slow music-box lullaby that helps children focus (lessons)
     sky   - bouncy ukulele and whistle (Balloon Pop)
     space - dreamy pads and twinkling stars (Space Words)
   A song keeps playing in a loop and continues from the same spot when you come back to a page with the same song.
   The 🎵 button turns it off. */
(function () {
  'use strict';
  const S = TK.settings;
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const midi = tok => { const m = /^([A-G][#b]?)(\d)$/.exec(tok); return m ? 12 * (+m[2] + 1) + NOTE[m[1]] : null; };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  // Chord voicings in the warm middle range, and their bass notes.
  const CHORD = {
    Cmaj7: [55, 59, 60, 64], Am7: [55, 57, 60, 64], Dm7: [57, 60, 62, 65], G7: [55, 59, 62, 65], Fmaj7: [57, 60, 64, 65], Em7: [55, 59, 62, 64],
    G: [55, 59, 62, 67], C: [55, 60, 64, 67], D: [57, 62, 66, 69], Em: [55, 59, 64, 67], Bm: [54, 59, 62, 66],
    F: [57, 60, 65, 69], Am: [57, 60, 64, 69], Bb: [58, 62, 65, 70], Dm: [57, 62, 65, 69], Gm7: [58, 62, 65, 67], Csus: [55, 60, 65, 67],
    Am9: [57, 60, 64, 71], Fmaj9: [57, 60, 64, 67], Cmaj9: [55, 59, 62, 64], G6: [55, 59, 64, 67], Dm9: [53, 57, 60, 64]
  };
  const BASS = {
    Cmaj7: 48, Am7: 45, Dm7: 50, G7: 43, Fmaj7: 41, Em7: 40, G: 43, C: 48, D: 50, Em: 40, Bm: 47,
    F: 41, Am: 45, Bb: 46, Dm: 50, Gm7: 43, Csus: 48, Am9: 45, Fmaj9: 41, Cmaj9: 48, G6: 43, Dm9: 50
  };
  const bars = s => s.trim().split(/\s+/);
  // Tune: one token per eighth note, "." = rest (the note before keeps ringing), "|" = bar line.
  const tune = s => s.replace(/\|/g, ' ').trim().split(/\s+/).map(midi);
  const REST8 = '. . . . . . . . |';

  let ctx = null, master = null, reverb = null, echo = null, warmPad = null, noiseBuf = null;

  // ----- instruments (round sine and triangle tones only, nothing buzzy) -----
  function out(g, fx) {
    g.connect(master);
    if (fx & 1) g.connect(reverb);
    if (fx & 2) g.connect(echo);
  }
  function tone(type, f, t, attack, decay, peak, fx) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    o.connect(g); out(g, fx);
    o.start(t); o.stop(t + attack + decay + .05);
  }
  // Electric piano chord with a tiny strum
  function keys(notes, t, v) {
    notes.forEach((n, i) => {
      const f = hz(n), d = t + i * .012;
      tone('sine', f, d, .015, 1.9, v, 1);
      tone('sine', f * 2, d, .01, .5, v * .22, 1);
      tone('sine', f * 4, d, .003, .06, v * .12);
    });
  }
  // Soft marimba
  function marimba(f, t) {
    tone('sine', f, t, .008, .75, .12, 1);
    tone('sine', f * 4, t, .002, .07, .025);
    tone('triangle', f * 2, t, .004, .2, .018, 1);
  }
  // Music box: a bell-like tine that rings for a long time
  function musicBox(f, t, v) {
    tone('sine', f, t, .004, 1.8, v, 3);
    tone('sine', f * 3, t, .002, .45, v * .12, 1);
    tone('sine', f * 4.2, t, .001, .16, v * .06);
  }
  // Ukulele strum: quick down-strum of soft plucked strings
  function uke(notes, t, v, up) {
    const order = up ? notes.slice().reverse() : notes;
    order.forEach((n, i) => {
      const f = hz(n), d = t + i * .018;
      tone('triangle', f, d, .003, .42, v, 1);
      tone('sine', f * 2, d, .002, .12, v * .35);
    });
  }
  // Harp: gentle plucked note for arpeggios
  function harp(f, t, v) {
    tone('triangle', f, t, .006, 1.3, v, 1);
    tone('sine', f * 2, t, .003, .3, v * .25);
  }
  // Glockenspiel sparkle
  function sparkle(f, t, v) { tone('sine', f, t, .004, .9, v || .03, 3); tone('sine', f * 3, t, .002, .25, (v || .03) * .27, 1); }
  // Whistle / soft flute with a little vibrato. A small pitch scoop at the start makes it sound sung.
  function flute(f, t, dur, v, scoop) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f * (scoop ? .97 : 1), t);
    o.frequency.exponentialRampToValueAtTime(f, t + .07);
    lfo.frequency.value = 5.2;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(f * .006, t + Math.min(.35, dur));
    lfo.connect(depth); depth.connect(o.frequency);
    const end = t + dur;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + .06);
    g.gain.linearRampToValueAtTime(v * .75, t + Math.max(.07, dur * .6));
    g.gain.linearRampToValueAtTime(0.0001, end + .25);
    o.connect(g); out(g, 3);
    o.start(t); lfo.start(t); o.stop(end + .3); lfo.stop(end + .3);
    tone('triangle', f * 2, t, .03, Math.min(.4, dur), v * .06, 1); // breath
  }
  // Warm pad: two slightly detuned tones per note that fade in and out slowly
  function pad(notes, t, dur, v) {
    const att = Math.min(1.2, dur * .4);
    notes.forEach(n => [-6, 6].forEach(c => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = hz(n); o.detune.value = c;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + att);
      g.gain.setValueAtTime(v, t + dur);
      g.gain.linearRampToValueAtTime(0, t + dur + 1.4);
      o.connect(g); g.connect(warmPad);
      o.start(t); o.stop(t + dur + 1.5);
    }));
  }
  function bass(f, t, d, v) {
    tone('sine', f, t, .02, d, v || .2);
    tone('triangle', f, t, .02, d * .6, (v || .2) * .25);
  }
  function kick(t, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
    g.gain.setValueAtTime(v || .16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .18);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .2);
  }
  function brush(t, v, freq) {
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = .7;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .12);
    s.connect(bp); bp.connect(g); out(g, 1);
    s.start(t); s.stop(t + .14);
  }
  // How long a tune note rings: until the next note, in eighths.
  function ringLength(mel, s) { let n = 1; while (n < 8 && mel[(s + n) % mel.length] === null) n++; return n; }

  // ----- the songs -----
  const SONGS = {
    // Warm, happy piano. 32 bars, about 85 seconds.
    home: {
      bpm: 92, volume: .24, echo: 3,
      chords: bars('Cmaj7 Am7 Dm7 G7 '.repeat(4) + 'Fmaj7 Em7 Dm7 Cmaj7 Fmaj7 Em7 Dm7 G7 Fmaj7 Em7 Dm7 G7 Cmaj7 Am7 Dm7 G7'),
      mel: tune(`
        E5 . . G5 . . E5 . | C5 . . E5 . . A5 . | F5 . E5 . D5 . C5 . | D5 . . . . . . . |
        E5 . . G5 . . C6 . | B5 . A5 . G5 . E5 . | F5 . A5 . G5 . F5 . | E5 . D5 . . . . . |
        E5 . . G5 . . E5 . | C5 . . E5 . . A5 . | F5 . E5 . D5 . C5 . | D5 . G5 . B5 . . . |
        E5 . . G5 . . C6 . | B5 . A5 . G5 . E5 . | F5 . D5 . G5 . B4 . | C5 . . . . . . . |
        A5 . . . C6 . A5 . | G5 . . . B5 . G5 . | F5 . A5 . . . F5 . | E5 . . . . . . . |
        A5 . C6 . E6 . C6 . | B5 . G5 . E5 . G5 . | A5 . F5 . D5 . F5 . | G5 . . . . . . . |
        ${REST8.repeat(8)}`),
      step(s, t, e, bar, pos, ch, name, m) {
        if (pos === 0) keys(ch, t, .045);
        if (pos === 5) keys(ch.slice(1), t, .022);
        if (pos === 0) bass(hz(BASS[name]), t, e * 3.5);
        if (pos === 4) bass(hz(BASS[name] + 7), t, e * 2.5);
        if (pos === 0 || pos === 5) kick(t);
        if (pos === 4) brush(t, .05, 1800);
        if (pos % 2 === 1) brush(t, .012, 6000);
        if (m) marimba(hz(m), t);
        if (bar >= 24 && pos % 2 === 0) sparkle(hz(ch[(pos / 2 + bar) % ch.length] + 24), t);
      }
    },

    // Slow music-box lullaby with a soft pad and harp. No drums, so children can concentrate. 24 bars, about 80 seconds.
    calm: {
      bpm: 72, volume: .26, echo: 3,
      chords: bars('F Am Bb C F Dm Gm7 Csus Bb F Gm7 C Dm Bb C F   F Am Bb C F Dm Bb Csus'),
      mel: tune(`
        A5 . . . G5 . F5 . | E5 . . . C5 . . . | D5 . . . F5 . D5 . | E5 . . . . . . . |
        A5 . . . C6 . A5 . | F5 . . . D5 . . . | D5 . F5 . Bb5 . A5 . | G5 . . . . . . . |
        F5 . . . D5 . F5 . | A5 . . . C5 . . . | Bb4 . D5 . G5 . F5 . | E5 . . . G5 . . . |
        F5 . . . A5 . F5 . | D5 . . . F5 . D5 . | C5 . . . G5 . E5 . | F5 . . . . . . . |
        ${REST8.repeat(8)}`),
      step(s, t, e, bar, pos, ch, name, m) {
        if (pos === 0) { pad(ch, t, e * 8, .012); bass(hz(BASS[name]), t, e * 6, .14); }
        if (pos === 4) bass(hz(BASS[name] + 12), t, e * 3, .05);
        // rolling harp arpeggio, quieter while the music box sings
        harp(hz(ch[[0, 1, 2, 3, 2, 1, 2, 3][pos]]), t, m || this.mel[s - 1] ? .018 : .03);
        if (m) musicBox(hz(m), t, .09);
        if (bar >= 16 && (pos === 0 || pos === 3 || pos === 6)) musicBox(hz(ch[(bar + pos) % ch.length] + 12), t, .035);
      }
    },

    // Bouncy and sunny: ukulele, a friendly whistle and a light shaker. 32 bars, about 71 seconds.
    sky: {
      bpm: 108, volume: .22, echo: 2,
      chords: bars('G C D G Em C D G C D Bm Em C D G G   G C D G Em C D G C D Bm Em C D G G'),
      mel: tune(`
        D5 . B4 . G4 . B4 D5 | E5 . . . C5 . E5 . | F#5 . E5 . D5 . A4 . | B4 . . . . . . . |
        D5 . B4 . G4 . B4 D5 | E5 . G5 . E5 . C5 . | D5 . E5 . F#5 . A5 . | G5 . . . . . . . |
        E5 . E5 G5 . . E5 . | F#5 . F#5 A5 . . F#5 . | D5 . F#5 . B5 . A5 . | G5 . . . E5 . . . |
        E5 . G5 . E5 . C5 . | D5 . F#5 . A5 . F#5 . | G5 . D5 . B4 . D5 . | G5 . . . . . . . |
        ${REST8.repeat(8)}
        E5 . E5 G5 . . E5 . | F#5 . F#5 A5 . . F#5 . | D5 . F#5 . B5 . A5 . | G5 . . . E5 . . . |
        E5 . G5 . E5 . C5 . | D5 . F#5 . A5 . F#5 . | G5 . D5 . B4 . D5 . | G5 . . . . . . . |`),
      step(s, t, e, bar, pos, ch, name, m) {
        // strum pattern: down . down-up . up down-up
        if (pos === 0) uke(ch, t, .05);
        if (pos === 2 || pos === 6) uke(ch, t, .03);
        if (pos === 3 || pos === 5 || pos === 7) uke(ch.slice(1), t, .018, true);
        if (pos === 0) bass(hz(BASS[name]), t, e * 1.8, .17);
        if (pos === 4) bass(hz(BASS[name] + 7), t, e * 1.8, .14);
        if (pos === 0 || pos === 4) kick(t, .1);
        if (pos === 2 || pos === 6) brush(t, .035, 2400);
        brush(t, pos % 2 ? .008 : .014, 7500);
        if (m) flute(hz(m), t, ringLength(this.mel, s) * e * .9, .085, true);
        // glockenspiel answers while the whistle rests
        if (bar >= 16 && bar < 24 && pos % 2 === 0) sparkle(hz(ch[[0, 2, 1, 3][pos / 2]] + 24), t, .035);
      }
    },

    // Dreamy: slow pads, a soft flute and twinkling echoes, like floating among the stars. 24 bars, about 72 seconds.
    space: {
      bpm: 80, volume: .27, echo: 3,
      chords: bars('Am9 Fmaj9 Cmaj9 G6 Am9 Fmaj9 Cmaj9 G6 Dm9 Am9 Fmaj9 G6 Dm9 Am9 Fmaj9 G6   Am9 Fmaj9 Cmaj9 G6 Am9 Fmaj9 Cmaj9 G6'),
      mel: tune(`
        E5 . . . . . B5 . | A5 . . . . . G5 . | E5 . . . D5 . . . | B4 . . . . . . . |
        E5 . . . . . C6 . | B5 . . . A5 . . . | G5 . . . E5 . D5 . | E5 . . . . . . . |
        F5 . . . A5 . . . | E5 . . . C5 . . . | A5 . . . G5 . E5 . | D5 . . . . . . . |
        F5 . . . A5 . C6 . | B5 . . . . . A5 . | G5 . . . E5 . . . | E5 . . . . . . . |
        ${REST8.repeat(8)}`),
      step(s, t, e, bar, pos, ch, name, m) {
        if (pos === 0) { pad(ch, t, e * 8, .016); bass(hz(BASS[name] - 12), t, e * 7, .16); }
        if (pos === 4) bass(hz(BASS[name]), t, e * 3, .05);
        // twinkling stars: high soft notes that echo away
        if (pos % 2 === 0 || pos === 3) sparkle(hz(ch[[0, 3, 1, 2, 0, 2][(pos + bar) % 6]] + 24), t, pos === 0 ? .03 : .018);
        if (m) flute(hz(m), t, ringLength(this.mel, s) * e * .95, .075);
        if (pos === 4 && bar % 2) brush(t, .01, 5000);
      }
    }
  };
  Object.values(SONGS).forEach(song => { song.len = song.mel.length; });
  // Old names, so pages with older markup still play something.
  SONGS.happy = SONGS.home;

  const SAVE_PREFIX = 'music_';
  let song = null, songName = '', timer = null, step = 0, nextT = 0, playing = false, enabled = false, vol = null;

  // Recorded versions of the songs (real sampled instruments) in assets/music. Each file holds one loop with
  // PAD seconds of its own music before and after, so it loops without a gap. If a file is missing, the live synth plays instead.
  const FILE = { home: [92, 32], calm: [72, 24], sky: [108, 32], space: [80, 24] };
  const PAD = 1, FILE_GAIN = .5;
  const RECORDED = []; // add a song name here once assets/music/<name>.mp3 exists
  let fileBytes = null, fileBuf = null, fileSrc = null, fileStartT = 0, fileStartPos = 0, fileLoop = 0, useFile = null;
  function loopSeconds(name) { const [bpm, nbars] = FILE[name]; return Math.round(Math.round(60e6 / bpm) * nbars * 4 / 1e6 * 44100) / 44100; }

  function init() {
    ctx = TK.audio();
    if (!ctx) return false;
    if (!master) {
      vol = ctx.createGain(); vol.gain.value = 0; vol.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = .8;
      const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 5000;
      const comp = ctx.createDynamicsCompressor();
      master.connect(warm); warm.connect(comp); comp.connect(vol);
      // Small room echo makes everything softer and rounder.
      const len = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      const conv = ctx.createConvolver(); conv.buffer = ir;
      reverb = ctx.createGain(); reverb.gain.value = .3;
      reverb.connect(conv); conv.connect(master);
      // Soft repeating echo (delay with feedback, darker on every repeat).
      echo = ctx.createGain(); echo.gain.value = .22;
      const dl = ctx.createDelay(2), fb = ctx.createGain(), dark = ctx.createBiquadFilter();
      dl.delayTime.value = song.echo * 30 / song.bpm; // a few eighth notes
      fb.gain.value = .38; dark.type = 'lowpass'; dark.frequency.value = 2600;
      echo.connect(dl); dl.connect(dark); dark.connect(fb); fb.connect(dl); dark.connect(master); dark.connect(reverb);
      // Pads go through a gentle low-pass so they stay in the background.
      warmPad = ctx.createBiquadFilter(); warmPad.type = 'lowpass'; warmPad.frequency.value = 1500;
      warmPad.connect(master); warmPad.connect(reverb);
      const nlen = Math.floor(ctx.sampleRate * .15);
      noiseBuf = ctx.createBuffer(1, nlen, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1;
    }
    return true;
  }

  function tick() {
    const e = 60 / song.bpm / 2;
    while (nextT < ctx.currentTime + .15) {
      const bar = Math.floor(step / 8), pos = step % 8, name = song.chords[bar % song.chords.length];
      song.step(step, nextT, e, bar, pos, CHORD[name], name, song.mel[step]);
      nextT += e;
      step = (step + 1) % song.len;
    }
  }

  function fade(to, secs) {
    const t = ctx.currentTime;
    vol.gain.cancelScheduledValues(t);
    vol.gain.setValueAtTime(Math.max(0.0001, vol.gain.value), t);
    vol.gain.exponentialRampToValueAtTime(Math.max(0.0001, to), t + secs);
  }
  function loadFile() {
    if (!fileBytes) fileBytes = !RECORDED.includes(songName) ? Promise.reject(new Error('no recording')) : fetch('assets/music/' + songName + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
    return fileBytes;
  }
  function savedPos(len) {
    const saved = TK.store.get(SAVE_PREFIX + songName, null);
    return saved && Date.now() - saved.at < 10 * 60000 && saved.sec !== undefined ? saved.sec % len : null;
  }

  function startFile() {
    const pos = savedPos(fileLoop);
    fileSrc = ctx.createBufferSource();
    fileSrc.buffer = fileBuf;
    fileSrc.loop = true;
    fileSrc.loopStart = PAD;
    fileSrc.loopEnd = PAD + fileLoop;
    const g = ctx.createGain(); g.gain.value = FILE_GAIN;
    fileSrc.connect(g); g.connect(vol);
    fileStartT = ctx.currentTime + .05;
    fileStartPos = pos || 0;
    fileSrc.start(fileStartT, PAD + fileStartPos);
    fade(1, pos !== null ? 1 : 2.5);
  }
  function startSynth() {
    const saved = TK.store.get(SAVE_PREFIX + songName, null);
    const resume = saved && Date.now() - saved.at < 10 * 60000 && saved.step !== undefined;
    step = resume ? saved.step % song.len : 0;
    nextT = ctx.currentTime + .1;
    fade(song.volume / .24, resume ? 1 : 2.5);
    tick();
    timer = setInterval(tick, 30);
  }
  function start() {
    if (playing || !enabled || !S.music || document.hidden) return;
    if (!init()) return;
    playing = true;
    if (useFile === false) return startSynth();
    if (fileBuf) return startFile();
    // first start on this page: decode the recording, or fall back to the synth if there is none
    loadFile()
      .then(b => new Promise((res, rej) => ctx.decodeAudioData(b.slice(0), res, rej)))
      .then(buf => { fileBuf = buf; fileLoop = loopSeconds(songName); useFile = true; if (playing && !fileSrc) startFile(); })
      .catch(() => { useFile = false; if (playing) startSynth(); });
  }
  function position() { return fileSrc ? (fileStartPos + Math.max(0, ctx.currentTime - fileStartT)) % fileLoop : 0; }
  function stop() {
    if (!playing) return;
    save();
    playing = false;
    clearInterval(timer);
    fade(0.0001, .3);
    if (fileSrc) { const s = fileSrc; fileSrc = null; s.stop(ctx.currentTime + .35); }
  }
  function save() {
    if (!playing) return;
    TK.store.set(SAVE_PREFIX + songName, fileSrc ? { sec: position(), at: Date.now() } : { step, at: Date.now() });
  }
  // Quieter while the voice speaks, so children can hear it clearly.
  function duck(secs) {
    if (!playing) return;
    const t = ctx.currentTime, d = secs || 1.2;
    vol.gain.cancelScheduledValues(t);
    vol.gain.setValueAtTime(vol.gain.value, t);
    vol.gain.linearRampToValueAtTime(.3, t + .08);
    vol.gain.setValueAtTime(.3, t + d + .1);
    vol.gain.linearRampToValueAtTime(1, t + d + .8);
  }
  // Browsers only allow sound after a tap or key press, so every tap also wakes the audio up.
  function wake() { if (S.music && TK.audio()) start(); }

  document.addEventListener('DOMContentLoaded', () => {
    const want = document.body.dataset.music;
    enabled = want !== undefined;
    if (!enabled) return;
    songName = SONGS[want] ? (want === 'happy' ? 'home' : want) : 'home';
    song = SONGS[songName];
    loadFile().catch(() => { useFile = false; }); // start downloading the recording straight away
    document.addEventListener('pointerdown', wake);
    document.addEventListener('keydown', wake);
  });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  document.addEventListener('tk-settings', e => { if (e.detail === 'music') { if (S.music) start(); else stop(); } });

  window.TKMusic = { start, stop, duck, get playing() { return playing; }, get song() { return songName; }, get step() { return step; }, get source() { return useFile ? 'file' : useFile === false ? 'synth' : 'loading'; }, get position() { return fileSrc ? position() : null; }, SONGS };
})();
