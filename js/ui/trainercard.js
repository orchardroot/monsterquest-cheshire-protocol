// =============================================================
// MonsterQuest v2 — MQ.UI.TrainerCard (ui-b): who you are on paper.
//   MQ.UI.TrainerCard.open()   two pages: Card and Records
//   MQ.UI.Badges.draw(ctx, badgeId, cx, cy, size, earned)
// The eight gym badges are drawn here (nobody else owns badge art),
// so the world map and the pause hub can borrow them at runtime.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }
  function flag(id) { try { return MQ.Flags ? MQ.Flags.get(id) : undefined; } catch (e) { return undefined; } }

  // =============================================================
  // Badge art — eight small enamel things, drawn not rasterised
  // =============================================================
  const BADGES = [
    { id: "badge_packet", name: "PACKET", town: "Wilmslow", leader: "Sysadmin Ada", type: "electric", col: "#e6c24a", shape: "bolt" },
    { id: "badge_cipher", name: "CIPHER", town: "Knutsford", leader: "Madam Gaskell", type: "psychic", col: "#d95f92", shape: "key" },
    { id: "badge_bear", name: "BEAR", town: "Congleton", leader: "Bearward Otis", type: "normal", col: "#a8a090", shape: "paw" },
    { id: "badge_kernel", name: "KERNEL", town: "Crewe", leader: "Stoker Di", type: "fire", col: "#e2492f", shape: "firebox" },
    { id: "badge_token", name: "TOKEN", town: "Nantwich", leader: "Brine Nell", type: "water", col: "#3f7fd0", shape: "drop" },
    { id: "badge_daemon", name: "DAEMON", town: "Northwich", leader: "Foreman Jack", type: "rock", col: "#a08a5c", shape: "crystal" },
    { id: "badge_proxy", name: "PROXY", town: "Runcorn", leader: "Chemist Ria", type: "poison", col: "#9a52b5", shape: "flask" },
    { id: "badge_admin", name: "ADMIN", town: "Warrington", leader: "Netrunner Mo", type: "cyber", col: "#3fe0c8", shape: "cursor" }
  ];
  const badgeById = {};
  for (let i = 0; i < BADGES.length; i++) badgeById[BADGES[i].id] = BADGES[i];

  const Badges = { LIST: BADGES, get: function (id) { return badgeById[id] || null; } };
  Badges.earned = function (id) {
    try { if (MQ.Trainer && MQ.Trainer.hasBadge) return MQ.Trainer.hasBadge(id); } catch (e) { /* ignore */ }
    return !!flag(id);
  };
  // cx,cy is the CENTRE. size is the full width.
  Badges.draw = function (ctx, id, cx, cy, size, earned) {
    const b = badgeById[id] || badgeById["badge_packet"];
    const s = size / 2;
    const on = earned === undefined ? Badges.earned(id) : !!earned;
    const col = on ? b.col : "rgba(110,106,140,0.55)";
    ctx.save();
    // enamel disc
    ctx.fillStyle = on ? "rgba(28,24,44,0.95)" : "rgba(20,18,32,0.7)";
    ctx.beginPath(); ctx.arc(cx, cy, s, 0, 6.3); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, size * 0.07);
    ctx.beginPath(); ctx.arc(cx, cy, s - 1, 0, 6.3); ctx.stroke();
    ctx.fillStyle = col; ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.4, size * 0.08);
    const u = size / 16;
    ctx.beginPath();
    switch (b.shape) {
      case "bolt":
        ctx.moveTo(cx + u, cy - 5 * u); ctx.lineTo(cx - 3 * u, cy + u); ctx.lineTo(cx, cy + u);
        ctx.lineTo(cx - u, cy + 5 * u); ctx.lineTo(cx + 3.5 * u, cy - u); ctx.lineTo(cx + 0.5 * u, cy - u);
        ctx.closePath(); ctx.fill();
        break;
      case "key":
        ctx.arc(cx, cy - 2 * u, 2.4 * u, 0, 6.3); ctx.fill();
        ctx.fillRect(cx - 0.8 * u, cy - u, 1.6 * u, 5.5 * u);
        ctx.fillRect(cx - 0.8 * u, cy + 2.4 * u, 3 * u, 1.2 * u);
        break;
      case "paw":
        ctx.arc(cx, cy + 1.6 * u, 3 * u, 0, 6.3); ctx.fill();
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(cx + i * 2.4 * u, cy - 2.6 * u, 1.25 * u, 0, 6.3); ctx.fill(); }
        ctx.beginPath(); ctx.arc(cx + 3.7 * u, cy - 0.4 * u, 1.1 * u, 0, 6.3); ctx.fill();
        break;
      case "firebox":
        ctx.arc(cx, cy, 4.4 * u, 0, 6.3); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 3.4 * u);
        ctx.quadraticCurveTo(cx + 2.6 * u, cy, cx, cy + 3.2 * u);
        ctx.quadraticCurveTo(cx - 2.6 * u, cy, cx, cy - 3.4 * u);
        ctx.fill();
        break;
      case "drop":
        ctx.moveTo(cx, cy - 4.4 * u);
        ctx.quadraticCurveTo(cx + 3.4 * u, cy + 1.2 * u, cx, cy + 4 * u);
        ctx.quadraticCurveTo(cx - 3.4 * u, cy + 1.2 * u, cx, cy - 4.4 * u);
        ctx.fill();
        break;
      case "crystal":
        ctx.moveTo(cx, cy - 4.4 * u); ctx.lineTo(cx + 3 * u, cy - u); ctx.lineTo(cx + 1.8 * u, cy + 4 * u);
        ctx.lineTo(cx - 1.8 * u, cy + 4 * u); ctx.lineTo(cx - 3 * u, cy - u);
        ctx.closePath(); ctx.fill();
        break;
      case "flask":
        ctx.moveTo(cx - 1.2 * u, cy - 4 * u); ctx.lineTo(cx + 1.2 * u, cy - 4 * u); ctx.lineTo(cx + 1.2 * u, cy - u);
        ctx.lineTo(cx + 3.6 * u, cy + 3.8 * u); ctx.lineTo(cx - 3.6 * u, cy + 3.8 * u); ctx.lineTo(cx - 1.2 * u, cy - u);
        ctx.closePath(); ctx.fill();
        break;
      default: // cursor: a blinking block on a bracket
        ctx.fillRect(cx - 0.6 * u, cy - 3.4 * u, 3.2 * u, 3.4 * u);
        ctx.beginPath();
        ctx.moveTo(cx - 3.6 * u, cy - 4 * u); ctx.lineTo(cx - 4.4 * u, cy - 4 * u); ctx.lineTo(cx - 4.4 * u, cy + 4 * u); ctx.lineTo(cx - 3.6 * u, cy + 4 * u);
        ctx.stroke();
        ctx.fillRect(cx - 2.6 * u, cy + 1.4 * u, 5.6 * u, 1.2 * u);
        break;
    }
    ctx.restore();
  };
  UI.Badges = Badges;

  // =============================================================
  // The card
  // =============================================================
  const STAT_LABELS = {
    steps: "Tiles walked", stepsRain: "Walked in rain", stepsRun: "Tiles run", battles: "Battles",
    wins: "Won", losses: "Lost", runs: "Ran away", catches: "Caught", faints: "Fainted",
    knockouts: "Knockouts", overdrives: "Overdrives", photos: "Photographs", brews: "Brews pressed",
    bounties: "Bounties", warrants: "Warrants", casesClosed: "Cases closed", fish: "Fish landed",
    itemsUsed: "Items used", moneyEarned: "Earned", moneySpent: "Spent", healsLido: "Lido dips",
    puppetsBeaten: "Puppets beaten", amosExposed: "Impostors exposed", luresRefused: "Lures refused",
    brinkSaves: "Brink saves", gymsBeaten: "Gyms beaten", arenaClears: "Arena clears"
  };
  const TRUST_WORDS = ["Wary", "Tolerant", "Fond", "Attached", "Devoted", "Yours"];

  const PAGES = ["Card", "Records"];
  const HINTS = [{ btn: "b", label: "Back" }, { btn: "lr", label: "Page" }];
  const sc = { id: "trainercard", touchPad: false, page: 0, scroll: 0 };

  function tr() { return MQ.Trainer || null; }
  function card() {
    const Tr = tr();
    if (Tr && Tr.card) { try { return Tr.card(); } catch (e) { /* ignore */ } }
    return {
      name: (Tr && Tr.name) || "JIM", level: (Tr && Tr.level) || 1, xp: 0, xpToNext: 1,
      badges: 0, badgeIds: [], rank: "Probationer", playtime: "0h 00m",
      money: 0, marks: 0, chips: 0, seen: 0, caught: 0, dexTotal: 0,
      perkPoints: 0, spent: 0, trinkets: [], steps: 0, battles: 0, wins: 0, titles: 0
    };
  }
  function badgeWord(b) {
    const Tr = tr();
    if (Tr && Tr.badgeLabel) { try { return Tr.badgeLabel(b.id.replace("badge_", "")); } catch (e) { /* ignore */ } }
    return flag("pippin_found") ? "SIGNED" : b.name;
  }
  function trustOf(id) {
    try { if (MQ.Cats && MQ.Cats.trust) return MQ.Cats.trust(id); } catch (e) { /* ignore */ }
    const v = flag("trust_" + id);
    return typeof v === "number" ? v : 0;
  }
  function catsOut() {
    try { if (MQ.Cats && MQ.Cats.unlocked && MQ.Cats.unlocked()) return true; } catch (e) { /* ignore */ }
    return !!flag("cats_joined");
  }
  function ribbons() {
    const out = [];
    try {
      const list = (MQ.Party && MQ.Party.list) || [];
      for (let i = 0; i < list.length; i++) {
        const rb = list[i].ribbons || [];
        for (let j = 0; j < rb.length; j++) out.push({ mon: list[i].nickname || list[i].species, ribbon: rb[j] });
      }
    } catch (e) { /* ignore */ }
    return out;
  }
  function titles() {
    try {
      const Tr = tr();
      if (Tr && Tr.titles && Tr.titles.forEach) { const out = []; Tr.titles.forEach(function (t2) { out.push(t2); }); return out; }
    } catch (e) { /* ignore */ }
    return [];
  }

  sc.enter = function () { sc.page = 0; sc.scroll = 0; TH().sfx("ui_open"); };
  sc.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("left")) { I.consume("left"); sc.page = (sc.page + PAGES.length - 1) % PAGES.length; sc.scroll = 0; Theme.sfx("ui_move"); }
    if (I.pressed("right") || I.pressed("a")) { I.consume("right"); I.consume("a"); sc.page = (sc.page + 1) % PAGES.length; sc.scroll = 0; Theme.sfx("ui_move"); }
    if (I.pressed("down")) { I.consume("down"); sc.scroll++; }
    if (I.pressed("up")) { I.consume("up"); sc.scroll = Math.max(0, sc.scroll - 1); }
    const tab = Theme.tabTapped();
    if (tab >= 0) { sc.page = tab; sc.scroll = 0; Theme.sfx("ui_move"); }
  };

  function drawPortrait(ctx, x, y, s) {
    const Theme = TH(), C = Theme.C;
    ctx.fillStyle = "rgba(10,9,20,0.6)";
    UI.roundRect(ctx, x, y, s, s, 8); ctx.fill();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 2;
    UI.roundRect(ctx, x + 1, y + 1, s - 2, s - 2, 8); ctx.stroke();
    let drawn = false;
    try {
      const PA = MQ.PeopleArt;
      if (PA) {
        const cv = PA.portrait ? PA.portrait("player") : (PA.frame ? PA.frame("player", "down", 0) : null);
        if (cv && cv.width) { ctx.drawImage(cv, x + 4, y + 4, s - 8, s - 8); drawn = true; }
      }
    } catch (e) { drawn = false; }
    if (!drawn) Theme.grin(ctx, x + s / 2, y + s / 2 + 4, s * 0.5, { alpha: 0.7 });
  }

  function drawCard(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const c = card();
    // the card itself
    ctx.save();
    ctx.fillStyle = "rgba(26,22,42,0.95)";
    UI.roundRect(ctx, x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 2;
    UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 12); ctx.stroke();
    // a silk-mill watermark
    Theme.grin(ctx, x + w - 70, y + 54, 92, { alpha: 0.07, color: C.brassLit });
    ctx.restore();

    const pad = 16;
    const ps = Math.min(96, h * 0.32);
    drawPortrait(ctx, x + pad, y + pad, ps);
    const tx = x + pad + ps + 16;
    T.draw(ctx, String(c.name || "JIM").toUpperCase(), tx, y + pad + 2, { size: "l", color: C.brassLit });
    T.draw(ctx, c.rank + "  ·  Incident Response", tx, y + pad + 32, { size: "s", color: C.textDim });
    T.draw(ctx, "ID " + (flag("player_id") || String(1000 + ((U.hash(String(c.name)) % 9000)))), x + w - pad, y + pad + 2, { size: "s", align: "right", color: C.textDim });
    // trainer level + xp
    const bw = Math.min(w - (tx - x) - pad, 280);
    T.draw(ctx, "Trainer Level " + c.level, tx, y + pad + 52, { size: "m", color: C.text });
    const ratio = c.xpToNext ? U.clamp(c.xp / (c.xp + c.xpToNext), 0, 1) : 0;
    UI.gauge(ctx, tx, y + pad + 76, bw, 8, ratio, { color: C.exp, bg: "rgba(0,0,0,0.5)", noBorder: true });
    T.draw(ctx, c.xpToNext ? c.xpToNext + " xp to next" : "", tx, y + pad + 88, { size: "s", color: C.textDim });

    // right-hand facts column
    const fx = x + w - pad - 170;
    let fy = y + pad + 30;
    const facts = [
      ["Playtime", c.playtime],
      ["Credits", Theme.money(c.money)],
      ["Marks", String(c.marks || 0)],
      ["Chips", String(c.chips || 0)],
      ["Dex", c.caught + "/" + c.dexTotal + " caught"],
      ["Sighted", String(c.seen)]
    ];
    for (let i = 0; i < facts.length; i++) {
      T.draw(ctx, facts[i][0], fx, fy, { size: "s", color: C.textDim });
      T.draw(ctx, facts[i][1], x + w - pad, fy, { size: "s", align: "right", color: C.text });
      fy += 17;
    }

    // badges
    const by = y + pad + ps + 24;
    T.draw(ctx, flag("pippin_found") ? "Badges — every one of them SIGNED" : "Badges", x + pad, by - 18, { size: "s", color: flag("pippin_found") ? C.oxblood : C.brassLit });
    // Spread the eight over the whole card rather than packing them left: the
    // labels underneath need the width, or "PACKETCIPHER BEAR" is what you read.
    const step = (w - pad * 2) / 8;
    const bs = Math.min(56, step - 6);
    const sh = T.px("s");
    for (let i = 0; i < BADGES.length; i++) {
      const b = BADGES[i];
      const cxp = x + pad + step / 2 + i * step;
      const on = Badges.earned(b.id);
      Badges.draw(ctx, b.id, cxp, by + bs / 2, bs, on);
      T.draw(ctx, badgeWord(b), cxp, by + bs + 4, { size: "s", align: "center", color: on ? C.text : C.dim, maxWidth: step - 4 });
      // the town only earns its line when it can be read at its natural width
      if (T.width(b.town, "s") <= step - 4) {
        T.draw(ctx, b.town, cxp, by + bs + 6 + sh, { size: "s", align: "center", color: C.dim });
      }
    }

    // cats
    const cy2 = by + bs + 40;
    const cw = (w - pad * 2) / 2 - 8;
    for (let i = 0; i < 2; i++) {
      const id = i === 0 ? "meadow" : "bigboy";
      const def = (MQ.Cats && MQ.Cats.DEFS) ? MQ.Cats.DEFS[id] : null;
      const cxx = x + pad + i * (cw + 16);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      UI.roundRect(ctx, cxx, cy2, cw, 52, 7); ctx.fill();
      UI.icon(ctx, "cat", cxx + 10, cy2 + 8, 1.2);
      const out = catsOut();
      T.draw(ctx, (def && def.name) || id.toUpperCase(), cxx + 36, cy2 + 6, { size: "s", color: out ? C.text : C.dim });
      const tv = trustOf(id);
      T.draw(ctx, out ? "Trust " + tv + " — " + TRUST_WORDS[U.clamp(tv, 0, 5)] : "not with you yet", cxx + 36, cy2 + 22, { size: "s", color: out ? C.textDim : C.dim });
      for (let p = 0; p < 5; p++) {
        ctx.fillStyle = out && p < tv ? C.brass : "rgba(120,116,150,0.35)";
        ctx.beginPath(); ctx.arc(cxx + 42 + p * 14, cy2 + 42, 4.5, 0, 6.3); ctx.fill();
      }
    }
    // titles strip
    const ty2 = cy2 + 60;
    if (ty2 < y + h - 18) {
      const ts = titles();
      T.draw(ctx, ts.length ? "Titles: " + ts.join(", ") : "No titles yet. Plenty of chances.", x + pad, ty2, { size: "s", color: ts.length ? C.brassLit : C.dim, maxWidth: w - pad * 2 });
    }
  }

  function drawRecords(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const Tr = tr();
    const stats = (Tr && Tr.stats) || {};
    const keys = (Tr && Tr.STATS) ? Tr.STATS : Object.keys(stats);
    const half = w / 2 - 8;
    Theme.panel(ctx, x, y, half, h, { flat: true, title: "The numbers" });
    const perCol = Math.max(1, Math.floor((h - 44) / 17));
    let ry = y + 36;
    const shown = Math.min(keys.length, perCol * 2);
    const colW = (half - 24) / 2;
    for (let i = 0; i < shown; i++) {
      const k = keys[i];
      const col = Math.floor(i / perCol);
      const rowY = ry + (i % perCol) * 17;
      const kx = x + 12 + col * colW;
      T.draw(ctx, STAT_LABELS[k] || Theme.titleCase(k), kx, rowY, { size: "s", color: C.textDim, maxWidth: colW - 50 });
      T.draw(ctx, String(stats[k] || 0), kx + colW - 12, rowY, { size: "s", align: "right", color: C.text });
    }

    const rx = x + half + 16, rw = w - half - 16;
    Theme.panel(ctx, rx, y, rw, h, { flat: true, title: "Ribbons, trinkets and awards" });
    let ay = y + 36;
    const c = card();
    const trink = c.trinkets || [];
    T.draw(ctx, "Trinkets", rx + 12, ay, { size: "s", color: C.brassLit }); ay += 16;
    if (!trink.length) { T.draw(ctx, "None worn. Trainer Level 20 opens the first slot.", rx + 12, ay, { size: "s", color: C.dim, maxWidth: rw - 24 }); ay += 18; }
    else for (let i = 0; i < trink.length; i++) {
      const nm = (MQ.Data && MQ.Data.itemName) ? MQ.Data.itemName(trink[i]) : Theme.titleCase(trink[i] || "empty");
      T.draw(ctx, "· " + (trink[i] ? nm : "empty slot"), rx + 12, ay, { size: "s", color: trink[i] ? C.text : C.dim }); ay += 16;
    }
    ay += 6;
    T.draw(ctx, "Ribbons", rx + 12, ay, { size: "s", color: C.brassLit }); ay += 16;
    const rb = ribbons();
    if (!rb.length) { T.draw(ctx, "Nothing pinned to anybody yet.", rx + 12, ay, { size: "s", color: C.dim }); ay += 18; }
    else for (let i = 0; i < rb.length && ay < y + h - 60; i++) {
      T.draw(ctx, "· " + Theme.titleCase(rb[i].ribbon) + " — " + rb[i].mon, rx + 12, ay, { size: "s", color: C.text, maxWidth: rw - 24 }); ay += 16;
    }
    ay += 6;
    let count = 0, total = 0;
    try {
      if (MQ.Achievements && MQ.Achievements.list) {
        const list = MQ.Achievements.list();
        total = list.length;
        for (let i = 0; i < list.length; i++) if (list[i].unlocked) count++;
      }
    } catch (e) { /* ignore */ }
    T.draw(ctx, "Awards: " + count + "/" + total, rx + 12, y + h - 40, { size: "s", color: C.brassLit });
    T.draw(ctx, "Perk points spare: " + (c.perkPoints || 0) + "  ·  spent " + (c.spent || 0), rx + 12, y + h - 22, { size: "s", color: C.textDim });
  }

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1c1830", bottom: "#131a22" });
    const c = card();
    Theme.header(ctx, { title: "Trainer Card", icon: "star", sub: c.rank + " · " + c.badges + " badges", right: c.playtime });
    const top = Theme.headerBottom();
    const th = Theme.tabStrip(ctx, PAGES, sc.page, { x: m.l, y: top, w: m.cw });
    const y = top + th + 8;
    const h = Theme.footerTop() - 6 - y;
    if (sc.page === 0) drawCard(ctx, m.l, y, m.cw, h);
    else drawRecords(ctx, m.l, y, m.cw, h);
    Theme.footer(ctx, HINTS);
  };

  sc.BADGES = BADGES;
  sc.open = function (p) { return MQ.Scenes.pushP(sc, p || {}); };
  UI.TrainerCard = sc;
  UI.Trainer = sc;
})();
