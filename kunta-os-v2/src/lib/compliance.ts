const blockedPhrases = [
  'cure',
  'treat disease',
  'guaranteed results',
  'instant results',
  'medical grade',
  'doctor approved',
  'miracle'
];

export function reviewCopy(copy: string) {
  const lower = copy.toLowerCase();
  const flags = blockedPhrases.filter((phrase) => lower.includes(phrase));

  return {
    approved: flags.length === 0,
    flags,
    guidance: flags.length
      ? 'Revise the copy to remove claims that could create trust, compliance, or platform risk.'
      : 'Copy is clear for general self-care positioning. Still review before publishing.'
  };
}

export function needsAffiliateDisclosure(url?: string | null) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('amazon.') || lower.includes('amzn.') || lower.includes('tag=');
}
