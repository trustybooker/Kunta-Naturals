async function loadSiteConfig() {
  try {
    const response = await fetch('/data/site-config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Configuration unavailable.');
    return await response.json();
  } catch {
    return {};
  }
}

function setLeadStatus(message, type = 'info') {
  const target = document.getElementById('leadCaptureStatus');
  if (!target) return;
  target.textContent = message;
  target.dataset.status = type;
}

function freeProductsUrl(config) {
  return config.free_download_url || 'free-products.html';
}

async function setupLeadCapture() {
  const form = document.getElementById('leadCaptureForm');
  if (!form) return;

  const config = await loadSiteConfig();
  const apiUrl = config.lead_capture_api_url || config.email_capture_url || '';
  const fallbackUrl = freeProductsUrl(config);
  const params = new URLSearchParams(window.location.search);
  const interest = String(params.get('interest') || 'free-guide').slice(0, 80);
  const submitButton = form.querySelector('button[type="submit"]');

  if (interest !== 'free-guide') {
    const heading = document.querySelector('h1');
    const intro = document.querySelector('.hero-copy .lead');
    if (heading) heading.textContent = 'Get first access when this ritual launches.';
    if (intro) intro.textContent = 'Join the launch list. We will send useful free ritual resources now and one availability update when this product is ready.';
    if (submitButton) submitButton.textContent = 'Join the launch list';
  }

  if (!apiUrl) {
    setLeadStatus('Email signup is temporarily unavailable. You can still open every free product now.', 'pending');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const name = String(data.get('name') || '').trim();
    const consent = data.get('marketingConsent') === 'on';
    const website = String(data.get('website') || '').trim();

    if (!email || !consent) {
      setLeadStatus('Enter your email and check the consent box to continue.', 'error');
      return;
    }

    if (!apiUrl) {
      window.location.href = fallbackUrl;
      return;
    }

    setLeadStatus('Saving your request...', 'info');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.label = submitButton.textContent;
      submitButton.textContent = 'Saving…';
    }

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email,
          name,
          product: interest,
          source: window.location.pathname,
          marketingConsent: consent,
          website
        })
      });
      window.clearTimeout(timeout);
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Lead capture failed.');
      }

      setLeadStatus(result.emailSent ? 'You’re in. Check your inbox, or open the free products below.' : 'You’re on the list. You can open the free products below now.', 'success');
      form.reset();
    } catch {
      setLeadStatus('We could not save your request. Nothing was charged or submitted. Please try again, or open the free products below.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.label || 'Submit';
      }
    }
  });
}

setupLeadCapture();
