export type ProductType = 'digital' | 'affiliate' | 'physical' | 'bundle';
export type WorkflowStatus = 'draft' | 'review' | 'approved' | 'active' | 'archived';
export type RitualType = 'glow' | 'fresh' | 'scent' | 'scalp' | 'calm' | 'mens-grooming' | 'family-reset';

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  ritualType: RitualType;
  audience: string;
  productType: ProductType;
  shortDescription: string;
  description: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency: 'USD';
  imageUrl?: string | null;
  mediaGallery: string[];
  amazonAsin?: string | null;
  amazonAssociateTag?: string | null;
  affiliateUrl?: string | null;
  checkoutUrl?: string | null;
  inventoryStatus: 'not_applicable' | 'in_stock' | 'out_of_stock' | 'preorder' | 'coming_soon';
  tags: string[];
  complianceNotes: string;
  disclosureRequired: boolean;
  status: WorkflowStatus;
};

export type ContentAsset = {
  id: string;
  title: string;
  channel: 'site' | 'email' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'blog';
  hook: string;
  body: string;
  callToAction: string;
  targetRitual: RitualType;
  status: WorkflowStatus;
  complianceNotes: string;
};
