async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load ' + path);
  return response.json();
}

function setCheckoutStatus(message, type = 'info') {
  const target = document.getElementById('checkoutStatus');
  if (!target) return;
  target.textContent = message;
  target.dataset.status = type;
}

function normalizeProductId(value) {
  return String(value || '').replace(/^kn-/, '');
}

function findProduct(products, productParam) {
  const normalizedParam = normalizeProductId(productParam);
  return products.find((product) => {
    const candidates = [
      product.id,
      normalizeProductId(product.id),
      product.checkout_product_id,
      product.checkout_url?.split('product=')[1],
      product.detail_url?.split('/').pop()?.replace('.html', '')
    ].filter(Boolean).map(normalizeProductId);
    return candidates.includes(normalizedParam);
  });
}

function dollars(product) {
  const price = Number(product?.price || 0);
  return price > 0 ? `$${price.toFixed(2)}` : 'Free';
}

async function setupCheckout() {
  const params = new URLSearchParams(window.location.search);
  const productParam = params.get('product') || '';
  const title = document.getElementById('checkoutTitle');
  const message = document.getElementById('checkoutMessage');
  const image = document.getElementById('checkoutImage');
  const form = document.getElementById('checkoutForm');
  const submitButton = form?.querySelector('button[type="submit"]');

  let config = {};
  let product = null;

  try {
    const [loadedConfig, products] = await Promise.all([
      loadJson('data/site-config.json'),
      loadJson('data/products.json')
    ]);
    config = loadedConfig;
    product = findProduct(products, productParam);
  } catch {
    setCheckoutStatus('Checkout configuration could not be loaded.', 'error');
  }

  if (product) {
    const pending = product.checkout_status?.startsWith('pending');
    title.textContent = pending ? `${product.name} launch list` : `${product.name} checkout`;
    message.textContent = `${dollars(product)} — ${product.short_description || 'Kunta Naturals digital product.'}`;
    if (image && product.image_url) image.src = product.image_url;
    if (pending) {
      form?.classList.add('launch-mode');
      if (submitButton) submitButton.textContent = 'Get first access';
    }
  } else {
    title.textContent = 'Kunta Naturals checkout';
    message.textContent = 'Choose a product from the shop before starting checkout.';
  }

  const apiUrl = config.checkout_api_url || '';

  if (product?.checkout_status?.startsWith('pending')) {
    setCheckoutStatus('This product is not accepting payments yet. Join the launch list for first access.', 'pending');
  } else if (!apiUrl) {
    setCheckoutStatus('Secure checkout is temporarily unavailable. No payment information has been collected.', 'pending');
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!product) {
      setCheckoutStatus('Product not found. Return to the shop and choose a product again.', 'error');
      return;
    }

    if (product.checkout_status?.startsWith('pending')) {
      window.location.href = `email-signup.html?interest=${encodeURIComponent(normalizeProductId(product.id))}`;
      return;
    }

    if (Number(product.price || 0) <= 0) {
      window.location.href = product.delivery_url || 'free-products.html';
      return;
    }

    if (!apiUrl) {
      setCheckoutStatus('Checkout provider is not connected yet. Start with the free products while Stripe is being connected.', 'pending');
      return;
    }

    const data = new FormData(form);
    const customerEmail = String(data.get('customerEmail') || '').trim();
    const accepted = data.get('termsAccepted') === 'on';

    if (!customerEmail || !accepted) {
      setCheckoutStatus('Enter your email and accept the checkout notice to continue.', 'error');
      return;
    }

    setCheckoutStatus('Opening secure Stripe checkout...', 'info');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Opening secure checkout…';
    }

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          productId: normalizeProductId(product.id),
          customerEmail
        })
      });
      window.clearTimeout(timeout);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || 'Checkout failed.');
      window.location.href = result.url;
    } catch {
      setCheckoutStatus('Checkout could not start. Nothing was charged. Please try again later or use the free products.', 'error');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Continue to secure checkout';
      }
    }
  });
}

setupCheckout();
