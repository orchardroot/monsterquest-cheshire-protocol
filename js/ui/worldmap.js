// =============================================================
// MonsterQuest v2 — MQ.UI.WorldMap (ui-b): Cheshire on one screen.
//   MQ.UI.WorldMap.open({mode:'view'|'travel', warp:false}) -> Promise<mapId|null>
// A stylised 14x10 county grid (WORLD-BIBLE §1: A-N west→east,
// 1-10 north→south) with the canonical map ids of DESIGN-INDEX §5.
// Nodes light up as you visit them, edges draw as you walk them,
// gym towns wear their badge, and stations/canal moorings offer
// fast travel once the story has handed you the means.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }
  function flag(id) { try { return MQ.Flags ? MQ.Flags.get(id) : undefined; } catch (e) { return undefined; } }

  // col letter A..N → 0..13, row 1..10 → 0..9
  function cx(letter) { return letter.charCodeAt(0) - 65; }

  // ---- the county ---------------------------------------------------
  // kind: city town village site dungeon estate
  const NODES = [
    { id: "macclesfield", n: "Macclesfield", c: "K", r: 5, kind: "town", region: "east", station: "macclesfield_station", canal: true, b: "Silk, soot and 108 steps up to the church. Home, and the reason for all of it." },
    { id: "bollington", n: "Bollington", c: "L", r: 4, kind: "village", region: "east", canal: true, b: "Happy Valley under Kerridge. White Nancy sits on the ridge like a full stop." },
    { id: "prestbury", n: "Prestbury", c: "K", r: 4, kind: "village", region: "east", b: "Expensive hedges, laid properly. Cadoc will teach you the billhook if you ask nicely." },
    { id: "poynton", n: "Poynton", c: "L", r: 3, kind: "town", region: "east", station: "poynton_station", b: "Coal under the fields, ponies under the coal, and a daycare yard run by Pit-Pony Pat." },
    { id: "lyme_park", n: "Lyme Park", c: "M", r: 2, kind: "estate", region: "east", b: "Deer, a house pretending to be Italian, and The Cage on the hill watching the road." },
    { id: "teggs_nose", n: "Tegg's Nose", c: "L", r: 6, kind: "site", region: "east", b: "A quarry bitten out of the hill. The Cat and Fiddle is up here, and so, at dusk, is something grinning." },
    { id: "wilmslow", n: "Wilmslow", c: "J", r: 3, kind: "town", region: "bollin", station: "wilmslow_station", gym: "badge_packet", leader: "Sysadmin Ada", b: "Gym one. Turing's house on the edge of town, and an electrician who reboots mid-fight." },
    { id: "styal", n: "Styal", c: "J", r: 2, kind: "site", region: "bollin", b: "Quarry Bank Mill and a waterwheel throttled by a fridge with a support contract." },
    { id: "lindow_moss", n: "Lindow Moss", c: "I", r: 3, kind: "dungeon", region: "bollin", b: "Peat, water where the map says none, and something patient underneath. Waders." },
    { id: "alderley_edge", n: "Alderley Edge", c: "J", r: 4, kind: "village", region: "bollin", b: "Copper, folklore and Elis Pennant. The Wizard's Well still takes offerings." },
    { id: "alderley_edge_caverns_b1", n: "Edge Caverns", c: "I", r: 4, kind: "dungeon", region: "bollin", b: "Old copper workings. Three levels down, the knights are still asleep." },
    { id: "knutsford", n: "Knutsford", c: "H", r: 3, kind: "town", region: "bollin", station: "knutsford_station", gym: "badge_cipher", leader: "Madam Gaskell", b: "Gym two. Gaskell's library is a network diagram nobody has updated since 1850." },
    { id: "tatton_park", n: "Tatton Park", c: "H", r: 2, kind: "estate", region: "bollin", b: "Four thousand deer counted where five hundred live. Every extra one had a login." },
    { id: "rostherne_mere", n: "Rostherne Mere", c: "H", r: 1, kind: "site", region: "bollin", b: "The deepest mere in the county, with a bell in it, they say. And a relay, I know." },
    { id: "holmes_chapel", n: "Holmes Chapel", c: "H", r: 6, kind: "village", region: "dane", station: "holmes_chapel_station", b: "A signal box whose levers move in the small hours, and a bakery that opens far too early." },
    { id: "jodrell_bank", n: "Jodrell Bank", c: "I", r: 5, kind: "dungeon", region: "dane", b: "The dish. It listens to quasars and, lately, to something much closer." },
    { id: "congleton", n: "Congleton", c: "I", r: 8, kind: "town", region: "dane", station: "congleton_station", gym: "badge_bear", leader: "Bearward Otis", b: "Gym three. The town that sold its Bible to buy a bear, and never quite lived it down." },
    { id: "bosley_cloud", n: "Bosley Cloud", c: "J", r: 7, kind: "site", region: "dane", b: "A gritstone edge with half of Cheshire underneath it. Grips required for the summit." },
    { id: "little_moreton_hall", n: "Little Moreton Hall", c: "J", r: 8, kind: "site", region: "dane", b: "A house that gave up on right angles in 1560 and has been leaning ever since." },
    { id: "mow_cop", n: "Mow Cop", c: "J", r: 9, kind: "site", region: "dane", b: "A folly built as a ruin. ZEPHYRION rides the storms across it." },
    { id: "sandbach", n: "Sandbach", c: "G", r: 7, kind: "town", region: "dane", b: "Two Saxon crosses in a cobbled square, chalked over by somebody with a cipher and no sense." },
    { id: "crewe", n: "Crewe", c: "F", r: 8, kind: "town", region: "south", station: "crewe_station", gym: "badge_kernel", leader: "Stoker Di", b: "Gym four. Every line in the county passes through here, including the ones nobody built." },
    { id: "nantwich", n: "Nantwich", c: "D", r: 8, kind: "town", region: "south", station: "nantwich_station", gym: "badge_token", leader: "Brine Nell", canal: true, b: "Gym five. Brine baths, black-and-white timber, and an ex-forensics leader who asks better questions than she throws." },
    { id: "hack_green", n: "Hack Green", c: "D", r: 9, kind: "dungeon", region: "south", b: "The secret nuclear bunker, signposted for miles. Telecoms floor, blast doors, bad coffee." },
    { id: "middlewich", n: "Middlewich", c: "F", r: 5, kind: "town", region: "salt", canal: true, b: "Three canals, one big lock, and the Roman salt road running underneath the lot." },
    { id: "winsford", n: "Winsford", c: "E", r: 6, kind: "town", region: "salt", station: "winsford_station", b: "The flashes: lakes where the salt was taken out from under the fields. Something surfaces in them." },
    { id: "northwich", n: "Northwich", c: "F", r: 4, kind: "town", region: "salt", station: "northwich_station", gym: "badge_daemon", leader: "Foreman Jack", canal: true, b: "Gym six. A town built on brine and rebuilt every time it sank." },
    { id: "salt_mine_cage", n: "The Salt Mine", c: "E", r: 5, kind: "dungeon", region: "salt", b: "A white cathedral under the fields, warm and dry, full of shipping containers that should not be there." },
    { id: "anderton", n: "Anderton", c: "F", r: 3, kind: "site", region: "salt", canal: true, b: "The boat lift: fifty feet of Victorian iron that carries narrowboats to work." },
    { id: "great_budworth", n: "Great Budworth", c: "G", r: 3, kind: "village", region: "salt", b: "One street, one church, one curate receiving video calls from a vicar who is not the vicar." },
    { id: "lymm", n: "Lymm", c: "G", r: 1, kind: "village", region: "mersey", canal: true, b: "A dam, a cross and a village that watches the Bridgewater go past at walking pace." },
    { id: "warrington", n: "Warrington", c: "F", r: 1, kind: "town", region: "mersey", station: "warrington_station", gym: "badge_admin", leader: "Netrunner Mo", b: "Gym eight. A NOC in a town hall, an arcade that lies, and a transporter bridge over the Mersey." },
    { id: "daresbury", n: "Daresbury", c: "E", r: 2, kind: "site", region: "mersey", b: "Alice windows in the church, a particle lab up the lane, and THE STACK humming behind both." },
    { id: "runcorn", n: "Runcorn", c: "D", r: 2, kind: "town", region: "mersey", station: "runcorn_station", gym: "badge_proxy", leader: "Chemist Ria", b: "Gym seven. Two bridges, a chemical past, and six fridges that will not go dark." },
    { id: "frodsham", n: "Frodsham", c: "D", r: 3, kind: "town", region: "mersey", station: "frodsham_station", b: "The hill with the memorial and the bench where ROOT finally says it plainly." },
    { id: "delamere_forest", n: "Delamere Forest", c: "D", r: 4, kind: "dungeon", region: "west", b: "The county's last real forest. Blakemere Moss shows you things in the water." },
    { id: "tarporley", n: "Tarporley", c: "C", r: 6, kind: "village", region: "west", b: "A hunting village on the Sandstone Trail, with the best hedge contest in England." },
    { id: "beeston_castle", n: "Beeston Castle", c: "C", r: 7, kind: "dungeon", region: "west", b: "A crag with a ruin on it and a well nobody has ever reached the bottom of." },
    { id: "chester", n: "Chester", c: "B", r: 5, kind: "city", region: "west", station: "chester_station", gym: "league", leader: "The White Hats", canal: true, b: "Walls, Rows, a Roman amphitheatre and THE FIREWALL waiting inside all three." },
    { id: "chester_zoo", n: "Chester Zoo", c: "B", r: 3, kind: "site", region: "west", b: "Somebody is counting the penguins who is not a keeper." },
    { id: "ellesmere_port", n: "Ellesmere Port", c: "B", r: 2, kind: "town", region: "west", station: "ellesmere_port_station", canal: true, b: "Where the canals meet the Manchester Ship Canal, and a boat museum with one boat too many." },
    { id: "ince_marshes", n: "Ince Marshes", c: "C", r: 2, kind: "site", region: "west", b: "Flares over the marsh, and the cooling-water intake for something inland." },
    { id: "parkgate", n: "Parkgate", c: "A", r: 3, kind: "village", region: "west", b: "A promenade with no sea and the best ice cream on the Dee. Wait for the tide." },
    { id: "y_berllan", n: "Y Berllan", c: "A", r: 8, kind: "site", region: "wales", station: "y_berllan_halt", b: "Off the map, over the Cambrian line: an orchard, an elm press, and Mam-gu." }
  ];

  const EDGES = [
    ["macclesfield", "bollington"], ["bollington", "poynton"], ["poynton", "lyme_park"], ["macclesfield", "prestbury"],
    ["prestbury", "wilmslow"], ["wilmslow", "styal"], ["wilmslow", "lindow_moss"], ["wilmslow", "alderley_edge"],
    ["alderley_edge", "alderley_edge_caverns_b1"], ["alderley_edge", "knutsford"], ["knutsford", "tatton_park"],
    ["tatton_park", "rostherne_mere"], ["knutsford", "holmes_chapel"], ["holmes_chapel", "jodrell_bank"],
    ["holmes_chapel", "congleton"], ["congleton", "bosley_cloud"], ["bosley_cloud", "teggs_nose"],
    ["macclesfield", "teggs_nose"], ["congleton", "little_moreton_hall"], ["little_moreton_hall", "mow_cop"],
    ["congleton", "sandbach"], ["sandbach", "crewe"], ["crewe", "nantwich"], ["nantwich", "hack_green"],
    ["nantwich", "winsford"], ["sandbach", "middlewich"], ["middlewich", "winsford"], ["winsford", "northwich"],
    ["middlewich", "northwich"], ["northwich", "anderton"], ["anderton", "great_budworth"], ["great_budworth", "lymm"],
    ["lymm", "warrington"], ["warrington", "daresbury"], ["daresbury", "runcorn"], ["runcorn", "frodsham"],
    ["frodsham", "delamere_forest"], ["delamere_forest", "winsford"], ["delamere_forest", "tarporley"],
    ["tarporley", "beeston_castle"], ["tarporley", "chester"], ["chester", "chester_zoo"], ["chester_zoo", "ellesmere_port"],
    ["ellesmere_port", "parkgate"], ["ellesmere_port", "ince_marshes"], ["ince_marshes", "frodsham"],
    ["salt_mine_cage", "winsford"], ["salt_mine_cage", "northwich"], ["jodrell_bank", "congleton"]
  ];

  const RAIL = ["macclesfield", "wilmslow", "crewe", "nantwich", "sandbach", "holmes_chapel", "winsford", "northwich", "frodsham", "runcorn", "warrington", "chester", "ellesmere_port", "poynton", "knutsford", "congleton"];

  const byId = {};
  for (let i = 0; i < NODES.length; i++) byId[NODES[i].id] = NODES[i];

  // ---- knowledge ----------------------------------------------------
  function visitedMaps() {
    try { if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.visited) return MQ.Overworld.state.visited; } catch (e) { /* ignore */ }
    return null;
  }
  function visited(id) {
    const v = visitedMaps();
    if (v) {
      if (v[id]) return true;
      // an interior counts for its town: macclesfield_care → macclesfield
      const ks = Object.keys(v);
      for (let i = 0; i < ks.length; i++) if (ks[i].indexOf(id + "_") === 0) return true;
    }
    try { if (MQ.Quests && MQ.Quests.visited && MQ.Quests.visited[id]) return true; } catch (e) { /* ignore */ }
    return false;
  }
  function currentMap() {
    try { return (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.map) || null; } catch (e) { return null; }
  }
  function currentNode() {
    const m = currentMap();
    if (!m) return null;
    if (byId[m]) return m;
    for (let i = 0; i < NODES.length; i++) if (m.indexOf(NODES[i].id + "_") === 0) return NODES[i].id;
    // routes: route_macc_bollington → nearest by token
    return null;
  }
  const adjacency = {};
  for (let i = 0; i < EDGES.length; i++) {
    (adjacency[EDGES[i][0]] || (adjacency[EDGES[i][0]] = [])).push(EDGES[i][1]);
    (adjacency[EDGES[i][1]] || (adjacency[EDGES[i][1]] = [])).push(EDGES[i][0]);
  }
  // Known = visited, or next door to somewhere you have been. Everything
  // else is a smudge on the map with a question mark on it.
  function known(id) {
    if (visited(id)) return true;
    const adj = adjacency[id] || [];
    for (let i = 0; i < adj.length; i++) if (visited(adj[i])) return true;
    return false;
  }
  function stationRegistered(node) {
    if (!node.station) return false;
    if (flag("station_" + node.id)) return true;
    const v = visitedMaps();
    if (v && v[node.station]) return true;
    return visited(node.id);
  }
  function ability(id) {
    try {
      const ab = MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities;
      if (ab && ab.has && ab.has(id)) return true;
    } catch (e) { /* ignore */ }
    return !!flag("unlock_" + id);
  }
  function travelOption(node) {
    if (!node) return null;
    if (node.id === "y_berllan") {
      if (!flag("cambrian_ticket")) return null;
      return { kind: "rail", to: node.station || node.id, label: "Cambrian line to Y Berllan" };
    }
    if (node.station && flag("rail_fast_travel") && stationRegistered(node)) {
      return { kind: "rail", to: node.station, label: "Train to " + node.n };
    }
    if (node.canal && ability("boat") && visited(node.id)) {
      return { kind: "canal", to: node.id, label: "Take the boat to " + node.n };
    }
    return null;
  }

  // =============================================================
  // Scene
  // =============================================================
  const sc = { id: "worldmap", touchPad: false, idx: 0, mode: "view", warp: false, rects: [], area: { x: 0, y: 0, w: 0, h: 0 } };
  const HINTS = [{ btn: "b", label: "Back" }, { btn: "dir", label: "Move" }, { btn: "a", label: "Travel" }, { btn: "select", label: "Legend" }];

  sc.enter = function (p) {
    p = p || {};
    sc.mode = p.mode || "view";
    sc.warp = !!p.warp;
    const here = p.focus || currentNode();
    sc.idx = 0;
    if (here) for (let i = 0; i < NODES.length; i++) if (NODES[i].id === here) sc.idx = i;
    TH().sfx("ui_open");
  };
  sc.node = function () { return NODES[sc.idx]; };

  // Nearest node in a direction, biased so a nudge east goes east.
  function moveCursor(dx, dy) {
    const cur = NODES[sc.idx];
    let best = -1, bestScore = 1e9;
    for (let i = 0; i < NODES.length; i++) {
      if (i === sc.idx) continue;
      const n = NODES[i];
      const ox = (cx(n.c) - cx(cur.c)), oy = (n.r - cur.r);
      const along = ox * dx + oy * dy;
      if (along <= 0) continue;
      const across = Math.abs(ox * dy - oy * dx);
      const score = along + across * 2.2;
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best >= 0) { sc.idx = best; TH().sfx("ui_move"); }
  }

  sc.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("left")) { I.consume("left"); moveCursor(-1, 0); }
    if (I.pressed("right")) { I.consume("right"); moveCursor(1, 0); }
    if (I.pressed("up")) { I.consume("up"); moveCursor(0, -1); }
    if (I.pressed("down")) { I.consume("down"); moveCursor(0, 1); }
    if (I.pressed("select")) { I.consume("select"); UI.WorldMapLegend.open(); return; }
    const tp = I.tapAt ? I.tapAt() : null;
    if (tp) {
      for (let i = 0; i < sc.rects.length; i++) {
        const r = sc.rects[i];
        if (r && U.inRect(tp.x, tp.y, r.x, r.y, r.w, r.h)) {
          I.consumeAll();
          if (i === sc.idx) { choose(); } else { sc.idx = i; Theme.sfx("ui_move"); }
          return;
        }
      }
    }
    if (I.pressed("a")) { I.consume("a"); choose(); }
  };

  function choose() {
    const Theme = TH();
    const node = sc.node();
    if (!known(node.id)) { Theme.sfx("ui_error"); Theme.toast("You have not been anywhere near there."); return; }
    const opt = travelOption(node);
    if (!opt) {
      Theme.sfx(visited(node.id) ? "ui_select" : "ui_error");
      Theme.toast(visited(node.id) ? "No line runs there from here. Walk it." : "Not visited yet.");
      return;
    }
    Theme.sfx("ui_select");
    Theme.confirm(opt.label + "?").then(function (ok) {
      if (!ok) return;
      if (sc.warp) {
        try { if (MQ.Overworld && MQ.Overworld.warpTo) MQ.Overworld.warpTo(opt.to, { fade: true }); } catch (e) { /* ignore */ }
      }
      if (MQ.Events) MQ.Events.emit("map:fasttravel", { map: opt.to, kind: opt.kind, node: node.id });
      MQ.Scenes.pop(opt.to);
    });
  }

  // ---- drawing -------------------------------------------------------
  function nodeXY(node, a) {
    const gx = a.x + (cx(node.c) + 0.5) * (a.w / 14);
    const gy = a.y + (node.r - 0.5) * (a.h / 10);
    return { x: gx, y: gy };
  }
  const pA = { x: 0, y: 0 }, pB = { x: 0, y: 0 };
  function posInto(node, a, out) {
    out.x = a.x + (cx(node.c) + 0.5) * (a.w / 14);
    out.y = a.y + (node.r - 0.5) * (a.h / 10);
    return out;
  }

  function drawTerrain(ctx, a) {
    const C = TH().C;
    // land
    ctx.fillStyle = "#1a2420";
    UI.roundRect(ctx, a.x, a.y, a.w, a.h, 10); ctx.fill();
    const cw = a.w / 14, chh = a.h / 10;
    // the Mersey and the ship canal along the north-west
    ctx.fillStyle = "rgba(52,92,120,0.55)";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + chh * 2.4);
    ctx.lineTo(a.x + cw * 3.2, a.y + chh * 1.7);
    ctx.lineTo(a.x + cw * 6.6, a.y + chh * 0.55);
    ctx.lineTo(a.x + cw * 6.6, a.y);
    ctx.lineTo(a.x, a.y);
    ctx.closePath(); ctx.fill();
    // the Dee estuary, bottom-left of the Wirral
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + chh * 2.2);
    ctx.lineTo(a.x + cw * 1.4, a.y + chh * 3.6);
    ctx.lineTo(a.x + cw * 1.9, a.y + chh * 5.2);
    ctx.lineTo(a.x + cw * 0.9, a.y + chh * 6.2);
    ctx.lineTo(a.x, a.y + chh * 5.4);
    ctx.closePath(); ctx.fill();
    // the eastern hills: hatched ridge under Macclesfield Forest
    ctx.save();
    ctx.strokeStyle = "rgba(120,104,150,0.35)"; ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const yy = a.y + chh * 1.2 + i * (chh * 0.32);
      ctx.beginPath();
      ctx.moveTo(a.x + cw * (9.6 + Math.sin(i * 0.7) * 0.25), yy);
      ctx.lineTo(a.x + a.w, yy);
      ctx.stroke();
    }
    ctx.restore();
    // the sandstone ridge down the west
    ctx.save();
    ctx.strokeStyle = "rgba(150,110,70,0.30)"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a.x + cw * 3.6, a.y + chh * 3.0);
    ctx.quadraticCurveTo(a.x + cw * 3.0, a.y + chh * 5.2, a.x + cw * 2.6, a.y + chh * 7.4);
    ctx.stroke();
    ctx.restore();
    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.045)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 14; i++) { ctx.moveTo(a.x + i * cw, a.y); ctx.lineTo(a.x + i * cw, a.y + a.h); }
    for (let j = 1; j < 10; j++) { ctx.moveTo(a.x, a.y + j * chh); ctx.lineTo(a.x + a.w, a.y + j * chh); }
    ctx.stroke();
    // frame
    ctx.strokeStyle = C.edgeDim; ctx.lineWidth = 2;
    UI.roundRect(ctx, a.x + 1, a.y + 1, a.w - 2, a.h - 2, 10); ctx.stroke();
  }

  function drawEdges(ctx, a) {
    const C = TH().C;
    ctx.save();
    for (let i = 0; i < EDGES.length; i++) {
      const A = byId[EDGES[i][0]], B = byId[EDGES[i][1]];
      if (!A || !B) continue;
      const va = visited(A.id), vb = visited(B.id);
      if (!known(A.id) && !known(B.id)) continue;
      posInto(A, a, pA); posInto(B, a, pB);
      if (va && vb) { ctx.strokeStyle = "rgba(201,163,74,0.55)"; ctx.lineWidth = 2; }
      else { ctx.strokeStyle = "rgba(160,155,190,0.20)"; ctx.lineWidth = 1; }
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
    }
    // the rail spine, when you hold a railcard
    if (flag("rail_fast_travel")) {
      ctx.strokeStyle = "rgba(124,224,255,0.28)"; ctx.lineWidth = 3;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < RAIL.length; i++) {
        const nd = byId[RAIL[i]];
        if (!nd || !stationRegistered(nd)) continue;
        posInto(nd, a, pA);
        if (!started) { ctx.moveTo(pA.x, pA.y); started = true; }
        else ctx.lineTo(pA.x, pA.y);
      }
      if (started) ctx.stroke();
    }
    ctx.restore();
  }

  function badgeEarned(node) {
    if (!node.gym || node.gym === "league") return false;
    try { if (MQ.Trainer && MQ.Trainer.hasBadge) return MQ.Trainer.hasBadge(node.gym); } catch (e) { /* ignore */ }
    return !!flag(node.gym);
  }
  function drawNodes(ctx, a) {
    const Theme = TH(), C = Theme.C;
    const here = currentNode();
    const t = ((MQ.Loop && MQ.Loop.time) || 0) / 1000;
    for (let i = 0; i < NODES.length; i++) {
      const nd = NODES[i];
      posInto(nd, a, pA);
      let r = sc.rects[i];
      if (!r) r = sc.rects[i] = { x: 0, y: 0, w: 0, h: 0 };
      const size = nd.kind === "city" ? 11 : nd.kind === "town" ? 9 : nd.kind === "dungeon" ? 8 : 7;
      r.x = pA.x - 16; r.y = pA.y - 16; r.w = 32; r.h = 32;
      const kn = known(nd.id), vs = visited(nd.id);
      if (!kn) {
        ctx.fillStyle = "rgba(150,146,180,0.22)";
        ctx.beginPath(); ctx.arc(pA.x, pA.y, 3.5, 0, 6.3); ctx.fill();
        continue;
      }
      // shape by kind: towns are discs, dungeons are diamonds, sites are squares
      ctx.fillStyle = vs ? (nd.gym ? C.brass : nd.kind === "dungeon" ? C.moor : C.paper) : "rgba(30,28,46,0.9)";
      ctx.strokeStyle = vs ? C.brassLit : "rgba(180,176,210,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (nd.kind === "dungeon") {
        ctx.moveTo(pA.x, pA.y - size); ctx.lineTo(pA.x + size, pA.y); ctx.lineTo(pA.x, pA.y + size); ctx.lineTo(pA.x - size, pA.y);
        ctx.closePath();
      } else if (nd.kind === "site" || nd.kind === "estate") {
        ctx.rect(pA.x - size + 1, pA.y - size + 1, size * 2 - 2, size * 2 - 2);
      } else {
        ctx.arc(pA.x, pA.y, size, 0, 6.3);
      }
      ctx.fill(); ctx.stroke();
      if (nd.station && flag("rail_fast_travel") && stationRegistered(nd)) {
        ctx.fillStyle = C.signal;
        ctx.fillRect(pA.x - 2, pA.y - size - 7, 4, 4);
      }
      if (nd.gym && nd.gym !== "league") {
        const got = badgeEarned(nd);
        if (UI.Badges && UI.Badges.draw) UI.Badges.draw(ctx, nd.gym, pA.x + size - 2, pA.y - size - 10, 13, got);
        else { ctx.fillStyle = got ? C.brassLit : "rgba(120,116,150,0.5)"; ctx.beginPath(); ctx.arc(pA.x + size + 3, pA.y - size - 3, 4, 0, 6.3); ctx.fill(); }
      }
      // label
      if (vs || nd.id === here) {
        T.draw(ctx, nd.n, pA.x, pA.y + size + 3, { size: "s", align: "center", color: vs ? C.text : C.textDim, maxWidth: a.w / 14 * 2.4 });
      }
      if (nd.id === here) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 4);
        ctx.strokeStyle = C.good; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + 0.5 * pulse;
        ctx.beginPath(); ctx.arc(pA.x, pA.y, size + 5 + pulse * 3, 0, 6.3); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (i === sc.idx) {
        ctx.strokeStyle = C.selEdge; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pA.x, pA.y, size + 8, 0, 6.3); ctx.stroke();
      }
    }
    sc.rects.length = NODES.length;
  }

  function drawInfo(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const nd = sc.node();
    Theme.panel(ctx, x, y, w, h, { flat: true });
    const kn = known(nd.id), vs = visited(nd.id);
    let ry = y + 10;
    T.draw(ctx, kn ? nd.n : "Somewhere over there", x + 12, ry, { size: "m", color: C.brassLit, maxWidth: w - 24 }); ry += 24;
    const grid = nd.c + String(nd.r);
    T.draw(ctx, grid + " · " + Theme.titleCase(nd.kind) + " · " + Theme.titleCase(nd.region), x + 12, ry, { size: "s", color: C.textDim }); ry += 18;
    if (!kn) {
      T.draw(ctx, "Not on your map yet. Somebody will mention it.", x + 12, ry, { size: "s", color: C.dim, maxWidth: w - 24 });
      return;
    }
    ry += T.drawWrapped(ctx, nd.b, x + 12, ry, w - 24, { size: "s", color: C.text }) * 15 + 6;
    if (nd.gym && nd.gym !== "league") {
      const got = badgeEarned(nd);
      const label = (MQ.Trainer && MQ.Trainer.badgeLabel) ? MQ.Trainer.badgeLabel(nd.gym.replace("badge_", "")) : nd.gym.replace("badge_", "").toUpperCase();
      T.draw(ctx, "Gym: " + nd.leader + " — " + label + (got ? " (earned)" : ""), x + 12, ry, { size: "s", color: got ? C.good : C.warn, maxWidth: w - 24 });
      ry += 17;
    } else if (nd.gym === "league") {
      T.draw(ctx, "THE FIREWALL: " + nd.leader, x + 12, ry, { size: "s", color: C.oxblood }); ry += 17;
    }
    T.draw(ctx, vs ? "Visited" : "Heard of, not walked", x + 12, ry, { size: "s", color: vs ? C.good : C.textDim });
    ry += 17;
    const opt = travelOption(nd);
    if (opt) T.draw(ctx, "A: " + opt.label, x + 12, y + h - 22, { size: "s", color: C.brassLit, maxWidth: w - 24 });
    else if (nd.station) T.draw(ctx, "Station here. You need a Railcard and a visit.", x + 12, y + h - 22, { size: "s", color: C.dim, maxWidth: w - 24 });
    else if (nd.canal) T.draw(ctx, "Moorings here. A narrowboat licence would help.", x + 12, y + h - 22, { size: "s", color: C.dim, maxWidth: w - 24 });
  }

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#14202a", bottom: "#101a16" });
    let seen = 0;
    for (let i = 0; i < NODES.length; i++) if (visited(NODES[i].id)) seen++;
    Theme.header(ctx, {
      title: "Cheshire", icon: "map",
      sub: (currentNode() ? "You are at " + byId[currentNode()].n : "Position unknown"),
      right: seen + "/" + NODES.length + " walked"
    });
    const top = Theme.headerBottom();
    const bot = Theme.footerTop() - 6;
    const infoW = m.wide ? Math.min(290, m.cw * 0.28) : Math.min(250, m.cw * 0.3);
    const a = sc.area;
    a.x = m.l; a.y = top; a.w = m.cw - infoW - 12; a.h = bot - top;
    // keep the county roughly 14:10
    const ideal = a.w / 14 * 10;
    if (ideal < a.h) { a.y += (a.h - ideal) / 2; a.h = ideal; }
    drawTerrain(ctx, a);
    drawEdges(ctx, a);
    drawNodes(ctx, a);
    drawInfo(ctx, m.r - infoW, top, infoW, bot - top);
    Theme.footer(ctx, HINTS);
  };

  sc.NODES = NODES;
  sc.EDGES = EDGES;
  sc.nodeById = function (id) { return byId[id] || null; };
  sc.visited = visited;
  sc.travelOption = travelOption;
  sc.open = function (p) { return MQ.Scenes.pushP(sc, p || {}); };
  UI.WorldMap = sc;
  UI.Map = sc;

  // ---- legend --------------------------------------------------------
  const leg = { id: "worldmap_legend", touchPad: false };
  const LEG_HINTS = [{ btn: "b", label: "Back" }];
  leg.enter = function () { TH().sfx("ui_open"); };
  leg.update = function () { const Theme = TH(); if (Theme.backPressed() || MQ.Input.pressed("a")) { MQ.Input.consume("a"); MQ.Scenes.pop(null); } };
  leg.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#14202a", bottom: "#101a16" });
    Theme.header(ctx, { title: "Legend", icon: "map", sub: "Fourteen columns west to east, ten rows north to south." });
    const top = Theme.headerBottom();
    const w = Math.min(m.cw, 620), x = m.cx - w / 2;
    Theme.panel(ctx, x, top, w, Theme.footerTop() - top - 6, { flat: true });
    const rows = [
      ["disc", C.paper, "Town or village you have walked"],
      ["disc", C.brass, "Gym town — the badge sits on its shoulder"],
      ["diamond", C.moor, "Dungeon: caverns, mine, moss, marsh"],
      ["square", C.paper, "Site: estate, hill, folly, observatory"],
      ["hollow", null, "Heard of, not yet walked"],
      ["dot", null, "Somewhere you have no business knowing about"],
      ["pip", C.signal, "Registered station — trains run once you hold a Railcard"],
      ["ring", C.good, "You are here"]
    ];
    let ry = top + 18;
    for (let i = 0; i < rows.length; i++) {
      const kind = rows[i][0], col = rows[i][1] || "rgba(30,28,46,0.9)";
      const gx = x + 30, gy = ry + 8;
      ctx.fillStyle = col; ctx.strokeStyle = C.brassLit; ctx.lineWidth = 2;
      ctx.beginPath();
      if (kind === "diamond") { ctx.moveTo(gx, gy - 8); ctx.lineTo(gx + 8, gy); ctx.lineTo(gx, gy + 8); ctx.lineTo(gx - 8, gy); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (kind === "square") { ctx.rect(gx - 7, gy - 7, 14, 14); ctx.fill(); ctx.stroke(); }
      else if (kind === "dot") { ctx.fillStyle = "rgba(150,146,180,0.25)"; ctx.arc(gx, gy, 3.5, 0, 6.3); ctx.fill(); }
      else if (kind === "pip") { ctx.fillStyle = C.signal; ctx.fillRect(gx - 3, gy - 3, 6, 6); ctx.fill(); }
      else if (kind === "ring") { ctx.strokeStyle = C.good; ctx.arc(gx, gy, 8, 0, 6.3); ctx.stroke(); }
      else if (kind === "hollow") { ctx.strokeStyle = "rgba(180,176,210,0.5)"; ctx.arc(gx, gy, 8, 0, 6.3); ctx.stroke(); }
      else { ctx.arc(gx, gy, 8, 0, 6.3); ctx.fill(); ctx.stroke(); }
      T.draw(ctx, rows[i][2], x + 56, ry + 1, { size: "s", color: C.text, maxWidth: w - 80 });
      ry += 26;
    }
    ry += 6;
    T.drawWrapped(ctx, "Fast travel runs on the rail network from Chapter 5 (Railcard at Crewe) between stations you have set foot in, and along the canals once you hold a narrowboat licence. Y Berllan is off the map, west, on the Cambrian line.", x + 16, ry, w - 32, { size: "s", color: C.textDim });
    Theme.footer(ctx, LEG_HINTS);
  };
  leg.open = function () { return MQ.Scenes.pushP(leg, {}); };
  UI.WorldMapLegend = leg;
})();
