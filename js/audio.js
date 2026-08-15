// =============================================================
// MonsterQuest — procedural chiptune music + SFX (WebAudio)
// No audio files: everything is synthesized square/triangle/noise.
// =============================================================
"use strict";

const Sound = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  enabled: true,          // sound master switch (persisted by game.js)
  currentSong: null,
  songTimer: null,
  songTime: 0,
  noiseBuf: null,

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.55;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.master);
      // pre-render a noise buffer for percussion / hit effects
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      if (this.pendingSong) this.playSong(this.pendingSong);
    } catch (e) { /* audio unavailable — play silently */ }
  },

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.stopSong();
    else if (this.pendingSong) this.playSong(this.pendingSong);
  },

  // ---- low-level helpers ---------------------------------------
  freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); },

  tone(midi, t0, dur, wave, vol, dest, slide) {
    const o = this.ctx.createOscillator();
    o.type = wave;
    o.frequency.setValueAtTime(this.freq(midi), t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, this.freq(midi + slide)), t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.setValueAtTime(vol, t0 + Math.max(0.01, dur - 0.03));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(dest);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  },

  noise(t0, dur, vol, dest, hp) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = hp ? "highpass" : "lowpass";
    f.frequency.value = hp ? 4000 : 900;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f).connect(g).connect(dest);
    s.start(t0);
    s.stop(t0 + dur);
  },

  // ---- SFX ------------------------------------------------------
  sfx(name) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const D = this.sfxGain;
    switch (name) {
      case "blip":    this.tone(88, t, 0.05, "square", 0.12, D); break;
      case "confirm": this.tone(84, t, 0.05, "square", 0.14, D); this.tone(91, t + 0.05, 0.08, "square", 0.14, D); break;
      case "cancel":  this.tone(70, t, 0.08, "square", 0.13, D, -5); break;
      case "hit":     this.noise(t, 0.16, 0.35, D); this.tone(45, t, 0.12, "square", 0.16, D, -10); break;
      case "hit2":    this.noise(t, 0.2, 0.4, D); this.tone(38, t, 0.16, "square", 0.18, D, -12); break;
      case "faint":   this.tone(60, t, 0.5, "square", 0.16, D, -24); this.noise(t + 0.1, 0.3, 0.2, D); break;
      case "heal":    [76, 80, 83, 88].forEach((n, i) => this.tone(n, t + i * 0.08, 0.1, "square", 0.12, D)); break;
      case "levelup": [72, 76, 79, 84, 88].forEach((n, i) => this.tone(n, t + i * 0.06, 0.1, "square", 0.13, D)); break;
      case "throw":   this.tone(70, t, 0.2, "square", 0.13, D, 12); break;
      case "shake":   this.tone(50, t, 0.09, "square", 0.15, D); break;
      case "catch":   [67, 72, 76, 79].forEach((n, i) => this.tone(n, t + i * 0.1, 0.14, "square", 0.14, D));
                      this.tone(84, t + 0.4, 0.3, "square", 0.13, D); break;
      case "run":     this.noise(t, 0.25, 0.25, D, true); break;
      case "money":   this.tone(88, t, 0.06, "square", 0.13, D); this.tone(93, t + 0.07, 0.1, "square", 0.13, D); break;
      case "warp":    this.tone(60, t, 0.18, "triangle", 0.2, D, 12); break;
      case "hack":    [90, 82, 94, 78, 96].forEach((n, i) => this.tone(n, t + i * 0.04, 0.05, "square", 0.1, D)); break;
    }
  },

  // ---- music sequencer ------------------------------------------
  // Songs: {bpm, loop:true, tracks:[{wave, vol, octave, notes:[[deg|"-", beats], ...]}]}
  // Notes are semitone offsets from C (60 = middle C at octave 0); "-" = rest.
  stopSong() {
    this.currentSong = null;
    if (this.songTimer) { clearTimeout(this.songTimer); this.songTimer = null; }
  },

  playSong(name) {
    this.pendingSong = name;
    if (!this.ctx || !this.enabled) return;
    if (this.currentSong === name) return;
    this.stopSong();
    const song = SONGS[name];
    if (!song) return;
    this.currentSong = name;
    const beat = 60 / song.bpm;
    // expand tracks to absolute schedules
    const tracks = song.tracks.map((tr) => {
      const events = [];
      let pos = 0;
      for (const [n, len] of tr.notes) {
        if (n !== "-") events.push([pos * beat, n + 60 + (tr.octave || 0) * 12, len * beat * 0.92]);
        pos += len;
      }
      return { tr, events, total: pos * beat };
    });
    const loopLen = Math.max(...tracks.map((t) => t.total));
    let loopStart = this.ctx.currentTime + 0.06;
    const scheduleLoop = () => {
      if (this.currentSong !== name) return;
      for (const { tr, events } of tracks) {
        for (const [off, midi, dur] of events) {
          if (tr.wave === "noise") this.noise(loopStart + off, Math.min(dur, 0.09), tr.vol, this.musicGain, true);
          else this.tone(midi, loopStart + off, dur, tr.wave, tr.vol, this.musicGain);
        }
      }
      loopStart += loopLen;
      if (song.loop === false) { this.currentSong = null; return; }
      const wait = (loopStart - this.ctx.currentTime - 0.3) * 1000;
      this.songTimer = setTimeout(scheduleLoop, Math.max(20, wait));
    };
    scheduleLoop();
  },

  jingle(name, thenSong) {
    if (!this.ctx || !this.enabled) { this.pendingSong = thenSong || this.pendingSong; return; }
    this.stopSong();
    this.playSong(name);
    const song = SONGS[name];
    const beat = 60 / song.bpm;
    const len = Math.max(...song.tracks.map((t) => t.notes.reduce((s, n) => s + n[1], 0))) * beat;
    setTimeout(() => {
      if (!this.currentSong && thenSong) this.playSong(thenSong);
    }, len * 1000 + 200);
  },
};

