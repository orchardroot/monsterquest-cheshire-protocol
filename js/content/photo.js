// =============================================================
// MonsterQuest v2 — MQ.Photo (content-activities)
// Sighting mode: freeze, raise the viewfinder, frame whatever is out
// there and press the shutter. Nothing is caught, nothing is hurt, and
// the Dex fills up with *seen* entries and a habitat note.
// SIDE-CONTENT §2.7, SYSTEMS-SPEC §16.
//
// Photos are stored as seeds — {sp, pose, phase, weather, score} — not
// pixels, so a save with four hundred photographs in it is still small.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const P = MQ.Photo || {};
  function A() { return MQ.Activities; }

  P.MAX_RECORDS = 400;
  P.POSES = ["still", "feeding", "calling", "grooming", "startled", "posing", "asleep", "mid-leap"];
  P.POSE_BONUS = { posing: 60, "mid-leap": 45, calling: 30, feeding: 20, grooming: 20, startled: 10, still: 0, asleep: 25 };

  P.state = { records: [], landmarks: {}, secrets: {}, shots: 0, film: 0 };

  // ---- the album's fixed targets ---------------------------------
  // 20 landmarks: shoot them from the map they live on.
  P.LANDMARKS = [
    { id: "lm_white_nancy", name: "White Nancy", map: "kerridge_hill", alt: "bollington" },
    { id: "lm_silk_museum", name: "The Silk Museum", map: "macclesfield" },
    { id: "lm_hovis_mill", name: "Hovis Mill", map: "macclesfield" },
    { id: "lm_teggs_nose", name: "Tegg's Nose quarry face", map: "teggs_nose" },
    { id: "lm_lyme_cage", name: "The Cage at Lyme", map: "lyme_park" },
    { id: "lm_quarry_bank", name: "Quarry Bank waterwheel", map: "styal" },
    { id: "lm_wizards_well", name: "The Wizard's Well", map: "alderley_edge" },
    { id: "lm_lindow_pool", name: "The pool on Lindow Moss", map: "lindow_moss" },
    { id: "lm_tatton_deer", name: "The Tatton deer herd", map: "tatton_park" },
    { id: "lm_gaskell_rooms", name: "Gaskell's rooms", map: "knutsford" },
    { id: "lm_jodrell_dish", name: "The Lovell dish", map: "jodrell_bank" },
    { id: "lm_bear_stone", name: "The Bear of Congleton", map: "congleton" },
    { id: "lm_saxon_crosses", name: "The Saxon crosses", map: "sandbach" },
    { id: "lm_crewe_panel", name: "The Crewe panel", map: "crewe" },
    { id: "lm_nantwich_lido", name: "The brine lido", map: "nantwich" },
    { id: "lm_lion_salt", name: "The Lion Salt Works", map: "northwich" },
    { id: "lm_boat_lift", name: "The Anderton Boat Lift", map: "anderton" },
    { id: "lm_beeston_crag", name: "Beeston crag", map: "beeston" },
    { id: "lm_frodsham_beacon", name: "The Frodsham beacon", map: "frodsham" },
    { id: "lm_eastgate_clock", name: "The Eastgate Clock", map: "chester" }
  ];
  // 5 secret shots: the right creature, the right place, the right hour.
  P.SECRETS = [
    { id: "sec_vex_eastgate", name: "VEX at the Eastgate, midnight", map: "chester", phase: "night", flag: "vex_name_revealed",
      line: "She is looking up at the clock, and she does not know you are there." },
    { id: "sec_grinmalkin_brine", name: "GRINMALKIN in the brine", species: "grinmalkin",
      line: "A grin in the salt water. Then only salt water." },
    { id: "sec_merlynx_press", name: "MERLYNX on the elm press", species: "merlynx", map: "y_berllan",
      line: "It has been sat there the whole time." },
    { id: "sec_glitchra_dish", name: "GLITCHRA over the dish", species: "glitchra", phase: "night",
      line: "The dish is pointed at nothing. Something is pointed back." },
    { id: "sec_cats_kerridge", name: "Both cats on Kerridge", map: "kerridge_hill", cats: true,
      line: "Meadow ahead, Bigboy sat down. The whole county behind them." }
  ];

  P.unlocked = function () { return !!A().flag("photo_mode"); };

  // ---- habitat notes -----------------------------------------------
  P.HABITAT_NOTES = {
    silk: "Prefers weave sheds and lamp-warmed corners.",
    salt: "Lives in the brine, and tastes of it.",
    rail: "Nests in ballast and cable troughing.",
    forest: "Keeps to the crown of the wood.",
    water: "Canal, mere, or the shallow end of the Weaver.",
    cave: "Underground, and unhurried about it.",
    urban: "Bins, gutters and the backs of pubs.",
    moor: "High ground. Wind is not a problem for it.",
    cyber: "Present without being anywhere in particular.",
    orchard: "Where fruit falls and stays fallen.",
    marsh: "Wet ground, and it wants it wetter.",
    town: "Domestic. Semi-domestic. Argumentative.",
    brine: "Brine-side. Never far from a wellhead.",
    industrial: "Warm pipework and standing plant."
  };
  P.habitatNote = function (species) {
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[species] : null;
    const h = sp && sp.habitat;
    return (h && P.HABITAT_NOTES[h]) || "Seen, noted, not disturbed.";
  };

  // ---- who is out there --------------------------------------------
  P.subjectsFor = function (mapId, x, y) {
    const rows = [];
    const map = MQ.World && MQ.World.has(mapId) ? MQ.World.get(mapId) : null;
    if (!map) return rows;
    if (MQ.Encounters && MQ.Encounters.preview && x !== undefined) {
      let pv = null;
      try { pv = MQ.Encounters.preview(map, x, y); } catch (e) { pv = null; }
      if (pv && pv.rows) for (let i = 0; i < pv.rows.length; i++) rows.push(pv.rows[i]);
    }
    if (!rows.length && map.encounters) {
      const zones = Object.keys(map.encounters);
      for (let z = 0; z < zones.length; z++) {
        const id = map.encounters[zones[z]];
        const tbl = id && MQ.Data.encounters ? MQ.Data.encounters[id] : null;
        if (!tbl) continue;
        for (let i = 0; i < tbl.table.length; i++) rows.push({ species: tbl.table[i].species, w: tbl.table[i].w || 10 });
      }
    }
    return rows;
  };

  // Build the little cast of the shot: one to three creatures at
  // different distances, drifting, each with a pose.
  P.makeSubjects = function (rows, rnd) {
    const out = [];
    if (!rows.length) return out;
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const row = rows[Math.floor(rnd() * rows.length)];
      const pose = P.POSES[Math.floor(rnd() * P.POSES.length)];
      out.push({
        species: row.species,
        x: 0.15 + rnd() * 0.7, y: 0.30 + rnd() * 0.45,
        z: 0.35 + rnd() * 0.65,                 // 1 = right in front of you
        vx: (rnd() - 0.5) * 0.00006, vy: (rnd() - 0.5) * 0.00003,
        pose: pose, t: rnd() * 6000, shy: 0.4 + rnd() * 0.6
      });
    }
    return out;
  };

  // ---- scoring -------------------------------------------------------
  // Centring, size, rarity, band of the day, and whether it was posing.
  P.score = function (subject, frame, phase) {
    const dx = (subject.x - frame.x) / Math.max(0.05, frame.w / 2);
    const dy = (subject.y - frame.y) / Math.max(0.05, frame.h / 2);
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return null;   // not in the frame at all
    const off = Math.min(1, Math.sqrt(dx * dx + dy * dy));
    const centring = Math.round((1 - off) * 220);
    const fill = Math.round(U.clamp(subject.z * (0.42 / Math.max(0.12, frame.w)), 0, 1.6) * 90);
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[subject.species] : null;
    const rarity = sp && sp.rarity === "legendary" ? 300 : sp && sp.rarity === "rare" ? 150 : sp && sp.rarity === "uncommon" ? 60 : 20;
    const band = phase === "night" ? 60 : phase === "dawn" || phase === "dusk" ? 35 : 0;
    const pose = P.POSE_BONUS[subject.pose] || 0;
    const total = centring + fill + rarity + band + pose;
    return {
      total: Math.max(1, Math.round(total)),
      centring: centring, fill: fill, rarity: rarity, band: band, pose: pose,
      grade: total > 520 ? "A" : total > 400 ? "B" : total > 280 ? "C" : "D"
    };
  };

  // ---- taking the shot -------------------------------------------------
  P.shoot = function (subject, score, ctx) {
    const a = A();
    ctx = ctx || {};
    const rec = {
      sp: subject.species, pose: subject.pose,
      phase: ctx.phase || a.phase(),
      weather: ctx.weather || "clear",
      score: score.total, grade: score.grade,
      map: ctx.map || null, ts: a.now()
    };
    P.state.records.unshift(rec);
    if (P.state.records.length > P.MAX_RECORDS) P.state.records.length = P.MAX_RECORDS;
    P.state.shots++;
    if (MQ.Trainer && MQ.Trainer.see) {
      MQ.Trainer.see(subject.species, { map: rec.map, how: "photo", note: P.habitatNote(subject.species) });
    }
    a.sfx("camera_shutter");
    // MQ.Quests owns the `photos` trainer stat off this event; count it
    // ourselves only when the quest engine is not there to do it.
    a.emit("photo", { species: subject.species, score: score.total, grade: score.grade, map: rec.map, pose: subject.pose });
    if (!MQ.Quests) a.bump("photos", 1);
    P.checkSecrets(subject, rec);
    return rec;
  };
  P.shootLandmark = function (id, mapId) {
    const a = A();
    let lm = null;
    for (let i = 0; i < P.LANDMARKS.length; i++) if (P.LANDMARKS[i].id === id) lm = P.LANDMARKS[i];
    if (!lm) return null;
    if (P.state.landmarks[id]) return { already: true, landmark: lm };
    P.state.landmarks[id] = a.now();
    P.state.shots++;
    a.sfx("camera_shutter");
    a.emit("photo", { landmark: id, map: mapId });
    if (!MQ.Quests) a.bump("photos", 1);
    return { landmark: lm, first: true };
  };
  P.landmarkOn = function (mapId) {
    for (let i = 0; i < P.LANDMARKS.length; i++) {
      const l = P.LANDMARKS[i];
      if (l.map === mapId || l.alt === mapId) return l;
    }
    return null;
  };
  P.checkSecrets = function (subject, rec) {
    const a = A();
    for (let i = 0; i < P.SECRETS.length; i++) {
      const s = P.SECRETS[i];
      if (P.state.secrets[s.id]) continue;
      if (s.species && subject.species !== s.species) continue;
      if (s.map && rec.map !== s.map) continue;
      if (s.phase && rec.phase !== s.phase) continue;
      if (s.flag && !a.flag(s.flag)) continue;
      if (s.cats && !(MQ.Cats && MQ.Cats.unlocked && MQ.Cats.unlocked())) continue;
      if (!s.species && !s.cats) continue;    // pure-place secrets are shot by landmark
      P.state.secrets[s.id] = a.now();
      a.toast("Secret shot: " + s.name);
      a.emit("photo:secret", { id: s.id, name: s.name });
    }
  };

  // ---- the album --------------------------------------------------------
  P.records = P.state.records;      // kept in sync by the provider below
  P.album = function () {
    const seen = {};
    for (let i = 0; i < P.state.records.length; i++) {
      const r = P.state.records[i];
      if (!seen[r.sp] || seen[r.sp].score < r.score) seen[r.sp] = r;
    }
    const speciesTotal = (MQ.Data && MQ.Data.count ? MQ.Data.count("species") : 0);
    return {
      species: Object.keys(seen).length, speciesTotal: speciesTotal,
      landmarks: Object.keys(P.state.landmarks).length, landmarksTotal: P.LANDMARKS.length,
      secrets: Object.keys(P.state.secrets).length, secretsTotal: P.SECRETS.length,
      shots: P.state.shots, best: P.bestOf(seen)
    };
  };
  P.bestOf = function (seen) {
    const ids = Object.keys(seen), out = [];
    for (let i = 0; i < ids.length; i++) out.push(seen[ids[i]]);
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 12);
  };
  P.bestFor = function (species) {
    let best = null;
    for (let i = 0; i < P.state.records.length; i++) {
      const r = P.state.records[i];
      if (r.sp === species && (!best || r.score > best.score)) best = r;
    }
    return best;
  };

  // ---- the scene ----------------------------------------------------------
  // Transparent, so the overworld keeps drawing underneath and the
  // viewfinder really is a viewfinder.
  P.scene = {
    id: "photo", transparent: true,
    enter: function (params) {
      const a = A();
      this.p = params || {};
      this.map = this.p.map || (MQ.Overworld && MQ.Overworld.state ? MQ.Overworld.state.map : null);
      this.rnd = a.rng(this.p.seed === undefined ? (Date.now() & 0xffffff) : this.p.seed);
      const rows = this.p.rows || P.subjectsFor(this.map, this.p.x, this.p.y);
      this.subjects = P.makeSubjects(rows, this.rnd);
      this.frame = { x: 0.5, y: 0.5, w: 0.34, h: 0.30 };
      this.landmark = P.landmarkOn(this.map);
      this.shots = this.p.film === undefined ? 6 : this.p.film;
      this.taken = [];
      this.msg = this.subjects.length ? "Something out there. Frame it." : "Nothing moving. Try the landmark.";
      this.flash = 0; this.busy = false; this.t = 0;
      if (MQ.Overworld && MQ.Overworld.freeze) MQ.Overworld.freeze(true);
      a.sfx("ui_open");
    },
    exit: function () {
      if (MQ.Overworld && MQ.Overworld.freeze) MQ.Overworld.freeze(false);
      A().sfx("ui_close");
    },
    update: function (dt) {
      const a = A(), I = MQ.Input;
      this.t += dt;
      if (this.flash > 0) this.flash -= dt;
      for (let i = 0; i < this.subjects.length; i++) {
        const s = this.subjects[i];
        s.t += dt;
        s.x = U.clamp(s.x + s.vx * dt, 0.06, 0.94);
        s.y = U.clamp(s.y + s.vy * dt, 0.22, 0.86);
        if (s.x <= 0.06 || s.x >= 0.94) s.vx = -s.vx;
        if (s.y <= 0.22 || s.y >= 0.86) s.vy = -s.vy;
      }
      if (a.backPressed()) { MQ.Scenes.pop(this.taken.length ? this.taken : null); return; }
      // pan: stick or drag; zoom: shoulder / up-down
      if (I) {
        const ax = I.axis();
        if (ax && ax.mag > 0.1) {
          this.frame.x = U.clamp(this.frame.x + ax.x * dt * 0.0009, 0.08, 0.92);
          this.frame.y = U.clamp(this.frame.y + ax.y * dt * 0.0009, 0.16, 0.90);
        }
        if (I.held("run")) this.zoom(-dt * 0.00018);
        if (I.pressed("select")) { I.consume("select"); this.zoom(0.06); }
      }
      const tp = a.anyTap();
      if (tp) {
        const m = a.m();
        const fx = tp.x / Math.max(1, m.w), fy = tp.y / Math.max(1, m.h);
        // tapping inside the frame is the shutter; tapping outside re-aims
        if (Math.abs(fx - this.frame.x) < this.frame.w / 2 && Math.abs(fy - this.frame.y) < this.frame.h / 2) { this.shutter(); return; }
        this.frame.x = U.clamp(fx, 0.08, 0.92);
        this.frame.y = U.clamp(fy, 0.16, 0.90);
        a.sfx("ui_move");
        return;
      }
      if (a.confirmPressed()) this.shutter();
    },
    zoom: function (d) {
      this.frame.w = U.clamp(this.frame.w + d, 0.12, 0.52);
      this.frame.h = this.frame.w * 0.88;
    },
    shutter: function () {
      const a = A();
      if (this.shots <= 0) { a.sfx("ui_error"); this.msg = "Out of film. There's only so much of it."; return; }
      this.shots--;
      this.flash = 180;
      const phase = a.phase();
      const weather = (MQ.Clock && MQ.Clock.weather) || "clear";
      let best = null, bestScore = null;
      for (let i = 0; i < this.subjects.length; i++) {
        const sc = P.score(this.subjects[i], this.frame, phase);
        if (sc && (!bestScore || sc.total > bestScore.total)) { best = this.subjects[i]; bestScore = sc; }
      }
      if (best) {
        const rec = P.shoot(best, bestScore, { map: this.map, phase: phase, weather: weather });
        this.taken.push(rec);
        this.msg = a.speciesName(best.species) + " — grade " + bestScore.grade + ", " + bestScore.total + ". " + P.habitatNote(best.species);
        // creatures do not sit for a second portrait
        best.vx *= 3.2; best.vy *= 3.2;
        if (this.rnd() < best.shy * 0.5) {
          const k = this.subjects.indexOf(best);
          if (k >= 0) this.subjects.splice(k, 1);
        }
      } else if (this.landmark) {
        const res = P.shootLandmark(this.landmark.id, this.map);
        this.msg = res && res.already ? this.landmark.name + " again. One is plenty." : this.landmark.name + " — in the album.";
        a.sfx("camera_shutter");
      } else {
        a.sfx("camera_shutter");
        this.msg = "A very good photograph of a hedge.";
      }
      if (this.shots <= 0 && !this.subjects.length) this.msg += " That's the roll.";
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      // darken everything outside the frame
      const fx = this.frame.x * m.w, fy = this.frame.y * m.h;
      const fw = this.frame.w * m.w, fh = this.frame.h * m.h;
      const x0 = fx - fw / 2, y0 = fy - fh / 2;
      ctx.fillStyle = "rgba(6,5,12,0.72)";
      ctx.fillRect(0, 0, m.w, y0);
      ctx.fillRect(0, y0 + fh, m.w, m.h - (y0 + fh));
      ctx.fillRect(0, y0, x0, fh);
      ctx.fillRect(x0 + fw, y0, m.w - (x0 + fw), fh);
      // the subjects (drawn everywhere; only what's in the frame counts)
      for (let i = 0; i < this.subjects.length; i++) {
        const s = this.subjects[i];
        const sx = s.x * m.w, sy = s.y * m.h;
        const scale = 1.1 + s.z * 2.2;
        const bob = Math.sin(s.t / 420) * 3 * s.z;
        if (MQ.MonsterArt && MQ.MonsterArt.draw && MQ.MonsterArt.has(s.species)) {
          MQ.MonsterArt.draw(ctx, s.species, "front", sx, sy + bob, scale * 0.5, { alpha: 0.45 + s.z * 0.55 });
        } else {
          ctx.fillStyle = "rgba(240,235,220," + (0.35 + s.z * 0.5) + ")";
          ctx.beginPath(); ctx.arc(sx, sy + bob, 10 + s.z * 16, 0, 6.3); ctx.fill();
        }
      }
      // the frame itself
      ctx.strokeStyle = this.flash > 0 ? "#ffffff" : C.brassLit;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0, y0, fw, fh);
      const corner = Math.min(22, fw / 5);
      ctx.strokeStyle = C.brass; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + corner); ctx.lineTo(x0, y0); ctx.lineTo(x0 + corner, y0);
      ctx.moveTo(x0 + fw - corner, y0); ctx.lineTo(x0 + fw, y0); ctx.lineTo(x0 + fw, y0 + corner);
      ctx.moveTo(x0, y0 + fh - corner); ctx.lineTo(x0, y0 + fh); ctx.lineTo(x0 + corner, y0 + fh);
      ctx.moveTo(x0 + fw - corner, y0 + fh); ctx.lineTo(x0 + fw, y0 + fh); ctx.lineTo(x0 + fw, y0 + fh - corner);
      ctx.stroke();
      // crosshair
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx - 10, fy); ctx.lineTo(fx + 10, fy);
      ctx.moveTo(fx, fy - 10); ctx.lineTo(fx, fy + 10);
      ctx.stroke();
      if (this.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (this.flash / 400) + ")"; ctx.fillRect(0, 0, m.w, m.h); }

      a.header(ctx, { title: "Sighting Mode", accent: "#f2d68a", sub: this.landmark ? this.landmark.name + " is in view" : "hold still", right: this.shots + " frames" });
      const top = a.headerBottom();
      a.panel(ctx, m.l, m.b - 74, m.cw, 44, { flat: true });
      a.text(ctx, this.msg, m.l + 12, m.b - 64, { size: "s", color: C.text, maxWidth: m.cw - 24 });
      a.text(ctx, "photos " + P.state.shots, m.r - 8, top + 4, { size: "s", align: "right", color: C.dim });
      a.footer(ctx, [{ btn: "a", label: "Shutter" }, { btn: "dir", label: "Aim" }, { btn: "select", label: "Zoom" }, { btn: "b", label: "Lower it" }]);
    }
  };

  // ---- public entry ---------------------------------------------------------
  P.start = function (params) {
    const a = A();
    params = params || {};
    if (!P.unlocked() && !params.force) {
      return a.say(["You have no camera, and no reason for one yet.", "(Sighting mode opens with the Casebook's fourth case.)"]);
    }
    const st = MQ.Overworld && MQ.Overworld.state ? MQ.Overworld.state : null;
    return a.open(P.scene, {
      map: params.map || (st && st.map) || null,
      x: params.x === undefined ? (st && st.tileX) : params.x,
      y: params.y === undefined ? (st && st.tileY) : params.y,
      seed: params.seed, film: params.film, rows: params.rows
    });
  };
  P.enter = P.start;
  P.open = P.start;

  A().provider(P, "photo", {
    save: function () {
      return { records: P.state.records, landmarks: P.state.landmarks, secrets: P.state.secrets, shots: P.state.shots };
    },
    load: function (o) {
      P.state.records.length = 0;
      P.state.landmarks = {}; P.state.secrets = {}; P.state.shots = 0;
      if (!o) return;
      const rec = o.records || [];
      for (let i = 0; i < rec.length; i++) P.state.records.push(rec[i]);
      P.state.landmarks = o.landmarks || {};
      P.state.secrets = o.secrets || {};
      P.state.shots = o.shots || 0;
    }
  });

  MQ.Photo = P;
})();
