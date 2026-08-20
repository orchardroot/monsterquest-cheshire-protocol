// MonsterQuest v2 — region-northwest: every map loads, is walkable, joins up.
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("../headless");
const ROOT = path.resolve(__dirname, "..", "..");

// The five files this workstream owns that the shipped contract order in
// tools/gen-index.js does not yet cover (see the report's NEEDS). Until they
// are listed there, the tests splice them in themselves so that
// `node tools/test/run.js region-northwest` works on a clean tree.
function nwFiles() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const files = [];
  const re = /<script\s+src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) files.push(m[1]);
  const add = function (before, extra) {
    const keep = extra.filter(function (f) { return files.indexOf(f) < 0 && fs.existsSync(path.join(ROOT, f)); });
    const i = files.indexOf(before);
    if (i < 0) { files.push.apply(files, keep); return; }
    files.splice.apply(files, [i, 0].concat(keep));
  };
  add("js/data/dialogue.js", ["js/data/encounters_nw.js", "js/data/trainers_nw.js", "js/data/quests_nw.js"]);
  const maps = fs.readdirSync(path.join(ROOT, "js/world/maps"))
    .filter(function (f) { return /^nw.*\.js$/.test(f); }).sort()
    .map(function (f) { return "js/world/maps/" + f; });
  add("js/battle/effects.js", maps);
  const story = ["js/story/npcs_nw.js", "js/story/endings.js"];
  const chapters = fs.readdirSync(path.join(ROOT, "js/story/chapters"))
    .filter(function (f) { return /^(ch0[89]|ch1[012]|postgame).*\.js$/.test(f); }).sort()
    .map(function (f) { return "js/story/chapters/" + f; });
  add("js/boot.js", story.concat(chapters));
  return files;
}
const load = function (opts) { return H.load(Object.assign({ files: nwFiles() }, opts || {})); };