// ---- tunes ------------------------------------------------------
// Original 8-bit style loops. Degrees are semitones from C.
const SONGS = {
  title: {
    bpm: 112, loop: true,
    tracks: [
      { wave: "square", vol: 0.1, octave: 1, notes: [
        [0, 1], [4, 1], [7, 1], [12, 1.5], [11, 0.5], [7, 1], [4, 1], [0, 2],
        [-3, 1], [0, 1], [5, 1], [9, 1.5], [7, 0.5], [5, 1], [0, 1], ["-", 2],
        [0, 1], [4, 1], [7, 1], [12, 1.5], [14, 0.5], [16, 1], [12, 1], [7, 2],
        [9, 1], [7, 1], [5, 1], [4, 1.5], [2, 0.5], [0, 3], ["-", 1],
      ]},
      { wave: "triangle", vol: 0.14, octave: -1, notes: [
        [0, 2], [7, 2], [0, 2], [7, 2], [-7, 2], [0, 2], [-7, 2], [0, 2],
        [0, 2], [7, 2], [0, 2], [7, 2], [5, 2], [4, 2], [2, 2], [0, 2],
      ]},
    ],
  },
  town: {
    bpm: 104, loop: true,
    tracks: [
      { wave: "square", vol: 0.08, octave: 1, notes: [
        [4, 1], [7, 1], [9, 1], [7, 1], [4, 1.5], [0, 0.5], [2, 1], [4, 1],
        [5, 1], [4, 1], [2, 1], [0, 1], [2, 3], ["-", 1],
        [4, 1], [7, 1], [9, 1], [12, 1], [11, 1.5], [7, 0.5], [9, 1], [11, 1],
        [12, 1], [11, 1], [9, 1], [7, 1], [4, 3], ["-", 1],
      ]},
      { wave: "triangle", vol: 0.13, octave: -1, notes: [
        [0, 2], [4, 2], [7, 2], [4, 2], [-5, 2], [-1, 2], [2, 2], [-1, 2],
        [0, 2], [4, 2], [7, 2], [4, 2], [5, 2], [7, 2], [0, 4],
      ]},
    ],
  },
  route: {
    bpm: 128, loop: true,
    tracks: [
      { wave: "square", vol: 0.09, octave: 1, notes: [
        [0, 0.5], [0, 0.5], [4, 1], [7, 1], [9, 0.5], [7, 0.5], [4, 1], [7, 1.5], [4, 0.5], [2, 1],
        [0, 0.5], [0, 0.5], [4, 1], [7, 1], [12, 0.5], [11, 0.5], [9, 1], [7, 2],
        [5, 0.5], [5, 0.5], [9, 1], [12, 1], [14, 0.5], [12, 0.5], [9, 1], [12, 1.5], [9, 0.5], [7, 1],
        [4, 0.5], [4, 0.5], [7, 1], [11, 1], [12, 2], [7, 2],
      ]},
      { wave: "triangle", vol: 0.13, octave: -1, notes: [
        [0, 1], [7, 1], [0, 1], [7, 1], [0, 1], [7, 1], [0, 1], [7, 1],
        [0, 1], [7, 1], [0, 1], [7, 1], [-3, 1], [4, 1], [-3, 1], [4, 1],
        [5, 1], [12, 1], [5, 1], [12, 1], [5, 1], [12, 1], [5, 1], [12, 1],
        [4, 1], [11, 1], [4, 1], [11, 1], [0, 1], [7, 1], [0, 1], [7, 1],
      ]},
      { wave: "noise", vol: 0.05, notes: [
        ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5],
        ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], [0, 0.5], [0, 0.5],
        ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5],
        ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], [0, 0.5], [0, 0.5],
      ]},
    ],
  },
  battle: {
    bpm: 150, loop: true,
    tracks: [
      { wave: "square", vol: 0.09, octave: 1, notes: [
        [0, 0.5], [0, 0.5], [3, 0.5], [0, 0.5], [5, 0.5], [3, 0.5], [0, 1],
        [-2, 0.5], [-2, 0.5], [2, 0.5], [-2, 0.5], [3, 0.5], [2, 0.5], [-2, 1],
        [0, 0.5], [3, 0.5], [7, 0.5], [10, 0.5], [12, 1], [10, 0.5], [7, 0.5],
        [8, 0.5], [7, 0.5], [5, 0.5], [3, 0.5], [2, 1], [3, 0.5], [5, 0.5],
      ]},
      { wave: "square", vol: 0.07, octave: 0, notes: [
        [-12, 0.5], [-12, 0.5], [-9, 0.5], [-12, 0.5], [-7, 0.5], [-9, 0.5], [-12, 1],
        [-14, 0.5], [-14, 0.5], [-10, 0.5], [-14, 0.5], [-9, 0.5], [-10, 0.5], [-14, 1],
        [-12, 1], [-9, 1], [-5, 1], [-2, 1],
        [-4, 1], [-5, 1], [-7, 1], [-9, 1],
      ]},
      { wave: "noise", vol: 0.06, notes: [
        [0, 0.5], ["-", 0.5], [0, 0.25], [0, 0.25], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5],
        [0, 0.5], ["-", 0.5], [0, 0.25], [0, 0.25], ["-", 0.5], [0, 0.5], ["-", 0.5], [0, 0.5], ["-", 0.5],
      ]},
    ],
  },
  cave: {
    bpm: 92, loop: true,
    tracks: [
      { wave: "triangle", vol: 0.12, octave: 0, notes: [
        [0, 1.5], [3, 0.5], [2, 2], [-2, 1.5], [0, 0.5], [-4, 2],
        [-5, 1.5], [-2, 0.5], [0, 2], [3, 1.5], [2, 0.5], [0, 2],
      ]},
      { wave: "triangle", vol: 0.1, octave: -2, notes: [
        [0, 4], [-2, 4], [-5, 4], [-7, 4],
      ]},
    ],
  },
  danger: {
    bpm: 140, loop: true,
    tracks: [
      { wave: "square", vol: 0.08, octave: 0, notes: [
        [0, 0.5], [1, 0.5], [0, 0.5], [1, 0.5], [3, 0.5], [1, 0.5], [0, 1],
        [-2, 0.5], [-1, 0.5], [-2, 0.5], [-1, 0.5], [1, 0.5], [-1, 0.5], [-2, 1],
        [6, 0.5], [7, 0.5], [6, 0.5], [7, 0.5], [9, 0.5], [7, 0.5], [6, 1],
        [5, 1], [3, 1], [1, 1], [0, 1],
      ]},
      { wave: "triangle", vol: 0.13, octave: -1, notes: [
        [0, 0.5], [0, 0.5], [-1, 0.5], [-1, 0.5], [0, 0.5], [0, 0.5], [-1, 0.5], [-1, 0.5],
        [0, 0.5], [0, 0.5], [-1, 0.5], [-1, 0.5], [3, 0.5], [3, 0.5], [1, 0.5], [1, 0.5],
      ]},
      { wave: "noise", vol: 0.06, notes: [
        [0, 0.25], ["-", 0.75], [0, 0.25], ["-", 0.75], [0, 0.25], ["-", 0.25], [0, 0.25], ["-", 0.25],
      ]},
    ],
  },
  league: {
    bpm: 120, loop: true,
    tracks: [
      { wave: "square", vol: 0.09, octave: 1, notes: [
        [0, 1], [-1, 0.5], [0, 0.5], [4, 1], [0, 1], [7, 1.5], [4, 0.5], [0, 1], [4, 1],
        [5, 1], [4, 0.5], [2, 0.5], [4, 1], [5, 1], [7, 2], [11, 1], [12, 1],
      ]},
      { wave: "triangle", vol: 0.14, octave: -1, notes: [
        [0, 1], [0, 1], [4, 1], [4, 1], [5, 1], [5, 1], [7, 1], [7, 1],
        [5, 1], [5, 1], [7, 1], [7, 1], [0, 2], [7, 2],
      ]},
    ],
  },
  victory: {
    bpm: 140, loop: false,
    tracks: [
      { wave: "square", vol: 0.11, octave: 1, notes: [
        [0, 0.5], [0, 0.5], [0, 0.5], [0, 1], [-4, 1], [0, 1], [4, 1.5], [0, 0.5], [4, 2],
      ]},
      { wave: "triangle", vol: 0.13, octave: -1, notes: [
        [0, 0.5], [0, 0.5], [0, 0.5], [0, 1], [-9, 1], [-5, 1], [0, 1.5], [-5, 0.5], [0, 2],
      ]},
    ],
  },
  fame: {
    bpm: 96, loop: true,
    tracks: [
      { wave: "square", vol: 0.09, octave: 1, notes: [
        [0, 1], [4, 1], [7, 1], [12, 2], [11, 1], [12, 2],
        [14, 1], [12, 1], [11, 1], [7, 2], [9, 1], [7, 2], ["-", 1],
      ]},
      { wave: "triangle", vol: 0.13, octave: -1, notes: [
        [0, 2], [7, 2], [5, 2], [7, 2], [2, 2], [7, 2], [0, 2], ["-", 2],
      ]},
    ],
  },
};
