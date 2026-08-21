// =============================================================
// MonsterQuest v2 — MQ.Shop (content): the shop registry.
// Every `shop:` id declared on a map or NPC (js/world/maps/*.js) needs an
// entry here — js/world/interact.js's I.openShop looks for MQ.Shop.open
// and falls back to a dead till when nothing answers.
// MQ.Shop.open(id, meta) -> Promise<void>, pushes MQ.UI.Shop (js/ui/shop.js)
// with a stock list built from this registry, gated by MQ.Trainer's badge
// count so shops restock as the player progresses.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;

  // ---- shared stock pools, gated by badge count ---------------------------
  function rows(ids) { const out = []; for (let i = 0; i < ids.length; i++) out.push({ id: ids[i] }); return out; }
  function gatedRows(need, ids) {
    const out = [];
    for (let i = 0; i < ids.length; i++) out.push(need > 0 ? { id: ids[i], cond: "badges >= " + need } : { id: ids[i] });
    return out;
  }
  function tiered(tiers) {
    let out = [];
    for (let i = 0; i < tiers.length; i++) out = out.concat(gatedRows(tiers[i][0], tiers[i][1]));
    return out;
  }

  const HEAL_TIERS = [
    [0, ["salve", "antidote"]],
    [1, ["tonic", "burn_balm", "nerve_tonic", "smelling_salts"]],
    [3, ["thaw_flask", "calm_drops", "panacea"]],
    [5, ["elixir", "revive_salts"]],
    [7, ["full_restore"]]
  ];
  const CAPSULE_TIERS = [
    [0, ["capsule_basic"]],
    [2, ["capsule_mesh"]],
    [5, ["capsule_kernel"]]
  ];
  const WEATHER_TIERS = [
    [4, ["rain_jar", "sun_lamp"]],
    [6, ["fog_machine", "wind_whistle"]]
  ];
  const TONIC_TIERS = [
    [3, ["tonic_atk", "tonic_def", "tonic_spa", "tonic_spd", "tonic_spe", "tonic_acc"]]
  ];

  // Basic general store: heals + capsules, always on the shelf everywhere.
  function mart() { return tiered(HEAL_TIERS).concat(tiered(CAPSULE_TIERS)); }
  // A bigger-town general store also stocks weather jars and stat tonics.
  function bigMart() { return mart().concat(tiered(WEATHER_TIERS)).concat(tiered(TONIC_TIERS)); }

  // All 24 non-gym Skill Cards, unlocked in three waves as badges come in.
  const SHOP_TM_MOVES = ["torrent", "flame_burst", "volt_strike", "petal_storm", "rock_slide", "quake", "mind_ray", "night_pulse",
    "data_stream", "hack_slash", "sludge", "wing_attack", "bug_bite", "static_wave", "toxic_dose", "sleep_powder",
    "agility", "encrypt", "firewall_up", "hedge_lay", "signal_box", "mere_mist", "ridge_gale", "beacon_light"];
  function bookStock() {
    const ids = SHOP_TM_MOVES.map(function (m) { return "tm_" + m; });
    return gatedRows(1, ids.slice(0, 8)).concat(gatedRows(3, ids.slice(8, 16))).concat(gatedRows(5, ids.slice(16)))
      .concat(rows(["cipher_lens"]));
  }

  // ---- the 39 shops the world declares -------------------------------------
  const REGISTRY = {
    // Region east (Ch.1-2) ---------------------------------------------------
    shop_alderley_edge: { name: "Alderley Edge Stores", variant: "mart", stock: mart().concat(rows(["boombox"])).concat(gatedRows(1, ["capsule_night"])) },
    shop_alderley_ropes: { name: "Engine Vein Ropes", variant: "mart", stock: rows(["umbrella"]).concat(gatedRows(1, ["copper_coil"])) },
    shop_bollington: { name: "Bollington Stores", variant: "mart", stock: mart() },
    shop_bollington_spokes: { name: "Discovery Spokes", variant: "mart", stock: gatedRows(1, ["focus_band", "walkers_boots"]) },
    shop_lyme_stables: { name: "Lyme Park Stables", variant: "mart", stock: rows(["warm_blanket"]).concat(gatedRows(1, ["roasted_acorn", "catmint"])) },
    shop_macclesfield: { name: "Macclesfield Mart", variant: "mart", stock: mart() },
    shop_macclesfield_outfitters: { name: "Silk Row Outfitters", variant: "mart", stock: rows(["silk_scarf"]).concat(gatedRows(2, ["capsule_heavy"])) },
    shop_poynton: { name: "Poynton Market", variant: "market", stock: mart().concat(rows(["apple", "oats", "lucky_coin"])) },
    shop_prestbury_boutique: { name: "Prestbury Boutique", variant: "mart", stock: rows(["damson"]).concat(mart()) },
    shop_teggs_nose: { name: "Tegg's Nose Trading Post", variant: "mart", stock: gatedRows(1, ["walkers_boots", "torch"]) },
    shop_wilmslow: { name: "Wilmslow Mart", variant: "mart", stock: mart() },
    shop_wilmslow_cafe: { name: "Alderley Road Café", variant: "brewery", stock: rows(["toffee"]).concat(gatedRows(1, ["capsule_friend"])) },

    // Region mid (Ch.3-5) -----------------------------------------------------
    shop_congleton: { name: "Congleton Mart", variant: "mart", stock: mart() },
    shop_congleton_bakery: { name: "Beartown Bakehouse", variant: "mart", stock: rows(["toffee", "honey"]).concat(gatedRows(1, ["ember_coal"])) },
    shop_crewe: { name: "Crewe Mart", variant: "mart", stock: bigMart() },
    shop_crewe_railcard: { name: "Railcard Office", variant: "mart", stock: gatedRows(2, ["rail_pass", "ledger"]) },
    shop_holmes_bakery: { name: "Bev's Bakery", variant: "mart", stock: rows(["toffee", "oats", "apple"]).concat(gatedRows(1, ["cat_bell"])) },
    shop_holmes_chapel: { name: "Holmes Chapel Stores", variant: "mart", stock: mart().concat(rows(["blackberry", "sloe"])) },
    shop_jodrell: { name: "Jodrell Gift Shop", variant: "mart", stock: gatedRows(2, ["x_ray_card"]).concat(rows(["roasted_acorn"])) },
    shop_knutsford: { name: "Knutsford Mart", variant: "mart", stock: mart().concat(rows(["catmint"])) },
    shop_knutsford_bookshop: { name: "The Book of Moves", variant: "bookshop", stock: bookStock() },
    shop_sandbach: { name: "Sandbach Mart", variant: "mart", stock: mart().concat(rows(["blackberry", "sloe"])) },
    shop_sandbach_post: { name: "Sandbach Post Office", variant: "mart", stock: gatedRows(2, ["ledger", "x_ray_card"]) },

    // Region south-west (Ch.6-7) ----------------------------------------------
    shop_great_budworth: { name: "Great Budworth Village Store", variant: "market", stock: mart().concat(rows(["honey", "apple"])) },
    shop_middlewich: { name: "Middlewich Mart", variant: "mart", stock: bigMart().concat(gatedRows(3, ["torch"])) },
    shop_nantwich: { name: "Nantwich Mart", variant: "mart", stock: bigMart() },
    shop_nantwich_market: { name: "Nantwich Cheese Show Market", variant: "market", stock: rows(["barley", "cream", "apple"]).concat(gatedRows(3, ["brine_charm"])) },
    shop_northwich: { name: "Northwich Mart", variant: "mart", stock: bigMart().concat(gatedRows(3, ["capsule_brine"])) },
    shop_winsford: { name: "Winsford Rock Mart", variant: "mart", stock: bigMart().concat(gatedRows(3, ["toxic_sachet"])) },
    shop_aberaeron: { name: "Aberaeron Harbour Stores", variant: "brewery", stock: rows(["roe", "perry_pear"]).concat(gatedRows(3, ["capsule_quick"])) },

    // Region north-west (Ch.8-12) ----------------------------------------------
    shop_chester: { name: "Chester Mart", variant: "mart", stock: bigMart().concat(gatedRows(5, ["capsule_net"])) },
    shop_chester_rows: { name: "Chester Rows Traders", variant: "mart", stock: rows(["honey"]).concat(gatedRows(5, ["kevlar_waistcoat"])) },
    shop_daresbury: { name: "Daresbury Mart", variant: "mart", stock: bigMart().concat(gatedRows(5, ["rusty_nail"])) },
    shop_frodsham: { name: "Frodsham Mart", variant: "mart", stock: bigMart() },
    shop_frodsham_trail: { name: "Sandstone Trail Post", variant: "mart", stock: rows(["blackberry", "sloe", "roasted_acorn"]).concat(gatedRows(5, ["weathervane"])) },
    shop_lymm: { name: "Lymm Mart", variant: "mart", stock: bigMart().concat(gatedRows(5, ["capsule_night"])) },
    shop_runcorn: { name: "Runcorn Mart", variant: "mart", stock: bigMart().concat(gatedRows(5, ["heavy_anvil"])) },
    shop_tarporley: { name: "Tarporley Mart", variant: "mart", stock: bigMart().concat(rows(["timber_oak", "timber_pine", "timber_birch"])) },
    shop_warrington: { name: "Warrington Mart", variant: "mart", stock: bigMart().concat(gatedRows(6, ["patch_cable"])) },
    shop_ellesmere_outlet: { name: "Ellesmere Port Outlet", variant: "mart", stock: bigMart().concat(gatedRows(6, ["toxic_sachet"])) }
  };

  const FALLBACK = { name: "General Store", variant: "mart", stock: mart() };

  // ---- MQ.Shop -------------------------------------------------------------
  const Shop = {};
  Shop.REGISTRY = REGISTRY;
  Shop.def = function (id) { return REGISTRY[id] || null; };
  Shop.stockFor = function (id) {
    const def = REGISTRY[id] || FALLBACK;
    return def.stock.slice();
  };
  Shop.open = function (id, meta) {
    const def = REGISTRY[id] || FALLBACK;
    return MQ.UI.Shop.open({
      name: def.name,
      variant: def.variant,
      stock: Shop.stockFor(id),
      sellRate: def.sellRate,
      currency: def.currency,
      greeting: def.greeting
    });
  };

  MQ.Shop = Shop;

  // ---- validation ------------------------------------------------------
  // Every `shop:` id any map declares (on a map itself or on one of its
  // NPCs) must have a registry entry, or the till behind it can never open.
  if (MQ.Data && MQ.Data.validators) {
    MQ.Data.validators.push(function (err) {
      if (!MQ.World || !MQ.World.ids) return;
      const ids = MQ.World.ids();
      for (let i = 0; i < ids.length; i++) {
        const map = MQ.World.get(ids[i]);
        if (!map) continue;
        const declared = {};
        if (map.shop) declared[map.shop] = true;
        const npcs = map.npcs || [];
        for (let j = 0; j < npcs.length; j++) if (npcs[j].shop) declared[npcs[j].shop] = true;
        const keys = Object.keys(declared);
        for (let j = 0; j < keys.length; j++) if (!REGISTRY[keys[j]]) err("shop: map '" + ids[i] + "' declares undefined shop id '" + keys[j] + "'");
      }
    });
  }
})();
