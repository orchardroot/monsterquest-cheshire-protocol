# Workstream report — art-tiles

Branch `ws/art-tiles`. Files owned and changed: `js/art/sprites.js`, `js/art/tiles.js`,
`tools/test/test-art-tiles.js`. Nothing else was touched (`index.html`/`sw.js` are
regenerated locally for headless runs and reverted before every commit).

## What was built

**`js/art/sprites.js` — `MQ.Art`, the painting toolkit.**
The stub rasteriser is intact (`render/get/define/sprite/flip/tint/silhouette/
TYPE_PALETTES/stats/clearCache/canvas`) and now sits under a full procedural
toolkit. Everything paints with `fillRect` only — no paths, gradients or
transforms — so art bakes identically in a browser, in the headless stub and in
the software rasteriser the tests install.

**`js/art/tiles.js` — 296 hand-painted 16×16 tiles.**
Every one of the world workstream's 288 placeholder painters is replaced with real
pixel art; ids and properties are byte-stable (one addition, below). 8 new ids were
added. `Tiles.warm()` bakes 432 canvases (frames × variants).

Cheshire palette, used everywhere: silk-mill oxblood brick, Chester sandstone,
blue slate, salt white, canal green, pine dark, moor purple/heather, silk-mill
mustard, rail steel, Kerridge gritstone.

Highlights: grass ×3 seeded variants and tall grass that sways on 2 frames;
dirt/cobble/flag/gravel/tarmac/towpath/moor paths; 10 animated waters (canal green,
mere, deep, brine, flash, zoo pool, fishing rise-rings, waterfall, hot spring);
two-tile oak/pine/birch/apple trees with seeded canopy dapple plus willow, autumn
and dead singles; brick/sandstone/gritstone/Tudor/render/castle/city masonry;
slate, pantile, thatch, glass and corrugated roofs with edge and ridge variants;
lit and unlit windows with a warm interior glow; a rotating silk-mill water wheel;
Lovell dish, boat lift, canal lock, narrowboat, salt pans, brine pump, mine
workings and rails, Saxon cross, bear statue, moai, White Nancy, station clock,
signal, chippy and pub signs; and a full interior set (floors, rugs, counters,
shelves, PC, healer, hearth with a 4-frame fire, bar, pews-adjacent furniture,
cat bed and bowl).

## Public API

```js
// Tiles (unchanged signatures, plus three additions)
MQ.Tiles.get(id, frame, seed) → cached 16×16 canvas   // wraps frame/variant, null if unknown
MQ.Tiles.warm() → {tiles, baked}                      // prebake everything (Boot calls this)
MQ.Tiles.props/has/ids/count/isSolid/frames/clearCache
MQ.Tiles.variants(id) → n            // NEW
MQ.Tiles.stats() → {tiles, baked}    // NEW
MQ.Tiles.unpainted() → [id...]       // NEW (dev/tests)

// Art — primitives (all take a 2d ctx)
MQ.Art.px/rect/hline/vline/fill/frame/bevel/vgrad/hgrad
MQ.Art.ascii(ctx, rows, pal, ox, oy)      // run-length ascii sheets, '.'/' ' = transparent
MQ.Art.checker/dither(level 0..16)/speckle(seeded)
MQ.Art.bricks/stonework/planks/roof({style:'slate'|'tile'|'thatch'|'metal'})
MQ.Art.ripples(ctx, frame, opts)/tuft/edge(sides)/shadow/glow
// Art — palette & post-process
MQ.Art.C            // named Cheshire colours
MQ.Art.PAL          // shared 60-char ascii palette (stable — tile art is written against it)
MQ.Art.pal(over)    // copy of PAL with overrides (never mutates PAL)
MQ.Art.ramp(base, n, lo, hi) → [shades]
MQ.Art.outline(canvas, colour, diagonal?) → new canvas
MQ.Art.dropShadow(canvas, dx, dy, alpha) → new canvas
MQ.Art.tint/silhouette/flip/flipY/get/render/stats/clearCache
```