module.exports = function (t, assert) {
  const env = load();
  const MQ = env.MQ, W = MQ.World;

  const TOWNS = ["tarporley", "frodsham", "runcorn", "daresbury", "lymm", "warrington", "chester", "ellesmere_port", "parkgate"];
  const SITES = [
    "delamere_forest", "delamere_blakemere", "delamere_old_pale", "delamere_night_glade",
    "delamere_eddisbury", "delamere_ranger_hut",
    "beeston_castle", "beeston_castle_keep", "beeston_castle_well", "beeston_castle_summit",
    "beeston_arena", "peckforton_castle",
    "frodsham_hill", "frodsham_marsh",
    "runcorn_silver_jubilee_bridge", "runcorn_mersey_gateway", "runcorn_halton_castle", "runcorn_norton_priory",
    "daresbury_church", "daresbury_lab",
    "lymm_dam", "warrington_arcade", "warrington_arena", "warrington_town_hall", "warrington_gym_gondola",
    "chester_walls", "chester_northgate", "chester_cathedral", "chester_amphitheatre",
    "chester_rows", "chester_roodee", "chester_groves", "chester_edgars_field",
    "chester_zoo", "chester_zoo_penguins", "chester_zoo_keeper_hut",
    "ellesmere_port_boat_museum", "ellesmere_port_mirror_boat", "ellesmere_port_outlet",
    "ince_marshes", "ince_intake", "parkgate_ice_cream"
  ];
  const ROUTES = [
    "route_frodsham_delamere", "route_delamere_winsford", "route_delamere_tarporley",
    "route_tarporley_beeston", "route_tarporley_chester", "route_runcorn_frodsham",
    "route_warrington_daresbury", "route_daresbury_runcorn", "route_lymm_warrington",
    "route_chester_zoo", "route_zoo_ellesmere", "route_ellesmere_parkgate",
    "route_ellesmere_ince", "route_ince_frodsham"
  ];
  const GYMS = ["runcorn_gym", "warrington_gym"];
  const STACK = ["stack_lobby", "stack_breaker_room"];
  for (let i = 1; i <= 8; i++) STACK.push("stack_hall_" + i);
  for (let i = 1; i <= 5; i++) STACK.push("stack_cold_f" + i);
  const ALL = TOWNS.concat(SITES, ROUTES, GYMS, STACK);

  // Every map this workstream owns: the nodes above plus everything named
  // after one of them (interiors, houses, care centres, sub-maps).
  const PREFIX = TOWNS.concat(["delamere", "beeston", "peckforton", "stack", "ince", "route_frodsham",
    "route_delamere", "route_tarporley", "route_runcorn", "route_warrington", "route_daresbury",
    "route_lymm", "route_chester_zoo", "route_zoo", "route_ellesmere", "route_ince", "chester_zoo"]);
  function isNW(id) {
    for (let i = 0; i < PREFIX.length; i++) if (id === PREFIX[i] || id.indexOf(PREFIX[i] + "_") === 0) return true;
    return false;
  }
  const nwIds = W.ids().filter(isNW);

  t("the world validates with zero problems", function () {
    const errs = W.validate();
    assert.strictEqual(errs.length, 0, errs.join("\n"));
    const dat = MQ.Data.validate();
    assert.strictEqual(dat.length, 0, dat.join("\n"));
  });

  t("every region-northwest map exists and is the right shape", function () {
    const missing = ALL.filter(function (id) { return !W.has(id); });
    assert.deepStrictEqual(missing, [], "missing maps: " + missing.join(", "));
    TOWNS.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width >= 36 && m.width <= 66, id + " width " + m.width);
      assert.ok(m.height >= 28 && m.height <= 48, id + " height " + m.height);
      assert.ok(m.landmark, id + " has no landmark");
      assert.ok(m.spawnPoint, id + " has no spawnPoint");
      assert.ok(m.healPoint, id + " has no healPoint");
      assert.strictEqual(typeof m.dialogue, "string", id + " has no dialogue pool");
    });
    ROUTES.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width * m.height >= 600, id + " is too small (" + m.width + "x" + m.height + ")");
      assert.ok(m.encounters, id + " has no encounter block");
    });
    assert.ok(nwIds.length >= 100, "region-northwest ships " + nwIds.length + " maps");
  });

  t("every legend character in every nw map resolves to a real tile", function () {
    const bad = [];
    nwIds.forEach(function (id) {
      const m = W.get(id);
      Object.keys(m.legend).forEach(function (ch) {
        const tid = m.legend[ch];
        if (tid !== null && !MQ.Tiles.has(tid)) bad.push(id + ": '" + ch + "' -> " + tid);
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  function approachable(m, x, y) {
    if (!W.inBounds(m, x, y)) return false;
    if (!W.isSolid(m, x, y)) return true;
    return !W.isSolid(m, x + 1, y) || !W.isSolid(m, x - 1, y) ||
      !W.isSolid(m, x, y + 1) || !W.isSolid(m, x, y - 1);
  }

  t("spawn points, heal points, NPCs, items and rest points are stood on real ground", function () {
    const bad = [];
    nwIds.forEach(function (id) {
      const m = W.get(id);
      if (m.spawnPoint && W.isSolid(m, m.spawnPoint.x, m.spawnPoint.y)) bad.push(id + ": spawnPoint is solid");
      if (m.healPoint && !W.inBounds(m, m.healPoint.x, m.healPoint.y)) bad.push(id + ": healPoint out of bounds");
      (m.npcs || []).forEach(function (n) {
        if (!approachable(m, n.x, n.y)) bad.push(id + ": npc " + n.id + " walled in at (" + n.x + "," + n.y + ")");
        if (n.trainer && W.isSolid(m, n.x, n.y)) bad.push(id + ": trainer " + n.id + " stands in scenery");
      });
      (m.items || []).forEach(function (it) {
        if (!approachable(m, it.x, it.y)) bad.push(id + ": item " + it.item + " walled in at (" + it.x + "," + it.y + ")");
      });
      (m.restPoints || []).forEach(function (r) {
        if (!approachable(m, r.x, r.y)) bad.push(id + ": restPoint walled in at (" + r.x + "," + r.y + ")");
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("signs sit on something you can face and read", function () {
    const bad = [];
    nwIds.forEach(function (id) {
      const m = W.get(id);
      (m.signs || []).forEach(function (s) {
        if (!W.isSolid(m, s.x, s.y) && !W.interactAt(m, s.x, s.y)) bad.push(id + ": sign at (" + s.x + "," + s.y + ") is on open ground");
        if (!approachable(m, s.x, s.y)) bad.push(id + ": sign at (" + s.x + "," + s.y + ") cannot be stood next to");
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  // Flood fill from the spawn point with every traversal ability granted.
  function reach(m) {
    const seen = {};
    const sp = W.spawnOf(m);
    const q = [[sp.x, sp.y]];
    seen[sp.x + "," + sp.y] = true;
    const abil = { has: function () { return true; } };
    while (q.length) {
      const p = q.pop();
      const nb = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
      for (let i = 0; i < 4; i++) {
        const x = nb[i][0], y = nb[i][1], k = x + "," + y;
        if (seen[k] || !W.inBounds(m, x, y)) continue;
        if (W.blocked(m, x, y, abil)) continue;
        seen[k] = true; q.push([x, y]);
      }
    }
    return seen;
  }

  t("every warp is reachable on foot from the map's spawn point", function () {
    const bad = [];
    nwIds.forEach(function (id) {
      const m = W.get(id);
      const seen = reach(m);
      (m.warps || []).forEach(function (w) {
        const near = seen[w.x + "," + w.y] || seen[(w.x + 1) + "," + w.y] || seen[(w.x - 1) + "," + w.y] ||
          seen[w.x + "," + (w.y + 1)] || seen[w.x + "," + (w.y - 1)];
        if (!near) bad.push(id + " -> " + w.to + " at (" + w.x + "," + w.y + ")");
      });
    });
    assert.deepStrictEqual(bad, [], "unreachable warps:\n" + bad.join("\n"));
  });

  t("every warp lands somewhere walkable and every link round-trips", function () {
    const bad = [];
    nwIds.forEach(function (id) {
      const m = W.get(id);
      (m.warps || []).forEach(function (w) {
        const tm = W.get(w.to);
        if (!tm) { bad.push(id + ": no map " + w.to); return; }
        if (W.isSolid(tm, w.tx, w.ty)) bad.push(id + " -> " + w.to + " lands on solid (" + w.tx + "," + w.ty + ")");
        const back = (tm.warps || []).some(function (v) { return v.to === id; });
        if (!back) bad.push(id + " -> " + w.to + " is one-way");
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("the whole region is one connected component from Delamere", function () {
    const seen = { delamere_forest: true };
    const q = ["delamere_forest"];
    while (q.length) {
      const id = q.pop();
      const m = W.get(id);
      (m.warps || []).forEach(function (w) {
        if (!seen[w.to] && W.has(w.to)) { seen[w.to] = true; q.push(w.to); }
      });
    }
    const orphans = nwIds.filter(function (id) { return !seen[id]; });
    assert.deepStrictEqual(orphans, [], "not reachable from Delamere Forest: " + orphans.join(", "));
  });

  t("encounter tables, fishing spots and trainers all resolve", function () {
    const D = MQ.Data;
    const bad = [];
    nwIds.forEach(function (id) {
      const m = W.get(id);
      if (m.encounters) Object.keys(m.encounters).forEach(function (z) {
        const tid = m.encounters[z];
        if (tid && !D.encounters[tid]) bad.push(id + ": missing encounter table " + tid);
      });
      if (m.fishing && !D.encounters[m.fishing]) bad.push(id + ": missing fishing table " + m.fishing);
      (m.npcs || []).forEach(function (n) {
        if (n.trainer && !D.trainers[n.trainer]) bad.push(id + ": missing trainer " + n.trainer);
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("the region's data ships the bosses, the leaders and the League", function () {
    const D = MQ.Data;
    ["leader_ria", "leader_mo", "whitehat_sue", "whitehat_raj", "whitehat_kim", "whitehat_doc",
      "champion_vex", "champion_vex_tuned", "vex_4", "boss_understudy_beeston", "boss_gateway",
      "boss_root", "boss_glitchra", "boss_oracle", "boss_stack_remnant"].forEach(function (id) {
        assert.ok(D.trainers[id], "missing trainer " + id);
      });
    assert.strictEqual(D.trainers.leader_ria.leader.badge, "badge_proxy");
    assert.strictEqual(D.trainers.leader_mo.leader.badge, "badge_admin");
    assert.ok(D.trainers.leader_ria.boss.phases.length >= 2, "Ria has boss phases");
    assert.strictEqual(D.trainers.leader_mo.boss.phases.length, 3, "Mo has three phases");
    assert.ok(D.trainers.boss_oracle.boss.phases.length >= 3, "ORACLE has three phases");
    assert.ok(D.trainers.boss_root.boss.phases.some(function (p) {
      return (p.events || []).some(function (e) { return e.boostSelf && Object.keys(e.boostSelf).some(function (k) { return e.boostSelf[k] < 0; }); });
    }), "ROOT wants to lose");
    ["main_08_the_ruin", "main_09_bridge_traffic", "main_10_draw_your_own_conclusions",
      "main_11_the_sky_is_quiet", "main_12_the_firewall", "main_13_fifth_pulse",
      "case_23_frodsham_beacon", "case_24_runcorn_gauntlet", "case_26_delamere_watch",
      "case_27_lymm_reflection", "case_28_wire_arcade", "case_29_chester_walls"].forEach(function (id) {
        assert.ok(D.quests[id], "missing quest " + id);
      });
  });

  t("the eight STACK doors open to the badges in the order they were earned", function () {
    const lobby = W.get("stack_lobby");
    const doors = (lobby.warps || []).filter(function (w) { return /^stack_hall_/.test(w.to); });
    assert.strictEqual(doors.length, 8, "eight hall doors");
    doors.forEach(function (w) {
      const n = Number(w.to.replace("stack_hall_", ""));
      assert.strictEqual(w.cond, "stack_doors_opened >= " + n, "door " + n + " gate");
      MQ.Flags.set("stack_doors_opened", n - 1);
      assert.strictEqual(MQ.Flags.test(w.cond), false, "door " + n + " shut at " + (n - 1));
      MQ.Flags.set("stack_doors_opened", n);
      assert.strictEqual(MQ.Flags.test(w.cond), true, "door " + n + " open at " + n);
    });
    MQ.Flags.set("stack_doors_opened", 0);
  });

  t("the ability-gated ways in are gated and the gates parse", function () {
    const gates = {
      beeston_castle_well: "shove && lamp",
      beeston_castle_summit: "climb",
      peckforton_castle: null,
      frodsham_marsh: "waders",
      delamere_night_glade: "time.night || lamp"
    };
    const bee = W.get("beeston_castle");
    Object.keys(gates).forEach(function (target) {
      if (!gates[target]) return;
      const w = (bee.warps || []).concat(W.get("route_runcorn_frodsham").warps || [])
        .concat(W.get("delamere_forest").warps || [])
        .filter(function (v) { return v.to === target; })[0];
      assert.ok(w, "a warp to " + target);
      assert.strictEqual(w.cond, gates[target], target + " gate expression");
      assert.doesNotThrow(function () { MQ.Flags.parse(w.cond); }, target + " gate parses");
    });
  });
};
