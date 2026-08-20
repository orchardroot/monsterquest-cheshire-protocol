// =============================================================
// MonsterQuest v2 — the east<->mid seam.
// region-east's map files are finished and are not ours to edit, so the
// return halves of the two links between the regions are added here, at
// registration time, to the map objects region-east has already defined:
//   Alderley Edge  -> Chelford Heath (R8, Knutsford)
//   Tegg's Nose    -> Bosley Cloud   (D-Cloud, Congleton)
// Loads after every east_*.js and mid_*.js (alphabetical), and does
// nothing at all if region-east is not present.
// Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const M = MQ.MidBuild;

  // The Edge's south lawn, below the Wizard's Well: the track west onto the
  // heath. region-east's own exits (north to the Sandhills, the caverns,
  // the rope slide) are untouched.
  M.linkBack("alderley_edge", [
    { x: 1, y: 36, to: "route_alderley_knutsford", tx: 1, ty: 16, dir: "left", kind: "edge" },
    { x: 1, y: 37, to: "route_alderley_knutsford", tx: 1, ty: 17, dir: "left", kind: "edge" },
    { x: 1, y: 38, to: "route_alderley_knutsford", tx: 1, ty: 18, dir: "left", kind: "edge" }
  ], [
    { x: 2, y: 39, text: ["CHELFORD HEATH & KNUTSFORD — 4 MILES, WEST ALONG THE SANDHILLS.",
      "A National Trust waymark, and under it a much older iron finger-post pointing at nothing in particular."] }
  ]);

  // The south-east corner of Tegg's Nose: the upland link down the Gritstone
  // Trail to Bosley Cloud. The Shutlingsloe gate at (30,33) is east's; ours
  // sits along the heather at the corner.
  M.linkBack("teggs_nose", [
    { x: 40, y: 32, to: "bosley_cloud", tx: 19, ty: 1, dir: "down", kind: "edge" },
    { x: 41, y: 32, to: "bosley_cloud", tx: 19, ty: 1, dir: "down", kind: "edge" },
    { x: 42, y: 32, to: "bosley_cloud", tx: 20, ty: 1, dir: "down", kind: "edge" }
  ], [
    { x: 43, y: 31, text: ["GRITSTONE TRAIL SOUTH — BOSLEY CLOUD 5 MILES, MOW COP 12.",
      "The next hill is a long way off and it is exactly as far away as it looks, which is unusual and worth noticing."] }
  ]);
})();
