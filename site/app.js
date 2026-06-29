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
  if (product.checkout_status === 'pending_supplier') return `${moneyLabel(product)} - supplier pending`;
  if (product.checkout_status === 'pending_partner') return `${moneyLabel(product)} - partner review pending`;
  if (product.checkout_status === 'pending_provider') return `${moneyLabel(product)} - checkout pending`;
  if (Number(product.price || 0) > 0) return `View details - ${moneyLabel(product)}`;
  return 'Get ritual guide first';
}

function statusNote(product) {
  if (product.checkout_status === 'free_public') return 'Free public delivery path.';
  if (product.checkout_status === 'pending_supplier') return 'Supplier or POD provider must be connected before live purchase.';
  if (product.checkout_status === 'pending_partner') return 'Partner links must be reviewed before this bundle goes live.';
  if (product.checkout_status === 'pending_provider') return 'Paid delivery stays pending until secure checkout is connected.';
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
  const destination = product.detail_url || product.checkout_url || product.delivery_url || product.affiliate_url || '';
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

async function loadPublicProducts() {
  if (!productGrid) return;
  try {
    const response = await fetch('data/products.json', { cache: 'no-store' });
    const products = await response.json();
    const visible = products.filter((product) => product.status === 'active');
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
    productGrid.textContent = 'Product picks are being prepared.';
  }
}

loadPublicProducts();
