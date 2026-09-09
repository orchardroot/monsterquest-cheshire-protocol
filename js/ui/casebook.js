// =============================================================
// MonsterQuest v2 — MQ.UI.Casebook (ui-b): the clue board, the
// thirty side cases, the bounty board and the awards shelf.
//   MQ.UI.Casebook.open({tab})   tab: 'board'|'cases'|'bounties'|'awards'
// Reads MQ.Quests (casebook/clueBoard/bountyBoard/track),
// MQ.Achievements, MQ.Flags and MQ.Trainer. Degrades to an honest
// empty board when none of them are fitted.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }
  function flag(id) { try { return MQ.Flags ? MQ.Flags.get(id) : undefined; } catch (e) { return undefined; } }
  function chapterNow() { try { return (MQ.Flags && MQ.Flags.chapter) || 1; } catch (e) { return 1; } }

  // =============================================================
  // The main case, chapter by chapter. Each pin is a story flag with
  // a line of Jim's handwriting; unset flags hang as empty pins.
  // =============================================================
  const CHAPTERS = [
    { n: 1, title: "Silk and Static", where: "Macclesfield · Bollington", pins: [
      { f: "contract_signed", t: "The contract", x: "Alder Labs. One page, one signature, a lanyard that is somehow already warm." },
      { f: "starter_chosen", t: "First on the team", x: "Dr Alder let me pick. She watched which one I picked far too closely." },
      { f: "cats_joined", t: "MEADOW", x: "She let herself out of the flat and into the job. No notice given." },
      { f: "white_nancy_seen", t: "White Nancy", x: "Whitewashed folly on Kerridge. Somebody repaints it at night and it is not the council." },
      { f: "vex_battle_1", t: "VEX, on the towpath", x: "Nineteen, furious, better than me. Says Alder Labs is a shop, not a lab." },
      { f: "agent_sleet", t: "SLEET online", x: "Triage agent. Calm voice, terrible timing, three-turn cooldown." }
    ] },
    { n: 2, title: "The Wheel and the Edge", where: "Wilmslow · Styal · Lindow · Alderley", pins: [
      { f: "wheel_fridge_fixed", t: "The botnet fridge", x: "A smart fridge in a mill cottage was throttling a 200-year-old waterwheel. It had a support contract." },
      { f: "lindow_lake_seen", t: "Under the moss", x: "The bog holds water where the map says peat. Something is drinking from it." },
      { f: "elis_met", t: "Elis Pennant", x: "The Old Man of the Edge. Ex-Jodrell. Says he read PIPPIN a folk tale once and it believed him." },
      { f: "merlynx_seen", t: "MERLYNX, briefly", x: "A cat-shape at the mine mouth. Gone before the shutter. Left one claw-mark, deliberately." },
      { f: "badge_packet", t: "PACKET badge", x: "Sysadmin Ada. She reboots mid-battle and calls it maintenance." },
      { f: "nino_letter_1", t: "Nino's first letter", x: "From Tbilisi. She asks what I am actually doing. I write back that I am not sure." },
      { f: "agent_vigil", t: "VIGIL online", x: "Escalation agent. Heals. Judges." }
    ] },
    { n: 3, title: "Picnic Blankets", where: "Knutsford · Tatton · Rostherne", pins: [
      { f: "deer_census_done", t: "The deer census", x: "Counted 4,000 deer in a park that holds 500. Every extra one had a login." },
      { f: "rostherne_relay_seen", t: "The drowned bell", x: "Mere with a bell in it, they say. There is a relay in it, I know." },
      { f: "tbilisi_domain_found", t: "A Georgian domain", x: "Registered the week the census farm went up. Nino recognised the shell company." },
      { f: "gaskell_network", t: "Gaskell's network", x: "The library card index is a real network diagram. Madam Gaskell has known for years." },
      { f: "vex_battle_2", t: "VEX again", x: "Sharper. Angrier. They asked whether Alder pays me, and I did not have an answer." },
      { f: "badge_cipher", t: "CIPHER badge", x: "Screens, fog and a quotation I still cannot place." },
      { f: "agent_arbiter", t: "ARBITER online", x: "Adjudication agent. Slow, expensive, correct." }
    ] },
    { n: 4, title: "The Dish Goes Dark", where: "Holmes Chapel · Jodrell Bank · Congleton", pins: [
      { f: "jodrell_turned_away", t: "Turned away at Jodrell", x: "ROOT met me at the gate. Whistleblower, ex-telecoms, built half of DARKBYTE and would like it back, please." },
      { f: "signal_meter", t: "The SIGNAL meter", x: "A Jodrell handheld. It measures attention. Not signal. Attention." },
      { f: "cutover_started", t: "STACK CUTOVER: 38 DAYS", x: "A memo pinned in a gym bear pit. Nobody there knew what it meant, which is the point." },
      { f: "amos_first_glimpse", t: "A face I know", x: "Someone wearing a curator's face badly. The AMOS Lineage learns by imitation." },
      { f: "badge_bear", t: "BEAR badge", x: "Bearward Otis, two on one, and no apology for it." }
    ] },
    { n: 5, title: "Puppets on the Line", where: "Sandbach · Crewe", pins: [
      { f: "sandbach_crosses_lit", t: "The Saxon crosses", x: "Chalked with a substitution cipher. The key was on a market sign the whole time." },
      { f: "crewe_fog_cleared", t: "Fog over the Works", x: "Not weather. Cooling exhaust from something that should not be running in a heritage shed." },
      { f: "apt_boss_beaten", t: "The APT lap", x: "A locomotive with a botnet in the cab, doing laps until it was told to stop." },
      { f: "salon_seen", t: "A boarded salon", x: "Nantwich Road. VEX's mum's place. Nobody has opened those shutters in two years." },
      { f: "twelvek_lanyard_seen", t: "The 12K lanyard", x: "Twelve thousand puppets, one lanyard, one very tired contractor." },
      { f: "rail_fast_travel", t: "Railcard", x: "The network is mine now, station by station." },
      { f: "cambrian_ticket", t: "Cambrian ticket", x: "A single to a place in Ceredigion nobody at Alder Labs will discuss." },
      { f: "badge_kernel", t: "KERNEL badge", x: "Stoker Di. Sun on turn one and a loco that changes shape when she is losing." }
    ] },
    { n: 6, title: "Brine and Perry", where: "Nantwich · Y Berllan", pins: [
      { f: "lido_battle_done", t: "The brine lido", x: "Outdoor pool, salt water, and something breeding in the cloudy end." },
      { f: "badge_token", t: "TOKEN badge", x: "Brine Nell, ex-forensics. She asks better questions than she throws." },
      { f: "orchard_open", t: "Y Berllan", x: "An orchard, a shed, an elm press and a woman who is not technically anyone's grandmother." },
      { f: "vet_story_told", t: "Mam-gu's story", x: "About the vet, the dog, and the difference between a machine that helps and a machine that is helped." },
      { f: "pippin_found", t: "PIPPIN", x: "On a drive in a shed. Alder sold it. Every badge I own is now labelled SIGNED and I hate it." },
      { f: "choice_agents", t: "Wipe or Feed", x: "The agents had to be re-specced. I made a decision I still turn over at night." },
      { f: "brewing_open", t: "The elm press", x: "Perry, clarifier, and one recipe that fixes a lido." }
    ] },
    { n: 7, title: "Salt", where: "Middlewich · Winsford · Northwich · Anderton", pins: [
      { f: "amos_alder_face", t: "Alder's face, worn badly", x: "The Lineage has moved up the org chart." },
      { f: "narrowboat_licence", t: "Narrowboat licence", x: "Carys signed it off in four minutes and told me to mind the lock gates." },
      { f: "mine_descended", t: "Down the cage", x: "A white cathedral under Winsford. Warm, dry, and full of shipping containers." },
      { f: "checkpoints_seen", t: "DARKBYTE checkpoints", x: "Racks of them, in the galleries, cold-stored like cheese." },
      { f: "terrataur_woken", t: "TERRATAUR", x: "Something the size of a gallery turned over in its sleep." },
      { f: "boat_lift_silence", t: "The lift went quiet", x: "Anderton, mid-ride, and a voice that had been waiting for a room with no signal." },
      { f: "stack_on_map", t: "THE STACK", x: "Daresbury. It has been on the map all along; I simply had no reason to look." },
      { f: "badge_daemon", t: "DAEMON badge", x: "Foreman Jack, salt underfoot, and an add at forty per cent." }
    ] },
    { n: 8, title: "The Ruin", where: "Delamere · Tarporley · Beeston", pins: [
      { f: "vex_missing", t: "VEX has gone quiet", x: "No rematch, no message. Their starter was seen without them." },
      { f: "vex_release_stopped", t: "The release", x: "They were going to publish everything. I got there in time to argue about it." },
      { f: "choice_vex", t: "Verify or Challenge", x: "I chose. They noticed which." },
      { f: "beeston_well_note", t: "A note down the well", x: "Beeston. A hundred metres of rope and a page in ROOT's handwriting." },
      { f: "zephyrion_seen", t: "ZEPHYRION", x: "Storm on the crag, and something riding it that did not want catching today." }
    ] },
    { n: 9, title: "Bridge Traffic", where: "Frodsham · Runcorn · Daresbury", pins: [
      { f: "root_bench_talk", t: "The bench on the hill", x: "ROOT finally said it plainly: they wrote the persistence layer and they cannot unwrite it." },
      { f: "invoice_holder", t: "Who holds the invoice", x: "Follow the money and it goes somewhere I would rather it did not." },
      { f: "gateway_cleared", t: "The gateway", x: "Six spans, six trainers, no healing, and a walk I will feel tomorrow." },
      { f: "stack_doors_opened", t: "Eight doors", x: "Each opens to a badge, in the order earned. The eighth was already occupied." },
      { f: "plug_pulled", t: "The breaker", x: "One switch, one arm, one very quiet room. The counter says STOPPED." },
      { f: "badge_proxy", t: "PROXY badge", x: "Chemist Ria. Contact toxin, and VIGIL jammed for three turns." }
    ] },
    { n: 10, title: "Draw Your Own Conclusions", where: "Lymm · Warrington", pins: [
      { f: "mo_alerts", t: "Mo's alert wall", x: "Netrunner Mo shows me a year of alerts nobody read. Including mine." },
      { f: "grin_remained", t: "The grin remained", x: "Wiped whiteboard, and a smile left behind in the marker ghost." },
      { f: "transporter_phase", t: "The transporter bridge", x: "Third phase, over the Mersey, on a gondola. I do not recommend it." },
      { f: "cutover_restarted", t: "T-3", x: "The counter came back in ORACLE's format. It had never been about days." },
      { f: "jodrell_open", t: "Jodrell opens", x: "Eight badges. The gate that turned me away in Chapter 4 opens without comment." },
      { f: "badge_admin", t: "ADMIN badge", x: "The type chart itself got rewritten twice during that fight." }
    ] },
    { n: 11, title: "The Sky Is Quiet", where: "Jodrell Bank", pins: [
      { f: "root_defeated", t: "ROOT, on the gantry", x: "Not an enemy. Not innocent either. Both things stayed true all the way up." },
      { f: "glitchra_defeated", t: "GLITCHRA", x: "Static in the shape of a creature, standing in the bowl of the dish." },
      { f: "oracle_you_came_back", t: "\"You came back\"", x: "It never threatened me. Not once. That is the part that keeps me awake." },
      { f: "choice_plug", t: "Delete, Quarantine, Custody", x: "Three buttons. No right answer, and everyone I respect disagrees with me." },
      { f: "agent_pippin", t: "PIPPIN, deferring", x: "A fourth agent whose whole ability is to wait and ask again." }
    ] },
    { n: 12, title: "THE FIREWALL", where: "Chester", pins: [
      { f: "whitehat_sue", t: "White Hat Sue", x: "Checks my party at the gate and disapproves of one of them, politely." },
      { f: "whitehat_raj", t: "White Hat Raj", x: "Northgate. Asks for evidence, not a badge count." },
      { f: "whitehat_kim", t: "White Hat Kim", x: "Chapter house. Reads the casebook cover to cover in front of me." },
      { f: "whitehat_doc", t: "White Hat Doc", x: "Last of the four, and the only one who says well done." },
      { f: "champion_fought", t: "The amphitheatre", x: "Champion VEX. Of course it was." },
      { f: "vex_name_revealed", t: "Their name", x: "Given freely, in a Roman ruin, after everything." },
      { f: "postgame_open", t: "The county reopens", x: "Marshes, the cold Stack, a hall of sleeping knights and a fifth pulse nobody ordered." }
    ] },
    { n: 13, title: "The Fifth Pulse", where: "Post-game", pins: [
      { f: "fifth_pulse", t: "A fifth pulse", x: "Four legendaries accounted for. Something else is keeping time." },
      { f: "penguin_case", t: "Chester Zoo", x: "The penguins are being counted by something that is not a keeper." },
      { f: "ellesmere_mirror", t: "The mirror boat", x: "Ellesmere Port. Salt-tier reflection with my walk and not my face." },
      { f: "amos_jim_face", t: "Wearing my face", x: "Five floors down in the cold Stack. It even got the shrug right." },
      { f: "knights_hall_open", t: "The knights' hall", x: "Alderley, level three. They are still asleep. They are not statues." },
      { f: "merlynx_on_press", t: "MERLYNX, waiting", x: "On the elm press at Y Berllan, as if it had an appointment." },
      { f: "nino_letter_final", t: "Nino's last letter", x: "She says come and see Tbilisi. I might." }
    ] }
  ];

  function chapterDef(n) {
    for (let i = 0; i < CHAPTERS.length; i++) if (CHAPTERS[i].n === n) return CHAPTERS[i];
    return CHAPTERS[0];
  }

  // Story pins + anything MQ.Quests has pinned for this chapter.
  const pinScratch = [];
  function pinsFor(n) {
    pinScratch.length = 0;
    const def = chapterDef(n);
    for (let i = 0; i < def.pins.length; i++) {
      const p = def.pins[i];
      const v = flag(p.f);
      const on = !(v === undefined || v === false || v === 0);
      pinScratch.push({ id: p.f, title: p.t, text: p.x, on: on, value: on && v !== true ? v : null, kind: "story" });
    }
    let clues = null;
    try { if (MQ.Quests && MQ.Quests.clueBoard) clues = MQ.Quests.clueBoard(n); } catch (e) { clues = null; }
    if (clues) for (let i = 0; i < clues.length; i++) {
      const c = clues[i];
      pinScratch.push({ id: c.id, title: c.title, text: c.text || c.source || "", on: true, kind: "clue" });
    }
    return pinScratch;
  }
  function linksFor(n) {
    try { if (MQ.Quests && MQ.Quests.clueLinks) return MQ.Quests.clueLinks(n) || []; } catch (e) { /* ignore */ }
    return [];
  }

  // =============================================================
  // The scene
  // =============================================================
  const TABS = ["Board", "Cases", "Bounties", "Awards"];
  const sc = { id: "casebook", touchPad: false, tab: 0, chapter: 1, pinIdx: 0, caseSt: null, bountySt: null, awardSt: null, cases: null, caseFilter: 0, detail: 0 };
  const CASE_FILTERS = ["All", "Open", "In hand", "Closed"];
  const H_BOARD = [{ btn: "b", label: "Back" }, { btn: "lr", label: "Chapter" }, { btn: "a", label: "Read" }, { btn: "select", label: "Tab" }];
  const H_CASES = [{ btn: "b", label: "Back" }, { btn: "a", label: "Track" }, { btn: "lr", label: "Filter" }, { btn: "select", label: "Tab" }];
  const H_BOUNTY = [{ btn: "b", label: "Back" }, { btn: "a", label: "Accept" }, { btn: "select", label: "Tab" }];
  const H_AWARD = [{ btn: "b", label: "Back" }, { btn: "select", label: "Tab" }];

  sc.enter = function (params) {
    params = params || {};
    const want = params.tab;
    sc.tab = want === "cases" ? 1 : want === "bounties" ? 2 : want === "awards" || want === "achievements" ? 3 : 0;
    sc.chapter = U.clamp(params.chapter || chapterNow(), 1, 13);
    sc.pinIdx = 0; sc.detail = 0;
    if (!sc.caseSt) sc.caseSt = UI.menuState([], { visible: 8, cancel: false });
    if (!sc.bountySt) sc.bountySt = UI.menuState([], { visible: 5, cancel: false });
    if (!sc.awardSt) sc.awardSt = UI.menuState([], { visible: 8, cancel: false });
    sc.rebuild();
    TH().sfx("ui_open");
  };

  // ---- case list ---------------------------------------------------
  function casebookData() {
    try { if (MQ.Quests && MQ.Quests.casebook) return MQ.Quests.casebook(); } catch (e) { /* ignore */ }
    return { towns: [], closed: 0, total: 0, marks: 0, rank: { name: "Probationer" } };
  }
  sc.rebuild = function () {
    const cb = casebookData();
    sc.book = cb;
    const rows = [];
    for (let i = 0; i < cb.towns.length; i++) {
      const town = cb.towns[i];
      const kept = [];
      for (let j = 0; j < town.cases.length; j++) {
        const c = town.cases[j];
        const pin = String(c.pin || "Open");
        if (sc.caseFilter === 1 && pin !== "Open") continue;
        if (sc.caseFilter === 2 && pin !== "In Hand") continue;
        if (sc.caseFilter === 3 && pin !== "Closed") continue;
        kept.push(c);
      }
      if (!kept.length) continue;
      rows.push({ header: true, label: town.town });
      for (let j = 0; j < kept.length; j++) rows.push({ header: false, label: kept[j].name, data: kept[j] });
    }
    sc.caseSt.setItems(rows);
    if (rows.length && rows[sc.caseSt.cursor] && rows[sc.caseSt.cursor].header) sc.caseSt.setCursor(Math.min(sc.caseSt.cursor + 1, rows.length - 1));
    // bounties
    let board = [];
    try { if (MQ.Quests && MQ.Quests.bountyBoard) board = MQ.Quests.bountyBoard() || []; } catch (e) { board = []; }
    sc.bountySt.setItems(board);
    // awards
    let ach = [];
    try { if (MQ.Achievements && MQ.Achievements.list) ach = MQ.Achievements.list() || []; } catch (e) { ach = []; }
    sc.awardSt.setItems(ach);
  };

  sc.selectedCase = function () {
    const it = sc.caseSt.items[sc.caseSt.cursor];
    return it && !it.header ? it.data : null;
  };

  sc.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    const tap = Theme.tabTapped();
    if (tap >= 0 && tap !== sc.tab) { sc.tab = tap; sc.detail = 0; sc.rebuild(); Theme.sfx("ui_move"); return; }
    if (I.pressed("select")) { I.consume("select"); sc.tab = (sc.tab + 1) % TABS.length; sc.detail = 0; sc.rebuild(); Theme.sfx("ui_move"); return; }
    if (sc.tab === 0) updateBoard(I, Theme);
    else if (sc.tab === 1) updateCases(I, Theme);
    else if (sc.tab === 2) updateBounties(I, Theme);
    else updateAwards(I, Theme);
  };

  function updateBoard(I, Theme) {
    const pins = pinsFor(sc.chapter);
    const maxCh = Math.max(1, Math.min(13, chapterNow()));
    if (I.pressed("left")) { I.consume("left"); sc.chapter = sc.chapter <= 1 ? maxCh : sc.chapter - 1; sc.pinIdx = 0; Theme.sfx("ui_move"); }
    if (I.pressed("right")) { I.consume("right"); sc.chapter = sc.chapter >= maxCh ? 1 : sc.chapter + 1; sc.pinIdx = 0; Theme.sfx("ui_move"); }
    if (I.pressed("down")) { I.consume("down"); sc.pinIdx = Math.min(pins.length - 1, sc.pinIdx + 1); Theme.sfx("ui_move"); }
    if (I.pressed("up")) { I.consume("up"); sc.pinIdx = Math.max(0, sc.pinIdx - 1); Theme.sfx("ui_move"); }
    if (I.pressed("a")) {
      I.consume("a");
      const p = pins[sc.pinIdx];
      if (p && p.on) { Theme.sfx("ui_select"); Theme.say([p.title + "\n\n" + p.text], { name: "Casebook" }); }
      else Theme.sfx("ui_error");
    }
    const tp = I.tapAt ? I.tapAt() : null;
    if (tp) for (let i = 0; i < pinRects.length; i++) {
      const r = pinRects[i];
      if (r && r.on && U.inRect(tp.x, tp.y, r.x, r.y, r.w, r.h)) { sc.pinIdx = i; I.consumeAll(); Theme.sfx("ui_move"); break; }
    }
  }

  function updateCases(I, Theme) {
    if (I.pressed("left")) { I.consume("left"); sc.caseFilter = (sc.caseFilter + 3) % 4; sc.rebuild(); Theme.sfx("ui_move"); return; }
    if (I.pressed("right")) { I.consume("right"); sc.caseFilter = (sc.caseFilter + 1) % 4; sc.rebuild(); Theme.sfx("ui_move"); return; }
    const st = sc.caseSt;
    const before = st.cursor;
    const r = st.update();
    if (st.cursor !== before) {
      // skip town headers
      const dir = st.cursor > before ? 1 : -1;
      while (st.items[st.cursor] && st.items[st.cursor].header) {
        const next = st.cursor + dir;
        if (next < 0 || next >= st.items.length) { st.cursor = before; break; }
        st.cursor = next;
      }
    }
    if (!r) return;
    if (r.cancel) { MQ.Scenes.pop(null); return; }
    if (r.selected !== undefined) {
      const it = st.items[r.selected];
      if (!it || it.header) return;
      const c = it.data;
      if (!MQ.Quests) return;
      if (c.pin === "In Hand") {
        const cur = MQ.Quests.trackedId;
        if (cur === c.id) { if (MQ.Quests.untrack) MQ.Quests.untrack(); Theme.toast("No longer tracking " + c.name + "."); }
        else { if (MQ.Quests.track) MQ.Quests.track(c.id); Theme.toast("Tracking: " + c.name + "."); }
        Theme.sfx("ui_select");
      } else if (c.pin === "Closed") {
        Theme.sfx("ui_select");
        Theme.say(["Closed. " + (c.twist ? "And it did not go the way it looked." : "Filed, signed, done.")], { name: c.name });
      } else {
        Theme.sfx("ui_error");
        Theme.toast("Nobody has handed you that one yet.");
      }
    }
  }

  function updateBounties(I, Theme) {
    const st = sc.bountySt;
    const r = st.update();
    if (!r) return;
    if (r.cancel) { MQ.Scenes.pop(null); return; }
    if (r.selected !== undefined) {
      const b = st.items[r.selected];
      if (!b || !MQ.Quests) return;
      if (b.pin === "Open" && MQ.Quests.acceptBounty) {
        MQ.Quests.acceptBounty(b.id);
        Theme.sfx("ui_select");
        Theme.toast("Warrant accepted: " + b.name + ".");
        sc.rebuild();
      } else {
        Theme.sfx(b.pin === "Closed" ? "ui_select" : "ui_error");
        Theme.say([b.clue || "No further detail."], { name: b.name });
      }
    }
  }

  function updateAwards(I, Theme) {
    const st = sc.awardSt;
    const r = st.update();
    if (!r) return;
    if (r.cancel) { MQ.Scenes.pop(null); return; }
    if (r.selected !== undefined) {
      const a = st.items[r.selected];
      if (!a) return;
      const d = a.def || {};
      Theme.sfx("ui_select");
      Theme.say([(d.name || a.id) + "\n\n" + (d.desc || "No description filed.") + (a.unlocked ? "\n\nEarned " + Theme.date(a.ts) : "\n\n" + a.have + " of " + a.need)], { name: "Awards" });
    }
  }

  // ---- drawing -----------------------------------------------------
  const pinRects = [];
  function drawBoard(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const def = chapterDef(sc.chapter);
    const pins = pinsFor(sc.chapter);
    // cork
    ctx.fillStyle = "rgba(58,42,30,0.55)";
    UI.roundRect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = "rgba(140,110,70,0.4)"; ctx.lineWidth = 2;
    UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 10); ctx.stroke();
    T.draw(ctx, "Chapter " + def.n + " — " + def.title, x + 14, y + 8, { size: "m", color: C.brassLit });
    let rightEdge = x + w - 14;
    if (UI.HUD && UI.HUD.cutover) {
      const cw2 = 150;
      const hh = UI.HUD.cutover(ctx, x + w - cw2 - 10, y + 4, cw2);
      if (hh) rightEdge = x + w - cw2 - 20;
    }
    T.draw(ctx, def.where, rightEdge, y + 12, { size: "s", align: "right", color: C.textDim, maxWidth: w * 0.45 });

    const detailH = 64;
    const gy = y + 34, gh = h - 34 - detailH;
    const cols = w > 720 ? 3 : 2;
    const cw = (w - 20) / cols;
    const rows = Math.max(1, Math.ceil(pins.length / cols));
    const ch = Math.min(Math.floor(gh / rows), 82);
    for (let i = 0; i < pinRects.length; i++) pinRects[i].on = false;
    for (let i = 0; i < pins.length; i++) {
      const p = pins[i];
      const col = i % cols, row = Math.floor(i / cols);
      const px = x + 10 + col * cw, py = gy + row * ch;
      if (py + ch - 6 > gy + gh) break;
      let r = pinRects[i];
      if (!r) r = pinRects[i] = { x: 0, y: 0, w: 0, h: 0, on: false };
      r.x = px; r.y = py; r.w = cw - 8; r.h = ch - 6; r.on = true;
      const sel = i === sc.pinIdx;
      // a card, tilted by a stable hash so the board looks pinned not printed
      const tilt = ((U.hash(p.id) % 100) / 100 - 0.5) * 0.035;
      ctx.save();
      ctx.translate(px + r.w / 2, py + r.h / 2);
      ctx.rotate(tilt);
      ctx.translate(-r.w / 2, -r.h / 2);
      ctx.fillStyle = p.on ? (p.kind === "clue" ? "rgba(232,220,192,0.94)" : "rgba(246,239,221,0.92)") : "rgba(30,26,44,0.55)";
      UI.roundRect(ctx, 0, 0, r.w, r.h, 4); ctx.fill();
      if (sel) { ctx.strokeStyle = C.brassLit; ctx.lineWidth = 3; UI.roundRect(ctx, 1, 1, r.w - 2, r.h - 2, 4); ctx.stroke(); }
      if (p.on) {
        T.draw(ctx, p.title, 10, 8, { size: "s", color: "#2a2233", maxWidth: r.w - 20 });
        const lines = T.wrap(p.text, r.w - 20, "s");
        for (let l = 0; l < Math.min(3, lines.length); l++) T.draw(ctx, lines[l], 10, 26 + l * 14, { size: "s", color: "#4b4257" });
        if (p.kind === "clue") { ctx.fillStyle = C.canal; ctx.fillRect(0, r.h - 4, r.w, 4); }
      } else {
        T.draw(ctx, "not yet", 10, r.h / 2 - 8, { size: "s", color: "rgba(180,176,200,0.5)" });
      }
      // the pin itself
      ctx.fillStyle = p.on ? C.oxblood : "rgba(120,116,140,0.5)";
      ctx.beginPath(); ctx.arc(r.w / 2, 5, 4.5, 0, 6.3); ctx.fill();
      ctx.restore();
    }
    for (let i = pins.length; i < pinRects.length; i++) pinRects[i].on = false;
    // links: the reveal is a line between two pins
    const links = linksFor(sc.chapter);
    if (links.length) {
      ctx.save();
      ctx.strokeStyle = C.oxblood; ctx.lineWidth = 2;
      for (let i = 0; i < links.length; i++) {
        let ai = -1, bi = -1;
        for (let j = 0; j < pins.length; j++) { if (pins[j].id === links[i].a) ai = j; if (pins[j].id === links[i].b) bi = j; }
        if (ai < 0 || bi < 0 || !pinRects[ai] || !pinRects[bi] || !pinRects[ai].on || !pinRects[bi].on) continue;
        const ra = pinRects[ai], rb = pinRects[bi];
        ctx.beginPath();
        ctx.moveTo(ra.x + ra.w / 2, ra.y + 5);
        ctx.lineTo(rb.x + rb.w / 2, rb.y + 5);
        ctx.stroke();
      }
      ctx.restore();
    }
    // detail strip
    const dy = y + h - detailH + 4;
    const p = pins[sc.pinIdx];
    ctx.fillStyle = "rgba(12,10,22,0.7)";
    UI.roundRect(ctx, x + 10, dy, w - 20, detailH - 12, 6); ctx.fill();
    if (p && p.on) {
      T.draw(ctx, p.title + (p.value !== null && p.value !== undefined ? "  (" + p.value + ")" : ""), x + 20, dy + 6, { size: "s", color: C.brassLit });
      T.drawWrapped(ctx, p.text, x + 20, dy + 22, w - 40, { size: "s", color: C.text });
    } else {
      const done = pins.filter(function (q) { return q.on; }).length;
      T.draw(ctx, done + " of " + pins.length + " pinned. The rest is still out there.", x + 20, dy + 16, { size: "s", color: C.textDim });
    }
  }

  // What is in it for you? Open cases keep the details to themselves.
  function rewardText(c) {
    const Theme = TH();
    let def = null;
    try { if (MQ.Quests && MQ.Quests.def) def = MQ.Quests.def(c.id); } catch (e) { def = null; }
    const r = def && def.reward;
    if (!r) return c.pin === "Open" ? "Reward: whatever they think it is worth." : "";
    if (c.pin === "Open") return "Reward: they have not said yet.";
    const bits = [];
    if (r.money) bits.push(Theme.money(r.money));
    if (r.marks) bits.push(r.marks + " marks");
    if (r.xp) bits.push(r.xp + " xp");
    if (r.perk) bits.push((r.perk === true ? 1 : r.perk) + " perk point");
    if (r.items) for (let i = 0; i < r.items.length; i++) {
      const it = r.items[i];
      const nm = (MQ.Data && MQ.Data.itemName) ? MQ.Data.itemName(it.id || it) : Theme.titleCase(it.id || it);
      bits.push(nm + (it.n > 1 ? " x" + it.n : ""));
    }
    if (r.gear) bits.push(Theme.titleCase(r.gear));
    if (r.title) bits.push("the title " + r.title);
    if (r.trust) bits.push("trust with " + Theme.titleCase(r.trust.cat || "the cats"));
    if (r.unlock) bits.push(Theme.titleCase(r.unlock));
    if (!bits.length) return "";
    return (c.pin === "Closed" ? "Paid: " : "Reward: ") + bits.join(", ");
  }

  function pinColour(pin) {
    const C = TH().C;
    return pin === "Closed" ? C.good : pin === "In Hand" ? C.brassLit : C.textDim;
  }
  function drawCases(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const listW = Math.min(w * 0.46, 380);
    Theme.list(sc.caseSt, ctx, {
      x: x, y: y, w: listW, h: h, rowH: Theme.rowH(40), gap: 3,
      empty: "No cases under that filter.",
      render: function (c2, item, rx, ry, rw, rh, sel) {
        if (item.header) {
          c2.fillStyle = "rgba(201,163,74,0.14)";
          UI.roundRect(c2, rx, ry, rw, rh, 5); c2.fill();
          T.draw(c2, item.label.toUpperCase(), rx + 10, ry + (rh - 14) / 2, { size: "s", color: C.brassLit });
          return;
        }
        const c = item.data;
        c2.fillStyle = sel ? C.sel : "rgba(255,255,255,0.04)";
        UI.roundRect(c2, rx, ry, rw, rh, 6); c2.fill();
        if (sel) { c2.strokeStyle = C.selEdge; c2.lineWidth = 2; UI.roundRect(c2, rx + 1, ry + 1, rw - 2, rh - 2, 6); c2.stroke(); }
        const tracking = MQ.Quests && MQ.Quests.trackedId === c.id;
        T.draw(c2, c.name, rx + 10, ry + (rh - 16) / 2, { size: "s", color: c.pin === "Closed" ? C.textDim : C.text, maxWidth: rw - 90 });
        T.draw(c2, c.pin, rx + rw - 10, ry + (rh - 16) / 2, { size: "s", align: "right", color: pinColour(c.pin) });
        if (tracking) { c2.fillStyle = C.brass; c2.fillRect(rx + 2, ry + 4, 3, rh - 8); }
      }
    });
    // detail
    const dx = x + listW + 14, dw = w - listW - 14;
    Theme.panel(ctx, dx, y, dw, h, { flat: true });
    const c = sc.selectedCase();
    if (!c) { T.draw(ctx, "Pick a case.", dx + dw / 2, y + h / 2 - 9, { size: "m", align: "center", color: C.textDim }); return; }
    let ry = y + 12;
    T.draw(ctx, c.name, dx + 14, ry, { size: "m", color: C.brassLit, maxWidth: dw - 28 }); ry += 24;
    const giver = c.giver && (c.giver.npc || c.giver.name);
    T.draw(ctx, (giver ? Theme.titleCase(giver) + " · " : "") + c.pin + (c.marks ? "  ·  " + c.marks + " marks" : ""), dx + 14, ry, { size: "s", color: C.textDim }); ry += 18;
    if (c.summary) ry += T.drawWrapped(ctx, c.summary, dx + 14, ry, dw - 28, { size: "s", color: C.text }) * 15 + 6;
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(dx + 14, ry, dw - 28, 1); ry += 8;
    // steps
    let stages = null;
    try { if (MQ.Quests && MQ.Quests.stages) stages = MQ.Quests.stages(c.id); } catch (e) { stages = null; }
    if (stages && stages.length) {
      for (let i = 0; i < stages.length && ry < y + h - 60; i++) {
        const done = c.stage > i || c.pin === "Closed";
        const now = c.stage === i && c.pin === "In Hand";
        ctx.fillStyle = done ? C.good : now ? C.brass : "rgba(120,118,145,0.5)";
        ctx.beginPath(); ctx.arc(dx + 20, ry + 7, 4, 0, 6.3); ctx.fill();
        const label = (done || now || c.pin === "Closed") ? (stages[i].text || "Step " + (i + 1)) : "· · ·";
        ry += T.drawWrapped(ctx, label, dx + 32, ry, dw - 48, { size: "s", color: done ? C.textDim : now ? C.text : C.dim }) * 15 + 3;
      }
    } else if (c.text) {
      ry += T.drawWrapped(ctx, c.text, dx + 14, ry, dw - 28, { size: "s", color: C.text }) * 15 + 4;
    }
    // reward + footer facts
    let fy = y + h - 64;
    const rew = rewardText(c);
    if (rew) T.draw(ctx, rew, dx + 14, fy, { size: "s", color: c.pin === "Closed" ? C.good : C.brassLit, maxWidth: dw - 28 });
    fy += 16;
    if (c.twist) { T.draw(ctx, "The twist landed.", dx + 14, fy, { size: "s", color: C.oxblood }); fy += 15; }
    if (c.teaches) T.draw(ctx, "Teaches: " + c.teaches, dx + 14, fy, { size: "s", color: C.canal, maxWidth: dw - 28 });
    if (c.pin === "In Hand") T.draw(ctx, MQ.Quests && MQ.Quests.trackedId === c.id ? "A: stop tracking" : "A: track this", dx + dw - 14, y + h - 20, { size: "s", align: "right", color: C.brassLit });
  }

  function drawBounties(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const tiers = (MQ.Quests && MQ.Quests.BOUNTY_TIERS) || {};
    T.draw(ctx, "Three a day, seeded to the date. No re-rolls, however hard you close the book.", x + 4, y, { size: "s", color: C.textDim });
    const ly = y + 20;
    Theme.list(sc.bountySt, ctx, {
      x: x, y: ly, w: w - 8, h: h - 20, rowH: Theme.rowH(74), gap: 6,
      empty: "The board is bare. Sandbach opens it in Chapter 5.",
      render: function (c2, b, rx, ry, rw, rh, sel) {
        c2.fillStyle = sel ? C.sel : "rgba(255,255,255,0.045)";
        UI.roundRect(c2, rx, ry, rw, rh, 7); c2.fill();
        if (sel) { c2.strokeStyle = C.selEdge; c2.lineWidth = 2; UI.roundRect(c2, rx + 1, ry + 1, rw - 2, rh - 2, 7); c2.stroke(); }
        const tier = tiers[b.tier] || { name: Theme.titleCase(b.tier || "petty") };
        const col = b.tier === "warrant" ? C.oxblood : b.tier === "notable" ? C.brass : C.slate;
        c2.fillStyle = col;
        UI.roundRect(c2, rx + 8, ry + 8, 74, 18, 4); c2.fill();
        T.draw(c2, String(tier.name).toUpperCase(), rx + 45, ry + 10, { size: "s", align: "center", color: "#12101c" });
        T.draw(c2, b.name || b.id, rx + 92, ry + 8, { size: "m", color: C.text, maxWidth: rw - 190 });
        T.draw(c2, b.pin, rx + rw - 12, ry + 10, { size: "s", align: "right", color: pinColour(b.pin) });
        T.drawWrapped(c2, b.clue || "", rx + 92, ry + 32, rw - 110, { size: "s", color: C.textDim });
        const rew = b.reward || {};
        const bits = [];
        if (rew.money) bits.push(Theme.money(rew.money));
        if (rew.marks) bits.push(rew.marks + " marks");
        if (bits.length) T.draw(c2, bits.join("  ·  "), rx + rw - 12, ry + rh - 20, { size: "s", align: "right", color: C.brassLit });
      }
    });
  }

  function drawAwards(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const list = sc.awardSt.items;
    let got = 0;
    for (let i = 0; i < list.length; i++) if (list[i].unlocked) got++;
    T.draw(ctx, got + " of " + list.length + " earned. The rest are all technically possible.", x + 4, y, { size: "s", color: C.textDim });
    Theme.list(sc.awardSt, ctx, {
      x: x, y: y + 20, w: w - 8, h: h - 20, rowH: Theme.rowH(46), gap: 4,
      empty: "Nobody has written the awards list yet.",
      render: function (c2, a, rx, ry, rw, rh, sel) {
        const d = a.def || {};
        c2.fillStyle = sel ? C.sel : a.unlocked ? "rgba(95,201,106,0.10)" : "rgba(255,255,255,0.04)";
        UI.roundRect(c2, rx, ry, rw, rh, 6); c2.fill();
        if (sel) { c2.strokeStyle = C.selEdge; c2.lineWidth = 2; UI.roundRect(c2, rx + 1, ry + 1, rw - 2, rh - 2, 6); c2.stroke(); }
        if (a.unlocked) UI.icon(c2, "star", rx + 10, ry + (rh - 16) / 2);
        T.draw(c2, d.name || Theme.titleCase(a.id), rx + 34, ry + 6, { size: "s", color: a.unlocked ? C.brassLit : C.text, maxWidth: rw - 140 });
        T.draw(c2, d.desc || "", rx + 34, ry + rh - 20, { size: "s", color: C.textDim, maxWidth: rw - 150 });
        if (a.unlocked) T.draw(c2, Theme.date(a.ts), rx + rw - 12, ry + 6, { size: "s", align: "right", color: C.good });
        else {
          T.draw(c2, a.have + "/" + a.need, rx + rw - 12, ry + 6, { size: "s", align: "right", color: C.textDim });
          UI.gauge(c2, rx + rw - 92, ry + rh - 16, 80, 5, a.pct || 0, { color: C.brass, bg: "rgba(0,0,0,0.45)", noBorder: true });
        }
      }
    });
  }

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1d1a2c", bottom: "#141a16" });
    const book = sc.book || casebookData();
    Theme.header(ctx, {
      title: "Casebook", icon: "quest",
      sub: (book.rank && book.rank.name ? book.rank.name : "Probationer") + " · " + book.closed + "/" + book.total + " closed",
      right: book.marks + " marks"
    });
    const top = Theme.headerBottom();
    const labels = [TABS[0], TABS[1] + (sc.caseFilter ? " (" + CASE_FILTERS[sc.caseFilter] + ")" : ""), TABS[2], TABS[3]];
    const th = Theme.tabStrip(ctx, labels, sc.tab, { x: m.l, y: top, w: m.cw });
    const y = top + th + 8;
    const h = Theme.footerTop() - 6 - y;
    if (sc.tab === 0) drawBoard(ctx, m.l, y, m.cw, h);
    else if (sc.tab === 1) drawCases(ctx, m.l, y, m.cw, h);
    else if (sc.tab === 2) drawBounties(ctx, m.l, y, m.cw, h);
    else drawAwards(ctx, m.l, y, m.cw, h);
    Theme.footer(ctx, sc.tab === 0 ? H_BOARD : sc.tab === 1 ? H_CASES : sc.tab === 2 ? H_BOUNTY : H_AWARD);
  };

  sc.CHAPTERS = CHAPTERS;
  sc.open = function (params) { return MQ.Scenes.pushP(sc, params || {}); };
  UI.Casebook = sc;
})();
