const STORE_KEY = 'kuntaProductsWorkspaceV1';
let products = [];

const form = document.getElementById('productForm');
const list = document.getElementById('productList');

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `product-${Date.now()}`;
}

function field(id) {
  return document.getElementById(id);
}

function value(id) {
  return field(id)?.value?.trim() || '';
}

function setField(id, nextValue) {
  const item = field(id);
  if (item) item.value = nextValue || '';
}

function saveLocal() {
  localStorage.setItem(STORE_KEY, JSON.stringify(products, null, 2));
}

function loadLocal() {
  try {
    products = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    products = [];
  }
}

async function loadSeed() {
  const response = await fetch('../data/products.json', { cache: 'no-store' });
  products = await response.json();
  saveLocal();
  render();
}

function updateStats() {
  field('totalProducts').textContent = products.length;
  field('activeProducts').textContent = products.filter((item) => item.status === 'active').length;
  field('draftProducts').textContent = products.filter((item) => item.status === 'draft').length;
  field('reviewProducts').textContent = products.filter((item) => item.status === 'review').length;
}

function imagePath(product) {
  const src = product.image_url || '../assets/logo.svg';
  return src.startsWith('assets/') ? `../${src}` : src;
}

function card(product) {
  const wrap = document.createElement('article');
  wrap.className = 'product-card';

  const img = document.createElement('img');
  img.src = imagePath(product);
  img.alt = product.name || 'Kunta Naturals product';
  img.onerror = () => { img.src = '../assets/logo.svg'; };

  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = product.name || 'Untitled product';

  const badges = document.createElement('div');
  badges.className = 'badges';
  [product.status || 'draft', product.product_type || 'affiliate', product.category || 'Uncategorized'].forEach((text) => {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    badges.appendChild(badge);
  });

  const desc = document.createElement('p');
  desc.textContent = product.short_description || product.description || 'No description added yet.';

  const price = document.createElement('p');
  price.textContent = Number(product.price || 0) ? `Price: $${Number(product.price).toFixed(2)}` : 'Price: controlled by destination link';

  const link = document.createElement('p');
  link.textContent = `Link: ${product.checkout_url || product.affiliate_url || 'Needs link'}`;

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const edit = document.createElement('button');
  edit.type = 'button';
  edit.textContent = 'Edit';
  edit.addEventListener('click', () => editProduct(product.id));
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'secondary';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    products = products.filter((item) => item.id !== product.id);
    saveLocal();
    render();
  });
  actions.append(edit, remove);
  body.append(title, badges, desc, price, link, actions);
  wrap.append(img, body);
  return wrap;
}

function render() {
  updateStats();
  list.replaceChildren();
  if (!products.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No products yet. Add the first product or reload seed data.';
    list.appendChild(empty);
    return;
  }
  products.forEach((product) => list.appendChild(card(product)));
}

function productFromForm() {
  const name = value('name');
  const id = value('editingId') || slugify(name);
  return {
    id,
    name,
    slug: slugify(name),
    category: value('category'),
    ritual_type: value('ritual_type'),
    audience: value('audience') || 'All adults',
    product_type: value('product_type') || 'affiliate',
    short_description: value('short_description'),
    description: value('description'),
    price: Number(value('price') || 0),
    compare_at_price: null,
    currency: 'USD',
    image_url: value('image_url') || 'assets/logo.svg',
    media_gallery: [],
    affiliate_url: value('checkout_url'),
    checkout_url: value('checkout_url'),
    amazon_asin: value('amazon_asin'),
    amazon_tag: value('amazon_tag'),
    inventory_status: 'not_applicable',
    tags: [],
    compliance_notes: value('compliance_notes'),
    disclosure_required: value('product_type') === 'affiliate',
    status: value('status') || 'draft'
  };
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  setField('editingId', product.id);
  setField('name', product.name);
  setField('category', product.category);
  setField('ritual_type', product.ritual_type);
  setField('audience', product.audience);
  setField('product_type', product.product_type);
  setField('price', product.price);
  setField('short_description', product.short_description);
  setField('description', product.description);
  setField('image_url', product.image_url);
  setField('amazon_asin', product.amazon_asin);
  setField('amazon_tag', product.amazon_tag);
  setField('checkout_url', product.checkout_url || product.affiliate_url);
  setField('status', product.status);
  setField('compliance_notes', product.compliance_notes);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  ['editingId','name','category','ritual_type','audience','price','short_description','description','image_url','amazon_asin','amazon_tag','checkout_url','compliance_notes'].forEach((id) => setField(id, ''));
  setField('product_type', 'affiliate');
  setField('status', 'draft');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const product = productFromForm();
  const index = products.findIndex((item) => item.id === product.id);
  if (index >= 0) products[index] = product;
  else products.unshift(product);
  saveLocal();
  resetForm();
  render();
});

field('resetFormBtn').addEventListener('click', resetForm);
field('loadSeedBtn').addEventListener('click', loadSeed);
field('clearLocalBtn').addEventListener('click', () => {
  localStorage.removeItem(STORE_KEY);
  products = [];
  render();
});
field('exportBtn').addEventListener('click', () => {
  const text = JSON.stringify(products, null, 2);
  navigator.clipboard?.writeText(text);
  alert('Product JSON copied to clipboard.');
});

loadLocal();
if (products.length) render();
else loadSeed().catch(render);
