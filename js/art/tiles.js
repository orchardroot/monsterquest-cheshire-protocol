// STUB — owned by art (painters) / world (catalogue names + properties).
// Foundation ships the full NAMED catalogue with correct properties and
// flat-colour placeholder painters. The art workstream replaces painters
// (keep ids and properties stable; maps depend on them).
// =============================================================
// MonsterQuest v2 — MQ.Tiles: named tile catalogue + painters
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const ART = MQ.ART;

  const defs = {};
  const cache = {};        // id|frame|variant → canvas
  const Tiles = { defs: defs, cache: cache };

  const DEFAULTS = {
    solid: false, water: false, grass: false, ledge: null, encounter: null, layer: "ground",
    anim: null, art: null, pal: null, paint: null, variants: 1, light: false, interact: null, desc: "", color: "#f0f"
  };

  Tiles.define = function (id, def) {
    const d = U.defaults(def || {}, DEFAULTS);
    d.id = id;
    if (d.water && d.encounter === undefined) d.encounter = "water";
    defs[id] = d;
    return d;
  };
  Tiles.has = function (id) { return !!defs[id]; };
  Tiles.props = function (id) { return defs[id] || null; };
  Tiles.ids = function () { return Object.keys(defs); };
  Tiles.count = function () { return Object.keys(defs).length; };
  Tiles.isSolid = function (id) { const d = defs[id]; return !!(d && (d.solid || d.water)); };
  Tiles.frames = function (id) { const d = defs[id]; return d && d.anim ? d.anim.length : 1; };

  // Placeholder painter: flat colour with a little seeded texture and a
  // recognisable mark for the tile class (solid = darker rim, water = waves...)
  function placeholder(ctx, d, frame, seed) {
    const rnd = U.rng(d.id + ":" + seed);
    ctx.fillStyle = d.color;
    ctx.fillRect(0, 0, ART, ART);
    const dark = U.shade(d.color, 0.82), light = U.shade(d.color, 1.15);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = rnd() < 0.5 ? dark : light;
      ctx.fillRect(Math.floor(rnd() * ART), Math.floor(rnd() * ART), 1 + Math.floor(rnd() * 2), 1);
    }
    if (d.water) {
      ctx.fillStyle = light;
      const off = (frame || 0) % 4;
      for (let y = 2; y < ART; y += 5) { ctx.fillRect((y + off * 2) % ART, y, 3, 1); ctx.fillRect((y + 8 + off * 2) % ART, y + 2, 2, 1); }
    } else if (d.grass) {
      ctx.fillStyle = dark;
      for (let i = 0; i < 6; i++) { const x = 1 + Math.floor(rnd() * 14), y = 2 + Math.floor(rnd() * 12); ctx.fillRect(x, y, 1, 3); ctx.fillRect(x + 1, y - 1, 1, 2); }
    } else if (d.solid) {
      ctx.fillStyle = U.shade(d.color, 0.6);
      ctx.fillRect(0, 0, ART, 1); ctx.fillRect(0, 0, 1, ART); ctx.fillRect(0, ART - 1, ART, 1); ctx.fillRect(ART - 1, 0, 1, ART);
    }
    if (d.ledge) {
      ctx.fillStyle = U.shade(d.color, 0.5);
      ctx.fillRect(0, ART - 4, ART, 2);
    }
    if (d.interact) {
      ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.5;
      ctx.fillRect(6, 6, 4, 4);
      ctx.globalAlpha = 1;
    }
  }

  // get(id, frame, variantSeed) → cached 16×16 canvas
  Tiles.get = function (id, frame, seed) {
    const d = defs[id];
    if (!d) return null;
    frame = d.anim ? ((frame || 0) % d.anim.length) : 0;
    seed = d.variants > 1 ? ((seed || 0) % d.variants) : 0;
    const key = id + "|" + frame + "|" + seed;
    let c = cache[key];
    if (c) return c;
    c = document.createElement("canvas");
    c.width = ART; c.height = ART;
    const ctx = c.getContext("2d");
    if (typeof d.paint === "function") {
      d.paint(ctx, frame, seed, d);
    } else if (d.art) {
      const rows = d.anim ? d.art[frame] || d.art : d.art;
      const img = MQ.Art.render(rows, d.pal || {}, 1, false);
      if (d.under) { const u = Tiles.get(d.under, frame, seed); if (u) ctx.drawImage(u, 0, 0); }
      ctx.drawImage(img, 0, 0);
    } else {
      if (d.under) { const u = Tiles.get(d.under, frame, seed); if (u) ctx.drawImage(u, 0, 0); }
      placeholder(ctx, d, frame, seed);
    }
    cache[key] = c;
    return c;
  };
  Tiles.warm = function () {
    const ks = Object.keys(defs);
    for (let i = 0; i < ks.length; i++) {
      const d = defs[ks[i]];
      const nf = d.anim ? d.anim.length : 1;
      for (let f = 0; f < nf; f++) for (let v = 0; v < d.variants; v++) Tiles.get(ks[i], f, v);
    }
  };
  Tiles.clearCache = function () { const ks = Object.keys(cache); for (let i = 0; i < ks.length; i++) delete cache[ks[i]]; };

  // ---- catalogue ------------------------------------------------------
  // T(id, colour, props). Property shorthands: S solid, W water, G grass
  // encounter, D deco layer, O over layer, A:n animated frames, V:n variants
  const A4 = [0, 1, 2, 3];
  function T(id, color, p) {
    p = p || {};
    const d = { color: color };
    if (p.S) d.solid = true;
    if (p.W) { d.water = true; d.encounter = "water"; }
    if (p.G) { d.grass = true; d.encounter = "grass"; }
    if (p.C) d.encounter = "cave";
    if (p.D) d.layer = "deco";
    if (p.O) d.layer = "over";
    if (p.A) d.anim = p.A === 4 ? A4 : U.range(p.A);
    if (p.V) d.variants = p.V;
    if (p.L) d.ledge = p.L;
    if (p.I) d.interact = p.I;
    if (p.light) d.light = true;
    if (p.under) d.under = p.under;
    d.desc = p.desc || "";
    Tiles.define(id, d);
  }

  // -- ground: grass / paths / floors
  T("grass", "#5aab46", { V: 3, desc: "Short grass" });
  T("grass_dark", "#3f8a34", { V: 2 });
  T("grass_tall", "#3d9a3a", { G: 1, V: 2, desc: "Tall grass — wild encounters" });
  T("grass_moor", "#8a9a4a", { G: 1, V: 2, desc: "Moorland grass — encounters" });
  T("moor_heather", "#8a5aa0", { G: 1, V: 2, desc: "Heather — encounters" });
  T("moor_bog", "#4a5a30", { S: 1, desc: "Bog — impassable" });
  T("flowers_yellow", "#e0d040", { V: 2 });
  T("flowers_red", "#e05050", { V: 2 });
  T("flowers_blue", "#5070e0", { V: 2 });
  T("flowers_white", "#f0f0f0", { V: 2 });
  T("path_dirt", "#b8925a", { V: 2 });
  T("path_cobble", "#9a9aa8", { V: 2 });
  T("path_flag", "#a8a090", { V: 2, desc: "Flagstones" });
  T("path_gravel", "#b0a898", { V: 2 });
  T("path_tarmac", "#505058", { V: 1 });
  T("path_wet", "#7a8a70", { V: 1, desc: "Puddled path" });
  T("sand", "#e8d8a0", { V: 2 });
  T("mud", "#6a4a2a", { V: 2 });
  T("snow", "#f0f4ff", { V: 2 });
  T("salt_flat", "#e8e8f0", { V: 2, desc: "Salt flats" });
  T("salt_crust", "#d8d8e8", { S: 1, desc: "Salt crust ridge" });
  T("orchard_grass", "#6ab04c", { V: 2 });
  T("pine_needles", "#6a5a3a", { V: 2 });
  T("cave_floor", "#6a6070", { C: 1, V: 3, desc: "Cave floor — encounters" });
  T("cave_floor_dark", "#4a4050", { C: 1, V: 2 });
  T("mine_floor", "#5a5048", { C: 1, V: 2 });
  T("floor_wood", "#b08050", { V: 2 });
  T("floor_wood_dark", "#8a6038", { V: 1 });
  T("floor_stone", "#909098", { V: 2 });
  T("floor_tile", "#d8d0c0", { V: 2 });
  T("floor_tile_check", "#c8c8c8", { V: 1 });
  T("floor_carpet", "#a04040", { V: 1 });
  T("floor_lab", "#c0d8e0", { V: 1 });
  T("floor_gym", "#d0a860", { V: 1 });
  T("rug", "#c03030", { V: 1 });
  T("rug_edge", "#a02828", { V: 1 });
  T("platform", "#a8a0a0", { V: 2, desc: "Station platform" });
  T("platform_edge", "#e0d060", { desc: "Platform edge (yellow line)" });
  T("void", "#000000", { S: 1, desc: "Nothing" });

  // -- water
  T("water", "#4a8ad8", { W: 1, A: 4, desc: "Water — needs boat" });
  T("water_deep", "#25538f", { W: 1, A: 4 });
  T("water_canal", "#3a6a9a", { W: 1, A: 4, desc: "Canal water" });
  T("water_river", "#4a90c8", { W: 1, A: 4 });
  T("water_flash", "#5a80a8", { W: 1, A: 4, desc: "Flash / mere" });
  T("water_pond", "#4a7ab0", { W: 1, A: 4 });
  T("brine_pool", "#7ac8c0", { W: 1, A: 4, desc: "Brine pool" });
  T("water_edge", "#6aa0e0", { S: 1, A: 4, desc: "Bank / shallows" });
  T("water_reeds", "#5a9a70", { W: 1, A: 2, desc: "Reeds at the water's edge" });
  T("lake_reeds", "#5a9a70", { S: 1, A: 2, desc: "Reeds (walkable bank blocked)" });
  T("waterfall", "#a0d0f0", { S: 1, A: 4 });
  T("hot_spring", "#c0e0f0", { W: 1, A: 4, I: "spring", desc: "Hot spring — heals" });
  T("shallows", "#8ac0e0", { A: 4, desc: "Shallow water — walkable" });
  T("bridge_wood", "#a07840", { desc: "Wooden bridge" });
  T("bridge_stone", "#8a8a90", { desc: "Stone bridge" });
  T("bridge_rail", "#7a5a30", { S: 1, D: 1, desc: "Bridge railing" });
  T("boat_dock", "#8a6a40", { I: "boat", desc: "Jetty — boat" });
  T("fish_spot", "#3a7ac0", { W: 1, A: 4, I: "fish", desc: "Fishing spot" });

  // -- vegetation
  T("tree_oak", "#2e6d22", { S: 1, V: 2 });
  T("tree_oak_top", "#3a8a2c", { O: 1, V: 2, desc: "Oak canopy (walk behind)" });
  T("tree_pine", "#1e5a2a", { S: 1, V: 2 });
  T("tree_pine_top", "#286a34", { O: 1, V: 2 });
  T("tree_birch", "#6aa050", { S: 1, V: 2 });
  T("tree_birch_top", "#88b860", { O: 1 });
  T("tree_apple", "#4a9a3a", { S: 1, I: "shake", desc: "Apple tree — shake for fruit" });
  T("tree_apple_top", "#5aa848", { O: 1 });
  T("tree_dead", "#5a4a3a", { S: 1 });
  T("tree_willow", "#7aa860", { S: 1 });
  T("tree_autumn", "#c07030", { S: 1, V: 2 });
  T("hedge", "#2f7a2a", { S: 1, V: 2 });
  T("hedge_low", "#3f8a3a", { S: 1 });
  T("bush", "#3a8a3a", { S: 1, V: 2 });
  T("berry_bush", "#3a7a3a", { S: 1, I: "berry", desc: "Berry bush" });
  T("mushroom", "#c8a070", { I: "pick", D: 1 });
  T("stump", "#7a5a30", { S: 1 });
  T("log", "#8a6a3a", { S: 1 });
  T("moss_rock", "#5a7a4a", { S: 1 });

  // -- rock / cliffs / ledges
  T("rock", "#8a8070", { S: 1, V: 2 });
  T("rock_moor", "#7a7a70", { S: 1, V: 2, desc: "Gritstone" });
  T("rock_small", "#9a9080", { S: 1 });
  T("boulder", "#7a7068", { S: 1, I: "push", desc: "Boulder — needs strength" });
  T("cliff_top", "#8a7a60", { S: 1 });
  T("cliff_face", "#6a5a48", { S: 1 });
  T("cliff_left", "#7a6a50", { S: 1 });
  T("cliff_right", "#7a6a50", { S: 1 });
  T("cliff_corner", "#6a5a48", { S: 1 });
  T("cliff_climb", "#9a8a68", { I: "climb", desc: "Climbable crag — needs climb" });
  T("crag", "#5a5058", { S: 1, desc: "Castle crag" });
  T("ledge_down", "#9a8a68", { L: "down", desc: "Ledge — hop down" });
  T("ledge_left", "#9a8a68", { L: "left" });
  T("ledge_right", "#9a8a68", { L: "right" });
  T("ledge_up", "#9a8a68", { L: "up" });
  T("cave_wall", "#3a3040", { S: 1, V: 2 });
  T("cave_wall_top", "#2a2030", { S: 1 });
  T("cave_entrance", "#101018", { I: "door", desc: "Cave mouth" });
  T("stalag", "#8a8090", { S: 1, V: 2 });
  T("ore", "#c0a040", { S: 1, I: "mine", desc: "Ore vein" });
  T("crystal", "#a0d0f0", { S: 1, light: 1, A: 2 });
  T("mine_cart_rail_h", "#7a6a5a", { desc: "Mine cart rails" });
  T("mine_cart_rail_v", "#7a6a5a", {});
  T("mine_cart", "#5a4a40", { S: 1, I: "cart" });
  T("mine_prop", "#8a6a40", { S: 1 });

  // -- buildings: walls / roofs / doors / windows
  T("wall_brick_red", "#a04838", { S: 1, V: 2, desc: "Red brick (mill towns)" });
  T("wall_brick_dark", "#703028", { S: 1 });
  T("wall_stone_sandstone", "#c8a070", { S: 1, V: 2, desc: "Chester sandstone" });
  T("wall_stone_grey", "#8a8a90", { S: 1, V: 2 });
  T("wall_stone_grit", "#6a6a68", { S: 1, desc: "Gritstone wall (moor villages)" });
  T("wall_tudor", "#f0e8d8", { S: 1, desc: "Black-and-white Tudor timber" });
  T("wall_tudor_beam", "#2a2020", { S: 1, desc: "Tudor beam" });
  T("wall_render_white", "#ecece4", { S: 1 });
  T("wall_render_cream", "#e8dcb8", { S: 1 });
  T("wall_glass", "#a0d0e0", { S: 1, desc: "Glass wall (greenhouse/lab)" });
  T("wall_castle", "#7a7a80", { S: 1, desc: "Castle wall" });
  T("wall_castle_top", "#8a8a90", { S: 1, desc: "Battlements" });
  T("wall_city", "#b89060", { S: 1, desc: "Sandstone city wall (walkable top elsewhere)" });
  T("wall_city_walk", "#c8a878", { desc: "City wall walkway" });
  T("wall_interior", "#c8b8a0", { S: 1 });
  T("wall_interior_top", "#8a7a68", { S: 1 });
  T("wall_wainscot", "#a08060", { S: 1 });
  T("roof_slate", "#4a4a5a", { S: 1, V: 2 });
  T("roof_slate_edge", "#3a3a48", { S: 1 });
  T("roof_tile_red", "#b04a3a", { S: 1, V: 2 });
  T("roof_thatch", "#c8a860", { S: 1, V: 2 });
  T("roof_glass", "#b0e0f0", { S: 1, desc: "Greenhouse roof" });
  T("roof_metal", "#7a8a90", { S: 1, desc: "Corrugated roof (salt works)" });
  T("roof_over", "#4a4a5a", { O: 1, desc: "Roof edge drawn above player" });
  T("chimney", "#5a3a30", { S: 1 });
  T("chimney_mill", "#7a4030", { S: 1, desc: "Tall mill chimney" });
  T("chimney_smoke", "#c8c8d0", { O: 1, A: 4 });
  T("door_wood", "#6a4020", { I: "door" });
  T("door_red", "#b02020", { I: "door" });
  T("door_shop", "#3a6aa0", { I: "door" });
  T("door_locked", "#4a3018", { S: 1, I: "door", desc: "Locked door" });
  T("door_gym", "#c0a020", { I: "door" });
  T("door_stairs_up", "#a08060", { I: "door", desc: "Stairs up" });
  T("door_stairs_down", "#705040", { I: "door", desc: "Stairs down" });
  T("window", "#8ac0e0", { S: 1 });
  T("window_lit", "#f0d060", { S: 1, light: 1 });
  T("window_shop", "#a0d0f0", { S: 1 });
  T("shop_awning", "#c03030", { O: 1, desc: "Striped awning" });
  T("sign", "#8a6a40", { S: 1, I: "sign" });
  T("sign_post", "#7a5a30", { S: 1, I: "sign" });
  T("sign_chippy", "#f0c020", { S: 1, I: "sign", desc: "Chippy sign" });
  T("sign_pub", "#5a3a20", { S: 1, I: "sign", desc: "Pub sign" });
  T("sign_station", "#203060", { S: 1, I: "sign", desc: "Station name board" });
  T("station_clock", "#e0e0d0", { S: 1, I: "sign", A: 2, desc: "Station clock" });
  T("noticeboard", "#8a6a40", { S: 1, I: "sign" });
  T("fence_wood", "#a07840", { S: 1 });
  T("fence_wood_post", "#8a6030", { S: 1 });
  T("fence_iron", "#303038", { S: 1 });
  T("fence_stone", "#8a8a80", { S: 1, desc: "Dry stone wall" });
  T("fence_wire", "#8a8a8a", { S: 1 });
  T("gate_wood", "#a07840", { I: "gate", desc: "Gate (opens)" });
  T("gate_iron", "#303038", { S: 1, I: "gate" });
  T("wall_garden", "#a89078", { S: 1 });
  T("steps", "#9a9aa0", {});
  T("pavement", "#b0b0b8", { V: 2 });
  T("kerb", "#909098", {});
  T("road", "#505058", { V: 1 });
  T("road_line", "#e0e0d0", {});
  T("zebra", "#e8e8e0", {});

  // -- street furniture / town deco
  T("lamp", "#303040", { S: 1, light: 1, D: 1 });
  T("lamp_victorian", "#202028", { S: 1, light: 1, D: 1 });
  T("bench", "#8a6a40", { S: 1, D: 1, I: "sit" });
  T("bin", "#3a5a3a", { S: 1, D: 1 });
  T("postbox", "#c02020", { S: 1, D: 1, I: "sign" });
  T("phonebox", "#c02020", { S: 1, D: 1 });
  T("market_stall", "#d0a040", { S: 1, I: "shop", desc: "Market stall" });
  T("market_stall_top", "#e0b050", { O: 1 });
  T("bus_stop", "#5a5a68", { S: 1, D: 1, I: "sign" });
  T("bollard", "#404048", { S: 1, D: 1 });
  T("planter", "#8a6a40", { S: 1, D: 1 });
  T("statue", "#909098", { S: 1, I: "sign" });
  T("bear_statue", "#6a5a4a", { S: 1, I: "sign", desc: "Congleton bear" });
  T("cross_saxon", "#a09880", { S: 1, I: "sign", desc: "Sandbach Saxon cross" });
  T("moai", "#7a7a80", { S: 1, I: "sign", desc: "Moai head (the odd one)" });
  T("white_nancy", "#f0f0f0", { S: 1, I: "sign", desc: "White Nancy folly" });
  T("war_memorial", "#b0b0a8", { S: 1, I: "sign" });
  T("fountain", "#8ab0d0", { S: 1, A: 4 });
  T("well", "#7a7a80", { S: 1, I: "sign" });
  T("bandstand", "#c8b890", { S: 1 });
  T("picnic_table", "#a08050", { S: 1, I: "sit" });
  T("scarecrow", "#c8a060", { S: 1, I: "sign" });
  T("hay_bale", "#e0c060", { S: 1 });
  T("apple_press", "#7a5a30", { S: 1, I: "machine", desc: "Cider / apple press" });
  T("crate", "#a08040", { S: 1 });
  T("barrel", "#8a5a30", { S: 1 });
  T("sack", "#c0a070", { S: 1 });

  // -- Cheshire landmarks & industry
  T("mill_wheel", "#6a4a2a", { S: 1, A: 4, desc: "Silk mill water wheel" });
  T("mill_wall", "#8a4030", { S: 1, desc: "Silk mill brickwork" });
  T("mill_window", "#c0d8e8", { S: 1, desc: "Tall mill window" });
  T("loom", "#7a5a40", { S: 1, I: "machine", desc: "Silk loom" });
  T("silk_bolt", "#d060a0", { S: 1, desc: "Bolts of silk" });
  T("salt_pan", "#c8c8d0", { S: 1, I: "machine", desc: "Salt works evaporating pan" });
  T("salt_pile", "#f0f0f8", { S: 1 });
  T("salt_works_pipe", "#6a6a70", { S: 1 });
  T("brine_pump", "#5a5a60", { S: 1, I: "machine", A: 2, desc: "Brine pump" });
  T("rail_track_h", "#6a6060", { desc: "Rail track" });
  T("rail_track_v", "#6a6060", {});
  T("rail_track_x", "#6a6060", {});
  T("rail_buffer", "#c03030", { S: 1 });
  T("rail_signal", "#3a3a40", { S: 1, A: 2, light: 1 });
  T("train_engine", "#204060", { S: 1, I: "train", desc: "Train (front)" });
  T("train_carriage", "#803030", { S: 1, I: "train", desc: "Train carriage" });
  T("train_door", "#a04040", { I: "train", desc: "Carriage door — travel" });
  T("canal_lock", "#5a4a30", { S: 1, I: "machine", desc: "Canal lock gate" });
  T("canal_lock_beam", "#8a7040", { S: 1 });
  T("towpath", "#a08a60", { V: 2, desc: "Canal towpath" });
  T("narrowboat", "#206040", { S: 1, I: "boat", desc: "Narrowboat" });
  T("boat_lift", "#606870", { S: 1, desc: "Anderton boat lift ironwork" });
  T("boat_lift_top", "#707880", { O: 1 });
  T("dish", "#d0d8e0", { S: 1, desc: "Radio telescope dish (Jodrell)" });
  T("dish_base", "#7a8088", { S: 1 });
  T("dish_top", "#e0e8f0", { O: 1 });
  T("radio_mast", "#8a8a90", { S: 1, light: 1, A: 2 });
  T("castle_gate", "#4a4a50", { I: "door", desc: "Castle gatehouse" });
  T("castle_tower", "#6a6a70", { S: 1 });
  T("portcullis", "#3a3a40", { S: 1, I: "gate" });
  T("church_wall", "#9a9a90", { S: 1 });
  T("church_window", "#6060c0", { S: 1, desc: "Stained glass" });
  T("church_door", "#5a3a20", { I: "door" });
  T("church_spire", "#7a7a80", { S: 1 });
  T("gravestone", "#8a8a88", { S: 1, I: "sign" });
  T("pub_wall", "#f0e8d8", { S: 1 });
  T("pub_door", "#4a2a10", { I: "door" });
  T("chippy_counter", "#e0e0e8", { S: 1, I: "shop", desc: "Chippy counter" });
  T("greenhouse_wall", "#b0e0e8", { S: 1 });
  T("greenhouse_door", "#80b0c0", { I: "door" });
  T("greenhouse_bed", "#5a8a40", { S: 1, I: "pick" });
  T("zoo_fence", "#4a5a4a", { S: 1, desc: "Zoo enclosure fence" });
  T("zoo_enclosure", "#8a9a70", { desc: "Zoo enclosure floor" });
  T("zoo_pool", "#5aa0d0", { W: 1, A: 4 });
  T("zoo_sign", "#3a7a3a", { S: 1, I: "sign" });
  T("pine_forest_floor", "#4a3a2a", { G: 1, V: 2, desc: "Pine forest floor — encounters" });
  T("moor_path", "#7a6a48", { V: 2 });
  T("moor_stone", "#6a6a68", { S: 1, desc: "Standing stone" });
  T("orchard_row", "#6ab04c", {});
  T("racecourse_rail", "#f0f0f0", { S: 1 });
  T("racecourse_turf", "#4aa040", { V: 2 });
  T("mere_jetty", "#8a6a40", { I: "fish" });
  T("airport_fence", "#8a8a8a", { S: 1 });
  T("runway", "#404048", {});
  T("server_rack", "#202830", { S: 1, light: 1, A: 2, I: "pc", desc: "Server rack (Cyber)" });
  T("cable_duct", "#303840", { S: 1 });
  T("terminal", "#20b898", { S: 1, light: 1, A: 2, I: "pc", desc: "Terminal" });
  T("hologram", "#40e0c0", { light: 1, A: 4, D: 1 });

  // -- interiors
  T("counter", "#8a6a40", { S: 1, I: "shop" });
  T("counter_top", "#a08050", { S: 1 });
  T("shelf", "#7a5a30", { S: 1, I: "shelf" });
  T("shelf_books", "#7a5a30", { S: 1, I: "shelf" });
  T("pc", "#3050a0", { S: 1, I: "pc", light: 1, A: 2 });
  T("healer", "#e05070", { S: 1, I: "machine", light: 1, A: 2, desc: "Healing machine" });
  T("machine", "#606070", { S: 1, I: "machine" });
  T("table", "#a08050", { S: 1 });
  T("table_round", "#a08050", { S: 1 });
  T("chair", "#8a6a40", { S: 1 });
  T("stool", "#8a6a40", { S: 1 });
  T("bed", "#c04050", { S: 1, I: "bed", desc: "Bed — rest" });
  T("bed_head", "#a03040", { S: 1 });
  T("tv", "#202028", { S: 1, I: "sign", light: 1 });
  T("bookcase", "#6a4a2a", { S: 1, I: "shelf" });
  T("plant_pot", "#4a8a3a", { S: 1 });
  T("fireplace", "#5a4a40", { S: 1, light: 1, A: 4 });
  T("stove", "#404048", { S: 1, I: "machine" });
  T("sink", "#c8c8d0", { S: 1 });
  T("fridge", "#e0e0e8", { S: 1, I: "shelf" });
  T("wardrobe", "#6a4a2a", { S: 1 });
  T("piano", "#202020", { S: 1, I: "machine" });
  T("bar", "#5a3a20", { S: 1, I: "shop", desc: "Pub bar" });
  T("bar_taps", "#c0a040", { S: 1 });
  T("dartboard", "#c04040", { S: 1, I: "sign" });
  T("fruit_machine", "#e0c030", { S: 1, I: "machine", light: 1, A: 2 });
  T("stairs", "#a08060", { I: "door" });
  T("carpet_stairs", "#a03040", { I: "door" });
  T("mat", "#8a7a5a", {});
  T("mat_welcome", "#8a6a3a", {});
  T("lab_bench", "#c8d0d8", { S: 1, I: "shelf" });
  T("capsule_case", "#e0e0f0", { S: 1, I: "machine", light: 1, desc: "Starter capsules" });
  T("gym_badge_stand", "#c0a020", { S: 1, I: "sign" });
  T("gym_statue", "#909098", { S: 1, I: "sign" });
  T("mirror", "#c0d0e0", { S: 1 });
  T("painting", "#8a6a40", { S: 1, I: "sign" });
  T("clock_wall", "#e0e0d0", { S: 1, I: "sign", A: 2 });
  T("box_pc", "#4060b0", { S: 1, I: "pc", light: 1, A: 2, desc: "Storage box PC" });
  T("brew_vat", "#7a5a30", { S: 1, I: "machine", A: 2, desc: "Brewing vat" });
  T("cash_till", "#c0c0c8", { S: 1, I: "shop" });
  T("cat_bed", "#a0a0c0", { S: 1 });
  T("cat_bowl", "#e0e0e8", { S: 1 });
  T("shadow", "#000000", { D: 1, desc: "Generic shadow deco (drawn translucent)" });

  MQ.Tiles = Tiles;
})();
