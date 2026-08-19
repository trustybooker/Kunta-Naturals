(function () {
  const allowed = new Set(['page_view','quiz_completed','concierge_opened','concierge_recommended','free_product_opened','launch_access_clicked','checkout_started']);
  let endpoint = '';
  async function configure() {
    try {
      const response = await fetch('/data/site-config.json');
      const config = await response.json();
      endpoint = config.backend_api_base_url ? `${config.backend_api_base_url}/api/events` : '';
      track('page_view');
    } catch { /* Analytics must never interrupt the visitor. */ }
  }
  function track(event, label) {
    if (!endpoint || !allowed.has(event) || navigator.globalPrivacyControl) return;
    let referrerHost;
    try { referrerHost = document.referrer ? new URL(document.referrer).hostname : undefined; } catch { referrerHost = undefined; }
    const payload = JSON.stringify({ event, path: location.pathname.slice(0, 180), label: label?.slice(0, 120), referrerHost });
    if (navigator.sendBeacon) navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    else fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.includes('free-products') || href.includes('/downloads/')) track('free_product_opened', link.textContent.trim());
    if (href.includes('email-signup')) track('launch_access_clicked', link.textContent.trim());
    if (href.includes('checkout')) track('checkout_started', link.textContent.trim());
  });
  document.getElementById('ritualQuiz')?.addEventListener('submit', () => track('quiz_completed'));
  window.KuntaAnalytics = { track };
  void configure();
})();
