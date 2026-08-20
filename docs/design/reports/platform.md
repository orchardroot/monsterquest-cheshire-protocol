# Platform workstream — Android shell, CI and PWA manifest

Branch: `ws/platform`. Scope: `android/**`, `.github/workflows/*.yml`,
`manifest.webmanifest`. Nothing under `js/`, `css/`, `index.html` or `sw.js`
was touched — the shell adapts to the game, not the other way round.

Primary target is an **Amazon Fire tablet** (Fire OS 5+, held in landscape).
`minSdk 21` is unchanged; `compileSdk`/`targetSdk` stay at 34.

---

## 1. `MainActivity.java`

Rewritten around the same idea as before — a single full-screen `WebView`
loading `file:///android_asset/www/index.html` — with these changes:

**Immersive full screen, two ways.** `hideSystemUi()` now prefers
`Window.getInsetsController()` on API 30+
(`hide(WindowInsets.Type.systemBars())` +
`BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`, plus `setDecorFitsSystemWindows(false)`
in `onCreate`), and falls back to the legacy `SYSTEM_UI_FLAG_IMMERSIVE_STICKY`
bitmask on everything older. Both paths are re-applied from
`onWindowFocusChanged` and `onResume`. Every API newer than 21 sits behind an
explicit `Build.VERSION.SDK_INT >= Build.VERSION_CODES.R` guard.

**Back button.** Still `MQ.Input.inject('b')`, but now via a small JS bridge
(`JS_BACK`) evaluated with `evaluateJavascript` and a `ValueCallback`. The
snippet returns `"exit"` when `MQ.Scenes.depth() <= 1` and the top scene id is
`title` (or the boot placeholder `title_placeholder`), otherwise it injects `b`
and returns `"handled"`. Android calls `finish()` on `"exit"` or on a `null`
result (game not booted). `onBackPressed()` is still the correct hook: this is a
plain `android.app.Activity` that does not opt in to
`android:enableOnBackInvokedCallback`, so the platform keeps routing BACK
through it on API 33+.

**Pause / resume.** `onPause` runs `JS_PAUSE` first — `MQ.Input.releaseAll()`,
`MQ.Loop.paused = true`, `MQ.Events.emit('hidden')`, `MQ.Audio.suspend()` — and
only calls `webView.onPause()` / `pauseTimers()` from the callback, so the
script is guaranteed to have run before the WebView is frozen. Without that
ordering the WebAudio soundtrack keeps playing over the Fire launcher.
`onResume` mirrors it: `resumeTimers()`, `onResume()`, then `JS_RESUME` —
`MQ.Audio.resume()`, reset `MQ.Loop._last`/`_acc` to 0 so the fixed-timestep
loop does not try to catch up on however long the app was backgrounded, unpause,
then `MQ.Events.emit('visible')` (which `js/audio/audio.js` listens for and
answers with `A.resync()`). `onDestroy` detaches and destroys the WebView.

**Settings kept / added.** JavaScript, DOM storage (the save file) and file
access all stay on; hardware acceleration stays on in the manifest.
Added: `setUseWideViewPort(true)` + `setLoadWithOverviewMode(true)` so the
`width=device-width` viewport meta is honoured, zoom off, `setTextZoom(100)`
(ignore the system font-size setting), `setMediaPlaybackRequiresUserGesture(false)`,
`LOAD_NO_CACHE`, `OVER_SCROLL_NEVER`, scrollbars off, and long-press
text-selection suppressed. A `WebChromeClient` forwards the game's `console.*`
into logcat under tag `MonsterQuest`, and `setWebContentsDebuggingEnabled` is
switched on for debuggable builds only.
Deliberately **not** enabled: `setAllowFileAccessFromFileURLs` /
`setAllowUniversalAccessFromFileURLs` — the game loads everything with
`<script src>`, never `fetch`/XHR, so the `file://` sandbox stays intact.

`FLAG_KEEP_SCREEN_ON` is unchanged.

## 2. `AndroidManifest.xml` and themes

- `configChanges` widened to
  `orientation|screenSize|smallestScreenSize|screenLayout|keyboard|keyboardHidden|navigation|uiMode|density|fontScale|layoutDirection|locale`.
  Any config change the activity does *not* declare tears it down and rebuilds
  the WebView — which reloads the game at the title screen and loses anything
  not yet written to `localStorage`. Flags newer than API 21 are ignored by
  Fire OS 5 rather than being an error.
- `launchMode="singleTask"` (relaunching from the launcher resumes rather than
  recreates), `resizeableActivity="false"`, `immersive="true"`,
  `windowSoftInputMode="adjustNothing"`, `largeHeap="true"` (the art warm-up
  caches a lot of offscreen canvases).
