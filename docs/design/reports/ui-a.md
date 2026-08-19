# ui-a — primary UI screens

Files owned: `js/ui/theme.js`, `title.js`, `pause.js`, `party.js`, `bag.js`,
`settings.js`, `shop.js`, `save.js`, `tools/test/test-ui-a*.js`.
Nothing else was touched (`index.html`/`sw.js` are regenerated for local
testing only and reverted before every commit).

Everything is touch-first: rows are big hit targets, taps select, the header
carries an on-screen back chevron and the footer hint bar is tappable (tapping
a hint injects that action, so a tablet always has A/B on screen). Keyboard,
gamepad and the analogue stick all drive the same `MQ.UI.menuState` logic.
All geometry comes from `MQ.View.w/h` and `MQ.View.safe` — no literal 960.

---

## MQ.UI.Theme (js/ui/theme.js)

Shared by both UI workstreams. **Access it at runtime** (`MQ.UI.Theme.x` inside
a function), never at parse time — `ui/*.js` load alphabetically, so `theme.js`
loads after most consumers.

| Member | Purpose |
|---|---|
| `C` | palette: `ink paper panel edge brass brassLit oxblood slate canal salt moor cyber signal good warn bad dim text textDim hpHigh/Mid/Low exp grin sel selEdge` |
| `m()` | cached metrics `{w h l r t b cw ch cx cy pad rowH k touch wide}` from `MQ.View` + safe insets. Same object every call (no per-frame allocation) |
| `backdrop(ctx,{top,bottom})` / `scrim(ctx,alpha)` / `gradient(ctx,h,a,b)` | screen backgrounds; gradients are cached |
| `panel(ctx,x,y,w,h,{lit,flat,accent,title,selected,alpha,radius,fill,border})` | the standard box |
| `header(ctx,{title,sub,right,icon,accent,back})` → height | top bar with a big back chevron; `headerBottom()`, `backRect()` |
| `footer(ctx,[{btn,label}])` → height | hint bar with glyphs by `MQ.Input.lastSource`; tapping a hint injects the action; hidden when the "Button hints" setting is off. `footerTop()` |
| `glyph(btn)` | `a b start select run dir up down left right lr` → `Z/X/ESC` (key), `A/B/START` (pad), `A/B/MENU` (touch) |
| `backPressed()` | B, header chevron tap, or hardware back (Android injects `b`) |
| `tapped(rect)` | consumes a tap inside a rect |
| `button(ctx,label,x,y,w,h,{active,disabled,size})` | |
| `list(state,ctx,{x,y,w,h,rowH,gap,render,empty})` | themed scrolling list; fills `state.rects` so `state.update()` taps work, draws a scrollbar, keeps the cursor visible. `row()` is the default renderer |
| `tabStrip(ctx,labels,active,{x,y,w,h})` + `tabTapped()` | |
| `typeChip` `statusChip` `hpBar` `hpColour(r)` `typeColour(t)` | |
| `grin(ctx,cx,cy,size,{alpha,open,eyes,color})` | the GRINMALKIN motif: a smile with teeth and two lazy crescent eyes |
| `sfx(id)` `music(id)` `buzz(ms)` | ROSTER §8 ids with a fallback to the core's five (`cursor confirm deny text item`) |
| `confirm(q)` `say(pages,opts)` `toast(t)` | degrade to resolved promises with no `MQ.Dialog` |
| `money(n)` `playtime(ms)` `date(ts)` `titleCase(s)` `walletOf()` `flag(id)` | |

## MQ.UI.Title (js/ui/title.js)

`MQ.Boot` pushes this object directly, so it **is** the scene (`id: 'title'`).
Night sky over the Cheshire plain: stars, drifting rain, the Kerridge ridge with
White Nancy, the Jodrell dish and a mill chimney, and the GRINMALKIN grin fading
in and out of the sky on an 11-second cycle. Menu: Continue / New Game /
Settings / Credits; START takes the default action.