**How to use.** Draw a tile: `ctx.drawImage(MQ.Tiles.get(id, animFrame, variantSeed), x, y, 32, 32)`.
`get()` is one object-key lookup on the hot path and allocates nothing after the
first bake; call `MQ.Tiles.warm()` once at boot. Animate by passing a frame index
that advances a few times a second (`MQ.Tiles.frames(id)` gives the count, 1 for
static tiles). Pass a per-cell seed (e.g. `(x*7+y*13)`) as `variantSeed` so grass,
paths and rock never tile as an obvious grid — `MQ.Tiles.variants(id)` gives the
count. Over-layer and deco tiles paint on transparent ground on purpose; every
`layer:'ground'` tile is fully opaque, tested.

## Testing

`node tools/test/run.js art-tiles` — 17 tests, all passing. `tools/test/test-art-tiles.js`
installs a small software canvas (fillRect/drawImage/getImageData with real alpha
blending) into the vm, because the headless stub only records calls. It asserts:
every id renders every frame and variant without throwing at 16×16; every
ground-layer tile is 100% opaque; every solid tile has real pixels; every tile
uses ≥3 colours (no flat blocks); animated tiles differ between frames; variant
tiles differ between variants; `get()` caches, wraps negative/out-of-range
frames and is deterministic across `clearCache()`; `warm()` bakes exactly
frames×variants; the world-facing properties (solid/water/grass/encounter/layer/
ledge/interact/light) survived the repaint; and the `MQ.Art` helpers behave
(dither density, tint clipped to alpha, outline grows the silhouette, `pal()`
does not mutate `PAL`, `globalAlpha` always restored).

Full suite `node tools/test/run.js` → 46 passed, 0 failed. `node tools/validate.js` → OK, 296 tiles.

## NEEDS

- **world/overworld** — draw order must be ground → deco → entities (y-sorted) → over,
  and pass a per-cell `variantSeed` plus a shared animation frame to `MQ.Tiles.get()`.
  Two-tile trees need the `_top` id on the `over` layer directly above the base id.
  `water*` tiles are `solid` until the `boat` ability is unlocked (that gate is yours).
- **core/boot** — already calls `MQ.Tiles.warm()`; no change needed.
- **art/fx** — night/dusk tinting is a layer job, not a tile job: tiles with `light:true`
  (`window_lit`, `lamp`, `crystal`, `terminal`, `server_rack`, `rail_signal`, `fireplace`,
  `radio_mast`, `hologram`, …) should be excluded from the darkening layer or punched
  back through it.
- **maps** — the `waders` marsh sites (Lindow Moss, Ince, Burton) now have `marsh`,
  `marsh_pool` and `boardwalk`; festival streets have `bunting`; shorelines have
  `shore_n/w/e` to complement the existing south-facing `water_edge`.

## NEW IDS

Additive only — no existing id or property was removed or renamed.

| id | props | use |
|---|---|---|
| `marsh` | grass encounter, 2 variants | walkable marsh (Waders sites) |
| `marsh_pool` | water, 4 frames | standing marsh water |
| `boardwalk` | walkable, 2 variants | bog boardwalk (Lindow Moss) |
| `roof_ridge` | solid | slate roof ridge course |
| `bunting` | over layer | festival streets, Treacle Market, Middlewich |
| `shore_n` / `shore_w` / `shore_e` | solid, 4 frames | banks with water on the other three sides |

**One property change:** `grass_tall` gained `anim` (2 frames) so it sways. It is
additive — `Tiles.frames('grass_tall')` returns 2 instead of 1 and callers that
always pass frame 0 are unaffected.

## Known gaps

- Tiles are painted for daylight. There is no baked night/dusk variant set; that
  belongs to `MQ.FX`'s lighting layer (see NEEDS).
- Edge/corner autotiling is manual: `MQ.Art.edge()` is exposed and directional
  cliff/ledge/shore ids exist, but there is no automatic 47-tile blob autotiler.
  If the maps workstream wants one, it should live in `world/mapformat.js` and
  can select among the existing directional ids.
- Trees are two tiles (base + `_top`); there is no 2×2 large-tree variant.
- Snow/rain surface variants are not baked — weather is an `MQ.FX` overlay.
