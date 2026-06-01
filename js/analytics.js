/**
 * Google Analytics 4 (gtag.js)
 *
 * Setup:
 * 1. https://analytics.google.com/ → Admin → Create property (if needed)
 * 2. Data streams → Add stream → Web → URL: https://babyfacetaiwan.com
 * 3. Copy Measurement ID (G-XXXXXXXXXX) and paste below
 * 4. Deploy. In GA4 → Reports, use Realtime to verify visits.
 *
 * Leave "" to disable tracking (local file:// preview).
 */
const GA4_MEASUREMENT_ID = "G-1F0C5WC174";

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

  gtag("config", id, {
    send_page_view: true,
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
  });

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin === window.location.origin) return;

      gtag("event", "click", {
        event_category: "outbound",
        event_label: url.href,
        transport_type: "beacon",
      });
    },
    true
  );
})();
