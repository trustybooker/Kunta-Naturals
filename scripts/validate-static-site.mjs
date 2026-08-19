import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteDir = path.join(root, 'site');
const errors = [];
const warnings = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function walk(dir) {
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function stripQueryAndHash(value) {
  return value.split('#')[0].split('?')[0];
}

function localTarget(fromFile, rawValue) {
  if (!rawValue) return null;
  if (rawValue.startsWith('#')) return null;
  if (rawValue.startsWith('mailto:') || rawValue.startsWith('tel:')) return null;
  if (/^https?:\/\//i.test(rawValue)) {
    try {
      const url = new URL(rawValue);
      if (url.hostname !== 'kuntanaturals.com') return null;
      return stripQueryAndHash(url.pathname.replace(/^\//, '')) || 'index.html';
    } catch {
      return null;
    }
  }
  const stripped = stripQueryAndHash(rawValue);
  if (!stripped || stripped.startsWith('#')) return null;
  if (stripped.startsWith('/')) return stripped.slice(1) || 'index.html';
  const fromDir = path.dirname(fromFile.replace(/^site\//, ''));
  return path.normalize(path.join(fromDir, stripped)).replaceAll('\\', '/');
}

function validateReferences(relativeFile) {
  const html = read(relativeFile);
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(`${relativeFile} is missing a descriptive title.`);
  if (!/<meta name="description" content="[^"]{40,}"/.test(html) && !html.includes('noindex')) {
    fail(`${relativeFile} is missing a useful meta description.`);
  }
  if (!/<link rel="canonical" href="https:\/\/kuntanaturals\.com\/[^"]*"/.test(html) && !html.includes('noindex')) {
    fail(`${relativeFile} is missing a canonical URL.`);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch {
      fail(`${relativeFile} contains invalid JSON-LD.`);
    }
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of new Set(duplicateIds)) fail(`${relativeFile} contains duplicate id: ${id}`);

  const matches = [...html.matchAll(/(?:href|src)="([^"]+)"/g)];
  for (const [, raw] of matches) {
    if (raw === '#') fail(`${relativeFile} contains a dead # link.`);
    if (raw.startsWith('#')) {
      const targetId = raw.slice(1);
      if (targetId && !ids.includes(targetId)) fail(`${relativeFile} references missing section: ${raw}`);
      continue;
    }
    const target = localTarget(relativeFile, raw);
    if (!target) continue;
    const normalized = target === '' ? 'index.html' : target;
    const siteRelative = normalized.startsWith('site/') ? normalized : `site/${normalized}`;
    if (!exists(siteRelative)) {
      fail(`${relativeFile} references missing file: ${raw} -> ${siteRelative}`);
    }

    const hash = raw.includes('#') ? raw.split('#')[1] : '';
    if (hash && exists(siteRelative) && siteRelative.endsWith('.html')) {
      const targetHtml = read(siteRelative);
      if (!new RegExp(`\\sid=["']${hash}["']`).test(targetHtml)) {
        fail(`${relativeFile} references missing section ${raw}`);
      }
    }
  }
}

const htmlFiles = walk(siteDir)
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.relative(root, file).replaceAll('\\', '/'));

if (!htmlFiles.includes('site/index.html')) fail('site/index.html is missing.');
for (const file of htmlFiles) validateReferences(file);

const index = read('site/index.html');
if (!index.includes('application/ld+json')) fail('Homepage is missing JSON-LD schema.');
if (index.includes('before and after') || index.includes('guaranteed results')) fail('Homepage contains unsafe outcome language.');
if (/checkout pending/i.test(index)) fail('Homepage exposes internal checkout-pending language.');

const products = JSON.parse(read('site/data/products.json'));
const requiredProductIds = [
  'kn-digital-3-minute-guide',
  'kn-free-starter-checklist',
  'kn-free-5-day-course',
  'kn-7-day-body-ritual-guide',
  'kn-glow-scent-bundle',
  'kn-ritual-vault',
  'kn-ritual-journal',
  'kn-bathroom-reset-cards',
  'kn-self-care-planner'
];
const productIds = new Set(products.map((product) => product.id));
for (const id of requiredProductIds) {
  if (!productIds.has(id)) fail(`Missing required product: ${id}`);
}

for (const product of products) {
  if (!product.name || !product.image_url || !product.status) fail(`Product is missing required fields: ${JSON.stringify(product)}`);
  if (product.image_url && !exists(`site/${product.image_url}`)) fail(`${product.id} references missing image ${product.image_url}`);
  if (product.detail_url && !exists(`site/${stripQueryAndHash(product.detail_url)}`)) fail(`${product.id} references missing detail_url ${product.detail_url}`);
  if (product.checkout_status !== 'free_public' && product.delivery_url) fail(`${product.id} exposes a delivery_url but is not free_public.`);
  if (Number(product.price || 0) > 0 && product.checkout_status === 'free_public') fail(`${product.id} is paid but marked free_public.`);
}

const publicPaidFiles = walk(siteDir).filter((file) => /\.(pdf|zip)$/i.test(file));
if (publicPaidFiles.length) fail(`Public site contains PDF/ZIP files: ${publicPaidFiles.map((file) => path.relative(root, file)).join(', ')}`);

const allTextFiles = walk(siteDir)
  .filter((file) => /\.(html|css|js|json|svg|xml|txt)$/i.test(file));
for (const file of allTextFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (content.includes('TODO_ADD_EMAIL_CAPTURE_OR_FORM_ENDPOINT')) fail(`${rel} still contains dead email TODO endpoint.`);
  if (content.includes('ChatGPT Image Jun')) fail(`${rel} still references a deleted whole-board AI image filename.`);
}

const sitemap = read('site/sitemap.xml');
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1]);
  if (url.hash) fail(`Sitemap contains fragment URL: ${match[1]}`);
  const target = url.pathname === '/' ? 'site/index.html' : `site${url.pathname}`;
  if (!exists(target)) fail(`Sitemap references missing URL path: ${match[1]}`);
}

const robots = read('site/robots.txt');
if (!robots.includes('Sitemap: https://kuntanaturals.com/sitemap.xml')) fail('robots.txt missing sitemap line.');

if (warnings.length) {
  console.warn('Warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('Static site validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Static site validation passed: ${htmlFiles.length} HTML pages, ${products.length} products.`);
