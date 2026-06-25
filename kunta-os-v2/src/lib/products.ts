import type { Product } from './types';

export const sampleProducts: Product[] = [
  {
    id: 'free-ritual-guide',
    name: '3-Minute Natural Self-Care Guide',
    slug: '3-minute-natural-self-care-guide',
    category: 'Digital Guide',
    ritualType: 'glow',
    audience: 'All adults',
    productType: 'digital',
    shortDescription: 'A simple starter guide for your first repeatable ritual.',
    description: 'Build a simple routine before buying more products.',
    priceCents: 0,
    currency: 'USD',
    imageUrl: '/assets/logo.svg',
    mediaGallery: [],
    inventoryStatus: 'not_applicable',
    tags: ['free', 'guide'],
    complianceNotes: 'General self-care education only.',
    disclosureRequired: false,
    status: 'active'
  },
  {
    id: 'amazon-luffa-pick',
    name: 'Natural Luffa Starter Pick',
    slug: 'natural-luffa-starter-pick',
    category: 'Body-Care Tool',
    ritualType: 'glow',
    audience: 'All adults',
    productType: 'affiliate',
    shortDescription: 'A starter polish step for the shower ritual.',
    description: 'Use as one simple body-care tool in the polish step.',
    priceCents: 0,
    currency: 'USD',
    imageUrl: '/assets/ritual-shelf.svg',
    mediaGallery: [],
    amazonAsin: null,
    amazonAssociateTag: null,
    affiliateUrl: null,
    checkoutUrl: null,
    inventoryStatus: 'not_applicable',
    tags: ['amazon', 'affiliate', 'body-care'],
    complianceNotes: 'Needs official product link and disclosure before publishing.',
    disclosureRequired: true,
    status: 'draft'
  }
];

export const workflowColumns = [
  { id: 'draft', title: 'Draft', description: 'Idea or product added. Needs copy, image, link, and review.' },
  { id: 'review', title: 'Review', description: 'Check claims, disclosure, price, link, and brand fit.' },
  { id: 'approved', title: 'Approved', description: 'Ready to schedule or publish.' },
  { id: 'active', title: 'Active', description: 'Visible or ready for active promotion.' }
] as const;