- **Continue** → `MQ.UI.Save.open({mode:'load'})`. Legacy (`version < 2`) and
  corrupt slots are listed honestly rather than hidden, and picking one explains
  itself and offers a new game. A good slot is `MQ.Save.load()`ed, then handed off.
- **New Game** → name entry → difficulty → confirm → `MQ.Save.newGame()`, then hand-off.
  The starter is *not* chosen here; the story does that.
- **Hand-off**: `MQ.Events.emit('game:start', {newGame, slot, name, difficulty})`,
  then the first of `MQ.UI.Title.onStart(info)` (settable hook), `MQ.Game.start`,
  `MQ.Story.begin`, `MQ.Story.chapters[1].start` via `MQ.Script`, `MQ.Overworld.scene`,
  `MQ.Overworld.start`. With none of them present it says so rather than crashing.

Also published from this file:

- `MQ.UI.NameEntry.open({title, subtitle, initial, max})` → `Promise<string|null>` —
  on-screen QWERTY-free A–Z grid with case toggle, space, delete and DONE for touch
  and pad, **plus real typing** on a physical keyboard (a `keydown` listener that
  suppresses the input action that key would otherwise have triggered). Used for the
  player name and for monster nicknames.
- `MQ.UI.Difficulty.open({current})` → `Promise<id|null>` and `MQ.UI.DIFFICULTIES`
  (SYSTEMS-SPEC §13: story / normal / hard / nightmare with their effects).
- `MQ.UI.Credits.open()` — scrolling credits, A to speed up.

## MQ.UI.Pause (js/ui/pause.js)

`MQ.UI.Pause.open()` / `.toggle()`. Transparent scene over a scrim, so the
overworld stays visible. Tabs down the left: **Party, Bag, Dex, Casebook, Map,
Trainer, Perks, Settings, Save** — each opens `target.open(params)` if the owner
provided one, else pushes the object; a tab whose screen does not exist is greyed
and says so. Status card: name, trainer level, the eight badges as pips, credits,
playtime, map, chapter, clock, the party with HP bars and status, the tracked
quest (`MQ.Quests.tracked()`), and cat trust. **CUTOVER** counter appears when
`cutover_started` is set and reads `cutover_days` (number, `stopped`, `t3`, `t0`;
pulses red at T-minus). **SIGNAL** pip appears when `signal_meter` is set and shows
`MQ.Signal.level` if the world provides one. Four **quick-slots** along the bottom:
empty slot opens the bag in pick mode to register, filled slot uses the item, RUN
clears one. Persisted via save provider `ui_quick`.

## MQ.UI.Party (js/ui/party.js)

`MQ.UI.Party.open({mode:'menu'|'select', title, filter})` → `Promise<index|null>`.
Rows: sprite (via `MQ.MonsterArt` when it exists, else a typed placeholder), name,
level, HP gauge and numbers, status chip, gear marker, reserve marker, a full
Overdrive stripe, and a brass bar on the leader. Row options: Summary, Give/Take
gear (through the bag), Nickname, Move in the order (pick-then-place reorder),
Send to the front, and **Keep in reserve** for MEADOW/BIGBOY (calls
`MQ.Cats.setReserve` when present).

`MQ.UI.PartySummary.open({mons, index, page})` — four pages, left/right or tabs:
**Stats** (six stat bars, ability + description, temperament, traits gated behind
TL20 or the Fingerprint perk, base spread), **Moves** (type chip, category, power,
accuracy, PP, description), **Dex** (genus, height, weight, habitat, rarity, dex
text, met-at, evolution), **Ribbons** (friendship gauge, ribbons, met date).

## MQ.UI.Bag (js/ui/bag.js)

`MQ.UI.Bag.open({mode:'field'|'battle'|'give'|'sell'|'pick', target, pocket, title})`
→ `Promise<{item,n,data}|null>`. Seven pockets mapped from ROSTER item `kind`:
Items, Medicine, Capsules, Gear, Cards, Brewing, Keys. It lands on a pocket that
has something in it. Detail panel with description, price, and what a Skill Card
teaches. Field actions: Use / Teach / Look at it, Give to a monster, What is it?,
Throw away (quantity + confirm; key items refuse). Uses `MQ.Items.use` or
`MQ.Inventory.use` when they exist and falls back to plain HP/status handling.

