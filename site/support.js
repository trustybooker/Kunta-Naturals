async function loadSupportEndpoint() {
  const response = await fetch('/data/site-config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Support configuration could not be loaded.');
  const config = await response.json();
  if (!config.support_api_url) throw new Error('Support is not configured.');
  return config.support_api_url;
}

const form = document.querySelector('[data-support-form]');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-support-status]');
    const data = new FormData(form);
    button.disabled = true;
    status.textContent = 'Sending your request…';
    try {
      const endpoint = await loadSupportEndpoint();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({
          email: data.get('email'), topic: data.get('topic'), orderReference: data.get('orderReference'),
          message: data.get('message'), website: data.get('website')
        })
      });
      clearTimeout(timer);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Your request could not be sent.');
      form.reset();
      status.textContent = 'Request received. Keep your receipt and order details for reference.';
      status.focus();
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'The request timed out. Check your connection and try again.' : error.message;
      status.focus();
    } finally {
      button.disabled = false;
    }
  });
}
