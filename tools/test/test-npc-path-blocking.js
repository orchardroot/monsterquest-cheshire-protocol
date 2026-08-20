// MonsterQuest v2 — people should not be walls.
// A solid "still" NPC standing in a one-tile-wide walkway seals it: the
// Macclesfield angler used to sit in the middle of the canal towpath, so
// walking the cut east-west simply stopped. These tests walk the real maps
// with the real NPC solidity (MQ.Overworld.boxClear) and complain.
"use strict";
const H = require("../headless");

function boot(mapId) {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init();
  MQ.Input.init();
  MQ.Dialog.auto = true;
  MQ.DEV = false;
  MQ.Scenes.push(MQ.Overworld, { map: mapId });
  MQ.Scenes.flush();
  return env;
}

module.exports = function (t, assert) {

  t("nobody stands in the Macclesfield towpath", function () {
    const env = boot("macclesfield"); const MQ = env.MQ, O = MQ.Overworld, T = MQ.TILE;
    assert.strictEqual(O.state.map, "macclesfield");
    const blocked = [];
    for (let x = 3; x <= 22; x++) {
      if (!O.boxClear(x * T + T / 2, 33 * T + T / 2)) blocked.push(x);
    }
    assert.deepStrictEqual(blocked, [], "towpath tiles blocked at x=" + blocked.join(","));
  });

  t("the angler is beside the cut, not across it", function () {
    const env = boot("macclesfield"); const MQ = env.MQ, W = MQ.World;
    const m = W.get("macclesfield"), rt = W.prepare(m);
    const def = (m.npcs || []).filter(function (n) { return n.id === "npc_macclesfield_angler"; })[0];
    assert.ok(def, "the angler is still on the map");
    function walkable(x, y) {
      if (x < 0 || y < 0 || x >= rt.w || y >= rt.h) return false;
      const i = y * rt.w + x;
      return !rt.solid[i] && !rt.water[i];
    }
    // he may be solid, but there has to be a way past him
    const sealsRow = walkable(def.x - 1, def.y) && walkable(def.x + 1, def.y) &&
      !walkable(def.x, def.y - 1) && !walkable(def.x, def.y + 1);
    const sealsCol = walkable(def.x, def.y - 1) && walkable(def.x, def.y + 1) &&
      !walkable(def.x - 1, def.y) && !walkable(def.x + 1, def.y);
    assert.ok(!(sealsRow || sealsCol) || def.solid === false,
      "the angler seals a one-tile corridor at (" + def.x + "," + def.y + ")");
    // and he is still fishing: the cut is in front of him, path or no path
    let water = false;
    for (let d = 1; d <= 3; d++) if (rt.water[(def.y + d) * rt.w + def.x]) water = true;
    assert.ok(water, "still has the cut in front of him");
    assert.strictEqual(def.dir, "down", "still facing the water");
  });

  t("you can walk the cut from the lock to Sutton bridge", function () {
    const env = boot("macclesfield"); const MQ = env.MQ, O = MQ.Overworld, T = MQ.TILE;
    // breadth-first along the north bank (rows 32-33) with the NPCs in place
    const key = function (x, y) { return x + "," + y; };
    const clear = function (x, y) { return O.boxClear(x * T + T / 2, y * T + T / 2); };
    const seen = {}; const q = [[4, 33]];
    seen[key(4, 33)] = 1;
    assert.ok(clear(4, 33), "the west end of the towpath is walkable");
    while (q.length) {
      const p = q.shift();
      const nb = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
      for (let i = 0; i < nb.length; i++) {
        const x = nb[i][0], y = nb[i][1];
        if (y < 32 || y > 33 || x < 2 || x > 24) continue;
        if (seen[key(x, y)] || !clear(x, y)) continue;
        seen[key(x, y)] = 1; q.push([x, y]);
      }
    }
    assert.ok(seen[key(23, 33)], "reached the bridge end of the towpath");
  });
};
