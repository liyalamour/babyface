/**
 * Google Analytics 4 (gtag.js)
 * In GA4: Admin → Data streams → choose stream → copy “Measurement ID” (G-XXXXXXXXXX).
 * Paste it below. Leave "" to disable tracking (e.g. local file:// preview).
 */
const GA4_MEASUREMENT_ID = "";

(function initGa4() {
  const id = typeof GA4_MEASUREMENT_ID === "string" ? GA4_MEASUREMENT_ID.trim() : "";
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(script);

  gtag("config", id);
})();
