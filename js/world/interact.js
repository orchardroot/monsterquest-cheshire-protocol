// =============================================================
// MonsterQuest v2 — MQ.Interact: the A button in the overworld
// Looks at the tile you are facing (then the one under your feet) and does
// the obvious thing: read the sign, talk to the NPC, pick the thing up, open
// the door, heal at the machine, cast a line. Every hook calls the owning
// system (MQ.Shop, MQ.Fishing, MQ.Quests, …) when it exists and degrades to a
// line of dialogue and an event when it doesn't.
// Owned by: world workstream.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const I = {};
  const P = function (v) { return Promise.resolve(v); };
  const say = function (pages, opts) { return MQ.Dialog ? MQ.Dialog.say(pages, opts) : P(); };
  const has = function (path) {
    const parts = path.split(".");
    let o = MQ;
    for (let i = 0; i < parts.length; i++) { if (!o) return null; o = o[parts[i]]; }
    return typeof o === "function" ? o : (o || null);
  };
  I.has = has;

  // ---- what is there? ----------------------------------------------------
  // Returns a descriptor {kind, ...} or null. `kind` drives I.handlers.
  I.at = function (world, x, y) {
    const map = world.map;
    if (!map || !MQ.World.inBounds(map, x, y)) return null;
    const npc = world.npcAt ? world.npcAt(x, y) : null;
    if (npc) return { kind: "npc", npc: npc, x: x, y: y };
    const item = MQ.World.itemAt(map, x, y);
    if (item && !MQ.Flags.get(item.flag)) return { kind: "item", item: item, x: x, y: y };
    const sign = MQ.World.signAt(map, x, y);
    if (sign) return { kind: sign.lure ? "lure" : "sign", sign: sign, x: x, y: y };
    const tile = MQ.World.groundAt(map, x, y);
    const deco = MQ.World.prepare(map).deco[MQ.World.idx(map, x, y)];
    const kind = MQ.World.interactAt(map, x, y);
    if (kind) return { kind: kind, tile: deco && MQ.Tiles.props(deco) && MQ.Tiles.props(deco).interact ? deco : tile, x: x, y: y };
    return null;
  };

  // Main entry: MQ.Overworld calls this when A is pressed.
  // Returns a Promise while something is happening, or null if nothing was there.
  I.press = function (world) {
    const p = world.player;
    const v = U.dirVec[p.dir] || [0, 1];
    const fx = p.x + v[0], fy = p.y + v[1];
    let d = I.at(world, fx, fy);
    if (!d) {
      // nothing ahead — try under your own feet (items, water you are boating on)
      d = I.at(world, p.x, p.y);
      if (d && d.kind !== "item" && d.kind !== "fish" && d.kind !== "boat") d = null;
    }
    if (!d) return I.searchHidden(world, fx, fy);
    return I.run(world, d);
  };

  I.run = function (world, d) {
    const fn = I.handlers[d.kind] || I.handlers.unknown;
    d.world = world;
    d.map = world.map;
    let r;
    try { r = fn(d, world); }
    catch (e) { MQ.warn("[Interact] handler " + d.kind + " threw", e); return P(); }
    return r && typeof r.then === "function" ? r : P(r);
  };

  // Pressing A at nothing in particular: hidden items and a bit of texture.
  I.searchHidden = function (world, x, y) {
    const map = world.map;
    const item = MQ.World.itemAt(map, x, y);
    if (item && item.hidden && !MQ.Flags.get(item.flag)) return I.pickUp(world, item, true);
    return null;
  };

  // ---- item pickups ------------------------------------------------------
  I.pickUp = function (world, item, hidden) {
    MQ.Flags.set(item.flag, true);
    const n = item.n || 1;
    const name = (MQ.Data && MQ.Data.items && MQ.Data.items[item.item] && MQ.Data.items[item.item].name) || U.capitalise(String(item.item).replace(/_/g, " "));
    const add = has("Inventory.add");
    if (add) add(item.item, n); else MQ.Flags.add("item_" + item.item, n);
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("coin");
    MQ.Events.emit("item:pickup", { id: item.item, n: n, hidden: !!hidden, map: world.map.id });
    if (MQ.Quests && MQ.Quests.check) MQ.Quests.check();
    const line = hidden ? "Something in the grass… " : "";
    return say(line + "JIM found " + name + (n > 1 ? " ×" + n : "") + "!", { sfx: "item" });
  };

  // ---- NPCs --------------------------------------------------------------
  I.talk = function (world, npc) {
    const N = MQ.NPC;
    if (N) N.faceTowards(npc, world.player.x, world.player.y);
    npc.busy = true;
    const ctx = { npc: npc, map: world.map, player: world.player, world: world, S: MQ.Script.cmds };
    let chain;
    const tdata = (npc.trainer && MQ.Data && MQ.Data.trainers && MQ.Data.trainers[npc.trainer]) || null;
    if (npc.trainer && !MQ.NPC.isBeaten(npc)) {
      chain = I.trainerBattle(world, npc, false);
    } else if (npc.script && MQ.Story && MQ.Story.npcScripts && MQ.Story.npcScripts[npc.script]) {
      chain = MQ.Script.runNpc(npc.script, ctx);
    } else if (npc.def.shop) {
      chain = I.openShop(world, npc.def.shop, npc);
    } else if (npc.trainer && MQ.NPC.isBeaten(npc) && tdata && tdata.rematch && has("Rematches.offer")) {
      chain = P(has("Rematches.offer")(npc.trainer, { npc: npc.id, map: world.map.id }));
    } else if (npc.trainer && MQ.NPC.isBeaten(npc) && ((tdata && tdata.after) || npc.def.after)) {
      chain = say((tdata && tdata.after) || npc.def.after, { name: (tdata && tdata.name) || npc.def.name });
    } else if (npc.say) {
      chain = say(npc.say, { name: npc.def.name, portrait: npc.def.portrait || npc.sprite });
    } else if (npc.def.kind && I.handlers[npc.def.kind]) {
      chain = I.run(world, { kind: npc.def.kind, npc: npc, x: npc.x, y: npc.y });
    } else {
      chain = say(I.chatter(world, npc), { name: npc.def.name });
    }
    MQ.Flags.set("talked_" + npc.id, true);
    return P(chain).then(function (r) {
      npc.busy = false;
      if (MQ.Quests && MQ.Quests.check) MQ.Quests.check();
      return r;
    }, function (e) { npc.busy = false; MQ.warn("[Interact] npc script failed", e); });
  };

  // Shared chatter pools (MQ.Data.dialogue, ENGINE §1) with a Cheshire fallback.
  const FALLBACK_CHATTER = [
    "Grand day for it, isn't it.",
    "Mind the puddle. It's deeper than it looks.",
    "You'll want a proper coat up on the tops.",
    "They say the phone masts have been humming odd.",
    "I've not seen a cat that size since the war.",
    "Careful in the long grass. Things live in it."
  ];
  I.chatter = function (world, npc) {
    const D = MQ.Data && MQ.Data.dialogue;
    const town = world.map.dialogue || world.map.id;
    const pool = D && (D[town] || D[world.map.region] || D[npc.def.archetype]);
    if (pool && pool.lines && pool.lines.length) return U.pick(pool.lines);
    return U.pick(FALLBACK_CHATTER);
  };

  // ---- trainers ----------------------------------------------------------
  // Walk-up challenges are driven by MQ.Overworld (the '!' and the approach);
  // this is the dialogue + battle + payout half, shared by both routes.
  I.trainerBattle = function (world, npc, spotted) {
    const data = (MQ.Data && MQ.Data.trainers && MQ.Data.trainers[npc.trainer]) || null;
    const name = (data && data.name) || npc.def.name || "Trainer";
    const cls = (data && data.cls) || "";
    const intro = (data && data.intro) || npc.def.intro || ["Right then. Let's see what you've got."];
    const winLines = (data && data.lose) || ["You've a good hand with them."];   // trainer loses
    const loseLines = (data && data.win) || ["Better luck on the way back."];
    npc.busy = true;
    return P(say(intro, { name: (cls ? cls + " " : "") + name, portrait: npc.sprite }))
      .then(function () {
        if (MQ.Audio && MQ.Audio.playSong) MQ.Audio.playSong(data && data.leader ? "battle_gym" : "battle_trainer");
        const start = has("Battle.start");
        if (!start) return { outcome: "win", stub: true };
        return start({
          kind: data && data.boss ? "boss" : "trainer",
          trainer: data, trainerId: npc.trainer,
          enemyParty: null,
          rules: { canRun: false, canCatch: false },
          spotted: !!spotted
        });
      })
      .then(function (res) {
        const won = !res || res.outcome === "win" || res.stub;
        MQ.Events.emit("battle:end", res);
        if (won) {
          MQ.Flags.set("beat_" + npc.trainer, true);
          npc.beaten = true;
          const payout = (data && data.payout) || 0;
          if (payout) { const gm = has("Inventory.addMoney"); if (gm) gm(payout); else if (MQ.Inventory) MQ.Inventory.money = (MQ.Inventory.money || 0) + payout; else MQ.Flags.add("money", payout); }
          if (MQ.Quests && MQ.Quests.check) MQ.Quests.check();
          return say(winLines, { name: name }).then(function () {
            if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
          });
        }
        return say(loseLines, { name: name });
      })
      .then(function () { npc.busy = false; npc.spotted = false; }, function (e) { npc.busy = false; npc.spotted = false; MQ.warn("[Interact] trainer battle failed", e); });
  };

  // ---- system hooks ------------------------------------------------------
  I.openShop = function (world, shopId, npc) {
    const open = has("Shop.open") || has("UI.Shop.open");
    MQ.Events.emit("shop:open", { shop: shopId, map: world.map.id });
    if (open) return P(open(shopId, { npc: npc && npc.id, map: world.map.id }));
    return say(["\"Sorry, love — the till's not in yet.\"", "(Shops open when the shop screen lands.)"], { name: "Shopkeeper" });
  };

  I.heal = function (world, opts) {
    const heal = has("Party.heal");
    MQ.Events.emit("heal", { map: world.map.id });
    if (heal) heal();
    if (MQ.Audio && MQ.Audio.playSong) MQ.Audio.sfx && MQ.Audio.sfx("heal");
    if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
    if (world.map.id) MQ.Flags.set("visited_care_" + world.map.id, true);
    world.healPoint = { map: world.map.id, x: world.player.x, y: world.player.y };
    if (MQ.Overworld && MQ.Overworld.state) MQ.Overworld.state.respawn = { map: world.map.id, x: world.player.x, y: world.player.y + 1, dir: "down" };
    return say((opts && opts.lines) || ["\"Right — all of them rested and fed.\"", "\"We'll keep the kettle on.\""], { name: "Care Centre" });
  };

  // ---- handlers ----------------------------------------------------------
  I.handlers = {};
  const H = I.handlers;

  H.npc = function (d, world) { return I.talk(world, d.npc); };

  H.item = function (d, world) { return I.pickUp(world, d.item, d.item.hidden); };

  H.catgap = function (d, world) {
    const O = MQ.Overworld;
    if (!O.state.abilities.has("squeeze")) return say("A gap in the railings. A cat could manage it; you could not.");
    if (!O.cats().length) return say("You'd want a cat with you for that.");
    return O.sendCat(d.x, d.y, "meadow");
  };

  H.sign = function (d, world) {
    if (d.tile === "noticeboard" || d.tile === "bus_stop") {
      const b = has("Bounties.open");
      if (b && MQ.Flags.get("bounty_board_open")) return P(b(world.map.id));
    }
    const text = d.sign ? d.sign.text : null;
    if (text) return say(text, { position: "bottom", style: "paper" });
    const tile = d.tile || MQ.World.groundAt(world.map, d.x, d.y);
    const props = tile && MQ.Tiles.props(tile);
    if (props && props.desc) return say(props.desc + ".", { style: "paper" });
    return say("The paint's gone. Whatever it said, the weather won.", { style: "paper" });
  };

  H.lure = function (d, world) {
    const s = d.sign || {};
    const q = s.text ? (Array.isArray(s.text) ? s.text.join(" ") : s.text) : "\"SCAN ME — claim your free capsule.\"";
    return P(MQ.Dialog ? MQ.Dialog.ask(q, [{ label: "Scan it", value: "yes" }, { label: "Walk on", value: "no" }]) : "no")
      .then(function (v) {
        if (v === "yes") {
          MQ.Flags.add("lures_taken", 1);
          MQ.Flags.set("lured", true);
          MQ.Events.emit("lure:taken", { map: world.map.id });
          return say("Nothing happens. Which is somehow worse.");
        }
        MQ.Flags.add("lures_declined", 1);
        MQ.Events.emit("lure:declined", { map: world.map.id });
        return say("You walk on. Good lad.");
      });
  };

  H.door = function (d, world) {
    const w = MQ.World.warpAt(world.map, d.x, d.y);
    if (w) return MQ.Overworld.warp(w.to, w.tx, w.ty, w.dir || "down", { fade: true, kind: w.kind || "door", sfx: "door" });
    if (d.tile === "door_locked") return say("Locked. The kind of locked that means somebody meant it.");
    return say("It doesn't budge.");
  };
  H.gate = function (d, world) {
    const w = MQ.World.warpAt(world.map, d.x, d.y);
    if (w) return H.door(d, world);
    return say("The gate's tied shut with baler twine. Cheshire's finest security.");
  };

  H.pc = function (d, world) {
    const open = has("Box.open") || has("UI.Box.open");
    MQ.Events.emit("pc:open", { map: world.map.id });
    if (open) return P(open());
    return say(["The terminal wakes up.", "STORAGE — 0 boxes configured. It hums, apologetically."], { name: "Terminal" });
  };

  H.machine = function (d, world) {
    const tile = d.tile;
    if (tile === "healer") return I.heal(world);
    if (tile === "brew_vat") { const b = has("Brewing.start"); if (b) return P(b()); return say("The vat burps. Something in there is nearly ready."); }
    if (tile === "fruit_machine") { const g = has("Minigames.start"); if (g) return P(g("fruit_machine")); return say("Two bells and a lemon. The county's oldest tragedy."); }
    if (tile === "loom") return say("The loom clacks on without anyone touching it. Muscle memory, in wood.");
    if (tile === "salt_pan" || tile === "brine_pump") return say("Brine hisses over the pan and comes out as weather you can hold.");
    if (tile === "apple_press") { const b = has("Brewing.start"); if (b) return P(b("press")); return say("The press smells of every autumn at once."); }
    if (tile === "canal_lock") return say("The beam swings. Water finds its level, eventually.");
    if (tile === "piano") { if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("ui_select"); return say("You play the four notes everyone plays. Somebody upstairs groans."); }
    if (tile === "stove") return say("The hob's still warm. Someone's been at the beans.");
    const g = has("Minigames.start");
    MQ.Events.emit("machine:use", { tile: tile, map: world.map.id });
    if (g && d.machine) return P(g(d.machine));
    return say("It whirs, considers you, and carries on with its own business.");
  };

  H.shelf = function (d, world) {
    const tile = d.tile;
    if (tile === "bookcase" || tile === "shelf_books") return say(U.pick([
      "\"A Field Guide to Cheshire Weather\" — every page says 'rain, probably'.",
      "\"Silk: Threads of the Town\", vol. 3. Someone's used a bus ticket as a bookmark.",
      "A folder of network diagrams. Half the boxes are labelled 'TBC'."
    ]), { style: "paper" });
    if (tile === "fridge") return say("Milk, two days past. A pork pie with plans of its own.");
    return say(U.pick(["Tins, mostly. Someone likes mushy peas.", "Neatly stacked. Someone here has a system and defends it."]));
  };

  H.bed = function (d, world) {
    const inn = has("Inn.sleep");
    if (inn) return P(inn());
    const heal = has("Party.heal");
    if (heal) heal();
    if (MQ.Clock) MQ.Clock.setTime(7, 0);
    if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
    MQ.Events.emit("sleep", { map: world.map.id });
    return say("You sleep like a man who walked eleven miles. Morning arrives anyway.");
  };

  H.shop = function (d, world) {
    const shopId = (d.npc && d.npc.def.shop) || world.map.shop || (world.map.id + "_shop");
    return I.openShop(world, shopId, d.npc);
  };

  H.fish = function (d, world) {
    const start = has("Fishing.start");
    if (start) return P(start({ map: world.map.id, x: d.x, y: d.y }));
    const res = MQ.Encounters.fish(world.map, d.x, d.y, {});
    if (!res) return say("You cast. The canal considers it, and declines.");
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("fish_bite");
    return say("A bite! Something " + (res.rare ? "heavy" : "quick") + " on the line…").then(function () {
      return I.wildBattle(world, res);
    });
  };

  H.boat = function (d, world) {
    const st = MQ.Overworld.state;
    if (!st.abilities.has("boat")) return say("A narrowboat, moored and smug. You'd need a licence — and a nerve.");
    MQ.Overworld.setBoat(!st.boating);
    return say(st.boating ? "You step aboard. The engine settles into its slow chug." : "You step back onto the towpath.");
  };

  H.spring = function (d, world) {
    const heal = has("Party.heal");
    if (heal) heal();
    return say("Warm water, faintly salty. Everyone comes out looking better than they went in.");
  };

  H.berry = H.pick = function (d, world) {
    const g = has("Gathering.pick");
    if (g) return P(g(world.map.id, d.x, d.y));
    const flag = "gather_" + world.map.id + "_" + d.x + "_" + d.y;
    const at = MQ.Flags.get(flag) || 0;
    const steps = (MQ.Overworld.state && MQ.Overworld.state.steps) || 0;
    if (at && steps - at < 400) return say("Picked bare. Give it a few hundred paces.");
    MQ.Flags.set(flag, steps);
    MQ.Events.emit("gather", { map: world.map.id, x: d.x, y: d.y, tile: d.tile });
    const add = has("Inventory.add");
    const berry = (world.map.berry) || "blackberry";
    if (add) add(berry, 1); else MQ.Flags.add("item_" + berry, 1);
    return say("You pick a handful. Fingers purple, conscience clear.");
  };

  H.shake = function (d, world) {
    const flag = "shook_" + world.map.id + "_" + d.x + "_" + d.y;
    if (MQ.Flags.get(flag)) return say("Nothing left up there but a wasp with opinions.");
    MQ.Flags.set(flag, true);
    const add = has("Inventory.add");
    if (add) add("apple", 2); else MQ.Flags.add("item_apple", 2);
    return say("Two apples down, one off your head. Fair trade.");
  };

  H.push = function (d, world) {
    if (!MQ.Overworld.state.abilities.has("shove")) return say("It won't shift. You'd need something with more shoulder than you.");
    const ok = MQ.Overworld.shove(d.x, d.y);
    if (!ok) return say("BIGBOY leans on it. It leans back. Nothing doing.");
    MQ.Events.emit("boulder:push", { map: world.map.id, x: d.x, y: d.y });
    return P();
  };

  H.climb = function (d, world) {
    if (!MQ.Overworld.state.abilities.has("climb")) return say("Good holds, if you had the grips for it.");
    return MQ.Overworld.climbAt(d.x, d.y);
  };

  H.mine = function (d, world) {
    const g = has("Gathering.mine");
    if (g) return P(g(world.map.id, d.x, d.y));
    const flag = "mined_" + world.map.id + "_" + d.x + "_" + d.y;
    if (MQ.Flags.get(flag)) return say("Worked out. The green's gone from it.");
    MQ.Flags.set(flag, true);
    const add = has("Inventory.add");
    const ore = (world.map.ore) || "copper_wire";
    if (add) add(ore, 1); else MQ.Flags.add("item_" + ore, 1);
    return say("A green-blue nugget comes away in your hand. Copper, and old.");
  };

  H.cart = function (d, world) {
    const g = has("Minigames.start");
    if (g) return P(g("cart"));
    return say("The cart's wheels are seized solid. It's been waiting here longer than you've been alive.");
  };

  H.sit = function (d, world) {
    MQ.Events.emit("rest", { map: world.map.id, x: d.x, y: d.y });
    if (MQ.Overworld.catSit) MQ.Overworld.catSit();
    return say(U.pick([
      "You sit. The county carries on without you for a minute.",
      "A good bench. Someone's screwed a little brass plate to it: IN MEMORY OF ANOTHER WALKER."
    ]));
  };

  H.train = function (d, world) {
    const rail = has("Rail.open");
    if (rail) return P(rail(world.map.id));
    if (!MQ.Flags.get("rail_fast_travel")) return say("The guard shakes his head. \"Not without a railcard, pal.\"");
    return say("The 14:22 is running eleven minutes late. Some things survive everything.");
  };

  H.unknown = function (d) { return say("Nothing doing."); };

  // ---- shared: a wild battle from an overworld encounter -----------------
  I.wildBattle = function (world, enc) {
    const start = has("Battle.start");
    MQ.Events.emit("battle:start", enc);
    if (!start) { MQ.Events.emit("battle:end", { outcome: "win", stub: true }); return P({ outcome: "win", stub: true }); }
    const weather = MQ.Clock ? MQ.Clock.weatherOf(world.map.weatherZone) : "clear";
    return P(start({
      kind: "wild",
      enemyParty: enc.monster ? [enc.monster] : null,
      species: enc.species, level: enc.level,
      rules: { canRun: true, canCatch: true, weather: weather === "rain" || weather === "sun" || weather === "fog" || weather === "wind" ? weather : null },
      encounter: enc
    })).then(function (res) {
      MQ.Events.emit("battle:end", res);
      MQ.Encounters.afterBattle();
      return res;
    });
  };

  // Register an extra interaction kind (content teams: `MQ.Interact.define('arena', fn)`).
  I.define = function (kind, fn) { I.handlers[kind] = fn; return fn; };

  MQ.Interact = I;
})();
