export type DigitalProduct = {
  id: string;
  name: string;
  priceCents: number;
  currency: 'usd';
  deliveryMode: 'public_free_page' | 'private_paid_file';
  publicDeliveryPath?: string;
  protectedFileLabel?: string;
};

export const digitalProducts: Record<string, DigitalProduct> = {
  'free-3-minute-guide': {
    id: 'free-3-minute-guide',
    name: '3-Minute Natural Self-Care Guide',
    priceCents: 0,
    currency: 'usd',
    deliveryMode: 'public_free_page',
    publicDeliveryPath: '/downloads/free-3-minute-guide.html'
  },
  'free-starter-checklist': {
    id: 'free-starter-checklist',
    name: 'Natural Body-Care Starter Checklist',
    priceCents: 0,
    currency: 'usd',
    deliveryMode: 'public_free_page',
    publicDeliveryPath: '/downloads/starter-checklist.html'
  },
  'free-5-day-course': {
    id: 'free-5-day-course',
    name: '5-Day Natural Ritual Email Course',
    priceCents: 0,
    currency: 'usd',
    deliveryMode: 'public_free_page',
    publicDeliveryPath: '/downloads/5-day-natural-ritual-course.html'
  },
  '7-day-body-ritual-guide': {
    id: '7-day-body-ritual-guide',
    name: '7-Day Body Ritual Guide',
    priceCents: 900,
    currency: 'usd',
    deliveryMode: 'private_paid_file',
    protectedFileLabel: 'Kunta Naturals 7-Day Body Ritual Guide PDF'
  },
  'bathroom-reset-cards': {
    id: 'bathroom-reset-cards',
    name: 'Bathroom Reset Checklist Cards',
    priceCents: 1499,
    currency: 'usd',
    deliveryMode: 'private_paid_file',
    protectedFileLabel: 'Kunta Naturals Bathroom Reset Cards PDF'
  },
  'ritual-journal': {
    id: 'ritual-journal',
    name: 'Kunta Naturals Ritual Journal',
    priceCents: 2499,
    currency: 'usd',
    deliveryMode: 'private_paid_file',
    protectedFileLabel: 'Kunta Naturals Ritual Journal PDF'
  },
  'self-care-planner': {
    id: 'self-care-planner',
    name: 'Kunta Naturals Self-Care Planner',
    priceCents: 2799,
    currency: 'usd',
    deliveryMode: 'private_paid_file',
    protectedFileLabel: 'Kunta Naturals Self-Care Planner PDF'
  },
  'glow-scent-bundle': {
    id: 'glow-scent-bundle',
    name: 'Natural Glow + Scent Ritual Bundle',
    priceCents: 2700,
    currency: 'usd',
    deliveryMode: 'private_paid_file',
    protectedFileLabel: 'Kunta Naturals Glow + Scent Bundle ZIP'
  },
  'ritual-vault': {
    id: 'ritual-vault',
    name: 'Kunta Naturals Ritual Vault',
    priceCents: 4700,
    currency: 'usd',
    deliveryMode: 'private_paid_file',
    protectedFileLabel: 'Kunta Naturals Ritual Vault ZIP'
  }
};

export function getDigitalProduct(productId: string) {
  return digitalProducts[productId] || null;
}
