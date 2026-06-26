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

function productCard(product) {
  const article = document.createElement('article');
  article.className = `public-product-card has-brand ${product.fulfillment_model || ''}`;
  article.dataset.type = product.product_type || 'product';

  const brandStrip = document.createElement('div');
  brandStrip.className = 'product-brand-strip';
  brandStrip.innerHTML = '<img src="assets/logo-mark.svg" alt="" aria-hidden="true"><span>Kunta Naturals</span>';

  const media = document.createElement('div');
  media.className = product.crop_class ? `product-media board-crop ${product.crop_class}` : 'product-media';

  if (!product.crop_class) {
    const img = document.createElement('img');
    img.src = publicImagePath(product);
    img.alt = product.name || 'Kunta Naturals product';
    img.onerror = () => { img.src = 'assets/logo.svg'; };
    media.appendChild(img);
  } else {
    media.setAttribute('role', 'img');
    media.setAttribute('aria-label', product.name || 'Kunta Naturals product image');
  }

  const logo = document.createElement('img');
  logo.className = 'product-logo-badge';
  logo.src = 'assets/logo-mark.svg';
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');

  media.appendChild(logo);

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
  fulfillment.textContent = product.fulfillment_model?.includes('pod') || product.fulfillment_model?.includes('supplier') || product.fulfillment_model?.includes('partner')
    ? 'No Kunta Naturals inventory or shipping.'
    : product.product_type === 'digital'
      ? 'Owned digital product path.'
      : 'Third-party fulfillment path.';

  const action = document.createElement('a');
  action.className = 'product-link';
  const destination = product.detail_url || product.checkout_url || product.affiliate_url || '';
  action.href = destination || '#quiz';
  if (destination.startsWith('http')) {
    action.target = '_blank';
    action.rel = 'sponsored noopener';
  }
  if (product.product_type === 'digital' && product.price) {
    action.textContent = `View details - $${Number(product.price).toFixed(2)}`;
  } else if (product.price) {
    action.textContent = `View details - $${Number(product.price).toFixed(2)}`;
  } else {
    action.textContent = 'Get ritual guide first';
  }

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
