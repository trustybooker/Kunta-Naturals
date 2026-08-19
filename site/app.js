const quiz = document.getElementById('ritualQuiz');
const result = document.getElementById('quizResult');
const productGrid = document.getElementById('productGrid');

const recommendations = {
  'Glow Ritual': 'Your ritual type is the Glow Ritual. Start with the free guide, then use the 7-Day Body Ritual Guide. Suggested starter products: luffa, body oil, body butter.',
  'Fresh Ritual': 'Your ritual type is the Fresh Ritual. Start with the free guide and the Fresh Ritual product checklist. Suggested starter products: gentle soap, luffa, shower filter.',
  'Scent Ritual': 'Your ritual type is the Scent Ritual. Start with the Natural Glow + Scent Ritual Bundle. Suggested starter products: body oil, fragrance oil, candle.',
  'Scalp Ritual': 'Your ritual type is the Scalp Ritual. Start with the Hair & Scalp Ritual Kit. Suggested starter products: scalp brush, hair oil, satin or silk night accessory.',
  'Calm Ritual': 'Your ritual type is the Calm Ritual. Start with the 5-day email course. Suggested starter products: candle, incense, warm towel, evening reset checklist.'
};

quiz?.addEventListener('submit', (event) => {
  event.preventDefault();
  const selected = new FormData(quiz).get('ritual');
  result.style.display = 'block';
  result.textContent = selected ? recommendations[selected] : 'Choose one answer to reveal your ritual type.';
  result.setAttribute('tabindex', '-1');
  result.focus();
});

function publicImagePath(product) {
  const src = product.image_url || 'assets/logo.svg';
  return src.startsWith('assets/') ? src : src;
}

function moneyLabel(product) {
  const price = Number(product.price || 0);
  return price > 0 ? `$${price.toFixed(2)}` : 'Free';
}

function actionLabel(product) {
  if (product.checkout_status === 'free_public') return 'Open free product';
  if (product.checkout_status === 'pending_supplier') return 'Join the product waitlist';
  if (product.checkout_status === 'pending_partner') return 'Join the bundle waitlist';
  if (product.checkout_status === 'pending_provider') return `Join the launch list · ${moneyLabel(product)}`;
  if (product.checkout_status === 'live' && Number(product.price || 0) > 0) return `Buy securely · ${moneyLabel(product)}`;
  if (Number(product.price || 0) > 0) return `View details - ${moneyLabel(product)}`;
  return 'Get ritual guide first';
}

function statusNote(product) {
  if (product.checkout_status === 'free_public') return 'Free public delivery path.';
  if (product.checkout_status === 'pending_supplier') return 'In development · no payment taken.';
  if (product.checkout_status === 'pending_partner') return 'In development · no payment taken.';
  if (product.checkout_status === 'pending_provider') return 'Launching soon · no payment taken today.';
  if (product.checkout_status === 'live' && product.product_type === 'digital') return 'Secure checkout · private digital delivery.';
  if (product.fulfillment_model?.includes('pod') || product.fulfillment_model?.includes('supplier') || product.fulfillment_model?.includes('partner')) return 'No Kunta Naturals inventory or direct shipping.';
  if (product.product_type === 'digital') return 'Owned digital product path.';
  return 'Third-party fulfillment path.';
}

function productCard(product) {
  const article = document.createElement('article');
  article.className = `public-product-card has-brand ${product.fulfillment_model || ''}`;
  article.dataset.type = product.product_type || 'product';

  const brandStrip = document.createElement('div');
  brandStrip.className = 'product-brand-strip';
  brandStrip.innerHTML = '<img src="assets/logo-mark.svg" alt="" aria-hidden="true"><span>Kunta Naturals</span>';

  const media = document.createElement('div');
  media.className = 'product-media';

  const img = document.createElement('img');
  img.src = publicImagePath(product);
  img.alt = product.name || 'Kunta Naturals product';
  img.onerror = () => { img.src = 'assets/logo.svg'; };
  media.appendChild(img);

  const body = document.createElement('div');
  const meta = document.createElement('p');
  meta.className = 'product-meta';
  meta.textContent = product.category || product.ritual_type || 'Kunta Naturals pick';

  const title = document.createElement('h3');
  title.textContent = product.name || 'Coming soon';

  const desc = document.createElement('p');
  desc.textContent = product.short_description || product.description || 'Product details coming soon.';

  const fulfillment = document.createElement('p');
  fulfillment.className = 'fulfillment-note';
  fulfillment.textContent = statusNote(product);

  const action = document.createElement('a');
  action.className = product.checkout_status?.startsWith('pending') ? 'product-link pending-link' : 'product-link';
  const isPending = product.checkout_status?.startsWith('pending');
  const destination = isPending
    ? `email-signup.html?interest=${encodeURIComponent(normalizeProductSlug(product))}`
    : product.detail_url || product.checkout_url || product.delivery_url || product.affiliate_url || '';
  action.href = destination || '#quiz';
  if (destination.startsWith('http')) {
    action.target = '_blank';
    action.rel = 'sponsored noopener';
  }
  action.textContent = actionLabel(product);

  body.append(meta, title, desc, fulfillment, action);
  article.append(brandStrip, media, body);
  return article;
}

function normalizeProductSlug(product) {
  return String(product.id || product.name || 'product')
    .replace(/^kn-/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-');
}

async function loadPublicProducts() {
  if (!productGrid) return;
  try {
    let products;
    try {
      const configResponse = await fetch('data/site-config.json', { cache: 'no-store' });
      const config = await configResponse.json();
      if (!config.backend_api_base_url) throw new Error('Backend not configured');
      const liveResponse = await fetch(`${config.backend_api_base_url}/api/catalog`, { signal: AbortSignal.timeout(4500) });
      if (!liveResponse.ok) throw new Error('Live catalog unavailable');
      products = await liveResponse.json();
    } catch {
      const fallbackResponse = await fetch('data/products.json', { cache: 'no-store' });
      if (!fallbackResponse.ok) throw new Error('Fallback catalog unavailable');
      products = await fallbackResponse.json();
    }
    const visible = products.filter((product) =>
      product.status === 'active' &&
      product.product_type === 'digital'
    );
    productGrid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement('article');
      empty.className = 'public-product-card empty-card';
      empty.innerHTML = '<div><p class="product-meta">Coming soon</p><h3>Starter product picks are being reviewed.</h3><p>Take the quiz first and get the guide while official product links and photos are added.</p><a class="product-link" href="#quiz">Take the quiz</a></div>';
      productGrid.appendChild(empty);
      return;
    }
    visible.forEach((product) => productGrid.appendChild(productCard(product)));
  } catch {
    productGrid.innerHTML = '<article class="public-product-card empty-card"><div><p class="product-meta">Catalog unavailable</p><h3>The product list could not load.</h3><p>You can still open the free ritual products now.</p><a class="product-link" href="free-products.html">Open free products</a></div></article>';
  }
}

loadPublicProducts();
