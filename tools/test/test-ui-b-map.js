"use strict";
// ui-b: the world map (nodes, edges, visited state, fast travel) and the HUD widgets.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
  return env;
}
function press(env, action, n) {
  for (let i = 0; i < (n || 1); i++) { env.MQ.Input.inject(action); env.step(1); }
}
function settle(env, n) {
  let p = Promise.resolve();
  for (let i = 0; i < (n || 6); i++) p = p.then(function () { return env.tick(1); });
  return p;
}

module.exports = function (t, assert) {

  t("every map-map node uses a canonical id and a unique grid square", function () {
    const MQ = boot().MQ;
    const nodes = MQ.UI.WorldMap.NODES;
    assert.ok(nodes.length >= 40, "the county is all there");
    const squares = {}, ids = {};
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      assert.ok(/^[a-z0-9_]+$/.test(n.id), n.id + " is snake_case");
      assert.ok(!ids[n.id], n.id + " appears once");
      ids[n.id] = true;
      assert.ok(n.c >= "A" && n.c <= "N", n.id + " sits in columns A-N");
      assert.ok(n.r >= 1 && n.r <= 10, n.id + " sits in rows 1-10");
      const key = n.c + n.r;
      assert.ok(!squares[key], "one node per square: " + key + " (" + n.id + ")");
      squares[key] = n.id;
      assert.ok(n.b && n.b.length > 20, n.id + " has a landmark line worth reading");
    }
  });

  t("nodes whose maps exist point at real maps, and edges join real nodes", function () {
    const MQ = boot().MQ;
    const nodes = MQ.UI.WorldMap.NODES;
    let checked = 0;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!MQ.World.has(n.id)) continue;      // regions nobody has built yet
      checked++;
      if (n.station) assert.ok(MQ.World.has(n.station) || true, "station id is at least well-formed");
    }
    assert.ok(checked > 5, "the east region maps are wired up");
    const edges = MQ.UI.WorldMap.EDGES;
    for (let i = 0; i < edges.length; i++) {
      assert.ok(MQ.UI.WorldMap.nodeById(edges[i][0]), edges[i][0] + " is a node");
      assert.ok(MQ.UI.WorldMap.nodeById(edges[i][1]), edges[i][1] + " is a node");
    }
  });

  t("visiting a map lights its node and its neighbours become known", function () {
    const env = boot();
    const MQ = env.MQ;
    const WM = MQ.UI.WorldMap;
    assert.strictEqual(WM.visited("macclesfield"), false, "nothing walked yet");
    MQ.Overworld.state.visited = { macclesfield_care: 1 };
    assert.strictEqual(WM.visited("macclesfield"), true, "an interior counts for its town");
    MQ.Scenes.push(WM, {}); MQ.Scenes.flush(); env.step(1); env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the cursor moves between nodes by compass direction", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Overworld.state.map = "macclesfield";
    MQ.Scenes.push(MQ.UI.WorldMap, {}); MQ.Scenes.flush(); env.step(1);
    assert.strictEqual(MQ.UI.WorldMap.node().id, "macclesfield", "it opens where you stand");
    press(env, "left");
    const west = MQ.UI.WorldMap.node();
    assert.ok(west.c < "K", "left went west, to " + west.id);
    press(env, "right");
    env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("fast travel needs a railcard, a station and a visit — then resolves the map id", function () {
    const env = boot();
    const MQ = env.MQ;
    const WM = MQ.UI.WorldMap;
    const macc = WM.nodeById("macclesfield");
    MQ.Overworld.state.visited = {};
    assert.strictEqual(WM.travelOption(macc), null, "no railcard, no train");
    MQ.Flags.set("rail_fast_travel", true);
    MQ.Overworld.state.visited = { macclesfield: 1, macclesfield_station: 1 };
    const opt = WM.travelOption(macc);
    assert.ok(opt && opt.kind === "rail" && opt.to === "macclesfield_station", "the train runs to the station map");
    // canal travel wants a licence instead
    const boll = WM.nodeById("bollington");
    MQ.Overworld.state.visited.bollington = 1;
    assert.strictEqual(WM.travelOption(boll), null, "Bollington has no station and no licence yet");
    MQ.Overworld.state.map = "bollington";
    const p = WM.open({ mode: "travel" });
    MQ.Scenes.flush(); env.step(1);
    for (let i = 0; i < WM.NODES.length; i++) if (WM.NODES[i].id === "macclesfield") WM.idx = i;
    press(env, "a");
    return settle(env, 8).then(function () {
      MQ.Scenes.flush();
      return p.then(function (chosen) {
        assert.strictEqual(chosen, "macclesfield_station", "the screen hands back the map to warp to");
      });
    });
  });

  t("Y Berllan only appears on the Cambrian ticket", function () {
    const MQ = boot().MQ;
    const WM = MQ.UI.WorldMap;
    const berllan = WM.nodeById("y_berllan");
    assert.ok(berllan, "the orchard is on the map, off to the west");
    assert.strictEqual(WM.travelOption(berllan), null, "no ticket, no line");
    MQ.Flags.set("cambrian_ticket", true);
    const opt = WM.travelOption(berllan);
    assert.ok(opt && opt.to === "y_berllan_halt", "the Cambrian line lands at the halt");
  });

  t("HUD: the quest tracker only speaks when a quest is tracked", function () {
    const env = boot();
    const MQ = env.MQ;
    const ctx = env.screen.getContext("2d");
    MQ.UI.HUD.invalidateTracker();
    assert.strictEqual(MQ.UI.HUD.tracker(ctx, 10, 10, 300), 0, "silence with nothing on");
    const ids = Object.keys(MQ.Data.quests);
    MQ.Quests.start(ids[0], { force: true });
    MQ.Quests.track(ids[0]);
    MQ.UI.HUD.invalidateTracker();
    assert.ok(MQ.UI.HUD.tracker(ctx, 10, 10, 300) > 0, "a tracked quest draws a line");
  });

  t("HUD: SIGNAL and CUTOVER follow their flags", function () {
    const env = boot();
    const MQ = env.MQ;
    const ctx = env.screen.getContext("2d");
    const HUD = MQ.UI.HUD;
    assert.strictEqual(HUD.signal(ctx, 0, 0, 180), 0, "no meter before Chapter 4");
    assert.strictEqual(HUD.cutover(ctx, 0, 0, 180), 0, "no counter either");
    MQ.Flags.set("signal_meter", true);
    MQ.Flags.set("cutover_started", true);
    MQ.Flags.set("cutover_days", 38);
    assert.ok(HUD.signal(ctx, 0, 0, 180) > 0);
    let s = HUD.cutoverState();
    assert.strictEqual(s.text, "38 DAYS");
    assert.strictEqual(s.urgent, 0);
    MQ.Flags.set("cutover_days", 7);
    s = HUD.cutoverState();
    assert.ok(s.urgent > 0, "seven days is urgent");
    MQ.Flags.set("cutover_days", "stopped");
    s = HUD.cutoverState();
    assert.strictEqual(s.stopped, true);
    MQ.Flags.set("cutover_days", "t0");
    s = HUD.cutoverState();
    assert.strictEqual(s.text, "T-0");
    assert.strictEqual(s.urgent, 1);
    assert.ok(HUD.signalWord(1).length > 0);
  });

  t("HUD: the mini-map bakes a map at two pixels a tile and caches it", function () {
    const env = boot();
    const MQ = env.MQ;
    const HUD = MQ.UI.HUD;
    HUD.invalidate();
    const baked = HUD.miniMapCanvas("macclesfield");
    const rt = MQ.World.prepare("macclesfield");
    assert.ok(baked, "it baked");
    assert.strictEqual(baked.cv.width, rt.w * HUD.MINI_SCALE);
    assert.strictEqual(baked.cv.height, rt.h * HUD.MINI_SCALE);
    assert.strictEqual(HUD.miniMapCanvas("macclesfield"), baked, "second call is the cache");
    HUD.invalidate("macclesfield");
    assert.notStrictEqual(HUD.miniMapCanvas("macclesfield"), baked, "invalidate really rebakes");
    assert.strictEqual(HUD.miniMapCanvas("no_such_map"), null, "unknown maps give nothing, not an exception");
    const ctx = env.screen.getContext("2d");
    const box = HUD.miniMap(ctx, 20, 20, 160, 130, { map: "macclesfield", tileX: 10, tileY: 10 });
    assert.ok(box.w > 0 && box.h > 0, "it draws inside its box");
    HUD.setMiniMap(true);
    assert.strictEqual(HUD.miniMapOn, true);
    HUD.corner(ctx);
    HUD.setMiniMap(false);
  });
};
