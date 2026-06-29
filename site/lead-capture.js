async function loadSiteConfig() {
  try {
    const response = await fetch('data/site-config.json', { cache: 'no-store' });
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

  if (!apiUrl) {
    setLeadStatus('Email capture is ready in the codebase but needs the backend URL and Resend key before it can store leads. Free products are open now.', 'pending');
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

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          product: 'free-guide',
          source: window.location.pathname,
          marketingConsent: consent,
          website
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Lead capture failed.');
      }

      setLeadStatus(result.emailSent ? 'Success. Check your inbox for the free guide.' : 'Saved. Open the free products now while email delivery is being configured.', 'success');
      window.location.href = result.freeProductsUrl || fallbackUrl;
    } catch (error) {
      setLeadStatus('We could not save the email yet. The free products are still available now.', 'error');
      window.location.href = fallbackUrl;
    }
  });
}

setupLeadCapture();
