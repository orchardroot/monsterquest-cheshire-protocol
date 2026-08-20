// =============================================================
// MonsterQuest v2 — MQ.NPC: overworld entities
// Behaviours: still / wander / path / look / follow.
// Trainer line-of-sight challenges, companion cats (MEADOW & BIGBOY)
// following the player on a breadcrumb trail, emote bubbles, and a
// procedural fallback sprite so the world is legible before art lands.
// Owned by: world workstream.  Consumers: MQ.Overworld, MQ.Interact.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const T = MQ.TILE;                       // 32 logical px

  const NPC = {};

  // ---- constants ---------------------------------------------------------
  NPC.SPEED = { walk: 2.6, amble: 1.8, brisk: 3.6, cat: 5.4, lumber: 3.2, run: 6.0 };  // tiles/s
  NPC.FRAMES = [0, 1, 0, 2];               // walk cycle
  NPC.SIGHT_DEFAULT = 4;
  const DIRS = ["down", "up", "left", "right"];
  const DIRV = U.dirVec;

  // ---- entity ------------------------------------------------------------
  // def per ENGINE-ARCHITECTURE §5.2 npcs[]:
  //   {id,x,y,dir,sprite,behaviour,path,radius,script,say,trainer,cond,once,...}
  NPC.create = function (def, mapId) {
    const e = {
      id: def.id || ("npc_" + U.uid()),
      def: def,
      map: mapId || def.map || null,
      sprite: def.sprite || "npc_walker",
      x: def.x | 0, y: def.y | 0,
      px: (def.x | 0) * T + T / 2, py: (def.y | 0) * T + T / 2,
      dir: def.dir || "down",
      behaviour: def.behaviour || (def.path ? "path" : "still"),
      home: { x: def.x | 0, y: def.y | 0 },
      radius: def.radius === undefined ? 3 : def.radius,
      path: def.path || null, pathIdx: 0, pathStep: 1, pathMode: def.pathMode || "loop",
      speed: NPC.SPEED[def.speed] || def.speed || NPC.SPEED.walk,
      script: def.script || null, say: def.say || null,
      trainer: def.trainer || null, shop: def.shop || null, kind: def.kind || null,
      cond: def.cond || null, once: def.once || null,
      sight: def.sight === undefined ? (def.trainer ? NPC.SIGHT_DEFAULT : 0) : def.sight,
      solid: def.solid !== false,
      hidden: false, active: true,
      moving: false, mx: 0, my: 0, mdx: 0, mdy: 0, moveT: 0, moveLen: 0,
      animT: 0, frame: 0, idleT: 0, waitT: U.randInt(200, 1400),
      emoteKind: null, emoteT: 0, emoteMs: 0,
      spotted: false, beaten: false, busy: false,
      follow: def.follow || null, trailOffset: def.trailOffset || 0,
      sitting: false, sitT: 0, bob: 0, cat: false, tag: def.tag || null,
      scriptCtl: null
    };
    return e;
  };

  NPC.reset = function (e) {
    e.x = e.home.x; e.y = e.home.y;
    e.px = e.x * T + T / 2; e.py = e.y * T + T / 2;
    e.moving = false; e.spotted = false; e.busy = false; e.sitting = false;
    e.dir = e.def.dir || "down";
  };

  // Visibility: `cond` is a flag expression, `once` a flag that removes the NPC.
  NPC.visible = function (e) {
    if (!e.active || e.hidden) return false;
    if (e.once && MQ.Flags.get(e.once)) return false;
    if (e.cond && !MQ.Flags.test(e.cond)) return false;
    return true;
  };

  NPC.beatenFlag = function (e) { return e.trainer ? "beat_" + e.trainer : null; };
  NPC.isBeaten = function (e) { return !!(e.trainer && MQ.Flags.get("beat_" + e.trainer)); };

  // ---- movement ----------------------------------------------------------
  NPC.face = function (e, dir) { if (dir && DIRS.indexOf(dir) >= 0) e.dir = dir; };
  NPC.faceTowards = function (e, x, y) {
    const dx = x - e.x, dy = y - e.y;
    e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    return e.dir;
  };

  // Begin a one-tile step. `can(x,y)` decides passability (supplied by Overworld).
  NPC.step = function (e, dir, can, speed) {
    if (e.moving || e.sitting) return false;
    const v = DIRV[dir];
    if (!v) return false;
    const nx = e.x + v[0], ny = e.y + v[1];
    e.dir = dir;
    if (can && !can(nx, ny, e)) return false;
    e.mdx = v[0]; e.mdy = v[1];
    e.mx = nx; e.my = ny;
    e.moveT = 0;
    e.moveLen = T / ((speed || e.speed) * T) * 1000;   // ms for one tile
    e.moving = true;
    e.x = nx; e.y = ny;                                 // occupy immediately (no two NPCs in a tile)
    return true;
  };

  function advance(e, dt) {
    if (!e.moving) return;
    e.moveT += dt;
    const k = Math.min(1, e.moveT / e.moveLen);
    const fromX = (e.x - e.mdx) * T + T / 2, fromY = (e.y - e.mdy) * T + T / 2;
    e.px = fromX + e.mdx * T * k;
    e.py = fromY + e.mdy * T * k;
    e.animT += dt;
    e.frame = NPC.FRAMES[Math.floor(e.animT / 130) % 4];
    if (k >= 1) {
      e.moving = false;
      e.px = e.x * T + T / 2; e.py = e.y * T + T / 2;
      e.waitT = 0;
    }
  }
  NPC.advance = advance;

  // ---- behaviours --------------------------------------------------------
  // world = {map, player, can(x,y,e), occupied(x,y,e), frozen}
  NPC.update = function (e, dt, world) {
    if (!NPC.visible(e)) return;
    if (e.emoteT < e.emoteMs) e.emoteT += dt;
    if (e.moving) { advance(e, dt); return; }
    e.idleT += dt;
    if (e.busy || world.frozen) { e.frame = 0; return; }
    if (e.sitting) { e.sitT += dt; e.bob = Math.sin(e.sitT / 600) * 0.6; return; }
    e.frame = 0;
    switch (e.behaviour) {
      case "wander": wander(e, dt, world); break;
      case "path": patrol(e, dt, world); break;
      case "look": lookAbout(e, dt, world); break;
      case "follow": break;                 // driven by NPC.updateFollowers
      default: idleStill(e, dt, world);
    }
  };

  function idleStill(e, dt, world) {
    // a still NPC still turns to face a player who walks right up to them
    const p = world.player;
    if (!p) return;
    const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y);
    if (d === 1 && e.def.turnToPlayer !== false) NPC.faceTowards(e, p.x, p.y);
  }

  function wander(e, dt, world) {
    e.waitT -= dt;
    if (e.waitT > 0) return;
    e.waitT = U.randInt(700, 2600);
    if (Math.random() < 0.25) { e.dir = U.pick(DIRS); return; }   // just look around
    const dir = U.pick(DIRS);
    const v = DIRV[dir];
    const nx = e.x + v[0], ny = e.y + v[1];
    if (e.radius >= 0 && (Math.abs(nx - e.home.x) > e.radius || Math.abs(ny - e.home.y) > e.radius)) { e.dir = dir; return; }
    NPC.step(e, dir, world.can);
  }

  function patrol(e, dt, world) {
    if (!e.path || !e.path.length) return;
    e.waitT -= dt;
    if (e.waitT > 0) return;
    const wp = e.path[e.pathIdx];
    const tx = wp[0] !== undefined ? wp[0] : wp.x, ty = wp[1] !== undefined ? wp[1] : wp.y;
    if (e.x === tx && e.y === ty) {
      // reached the waypoint: pause, then aim at the next
      e.waitT = e.def.pathPause === undefined ? 300 : e.def.pathPause;
      if (e.pathMode === "pingpong") {
        if (e.pathIdx + e.pathStep >= e.path.length || e.pathIdx + e.pathStep < 0) e.pathStep = -e.pathStep;
        e.pathIdx += e.pathStep;
      } else e.pathIdx = (e.pathIdx + 1) % e.path.length;
      return;
    }
    const dx = tx - e.x, dy = ty - e.y;
    let dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    if (!NPC.step(e, dir, world.can)) {
      // blocked (often by the player): try the other axis, else wait a beat
      const alt = Math.abs(dx) > Math.abs(dy) ? (dy < 0 ? "up" : dy > 0 ? "down" : null) : (dx < 0 ? "left" : dx > 0 ? "right" : null);
      if (!alt || !NPC.step(e, alt, world.can)) e.waitT = 400;
    }
  }

  function lookAbout(e, dt, world) {
    const p = world.player;
    if (p) {
      const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y);
      if (d <= (e.radius || 3)) { NPC.faceTowards(e, p.x, p.y); e.waitT = 1200; return; }
    }
    e.waitT -= dt;
    if (e.waitT > 0) return;
    e.waitT = U.randInt(1200, 3200);
    e.dir = U.pick(DIRS);
  }

  // ---- emotes ------------------------------------------------------------
  NPC.emote = function (e, kind, ms) { e.emoteKind = kind; e.emoteT = 0; e.emoteMs = ms || 900; };
  NPC.emoting = function (e) { return e.emoteKind && e.emoteT < e.emoteMs; };

  // ---- trainer line of sight ---------------------------------------------
  // Returns the distance to the player (1..sight) when spotted, else 0.
  NPC.sightCheck = function (e, player, blocked) {
    if (!e.trainer || e.spotted || e.busy || !e.sight) return 0;
    if (NPC.isBeaten(e) || !NPC.visible(e)) return 0;
    if (e.moving) return 0;
    const v = DIRV[e.dir];
    if (!v) return 0;
    for (let i = 1; i <= e.sight; i++) {
      const x = e.x + v[0] * i, y = e.y + v[1] * i;
      if (player.x === x && player.y === y) return i;
      if (blocked && blocked(x, y)) return 0;
    }
    return 0;
  };

  // ---- followers (companion cats) ----------------------------------------
  // A ring buffer of the player's recent positions; each follower samples the
  // trail at a fixed arc-length behind, which reads as a proper trailing walk
  // at any speed without pathfinding. No allocation after construction.
  const TRAIL_CAP = 256;
  const Trail = {
    x: new Float32Array(TRAIL_CAP), y: new Float32Array(TRAIL_CAP),
    d: new Uint8Array(TRAIL_CAP), len: new Float32Array(TRAIL_CAP),
    head: 0, count: 0
  };
  NPC.Trail = Trail;
  const DIRN = { down: 0, up: 1, left: 2, right: 3 };

  NPC.trailReset = function (px, py, dir) {
    Trail.head = 0; Trail.count = 1;
    Trail.x[0] = px; Trail.y[0] = py; Trail.d[0] = DIRN[dir] || 0; Trail.len[0] = 0;
  };
  NPC.trailPush = function (px, py, dir) {
    const h = Trail.head;
    const dx = px - Trail.x[h], dy = py - Trail.y[h];
    const step = Math.sqrt(dx * dx + dy * dy);
    if (step < 2) { Trail.d[h] = DIRN[dir] || Trail.d[h]; return; }
    const nh = (h + 1) % TRAIL_CAP;
    Trail.x[nh] = px; Trail.y[nh] = py; Trail.d[nh] = DIRN[dir] || 0;
    Trail.len[nh] = Trail.len[h] + step;
    Trail.head = nh;
    if (Trail.count < TRAIL_CAP) Trail.count++;
  };
  // Sample the trail `back` px behind the head → writes into `out`.
  const sampleOut = { x: 0, y: 0, dir: "down", ok: false };
  NPC.trailSample = function (back) {
    sampleOut.ok = false;
    const h = Trail.head;
    const target = Trail.len[h] - back;
    if (Trail.count < 2 || target <= Trail.len[(h - Trail.count + 1 + TRAIL_CAP) % TRAIL_CAP]) {
      const t = (h - Trail.count + 1 + TRAIL_CAP) % TRAIL_CAP;
      sampleOut.x = Trail.x[t]; sampleOut.y = Trail.y[t]; sampleOut.dir = DIRS[Trail.d[t]];
      return sampleOut;
    }
    let i = h;
    for (let k = 0; k < Trail.count - 1; k++) {
      const prev = (i - 1 + TRAIL_CAP) % TRAIL_CAP;
      if (Trail.len[prev] <= target) {
        const span = Trail.len[i] - Trail.len[prev];
        const t = span > 0 ? (target - Trail.len[prev]) / span : 0;
        sampleOut.x = U.lerp(Trail.x[prev], Trail.x[i], t);
        sampleOut.y = U.lerp(Trail.y[prev], Trail.y[i], t);
        sampleOut.dir = DIRS[Trail.d[i]];
        sampleOut.ok = true;
        return sampleOut;
      }
      i = prev;
    }
    sampleOut.x = Trail.x[i]; sampleOut.y = Trail.y[i]; sampleOut.dir = DIRS[Trail.d[i]];
    return sampleOut;
  };

  // Companion cats. MEADOW is quick and darts ahead when you dawdle; BIGBOY
  // lumbers and sits down at rest points (SIDE-CONTENT §3).
  NPC.CATS = {
    meadow: { id: "cat_meadow", sprite: "cat_meadow", name: "MEADOW", back: 30, speed: NPC.SPEED.cat, sniffs: "items" },
    bigboy: { id: "cat_bigboy", sprite: "cat_bigboy", name: "BIGBOY", back: 58, speed: NPC.SPEED.lumber, sniffs: "creatures" }
  };

  NPC.makeCat = function (which) {
    const c = NPC.CATS[which];
    if (!c) return null;
    const e = NPC.create({ id: c.id, x: 0, y: 0, dir: "down", sprite: c.sprite, behaviour: "follow", solid: false });
    e.cat = which; e.catDef = c; e.trailBack = c.back; e.speed = c.speed;
    e.dartT = 0; e.sniffT = 0;
    return e;
  };

  // Which cats are out? MQ.Cats decides when it exists; otherwise the story
  // flag `cats_joined` puts both at your heel.
  NPC.followingCats = function () {
    if (MQ.Cats && MQ.Cats.following) { const l = MQ.Cats.following(); if (l) return l; }
    if (MQ.Flags.get("cats_joined")) return ["meadow", "bigboy"];
    return [];
  };

  NPC.updateFollower = function (e, dt, world) {
    if (!NPC.visible(e)) return;
    if (e.emoteT < e.emoteMs) e.emoteT += dt;
    const p = world.player;
    if (!p) return;
    const s = NPC.trailSample(e.trailBack + (e.dartOffset || 0));
    const dx = s.x - e.px, dy = s.y - e.py;
    const d = Math.sqrt(dx * dx + dy * dy);
    const maxStep = (e.speed * T) * (dt / 1000) * (d > T * 3 ? 2.2 : 1);
    if (d > 1.2) {
      const k = Math.min(1, maxStep / d);
      e.px += dx * k; e.py += dy * k;
      e.animT += dt * (e.cat === "meadow" ? 1.3 : 0.85);
      e.frame = NPC.FRAMES[Math.floor(e.animT / 110) % 4];
      e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      e.sitting = false; e.idleT = 0;
    } else {
      e.frame = 0;
      e.idleT += dt;
      e.dir = s.dir || e.dir;
    }
    e.x = Math.floor(e.px / T); e.y = Math.floor(e.py / T);
    if (d > T * 12) {                              // teleport home if left behind (warps, cutscenes)
      e.px = p.px; e.py = p.py; e.idleT = 0;
    }
    if (e.cat === "bigboy") bigboyIdle(e, dt, world);
    else if (e.cat === "meadow") meadowIdle(e, dt, world);
  };

  function bigboyIdle(e, dt, world) {
    const restNear = world.restPoint ? world.restPoint(e.x, e.y) : null;
    if (e.idleT > 1500 && !e.sitting) {
      e.sitting = true; e.sitT = 0;
      if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("cat_sit");
      if (restNear) MQ.Events.emit("cat:rest", { cat: "bigboy", point: restNear });
    }
    if (e.sitting) { e.sitT += dt; e.bob = Math.sin(e.sitT / 700) * 0.7; }
    if (e.idleT > 6000 && e.idleT < 6100) NPC.emote(e, "zzz", 1400);
  }

  function meadowIdle(e, dt, world) {
    if (e.idleT > 1200) {
      e.dartT += dt;
      if (e.dartT > 900) {                         // dart ahead a little, then settle
        e.dartT = 0;
        e.dartOffset = e.dartOffset ? 0 : -Math.min(48, e.trailBack);
      }
    } else { e.dartT = 0; e.dartOffset = 0; }
    e.sniffT += dt;
    if (e.sniffT > 1800) {
      e.sniffT = 0;
      if (world.sniff && world.sniff(e)) NPC.emote(e, "paw", 1300);
    }
  }

  // ---- drawing -----------------------------------------------------------
  // Uses MQ.PeopleArt when the art workstream has landed; otherwise draws a
  // readable procedural walker (jacket, pack, hair) or cat.
  const JACKETS = ["#3a5a8a", "#7a4030", "#3a6a4a", "#6a4a7a", "#8a6a30", "#404858", "#a05040", "#2f6a72"];
  const SKINS = ["#e8c0a0", "#c89870", "#8a5f42", "#f0d8c0", "#6a4630"];
  const HAIRS = ["#2a2020", "#6a4a20", "#c8a040", "#8a8a90", "#402030", "#101014"];

  function paletteFor(sprite) {
    const r = U.rng(sprite || "npc");
    return {
      jacket: JACKETS[Math.floor(r() * JACKETS.length)],
      skin: SKINS[Math.floor(r() * SKINS.length)],
      hair: HAIRS[Math.floor(r() * HAIRS.length)],
      legs: r() < 0.5 ? "#33384a" : "#4a3a30"
    };
  }
  const palCache = {};
  NPC.palette = function (sprite) { return palCache[sprite] || (palCache[sprite] = paletteFor(sprite)); };

  NPC.shadow = function (ctx, x, y, w) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x, y - 1, w || 9, (w || 9) * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Draw a person 20x30 with feet at (x,y).
  NPC.drawPerson = function (ctx, sprite, dir, frame, x, y, opts) {
    const P = NPC.palette(sprite);
    const bob = frame === 1 ? -1 : frame === 2 ? 1 : 0;
    const left = Math.round(x - 8), top = Math.round(y - 30 + (opts && opts.bob ? opts.bob : 0));
    NPC.shadow(ctx, x, y, 9);
    // legs
    ctx.fillStyle = P.legs;
    if (dir === "left" || dir === "right") {
      ctx.fillRect(left + 4, top + 21, 4, 9 + bob);
      ctx.fillRect(left + 9, top + 21, 4, 9 - bob);
    } else {
      ctx.fillRect(left + 3, top + 21, 5, 9 + bob);
      ctx.fillRect(left + 9, top + 21, 5, 9 - bob);
    }
    // body / jacket
    ctx.fillStyle = P.jacket;
    ctx.fillRect(left + 2, top + 11, 13, 11);
    ctx.fillStyle = U.shade(P.jacket, 0.8);
    ctx.fillRect(left + 2, top + 19, 13, 3);
    // day-pack when walking away from us
    if (dir === "up") { ctx.fillStyle = U.shade(P.jacket, 0.65); ctx.fillRect(left + 4, top + 12, 9, 8); }
    // arms
    ctx.fillStyle = P.skin;
    const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    ctx.fillRect(left, top + 12 + swing, 3, 8);
    ctx.fillRect(left + 14, top + 12 - swing, 3, 8);
    // head
    ctx.fillStyle = P.skin;
    ctx.fillRect(left + 4, top + 2, 9, 9);
    ctx.fillStyle = P.hair;
    ctx.fillRect(left + 3, top, 11, 4);
    if (dir === "up") ctx.fillRect(left + 3, top, 11, 9);
    if (dir === "left") ctx.fillRect(left + 3, top, 6, 8);
    if (dir === "right") ctx.fillRect(left + 8, top, 6, 8);
    // face
    if (dir !== "up") {
      ctx.fillStyle = "#20202a";
      if (dir === "down") { ctx.fillRect(left + 5, top + 6, 2, 2); ctx.fillRect(left + 10, top + 6, 2, 2); }
      else if (dir === "left") ctx.fillRect(left + 4, top + 6, 2, 2);
      else ctx.fillRect(left + 11, top + 6, 2, 2);
    }
  };

  // Draw a cat 18x14 with feet at (x,y).
  NPC.drawCat = function (ctx, which, dir, frame, x, y, sitting, bob) {
    const big = which === "bigboy";
    const w = big ? 11 : 8, h = big ? 9 : 7;
    const body = big ? "#1a1a1e" : "#141418";
    const patch = "#f0f0f4";
    const top = Math.round(y - h - 4 + (bob || 0));
    const left = Math.round(x - w);
    NPC.shadow(ctx, x, y, big ? 10 : 7);
    ctx.fillStyle = body;
    if (sitting) {
      ctx.fillRect(left + 2, top + 2, w * 2 - 4, h + 2);
      ctx.fillRect(left + 3, top - 4, w, 6);        // head up
      if (big) { ctx.fillStyle = patch; ctx.fillRect(left + 4, top + 6, 5, 5); ctx.fillStyle = body; }
      ctx.fillRect(left + 4, top - 7, 2, 3); ctx.fillRect(left + 8, top - 7, 2, 3);   // ears
      ctx.fillStyle = body;
      ctx.fillRect(left + w * 2 - 4, top + 4, 3, 7);  // curled tail
    } else {
      const step = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      ctx.fillRect(left, top + 2, w * 2, h);
      if (big) { ctx.fillStyle = patch; ctx.fillRect(left + 3, top + 5, 6, 5); ctx.fillStyle = body; }
      const hx = dir === "left" ? left - 3 : dir === "right" ? left + w * 2 - 4 : left + w - 4;
      ctx.fillRect(hx, top - 2, 7, 7);
      ctx.fillRect(hx, top - 5, 2, 3); ctx.fillRect(hx + 5, top - 5, 2, 3);
      const tx = dir === "left" ? left + w * 2 - 1 : dir === "right" ? left - 3 : left + w - 1;
      ctx.fillRect(tx, top - 3 + step, 3, 6);
      ctx.fillRect(left + 1, top + h + 1, 3, 3 + step);
      ctx.fillRect(left + w * 2 - 4, top + h + 1, 3, 3 - step);
    }
    if (dir !== "up") {
      ctx.fillStyle = big ? "#c8e070" : "#78e0b0";
      const ex = dir === "left" ? left - 2 : dir === "right" ? left + w * 2 - 3 : left + w - 3;
      ctx.fillRect(ex, top + (sitting ? -2 : 0), 2, 2);
      ctx.fillRect(ex + (dir === "down" ? 4 : 3), top + (sitting ? -2 : 0), 2, 2);
    }
  };

  NPC.draw = function (ctx, e, ox, oy) {
    if (!NPC.visible(e)) return;
    const x = Math.round(e.px - ox), y = Math.round(e.py - oy) + 6;
    const art = MQ.PeopleArt;
    if (art && art.get) {
      const c = art.get(e.sprite, e.dir, e.frame, e.sitting ? "sit" : null);
      if (c) { ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height + 4)); NPC.drawEmote(ctx, e, x, y - (c.height || 32)); return; }
    }
    if (e.cat) NPC.drawCat(ctx, e.cat, e.dir, e.frame, x, y, e.sitting, e.bob);
    else NPC.drawPerson(ctx, e.sprite, e.dir, e.frame, x, y, null);
    NPC.drawEmote(ctx, e, x, y - (e.cat ? 18 : 34));
  };

  NPC.drawEmote = function (ctx, e, x, y) {
    if (!NPC.emoting(e)) return;
    const k = e.emoteT / e.emoteMs;
    const pop = k < 0.15 ? U.ease.outBack(k / 0.15) : 1;
    const w = 14 * pop, h = 14 * pop;
    ctx.fillStyle = "#f8f8f0";
    ctx.fillRect(Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
    ctx.fillStyle = "#20202a";
    ctx.fillRect(Math.round(x - 1), Math.round(y), 2, 3);
    if (pop < 0.9) return;
    const cx = Math.round(x), cy = Math.round(y - 7);
    ctx.fillStyle = "#20202a";
    if (e.emoteKind === "!") { ctx.fillRect(cx - 1, cy - 5, 2, 6); ctx.fillRect(cx - 1, cy + 2, 2, 2); }
    else if (e.emoteKind === "?") { ctx.fillRect(cx - 2, cy - 5, 4, 2); ctx.fillRect(cx + 1, cy - 3, 2, 3); ctx.fillRect(cx - 1, cy, 2, 1); ctx.fillRect(cx - 1, cy + 2, 2, 2); }
    else if (e.emoteKind === "paw") {
      ctx.fillRect(cx - 2, cy - 1, 5, 4);
      ctx.fillRect(cx - 3, cy - 4, 2, 2); ctx.fillRect(cx, cy - 5, 2, 2); ctx.fillRect(cx + 3, cy - 4, 2, 2);
    } else if (e.emoteKind === "zzz") {
      ctx.fillRect(cx - 4, cy - 4, 4, 1); ctx.fillRect(cx - 4, cy - 1, 4, 1); ctx.fillRect(cx - 1, cy - 3, 1, 2);
      ctx.fillRect(cx + 1, cy, 3, 1); ctx.fillRect(cx + 1, cy + 3, 3, 1);
    } else if (e.emoteKind === "heart") {
      ctx.fillStyle = "#d04060";
      ctx.fillRect(cx - 3, cy - 3, 2, 2); ctx.fillRect(cx + 1, cy - 3, 2, 2);
      ctx.fillRect(cx - 3, cy - 1, 6, 2); ctx.fillRect(cx - 2, cy + 1, 4, 1); ctx.fillRect(cx - 1, cy + 2, 2, 1);
    } else if (e.emoteKind === "note") {
      ctx.fillRect(cx + 1, cy - 5, 1, 6); ctx.fillRect(cx - 2, cy + 1, 4, 3);
    } else { ctx.fillRect(cx - 2, cy - 3, 4, 6); }
  };

  MQ.NPC = NPC;
})();