- `screenOrientation="sensorLandscape"` and `hardwareAccelerated="true"` kept.
- Two `uses-feature ... required="false"` entries (touchscreen, gamepad) so the
  APK is not filtered off keyboard-driven devices. Still zero permissions.
- New `res/values-v28/styles.xml` adds
  `windowLayoutInDisplayCutoutMode = shortEdges` for notched phones; the base
  `res/values/styles.xml` is untouched and Fire tablets are unaffected.

## 3. Asset bundling (`android/app/build.gradle`)

The old `copyWebAssets` was a `Copy` task including only
`index.html, manifest.webmanifest, sw.js, js/**, icons/**` — it **missed
`css/**`** entirely, and being a `Copy` it never removed files, so anything
renamed or deleted in the repo stayed behind in `src/main/assets/www` and got
shipped forever.

Now it is a **`Sync`** task (mirrors the source, deletes strays) with
`css/**` added and `.DS_Store` / `*.map` / `node_modules` excluded. A `doLast`
assertion fails the build if `index.html` did not land, and `clean` now also
deletes `src/main/assets/www`.

Simulated against the current tree, the task bundles **87 files** across
`js/{core,art,audio,data,world,world/maps,battle,content,ui,story,story/chapters}`,
`css/`, `icons/` and the three root files — and every one of the 76 `src`/`href`
references in `index.html` resolves inside that set.

## 4. CI (`.github/workflows/`)

`apk.yml`
- Trigger branches are now `main`, `master`, **`v2`** (the stale
  `claude/pokemon-style-game-q728v6` branch was dropped).
- Added `concurrency: {group: apk, cancel-in-progress: true}` — every run
  publishes to the same `apk-latest` tag, so overlapping runs used to race.
- Signing is unchanged: repo secret `ANDROID_KEYSTORE_B64` /
  `ANDROID_KEYSTORE_PASS` when present, otherwise a freshly generated
  throwaway self-signed key.
- New **"Sanity-check the bundled web assets"** step: `unzip -l` the APK and
  fail if `assets/www/index.html`, `assets/www/css/style.css`,
  `assets/www/js/boot.js` or `assets/www/js/core/loop.js` are missing — the
  cheapest guard against shipping a black screen.
- Still publishes `monsterquest.apk` to the rolling `apk-latest` release
  (`make_latest: true`), plus the run artifact.

`pages.yml` — logic unchanged and still sound (it quietly skips when Pages is
not enabled on the repo); only the trigger branch list gained `v2`. Note it
uploads the whole repo root, so `docs/`, `android/` and `tools/` ride along;
harmless, but worth trimming if the artifact ever gets slow.

## 5. `manifest.webmanifest`

Name is now **"MonsterQuest: The Cheshire Protocol"** (short name still
`MonsterQuest`), with a description matching the actual game — Cheshire, eight
gym badges, ORACLE — rather than the old "5 towns, 4 badges" placeholder.
Added `id`, `lang: en-GB`, `dir`, `categories`, `display_override` and
`prefer_related_applications: false`. `display: fullscreen`,
`orientation: landscape` and the `#181820` background/theme colours are kept so
they still agree with `index.html`'s `theme-color` meta and the Android theme's
`game_background`. All three icons referenced (`icon-192`, `icon-512`,
`icon-maskable-512`) were confirmed present and correctly sized.

---

## Building and sideloading the APK

### Easiest: let CI do it

Push to `v2` (or run the workflow manually), wait for **Build Android APK**,
then grab `monsterquest.apk` from the rolling
[`apk-latest`](../../../../releases/tag/apk-latest) release or from the run's
artifacts.

### Locally

There is **no Gradle wrapper committed** (`android/gradlew` does not exist, and
a wrapper needs a binary `gradle-wrapper.jar`), so use a system Gradle **8.7+**
— AGP 8.5.2 requires it — with a **JDK 17**:

```sh
brew install gradle openjdk@17          # macOS; or use Android Studio's JDK
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME="$HOME/Library/Android/sdk"   # SDK Platform 34 + build-tools

cd /path/to/monsterquest-cheshire-protocol

# Debug build — self-signs with the local debug key, easiest for testing:
gradle -p android assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk

# Release build — needs a keystore:
keytool -genkeypair -v -keystore /tmp/mq.keystore -storetype PKCS12 \
  -alias monsterquest -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass monsterquest -keypass monsterquest \
  -dname "CN=MonsterQuest, OU=Games, O=MonsterQuest, C=GB"

gradle -p android assembleRelease \
  -PstoreFile=/tmp/mq.keystore -PstorePassword=monsterquest \
  -PkeyAlias=monsterquest -PkeyPassword=monsterquest \
  -PversionCode=1 -PversionName=1.0
# -> android/app/build/outputs/apk/release/app-release.apk
```

