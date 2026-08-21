// MonsterQuest v2 — the region sweep: nobody has actually played the ~350
// maps of regions mid, south-west and north-west (region-east had a human
// QA pass; the others only ever had their own workstream's own tests). This
// walks every map in the game from its spawn point with every traversal
// ability granted, and checks the things a human playtester would notice
// in the first five minutes but a per-region unit test might not:
//   - every warp, sign, NPC and pickup is actually reachable on foot
//   - no NPC (a trainer, a sign-reader, a shopkeeper) sits in the one gap
//     of a corridor, silently gating off whatever is past it
//   - a stationary trainer's sight line never traps the player against a
//     one-way ledge with no way to back out unfought
//   - every map has at least one way out that a player can actually walk to
// This is deliberately global (all 416 maps, not just mid/sw/nw) — a map
// bug doesn't stop being a bug because its region already has other tests.
"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, W = MQ.World;
  // js/world/maps/_demo.js is a format-exercising fixture from before any
  // real region existed (see its own header comment) — not played content.
  const NOT_PLAYED_CONTENT = { demo_field: 1, demo_house: 1 };
  const ids = W.ids().filter(function (id) { const m = W.get(id); return m && m.legend && !NOT_PLAYED_CONTENT[id]; });

  // Every traversal ability granted, so an ability-gated pocket still
  // counts as reachable — the same convention every region's own tests use.
  const ALL_ABIL = { has: function () { return true; } };

  function floodFill(m, blockedExtra) {
    const seen = {};
    const sp = W.spawnOf(m);
    if (!W.inBounds(m, sp.x, sp.y)) return seen;
    const q = [[sp.x, sp.y]];
    seen[sp.x + "," + sp.y] = true;
    while (q.length) {
      const p = q.pop();
      const nb = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
      for (let i = 0; i < 4; i++) {
        const x = nb[i][0], y = nb[i][1], k = x + "," + y;
        if (seen[k] || !W.inBounds(m, x, y)) continue;
        if (W.blocked(m, x, y, ALL_ABIL)) continue;
        if (blockedExtra && blockedExtra[k]) continue;
        seen[k] = true; q.push([x, y]);
      }
    }
    return seen;
  }
  function near(seen, x, y) {
    return !!(seen[x + "," + y] || seen[(x + 1) + "," + y] || seen[(x - 1) + "," + y] ||
      seen[x + "," + (y + 1)] || seen[x + "," + (y - 1)]);
  }

  // ---- 1. everything a player needs to reach, is reachable -----------------
  t("every warp, sign, NPC and pickup is reachable from the map's spawn point", function () {
    const bad = [];
    ids.forEach(function (id) {
      const m = W.get(id);
      const seen = floodFill(m);
      (m.warps || []).forEach(function (w) { if (!near(seen, w.x, w.y)) bad.push(id + ": warp -> " + w.to + " at (" + w.x + "," + w.y + ")"); });
      (m.signs || []).forEach(function (s) { if (!near(seen, s.x, s.y)) bad.push(id + ": sign at (" + s.x + "," + s.y + ")"); });
      (m.items || []).forEach(function (it) { if (!near(seen, it.x, it.y)) bad.push(id + ": item " + it.item + " at (" + it.x + "," + it.y + ")"); });
      (m.catGaps || []).forEach(function (g) { if (!near(seen, g.x, g.y)) bad.push(id + ": catGap at (" + g.x + "," + g.y + ")"); });
      (m.npcs || []).forEach(function (n) { if (!near(seen, n.x, n.y)) bad.push(id + ": npc " + n.id + " at (" + n.x + "," + n.y + ")"); });
      (m.triggers || []).forEach(function (tr) {
        let ok = false;
        for (let y = tr.y; y < tr.y + (tr.h || 1); y++) for (let x = tr.x; x < tr.x + (tr.w || 1); x++) if (seen[x + "," + y]) ok = true;
        if (!ok) bad.push(id + ": trigger " + tr.script + " at (" + tr.x + "," + tr.y + ")");
      });
    });
    assert.deepStrictEqual(bad, [], "unreachable content:\n" + bad.join("\n"));
  });

  // ---- 2. no NPC stands in the only gap of a corridor -----------------------
  // An NPC is solid by default (js/world/npc.js) and blocks its own tile the
  // same as scenery, but the plain tile flood-fill above never modelled
  // that — so a trainer parked in a one-tile hedge gap would read as
  // "everything's reachable" even though the player physically cannot get
  // past them without talking to them first. For every solid NPC, block
  // its own tile too and check that nothing the baseline could reach
  // becomes unreachable.
  //
  // A shopkeeper in their own doorway, a gym's door attendant, or a
  // trainer down a gym hall are all *meant* to be the only way past —
  // that's the interaction, not a bug — so any NPC with a `trainer`,
  // `shop` or `script` field (i.e. anything the player is expected to
  // talk to) is exempt. What's left is a plain flavour/dialogue NPC with
  // none of those — the pattern that really would softlock the map.
  t("no plain (non-interactive) NPC sits in the only gap of a corridor", function () {
    const bad = [];
    ids.forEach(function (id) {
      const m = W.get(id);
      const npcs = m.npcs || [];
      if (!npcs.length) return;
      const baseline = floodFill(m);
      const pois = [];
      (m.warps || []).forEach(function (w) { pois.push([w.x, w.y, "warp -> " + w.to]); });
      (m.signs || []).forEach(function (s) { pois.push([s.x, s.y, "sign"]); });
      (m.items || []).forEach(function (it) { pois.push([it.x, it.y, "item " + it.item]); });
      npcs.forEach(function (other) { pois.push([other.x, other.y, "npc " + other.id]); });
      const reachablePois = pois.filter(function (p) { return near(baseline, p[0], p[1]); });
      npcs.forEach(function (n) {
        if (n.solid === false) return;
        if (n.trainer || n.shop || n.script) return; // an intentional gate, not a trap
        const key = n.x + "," + n.y;
        const blockedExtra = {}; blockedExtra[key] = true;
        const withNpc = floodFill(m, blockedExtra);
        reachablePois.forEach(function (p) {
          if (p[0] === n.x && p[1] === n.y) return; // the NPC's own tile/self, not relevant
          if (!near(withNpc, p[0], p[1])) bad.push(id + ": npc " + n.id + " at (" + n.x + "," + n.y + ") is the only way to " + p[2] + " at (" + p[0] + "," + p[1] + ")");
        });
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  // ---- 3. a stationary trainer's sight line is never a one-way trap --------
  // Sight is a straight line from the trainer, in the direction it faces,
  // out to `sight` tiles (js/world/npc.js NPC.sightCheck). A player who
  // steps into that line is walked up to and challenged; that's fine and
  // normal. It stops being fine if the tile the player was standing on to
  // get spotted is a ledge-down the player just hopped — ledges are
  // one-way (js/world/mapformat.js World.ledgeBlocks), so that player can
  // no longer retreat the way they came and must fight to get free.
  t("a stationary trainer's sight line never sits on a ledge with no way back", function () {
    const bad = [];
    const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    ids.forEach(function (id) {
      const m = W.get(id);
      (m.npcs || []).forEach(function (n) {
        if (!n.trainer || !n.sight || n.behaviour === "wander" || n.behaviour === "path") return;
        const v = DIRV[n.dir];
        if (!v) return;
        for (let i = 1; i <= n.sight; i++) {
          const x = n.x + v[0] * i, y = n.y + v[1] * i;
          if (!W.inBounds(m, x, y) || W.blocked(m, x, y, ALL_ABIL)) break;
          // the tile the player retreats to is one step further from the trainer
          const bx = x + v[0], by = y + v[1];
          const ledge = W.ledgeAt(m, x, y);
          if (ledge && W.ledgeBlocks(m, x, y, v[0] === 0 ? (v[1] > 0 ? "up" : "down") : (v[0] > 0 ? "left" : "right"))) {
            bad.push(id + ": trainer " + n.id + "'s sight line crosses a ledge at (" + x + "," + y + ") that blocks retreat");
          }
        }
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  // ---- 4. every map has a way back out --------------------------------------
  // A handful of maps are legitimately exited only by a story script (a
  // train ride, a cutscene teleport) rather than a walkable warp tile.
  const SCRIPT_EXIT_ONLY = { cambrian_train: 1 };
  t("every map has at least one warp (or region edge) reachable on foot from spawn", function () {
    const bad = [];
    ids.forEach(function (id) {
      if (SCRIPT_EXIT_ONLY[id]) return;
      const m = W.get(id);
      const warps = W.allWarps ? W.allWarps(m) : (m.warps || []);
      if (!warps.length) { bad.push(id + ": no warp or edge at all"); return; }
      const seen = floodFill(m);
      const reachable = warps.some(function (w) { return near(seen, w.x, w.y); });
      if (!reachable) bad.push(id + ": has warps but none are reachable from spawn");
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });
};
