package com.monsterquest.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Thin, fully offline WebView shell around the bundled MonsterQuest web game.
 *
 * The game is loaded straight out of the APK's assets over the file:// scheme —
 * the approach Cordova has used for a decade, and the most widely compatible
 * across the ancient WebView builds that ship on Fire OS 5. The game makes no
 * network requests, so the app declares no permissions; localStorage (DOM
 * storage) holds the save file.
 *
 * Target device is an Amazon Fire tablet held in landscape. minSdk is 21
 * (Fire OS 5 / Android 5.1), so every API newer than that is behind an
 * explicit Build.VERSION.SDK_INT guard with a legacy fallback.
 */
public class MainActivity extends Activity {

    private static final String TAG = "MonsterQuest";
    private static final String GAME_URL = "file:///android_asset/www/index.html";

    // -----------------------------------------------------------------
    // Small JS snippets used as the bridge between Android and the game.
    // Each one is defensive: the game may not have booted yet, and a
    // thrown exception inside evaluateJavascript is silently swallowed by
    // the WebView, so everything is wrapped in try/catch and returns a
    // JSON value we can act on.
    // -----------------------------------------------------------------

    /**
     * Hardware BACK. Normally it is the game's B (cancel) button. When the
     * game is sitting on the title screen with nothing stacked above it,
     * there is nothing left to cancel, so BACK should leave the app —
     * which is what a Fire tablet user expects.
     * Returns "exit" or "handled".
     */
    private static final String JS_BACK =
            "(function(){try{"
            + "var M=window.MQ;"
            + "if(!M||!M.Scenes||!M.Input||!M.Input.inject)return 'exit';"
            + "var t=M.Scenes.top();"
            + "var id=t?String(t.id||''):'';"
            + "if(M.Scenes.depth()<=1&&(id==='title'||id==='title_placeholder'))return 'exit';"
            + "M.Input.inject('b');return 'handled';"
            + "}catch(e){return 'exit';}})()";

    /**
     * Going to the background: park the fixed-timestep loop, drop any keys
     * or touches that are still held, and suspend the WebAudio context so
     * the chiptune soundtrack does not keep playing over the home screen.
     */
    private static final String JS_PAUSE =
            "(function(){try{"
            + "var M=window.MQ;if(!M)return 'no-game';"
            + "if(M.Input&&M.Input.releaseAll)M.Input.releaseAll();"
            + "if(M.Loop)M.Loop.paused=true;"
            + "if(M.Events&&M.Events.emit)M.Events.emit('hidden');"
            + "if(M.Audio&&M.Audio.suspend)M.Audio.suspend();"
            + "return 'paused';"
            + "}catch(e){return 'error';}})()";

    /**
     * Coming back: resume the audio context first, then clear the loop's
     * accumulator so it does not try to catch up on however many minutes
     * the app spent in the background, then let subsystems resync.
     */
    private static final String JS_RESUME =
            "(function(){try{"
            + "var M=window.MQ;if(!M)return 'no-game';"
            + "if(M.Audio&&M.Audio.resume)M.Audio.resume();"
            + "if(M.Loop){M.Loop._last=0;M.Loop._acc=0;M.Loop.paused=false;}"
            + "if(M.Events&&M.Events.emit)M.Events.emit('visible');"
            + "return 'resumed';"
            + "}catch(e){return 'error';}})()";

    private WebView webView;

    // -----------------------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------------------

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final Window window = getWindow();
        // Never dim or lock while someone is playing.
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Draw behind the (hidden) system bars and the display cutout.
            window.setDecorFitsSystemWindows(false);
        }

        webView = new WebView(this);
        final WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);      // localStorage = the save file
        settings.setAllowFileAccess(true);        // default flips to false on API 30+
        settings.setUseWideViewPort(true);        // honour <meta name="viewport">
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);                // ignore the system font-size setting
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        // Deliberately NOT enabled: setAllowFileAccessFromFileURLs /
        // setAllowUniversalAccessFromFileURLs. The game loads everything with
        // <script src>, never fetch/XHR, so it does not need cross-file reads —
        // and leaving them off keeps the file:// sandbox intact.

        webView.setBackgroundColor(0xFF181820);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(false);
        // Kill the long-press text-selection magnifier; this is a game canvas.
        webView.setLongClickable(false);
        webView.setHapticFeedbackEnabled(false);
        webView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) { return true; }
        });

        // Keep all navigation inside the WebView (the game never navigates,
        // but a stray link should not launch a browser over the top of it).
        webView.setWebViewClient(new WebViewClient());

        // Surface the game's console into logcat — the only practical way to
        // debug a Fire tablet build.
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.d(TAG, m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")");
                return true;
            }
        });

        if (isDebuggable()) {
            // chrome://inspect against a debuggable build only.
            WebView.setWebContentsDebuggingEnabled(true);
        }

        setContentView(webView);
        hideSystemUi();
        webView.loadUrl(GAME_URL);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView == null) return;
        // Tell the game to stand down *before* freezing the WebView, otherwise
        // the pause script never gets a chance to run and the soundtrack keeps
        // playing in the background.
        webView.evaluateJavascript(JS_PAUSE, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (webView == null) return;
                webView.onPause();
                webView.pauseTimers();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView == null) return;
        webView.resumeTimers();
        webView.onResume();
        webView.evaluateJavascript(JS_RESUME, null);
        hideSystemUi();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            final WebView doomed = webView;
            webView = null;
            ViewGroup parent = (ViewGroup) doomed.getParent();
            if (parent != null) parent.removeView(doomed);
            doomed.stopLoading();
            doomed.setWebChromeClient(null);
            doomed.loadUrl("about:blank");
            doomed.removeAllViews();
            doomed.destroy();
        }
        super.onDestroy();
    }

    // -----------------------------------------------------------------
    // Immersive full screen
    // -----------------------------------------------------------------

    /**
     * Hide the status and navigation bars, "sticky" style: a swipe from the
     * edge shows them translucently for a moment and they slide away again
     * without the game ever being resized.
     *
     * API 30+ gets the modern WindowInsetsController. Everything older —
     * including every Fire OS 5 and Fire OS 7 tablet — falls back to the
     * deprecated-but-still-functional SYSTEM_UI_FLAG bitmask, which is
     * available from API 19 and is a harmless no-op on API 21 devices that
     * lack a soft navigation bar.
     */
    @SuppressWarnings("deprecation")
    private void hideSystemUi() {
        final Window window = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            final WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                controller.hide(WindowInsets.Type.systemBars());
                return;
            }
        }
        window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
    }

    // -----------------------------------------------------------------
    // Hardware back
    // -----------------------------------------------------------------

    /**
     * Still the right hook here: this Activity extends android.app.Activity
     * and does not opt in to predictive back
     * (android:enableOnBackInvokedCallback), so the platform keeps routing
     * BACK through onBackPressed() even on API 33+.
     */
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView == null) {
            finish();
            return;
        }
        webView.evaluateJavascript(JS_BACK, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                // evaluateJavascript hands back a JSON string, quotes included:
                // "handled", "exit", or null if the WebView could not run it.
                if (value == null || value.contains("exit")) finish();
            }
        });
    }

    private boolean isDebuggable() {
        return (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }
}