`copyWebAssets` runs automatically as part of `preBuild`, so the APK always
carries the current web tree. To refresh the assets without a full build:
`gradle -p android :app:copyWebAssets`. `gradle -p android clean` wipes the
mirrored assets too.

### Sideloading onto the Fire tablet

1. On the tablet: **Settings → Security & Privacy → Apps from Unknown Sources**
   (older Fire OS: **Settings → Security**) and allow the installer you are
   using — Silk browser if downloading from the GitHub release, or the Files app.
2. Either download `monsterquest.apk` directly in Silk and tap it, or install
   over ADB:

   ```sh
   # enable Developer Options: Settings -> Device Options -> tap "Serial Number" 7x
   # then Developer Options -> ADB Debugging -> on, and plug in over USB
   adb devices                       # accept the prompt on the tablet
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   adb shell am start -n com.monsterquest.app/.MainActivity
   adb logcat -s MonsterQuest:D chromium:E   # game console + WebView errors
   ```
3. **Signature mismatch on upgrade?** CI builds without the
   `ANDROID_KEYSTORE_B64` secret get a brand-new throwaway key each run, so
   `adb install -r` will fail with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`.
   `adb uninstall com.monsterquest.app` first (this also deletes the save), or
   set the repo secret once for stable upgrades.

The app is entirely offline and declares no permissions, so nothing else needs
granting.

---

## Verification done locally

No JDK, Android SDK or Gradle is installed on this machine, so nothing was
compiled. What *was* checked:

- **XML** — `AndroidManifest.xml`, `res/values/styles.xml`,
  `res/values-v28/styles.xml` all parse with `xml.dom.minidom`.
- **YAML** — both workflows parse with PyYAML; triggers, jobs and step counts
  inspected (`apk.yml`: 8 steps, `pages.yml`: 5).
- **JSON** — `manifest.webmanifest` parses; all three icon paths exist on disk
  at the declared sizes (192×192, 512×512, 512×512).
- **Gradle** — all three `.gradle` files brace/paren-balanced under a
  comment-and-string-aware scanner; `gradle.properties` well-formed.
- **The `Sync` file set** — the Ant include/exclude patterns were reimplemented
  in Python and run over the real tree: 87 files selected, and all 76
  `src`/`href` targets in `index.html` are inside that set.
- **Java** — brace/paren balanced under a proper lexer; every import used; every
  API referenced desk-checked against its `@since` level (`evaluateJavascript`
  19, `setMediaPlaybackRequiresUserGesture` 17, `setTextZoom` 14,
  `setDisplayZoomControls` 11, `Theme.Material` 21, `WindowInsetsController` /
  `WindowInsets.Type` / `setDecorFitsSystemWindows` / `getInsetsController` 30 —
  the last four all behind `SDK_INT >= R`).
- **The three JS bridge snippets** — extracted from the Java source and run
  under Node against a mock `MQ`. Results: back at `title` depth 1 → `exit`
  (no inject); at `title_placeholder` depth 1 → `exit`; at `overworld` → `handled`
  + `inject:b`; at `title` with depth 3 → `handled` + `inject:b`; with no game
  → `exit`. Pause emits `releaseAll`, `emit:hidden`, `audio.suspend` and sets
  `Loop.paused = true`; resume emits `audio.resume`, `emit:visible`, clears
  `_last`/`_acc` and unpauses. All three degrade to a harmless string if `MQ`
  is absent.

## Notes for other workstreams

- The bridge depends on three things staying put in `js/`: `MQ.Input.inject`,
  `MQ.Scenes.top()/.depth()`, and the top-level title scene keeping id
  `"title"`. If the title scene is ever renamed or wrapped, update `JS_BACK` in
  `MainActivity.java` to match, or the back button will stop exiting.
- `MQ.Loop._last` / `_acc` are poked directly on resume, mirroring what
  `js/core/loop.js` already does in its own `visibilitychange` handler. A public
  `MQ.Loop.resume()` would be tidier if the core team wants to add one.
- `theme_color` is pinned at `#181820` to match `index.html`'s `theme-color`
  meta and the Android theme colour. If UI changes the site chrome colour,
  all three want changing together.
- `sw.js` is still bundled into the APK for parity with the web build. It never
  registers there — `index.html` guards registration on
  `location.protocol.indexOf("http") === 0` — so it costs a few KB and nothing
  else.