**Skill Card flow**: pick the card → choose a party member → already known? say so;
under four moves? learn it; four moves? `MQ.UI.MoveReplace` shows the new move
against all four with type/power/accuracy/PP, confirms the swap, then consumes the
card. Also published: `MQ.UI.Quantity.open({max,min,start,price,unit,label,sub})`
→ `Promise<n|null>` (±1 up/down, ±10 sideways, big +/- buttons for thumbs) and
`MQ.UI.MoveReplace.open({mon,moveId})` → `Promise<slot|null>`.

## MQ.UI.Settings (js/ui/settings.js)

`MQ.UI.Settings.open({fromTitle})`. Fields: text speed, music, sound effects,
difficulty, battle animation, battle text, running (hold/toggle), touch layout
size, stick side, stick opacity, screen shake, vibration, autosave, button hints,
plus Reset to defaults. Left/right or A changes a value; changes apply instantly
(`MQ.Dialog.speed`, `MQ.Audio.setVolume`, `MQ.Scenes.shakeScale`,
`MQ.Save.autosaveEnabled`, `MQ.Battle.difficulty`, the `difficulty` flag, and the
`MQ.Input.setTouchScale/setTouchSide/setTouchAlpha` hooks when they exist).
The right-hand panel carries a **live preview**: the sample line types itself at
the chosen speed, and the touch rows draw a mock stick and buttons at the chosen
size, side and opacity. Reads/writes `MQ.Settings` when the content team supplies
it and always mirrors to `localStorage['mq2_settings']`.
Public: `get(id)`, `setValue(id,v)`, `values()`, `OPTIONS`, `DEFAULTS`, `applyAll()`,
`textSpeedMultiplier()`, `touchScale()`.

## MQ.UI.Shop (js/ui/shop.js)

`MQ.UI.Shop.open({name, variant, stock, greeting, sellRate, currency})` → Promise.
`stock = [{id, price?, stock?, cond?}]` — `price` defaults to the item price,
`stock` limits the shelf and decrements, `cond` is a `MQ.Flags.test` expression.
Buy / Sell / Leave tabs, quantity picker with a running total, "you can afford N",
half-price selling (`sellRate`), and the ADJUDICATE *Trader* perk discount when
`perk_adjudicate_trader` is held. Currencies: `credits` (`MQ.Inventory.money`),
`marks`, `chips` (`MQ.Trainer.<cur>` or the matching flag). **Variants** —
`mart chemist market bookshop brewery rods arena bounty` — each with its own accent
colour, icon, greeting and parting line, and each sets `shop_seen_<variant>`.

## MQ.UI.Save (js/ui/save.js)

`MQ.UI.Save.open({mode:'save'|'load', slot})` → `Promise<entry|null>` (the entry
from `MQ.Save.slots()`). Four cards: three slots and the autosave, each showing
name, chapter, trainer level, badge pips, playtime, party and location, or
"Empty" / "Old save (version n)" / "Damaged data". Overwriting an occupied slot
confirms first; the autosave slot cannot be hand-written. `MQ.UI.Save.card(...)`
is exported for reuse.

---

## Tests

`node tools/test/run.js ui-a` → **39 passing**
(`tools/test/test-ui-a-theme.js` 10, `test-ui-a-title.js` 11, `test-ui-a-screens.js` 18).
They cover: theme metrics/glyphs/list rects/scrolling, every screen pushing,
updating, drawing and popping cleanly, keyboard navigation reaching each expected
item, legacy/corrupt save handling, name entry by both on-screen keys and physical
typing, the pause tab list plus CUTOVER/SIGNAL/quick-slots, party select/reorder/
summary paging, bag pockets and the full Skill Card teach + replace flow, settings
persistence and the touch preview, shop buy/sell with quantities and money, the
save/overwrite path, and a portrait-resize pass over every screen.
`node tools/validate.js` exits 0.

