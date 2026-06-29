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
    title.textContent = `${product.name} checkout`;
    message.textContent = `${dollars(product)} — ${product.short_description || 'Kunta Naturals digital product.'}`;
    if (image && product.image_url) image.src = product.image_url;
  } else {
    title.textContent = 'Kunta Naturals checkout';
    message.textContent = 'Choose a product from the shop before starting checkout.';
  }

  const apiUrl = config.checkout_api_url || '';

  if (!apiUrl) {
    setCheckoutStatus('Stripe checkout is wired in the codebase but needs the deployed backend API URL and Stripe keys before live payments can run.', 'pending');
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!product) {
      setCheckoutStatus('Product not found. Return to the shop and choose a product again.', 'error');
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

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: normalizeProductId(product.id),
          customerEmail
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || 'Checkout failed.');
      window.location.href = result.url;
    } catch {
      setCheckoutStatus('Checkout could not start yet. The provider may still need keys, webhook, or deployment setup.', 'error');
    }
  });
}

setupCheckout();
