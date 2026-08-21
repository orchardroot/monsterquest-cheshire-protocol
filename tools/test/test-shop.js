"use strict";
// MonsterQuest v2 — MQ.Shop (content): the shop registry, the real stock it
// hands to MQ.UI.Shop, and the world NPC wiring that opens it.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;   // say yes to confirmations
  MQ.Flags.reset();
  ["Inventory", "Trainer", "Party", "Quests"].forEach(function (k) {
    if (MQ[k] && MQ[k].saveProvider) MQ[k].saveProvider.load(null);
  });
  return env;
}
function press(env, action, n) {
  for (let i = 0; i < (n || 1); i++) { env.MQ.Input.inject(action); env.step(1); }
}
function settle(env, n) {
  let p = Promise.resolve();
  for (let i = 0; i < (n || 4); i++) p = p.then(function () { return env.tick(1); });
  return p;
}
function pump(env, n) {
  let i = 0;
  return new Promise(function (resolve) {
    (function loop() { if (i++ >= n) return resolve(); env.step(1); setImmediate(loop); })();
  });
}

module.exports = function (t, assert) {

  t("every `shop:` id any map declares has a registry entry", function () {
    const env = boot(); const MQ = env.MQ, W = MQ.World;
    const ids = W.ids();
    const declared = {};
    for (let i = 0; i < ids.length; i++) {
      const map = W.get(ids[i]);
      if (map.shop) declared[map.shop] = ids[i];
      const npcs = map.npcs || [];
      for (let j = 0; j < npcs.length; j++) if (npcs[j].shop) declared[npcs[j].shop] = ids[i];
    }
    const missing = Object.keys(declared).filter(function (id) { return !MQ.Shop.REGISTRY[id]; });
    assert.deepStrictEqual(missing, [], "shop ids with no registry entry: " + missing.join(", "));
    assert.ok(Object.keys(declared).length > 30, "expected ~39 declared shop ids, saw " + Object.keys(declared).length);
  });

  t("every registry entry stocks real, priced, buyable items", function () {
    const env = boot(); const MQ = env.MQ;
    const ids = Object.keys(MQ.Shop.REGISTRY);
    assert.ok(ids.length >= 30);
    ids.forEach(function (id) {
      const def = MQ.Shop.REGISTRY[id];
      assert.ok(def.name, id + " needs a name");
      assert.ok(MQ.UI.Shop.VARIANTS[def.variant], id + " has an unknown variant '" + def.variant + "'");
      assert.ok(def.stock.length > 0, id + " has no stock at all");
      def.stock.forEach(function (row) {
        const it = MQ.Data.items[row.id];
        assert.ok(it, id + " stocks unknown item '" + row.id + "'");
        assert.ok(it.price > 0, id + " stocks '" + row.id + "' which has no price (kind " + it.kind + ")");
        if (row.cond) assert.strictEqual(typeof MQ.Flags.test(row.cond), "boolean", id + "'s cond on '" + row.id + "' does not evaluate");
      });
    });
  });

  t("higher-badge stock is gated and unlocks as badges come in", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Trainer.badges.clear();
    const gated = MQ.Shop.stockFor("shop_alderley_edge").filter(function (r) { return r.cond; });
    assert.ok(gated.length > 0, "shop_alderley_edge should have at least one badge-gated row");
    assert.strictEqual(MQ.Flags.test(gated[0].cond), false, "locked with no badges");
    ["packet", "cipher", "bear"].forEach(function (b) { MQ.Trainer.addBadge(b); });
    assert.strictEqual(MQ.Flags.test(gated[0].cond), true, "unlocked with three badges");
  });

  t("MQ.Shop.open opens the real shop screen, buys, and takes the money", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Inventory.money = 100000;
    const before = MQ.Inventory.money;
    const p = MQ.Shop.open("shop_alderley_edge");
    MQ.Scenes.flush();
    env.step(1); env.render();
    assert.strictEqual(MQ.Scenes.top().id, "shop", "the shop scene is on top");
    assert.strictEqual(MQ.UI.Shop.shopName, "Alderley Edge Stores");
    assert.ok(MQ.UI.Shop.rows.length > 0, "there is something to buy");
    const row = MQ.UI.Shop.rows[0];
    press(env, "a");
    return settle(env, 3).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "quantity", "quantity picker opened");
      press(env, "a");                                  // buy 1
      return settle(env, 4);
    }).then(function () {
      assert.strictEqual(MQ.Inventory.count(row.id), 1, "the item landed in the bag");
      assert.strictEqual(MQ.Inventory.money, before - row.price, "the price came out of the wallet");
      press(env, "b");                                  // leave
      MQ.Scenes.flush();
      return p;
    });
  });

  t("an unregistered shop id still opens on the general fallback stock rather than crashing", function () {
    const env = boot(); const MQ = env.MQ;
    const p = MQ.Shop.open("shop_does_not_exist");
    MQ.Scenes.flush();
    env.step(1); env.render();
    assert.strictEqual(MQ.Scenes.top().id, "shop");
    assert.ok(MQ.UI.Shop.rows.length > 0, "the fallback general store still has stock");
    MQ.Scenes.pop(null); MQ.Scenes.flush();
    return p;
  });

  // ---- world wiring: an NPC's `shop` field reaches MQ.Shop.open -----------
  function fixtures(MQ) {
    const W = MQ.World;
    W.defineMap("shoptest_field", {
      name: "Shop Test Field", region: "east", outdoor: true, music: "route_east", weatherZone: "east", ambience: "forest",
      legend: { ".": "grass", "T": "tree_oak", " ": null },
      layers: { ground: ["TTTTT", "T...T", "T...T", "T...T", "TTTTT"] },
      npcs: [{ id: "shoptest_keeper", x: 2, y: 2, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_alderley_edge" }],
      spawnPoint: { x: 2, y: 3 }, healPoint: { x: 2, y: 3 }, landmark: { name: "Test", x: 2, y: 3 }
    });
  }
  function bootWorld() {
    const env = boot(); const MQ = env.MQ;
    fixtures(MQ);
    MQ.Scenes.push(MQ.Overworld, { map: "shoptest_field" });
    MQ.Scenes.flush();
    return env;
  }

  t("walking up to a shop NPC and pressing A opens the real shop, not the dead-till fallback", function () {
    const env = bootWorld(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(2, 3, "up");                        // facing the shopkeeper at (2,2)
    MQ.Input.inject("a");
    return pump(env, 12).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "shop", "the NPC's shop field opened the real shop screen");
      assert.strictEqual(MQ.UI.Shop.shopName, "Alderley Edge Stores");
      MQ.Scenes.pop(null); MQ.Scenes.flush();
    });
  });

};