## NEEDS (from other teams)

- **world/overworld** — push the hub on START: `MQ.UI.Pause.open()` (or `.toggle()`).
  Expose `MQ.Overworld.state.map` for the status card, and either
  `MQ.Overworld.scene` (a scene object) or `MQ.Overworld.start(info)` so the title
  can hand off. Honour the `runMode` setting (`MQ.UI.Settings.get('runMode')`).
- **content** — `MQ.Party.list` (monster instances per ENGINE-ARCHITECTURE §4);
  `MQ.Inventory.{count,add,remove,money,spend}` **plus a listing**: `list()` →
  `[{id,n}]`, or `entries()`, or an `items` object/Map (any of these is read);
  `MQ.Trainer.{name,level,perks,badges,marks,chips}`; `MQ.Quests.tracked()` →
  `{name,text}`; `MQ.Cats.setReserve(speciesId,bool)`; `MQ.Items.use(id, monster)`
  (or `MQ.Inventory.use`) so bag and quick-slots do the real thing;
  `MQ.Settings.{get,set,save}` — if it exists it wins, otherwise settings live in
  `localStorage['mq2_settings']` and are exposed via `MQ.UI.Settings.get`.
- **data** — `MQ.Data.expProgress(monster)` → `{cur, need, ratio}` for the EXP bar
  (the summary shows raw EXP without it).
- **art** — `MQ.MonsterArt.get(speciesId)` (or `.sprite`/`.render`) returning a
  canvas; a typed placeholder is drawn until then.
- **audio** — `MQ.Sfx.play(id)`/`MQ.SFX.play(id)` for the ROSTER §8 ids
  (`ui_move ui_select ui_back ui_error ui_open ui_close coin cat_meow`) and
  `MQ.Audio.playSong('title'|'credits')`.
- **battle** — `MQ.BattleScene.animSpeed` and `MQ.Battle.difficulty` are set from
  Settings; the bag in `mode:'battle'` resolves `{item, n, data}` for you.
- **story/boot** — set `MQ.UI.Title.onStart = function(info){...}` if the hand-off
  order above is not what you want.
- **ui-b** — publish `MQ.UI.Dex`, `MQ.UI.Casebook`, `MQ.UI.WorldMap` (or `MQ.UI.Map`),
  `MQ.UI.TrainerCard` (or `MQ.UI.Trainer`), `MQ.UI.Perks` as scene objects, ideally
  with an `open(params)` returning a Promise; the pause hub picks them up
  automatically. Use `MQ.UI.Theme` at runtime, not parse time.

## NEW IDS

- `shop_seen_<variant>` — flags set on entering a shop
  (`mart chemist market bookshop brewery rods arena bounty`).
- `player_name` — flag mirroring the entered name, for scripts that want it
  without `MQ.Trainer`.
- `difficulty` — flag mirroring the difficulty setting so `MQ.Flags.test` can read it.
- `ui_quick` — save provider key for the four quick-slots.
- `perk_adjudicate_trader` — assumed id for the *Trader* second rank of Ledger
  Keeper (SYSTEMS-SPEC §8 lists the name but not the id); the shop applies a 10%
  discount when it is held and behaves normally when it is not.

## Known gaps

- The EXP bar in the summary needs `MQ.Data.expProgress`; until then it prints raw EXP.
- Item effects are the content team's; the bag applies simple HP/status fallbacks so
  the flow is testable, and defers to `MQ.Items.use` the moment it appears.
- Quick-slots use items through the same hook, so they are inert until that lands.
- `MQ.Input` has no touch size/side/opacity setters yet; the settings screen stores
  and previews them and calls `setTouchScale/setTouchSide/setTouchAlpha` when they exist.
- Boxed monsters / the PC are not here (no owner listed); the party screen manages
  the six in hand only.
- No browser testing was done — headless only, as instructed.
