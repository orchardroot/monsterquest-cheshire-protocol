// =============================================================
// MonsterQuest v2 — MQ.UI.Perks (ui-b): the TRIAGE / ESCALATE /
// ADJUDICATE tree. Three branches of ten, one point a rank, gated
// by trainer level and by points already spent in the branch.
//   MQ.UI.Perks.open()   -> Promise<null>
// Reads MQ.Progression (tree, canBuy, blockedReason, respecCost)
// and MQ.Trainer (perkPoints, buyPerk, respec). Says so plainly
// when the content team is not loaded rather than drawing nothing.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const BRANCHES = ["triage", "escalate", "adjudicate"];
  const BRANCH_FALLBACK = {
    triage: { name: "TRIAGE", agent: "sleet", blurb: "Offence, speed and scouting." },
    escalate: { name: "ESCALATE", agent: "vigil", blurb: "Healing, status and the cats." },
    adjudicate: { name: "ADJUDICATE", agent: "arbiter", blurb: "Stat control, catching and information." }
  };
  const BRANCH_COL = { triage: "#e2703f", escalate: "#5fc9a8", adjudicate: "#8fa8d8" };

  function P() { return MQ.Progression || null; }
  function tree() { const p = P(); return (p && p.tree) || []; }
  function branchInfo(b) {
    const p = P();
    if (p && p.BRANCH_INFO && p.BRANCH_INFO[b]) return p.BRANCH_INFO[b];
    return BRANCH_FALLBACK[b];
  }
  function branchNodes(b) {
    const p = P();
    if (p && p.branch) { try { return p.branch(b); } catch (e) { /* ignore */ } }
    return tree().filter(function (n) { return n.branch === b; });
  }
  function rankOf(id) {
    const p = P();
    if (p && p.rank) { try { return p.rank(id); } catch (e) { /* ignore */ } }
    try { if (MQ.Trainer && MQ.Trainer.perkRank) return MQ.Trainer.perkRank(id); } catch (e) { /* ignore */ }
    return 0;
  }
  function blocked(id) {
    const p = P();
    if (p && p.blockedReason) { try { return p.blockedReason(id); } catch (e) { return "Unavailable."; } }
    return "The perk tree is not fitted.";
  }
  function spentIn(b) {
    const p = P();
    if (p && p.spentIn) { try { return p.spentIn(b); } catch (e) { /* ignore */ } }
    return 0;
  }
  function points() { try { return (MQ.Trainer && MQ.Trainer.perkPoints) || 0; } catch (e) { return 0; } }

  // ---- effect prose -------------------------------------------------
  const EFFECT_WORDS = {
    critStage: "Crit stage", superEffective: "Super-effective", turn1DamageMult: "Turn-one damage",
    overdriveGainMult: "Overdrive gain", bossDamageMult: "Boss damage", showEncounterTable: "Encounter table",
    wildAmbushSpeStage: "Wild ambush Spe", quickDraw: "Quick draw", runSpeedMult: "Run speed",
    recoilMult: "Recoil taken", sleetCooldown: "SLEET cooldown", killChain: "Kill chain",
    statusTurnsSelf: "Status length", bagHealMult: "Bag healing", ownNegativeStageMult: "Drops taken",
    switchInHealFrac: "Switch-in heal", freeSwitch: "Free switching", ignoreFog: "Fog ignored",
    rollbackFaints: "Faints reverted", brinkUses: "Brink uses", meadowSlipstreamStage: "Slipstream",
    trustGainMult: "Cat trust", friendshipGainMult: "Friendship", vigilCooldown: "VIGIL cooldown",
    vigilHealMult: "VIGIL healing", incidentCommander: "Incident commander", showFoeMoves: "Foe moves",
    showFoeAbility: "Foe ability", showOwnTraits: "Own traits", showTurnOrder: "Turn order",
    captureWindowMult: "Capture window", capsuleBonusAdd: "Capsule bonus", shinyOddsMult: "Rare palette odds",
    ignoreFoePositiveStages: "Foe boosts ignored", bossPhaseHealCap: "Boss phase heal", critDamageMult: "Crit damage",
    moneyMult: "Prize money", shopPriceMult: "Shop prices", xpShareRatio: "XP share",
    arbiterCooldown: "ARBITER cooldown", attribution: "Attribution", overdriveCarryFrac: "Overdrive carried"
  };
  function effectText(key, val) {
    const label = EFFECT_WORDS[key] || TH().titleCase(key);
    if (val === true) return label;
    if (val === false) return label + " off";
    if (typeof val === "number") {
      if (key.indexOf("Mult") > 0 || key.indexOf("Frac") > 0 || key === "superEffective") {
        return label + " ×" + val;
      }
      return label + " " + (val > 0 ? "+" : "") + val;
    }
    return label + " " + val;
  }

  // ---- scene ---------------------------------------------------------
  const sc = { id: "perks", col: 0, row: 0, scroll: 0, rects: [] };
  const HINTS = [{ btn: "b", label: "Back" }, { btn: "dir", label: "Move" }, { btn: "a", label: "Take" }, { btn: "select", label: "Respec" }];

  sc.enter = function (p) {
    p = p || {};
    sc.col = 0; sc.row = 0; sc.scroll = 0;
    if (p.perk) {
      const t = tree();
      for (let i = 0; i < t.length; i++) if (t[i].id === p.perk) { sc.col = BRANCHES.indexOf(t[i].branch); sc.row = t[i].row; }
    }
    TH().sfx("ui_open");
  };
  sc.node = function () {
    const list = branchNodes(BRANCHES[sc.col]);
    for (let i = 0; i < list.length; i++) if (list[i].row === sc.row) return list[i];
    return list[sc.row] || null;
  };

  function buy() {
    const Theme = TH();
    const n = sc.node();
    if (!n) { Theme.sfx("ui_error"); return; }
    const why = blocked(n.id);
    if (why) { Theme.sfx("ui_error"); Theme.toast(why); return; }
    let ok = false;
    try { if (MQ.Trainer && MQ.Trainer.buyPerk) ok = MQ.Trainer.buyPerk(n.id); } catch (e) { ok = false; }
    if (ok) {
      const r = rankOf(n.id);
      const rk = n.ranks && n.ranks[r - 1];
      Theme.sfx("achievement"); Theme.buzz(20);
      Theme.toast("Taken: " + ((rk && rk.name) || n.name) + ".");
    } else { Theme.sfx("ui_error"); Theme.toast("That did not take."); }
  }
  function respec() {
    const Theme = TH();
    const p = P();
    if (!p || !MQ.Trainer || !MQ.Trainer.respec) { Theme.sfx("ui_error"); Theme.toast("Nothing to undo."); return; }
    const cost = p.respecCost ? p.respecCost() : 0;
    const marks = (MQ.Inventory && MQ.Inventory.marks) || 0;
    if (marks < cost) { Theme.sfx("ui_error"); Theme.toast("The casebook desk wants " + cost + " marks. You have " + marks + "."); return; }
    Theme.confirm("Wipe the whole tree for " + cost + " Casebook Marks?").then(function (yes) {
      if (!yes) return;
      let done = false;
      try { done = MQ.Trainer.respec({}); } catch (e) { done = false; }
      Theme.sfx(done ? "ui_select" : "ui_error");
      Theme.toast(done ? "Re-specced. Start again, differently." : "The desk refused.");
    });
  }

  sc.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("left")) { I.consume("left"); sc.col = (sc.col + 2) % 3; Theme.sfx("ui_move"); }
    if (I.pressed("right")) { I.consume("right"); sc.col = (sc.col + 1) % 3; Theme.sfx("ui_move"); }
    if (I.pressed("up")) { I.consume("up"); sc.row = Math.max(0, sc.row - 1); Theme.sfx("ui_move"); }
    if (I.pressed("down")) { I.consume("down"); sc.row = Math.min(9, sc.row + 1); Theme.sfx("ui_move"); }
    if (I.pressed("select")) { I.consume("select"); respec(); return; }
    const tp = I.tapAt ? I.tapAt() : null;
    if (tp) {
      for (let i = 0; i < sc.rects.length; i++) {
        const r = sc.rects[i];
        if (!r || !r.on) continue;
        if (U.inRect(tp.x, tp.y, r.x, r.y, r.w, r.h)) {
          I.consumeAll();
          if (sc.col === r.col && sc.row === r.row) buy();
          else { sc.col = r.col; sc.row = r.row; Theme.sfx("ui_move"); }
          return;
        }
      }
    }
    if (I.pressed("a")) { I.consume("a"); buy(); }
  };

  function drawNode(ctx, n, x, y, size, selected, col) {
    const Theme = TH(), C = Theme.C;
    const rank = rankOf(n.id);
    const owned = rank > 0;
    const can = blocked(n.id) === null;
    const t = ((MQ.Loop && MQ.Loop.time) || 0) / 1000;
    ctx.save();
    // halo for anything you could take right now
    if (can && !selected) {
      ctx.globalAlpha = 0.18 + 0.12 * Math.sin(t * 3);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, size * 0.85, 0, 6.3); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = owned ? col : can ? "rgba(40,36,64,0.95)" : "rgba(22,20,36,0.85)";
    ctx.strokeStyle = owned ? C.brassLit : can ? col : "rgba(110,106,140,0.4)";
    ctx.lineWidth = selected ? 3 : 2;
    ctx.beginPath();
    if (n.row === 9) { // capstone: a diamond
      ctx.moveTo(x, y - size * 0.62); ctx.lineTo(x + size * 0.62, y); ctx.lineTo(x, y + size * 0.62); ctx.lineTo(x - size * 0.62, y);
      ctx.closePath();
    } else if (n.row === 8) { // agent node: a hexagon
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        const px = x + Math.cos(a) * size * 0.56, py = y + Math.sin(a) * size * 0.56;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      ctx.arc(x, y, size * 0.5, 0, 6.3);
    }
    ctx.fill(); ctx.stroke();
    if (selected) {
      ctx.strokeStyle = C.selEdge; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, size * 0.78, 0, 6.3); ctx.stroke();
    }
    // rank pips underneath
    if (n.maxRank > 1) {
      const pw = 5, gap = 3;
      const total = n.maxRank * pw + (n.maxRank - 1) * gap;
      for (let i = 0; i < n.maxRank; i++) {
        ctx.fillStyle = i < rank ? C.brassLit : "rgba(120,116,150,0.4)";
        ctx.fillRect(x - total / 2 + i * (pw + gap), y + size * 0.62, pw, 3);
      }
    } else if (owned) {
      ctx.fillStyle = C.brassLit;
      ctx.fillRect(x - 3, y + size * 0.62, 6, 3);
    }
    ctx.restore();
  }

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1b1830", bottom: "#101c22" });
    const lvl = (MQ.Trainer && MQ.Trainer.level) || 1;
    Theme.header(ctx, {
      title: "Perks", icon: "cog",
      sub: "Trainer Level " + lvl + " · spent " + (P() && P().spentTotal ? P().spentTotal() : 0),
      right: points() + " point" + (points() === 1 ? "" : "s")
    });
    const top = Theme.headerBottom();
    const detailH = Math.round(112 * Math.min(1.2, m.k));
    const gy = top + 4;
    const gh = Theme.footerTop() - 8 - detailH - gy;
    const t = tree();
    if (!t.length) {
      T.draw(ctx, "The perk tree has not been fitted yet.", m.cx, gy + gh / 2 - 9, { size: "m", align: "center", color: C.textDim });
      Theme.footer(ctx, HINTS);
      return;
    }
    const gutter = Math.round(56 * m.k);
    const colW = (m.cw - gutter) / 3;
    const rowH = Math.min(Math.floor((gh - 34) / 10), Math.round(40 * m.k));
    const nodeSize = Math.min(rowH * 0.78, colW * 0.34, 34);
    let ri = 0;
    for (let i = 0; i < sc.rects.length; i++) sc.rects[i].on = false;
    // row gutter: unlock levels
    const rows = (P() && P().ROW_LEVELS) || [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
    for (let r = 0; r < 10; r++) {
      const ry = gy + 34 + r * rowH + rowH / 2;
      const need = rows[r] || 1;
      T.draw(ctx, "L" + need, m.l + 4, ry - 7, { size: "s", color: lvl >= need ? C.textDim : "rgba(120,116,150,0.5)" });
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(m.l + gutter - 8, ry, m.cw - gutter + 8, 1);
    }
    for (let b = 0; b < 3; b++) {
      const bid = BRANCHES[b];
      const info = branchInfo(bid);
      const col = BRANCH_COL[bid];
      const bx = m.l + gutter + b * colW + colW / 2;
      // branch head
      T.draw(ctx, info.name, bx, gy, { size: "m", align: "center", color: col });
      T.draw(ctx, (info.agent ? info.agent.toUpperCase() + " · " : "") + spentIn(bid) + " spent", bx, gy + 20, { size: "s", align: "center", color: C.textDim });
      // spine
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx, gy + 34 + rowH / 2); ctx.lineTo(bx, gy + 34 + 9 * rowH + rowH / 2); ctx.stroke();
      const list = branchNodes(bid);
      // spine lit as far as you have paid for
      let lit = 0;
      for (let i = 0; i < list.length; i++) if (rankOf(list[i].id) > 0) lit = Math.max(lit, list[i].row + 1);
      if (lit) {
        ctx.strokeStyle = col; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx, gy + 34 + rowH / 2); ctx.lineTo(bx, gy + 34 + (lit - 1) * rowH + rowH / 2); ctx.stroke();
      }
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        const ny = gy + 34 + n.row * rowH + rowH / 2;
        const sel = (b === sc.col && n.row === sc.row);
        drawNode(ctx, n, bx, ny, nodeSize, sel, col);
        const rank = rankOf(n.id);
        const label = (n.ranks && n.ranks[Math.max(0, rank - 1)] && n.ranks[Math.max(0, rank - 1)].name) || n.name;
        T.draw(ctx, label, bx + nodeSize * 0.7 + 6, ny - 8, { size: "s", color: rank ? C.text : blocked(n.id) === null ? col : C.dim, maxWidth: colW / 2 - 10 });
        if (n.maxRank > 1) T.draw(ctx, rank + "/" + n.maxRank, bx - nodeSize * 0.7 - 6, ny - 8, { size: "s", align: "right", color: C.textDim });
        let rc = sc.rects[ri];
        if (!rc) rc = sc.rects[ri] = { x: 0, y: 0, w: 0, h: 0, on: false, col: 0, row: 0 };
        rc.x = bx - colW / 2; rc.y = ny - rowH / 2; rc.w = colW; rc.h = rowH; rc.on = true; rc.col = b; rc.row = n.row;
        ri++;
      }
    }
    for (let i = ri; i < sc.rects.length; i++) sc.rects[i].on = false;
    // ---- detail panel
    const dy = Theme.footerTop() - 6 - detailH;
    const n = sc.node();
    Theme.panel(ctx, m.l, dy, m.cw, detailH, { flat: true, accent: BRANCH_COL[BRANCHES[sc.col]] });
    if (!n) { T.draw(ctx, "Nothing here.", m.l + 14, dy + 12, { size: "m", color: C.textDim }); Theme.footer(ctx, HINTS); return; }
    const rank = rankOf(n.id);
    const cur = n.ranks && n.ranks[rank - 1];
    const next = n.ranks && n.ranks[rank];
    T.draw(ctx, (next ? next.name : (cur && cur.name) || n.name) + (n.maxRank > 1 ? "  (rank " + Math.min(rank + (next ? 1 : 0), n.maxRank) + " of " + n.maxRank + ")" : ""), m.l + 14, dy + 8, { size: "m", color: C.brassLit, maxWidth: m.cw - 220 });
    const why = blocked(n.id);
    T.draw(ctx, why === null ? "A: take it (1 point)" : why, m.r - 14, dy + 10, { size: "s", align: "right", color: why === null ? C.good : C.warn, maxWidth: m.cw * 0.4 });
    const desc = next ? next.desc : (cur ? cur.desc : n.desc);
    const lines = T.drawWrapped(ctx, desc || "", m.l + 14, dy + 32, m.cw - 28, { size: "s", color: C.text });
    let ey = dy + 32 + lines * 15 + 4;
    const eff = (next && next.effects) || (cur && cur.effects) || null;
    if (eff) {
      const ks = Object.keys(eff);
      let ex = m.l + 14;
      for (let i = 0; i < ks.length; i++) {
        const txt = effectText(ks[i], eff[ks[i]]);
        const w = T.width(txt, "s") + 14;
        if (ex + w > m.r - 14) break;
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        UI.roundRect(ctx, ex, ey, w, 17, 4); ctx.fill();
        T.draw(ctx, txt, ex + 7, ey + 2, { size: "s", color: C.signal });
        ex += w + 6;
      }
      ey += 20;
    }
    if (rank > 0 && cur && next) T.draw(ctx, "Held: " + cur.name + " — " + cur.desc, m.l + 14, ey, { size: "s", color: C.textDim, maxWidth: m.cw - 28 });
    else if (rank > 0 && !next) T.draw(ctx, "Full rank. Nothing more to buy here.", m.l + 14, ey, { size: "s", color: C.good });
    const p = P();
    if (p && p.respecCost) T.draw(ctx, "SELECT: respec for " + p.respecCost() + " marks", m.r - 14, dy + detailH - 20, { size: "s", align: "right", color: C.dim });
    Theme.footer(ctx, HINTS);
  };

  sc.BRANCHES = BRANCHES;
  sc.effectText = effectText;
  sc.open = function (p) { return MQ.Scenes.pushP(sc, p || {}); };
  UI.Perks = sc;
})();
