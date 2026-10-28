package am.shtemarm.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceResponse;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;

public class MainActivity extends Activity {
    private WebView webView;
    private LinearLayout errorView;
    private static final String SITE = "https://shtemarm.lovable.app/";
    private static final String HOST = "shtemarm.lovable.app";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOfflineMessage();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 500) showOfflineMessage();
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (errorView != null && view.getVisibility() == View.VISIBLE) errorView.setVisibility(View.GONE);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("https".equals(url.getScheme()) && HOST.equals(url.getHost())) return false;
                if ("https".equals(url.getScheme()) || "mailto".equals(url.getScheme()) || "tel".equals(url.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, url)); } catch (Exception ignored) { }
                }
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        setContentView(webView);
        webView.loadUrl(SITE);
    }
    private void showOfflineMessage() {
        if (errorView == null) {
            errorView = new LinearLayout(this);
            errorView.setOrientation(LinearLayout.VERTICAL);
            errorView.setGravity(android.view.Gravity.CENTER);
            errorView.setPadding(36, 36, 36, 36);
            TextView message = new TextView(this);
            message.setText("Shtemarm\\n\\nԿապի խնդիր է առաջացել։ Ստուգիր ինտերնետը և փորձիր կրկին։");
            message.setTextSize(19);
            message.setGravity(android.view.Gravity.CENTER);
            Button retry = new Button(this);
            retry.setText("Կրկին փորձել");
            retry.setOnClickListener(v -> { errorView.setVisibility(View.GONE); webView.setVisibility(View.VISIBLE); webView.loadUrl(SITE); });
            errorView.addView(message);
            errorView.addView(retry);
            addContentView(errorView, new android.view.ViewGroup.LayoutParams(-1, -1));
        }
        webView.setVisibility(View.GONE);
        errorView.setVisibility(View.VISIBLE);
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
