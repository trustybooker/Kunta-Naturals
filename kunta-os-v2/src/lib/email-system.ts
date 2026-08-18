import { createHmac, timingSafeEqual } from 'node:crypto';

type Lesson = { subject: string; preview: string; heading: string; body: string; action: string; actionUrl: string };

const lessons: Record<number, Lesson> = {
  1: {
    subject: 'Your Kunta Naturals free ritual guide',
    preview: 'Start with what you already own.',
    heading: 'Day 1 · Choose one ritual',
    body: '<p>Welcome. Today, choose one direction: Glow, Fresh, Scent, Scalp, or Calm. Do not rebuild everything at once.</p><p>Write down the one part of your routine that feels most confusing. That is the only problem this five-day course needs to simplify.</p>',
    action: 'Open your free starter products',
    actionUrl: '/free-products.html'
  },
  2: {
    subject: 'Day 2: Give every product one job',
    preview: 'Cleanse, polish, moisturize, scent, reset.',
    heading: 'Day 2 · Give every product one job',
    body: '<p>Place each product you use into one of five roles: cleanse, polish, moisturize, scent, or reset. If an item has no clear role, move it out of the main routine for now.</p><p>Your first win is clarity—not a new purchase.</p>',
    action: 'Use the starter checklist',
    actionUrl: '/downloads/starter-checklist.html'
  },
  3: {
    subject: 'Day 3: Build the three-minute version',
    preview: 'The smallest ritual is the easiest to repeat.',
    heading: 'Day 3 · Build the three-minute version',
    body: '<p>Choose the minimum comfortable version of your routine: one cleanse step, one moisture or comfort step, and one reset action.</p><p>Optional steps may return later. A routine that fits your real day is more valuable than an impressive routine you avoid.</p>',
    action: 'Open the 3-minute guide',
    actionUrl: '/downloads/free-3-minute-guide.html'
  },
  4: {
    subject: 'Day 4: Use the finish-before-buying rule',
    preview: 'Reduce clutter before adding products.',
    heading: 'Day 4 · Finish before buying',
    body: '<p>Before buying, name the product’s role, when you will use it, what it replaces, and the budget it fits. If you cannot answer all four, wait.</p><p>This rule protects your money, shelf space, and attention.</p>',
    action: 'Review the Kunta Naturals method',
    actionUrl: '/our-method.html'
  },
  5: {
    subject: 'Day 5: Lock your ritual',
    preview: 'One written routine and one clear next step.',
    heading: 'Day 5 · Lock your ritual',
    body: '<p>Write your final five roles on one card. Add when you will do the routine, how long it takes, and what you will not buy this month.</p><p>If you want more structure, preview the seven-day guide. If the free system is enough, keep using it—there is no pressure to upgrade.</p>',
    action: 'Preview the 7-Day Body Ritual Guide',
    actionUrl: '/products/7-day-body-ritual-guide.html'
  }
};

function signingSecret() {
  return process.env.EMAIL_SIGNING_SECRET || process.env.DELIVERY_TOKEN_SECRET || '';
}

export function unsubscribeToken(email: string) {
  const secret = signingSecret();
  if (!secret) return '';
  const encoded = Buffer.from(email.trim().toLowerCase()).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function emailFromUnsubscribeToken(token: string) {
  const secret = signingSecret();
  const [encoded, supplied] = token.split('.');
  if (!secret || !encoded || !supplied) return null;
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const email = Buffer.from(encoded, 'base64url').toString('utf8').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  } catch {
    return null;
  }
}

export function renderLesson(day: number, email: string) {
  const lesson = lessons[day] || lessons[1];
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuntanaturals.com';
  const token = unsubscribeToken(email);
  const unsubscribeUrl = `${process.env.KUNTA_BACKEND_PUBLIC_URL || 'https://kunta-naturals-os.vercel.app'}/unsubscribe?token=${encodeURIComponent(token)}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f7efe3;color:#2e2119;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${lesson.preview}</div><table width="100%" role="presentation" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 14px"><table width="100%" role="presentation" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid #e8d6bd;border-radius:24px;overflow:hidden"><tr><td style="padding:28px 32px;background:#2e2119;color:#fffaf2"><p style="margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;font-size:12px">Pure. Rooted. Real.</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px">Kunta Naturals</h1></td></tr><tr><td style="padding:32px"><h2 style="font-family:Georgia,serif;font-size:30px;line-height:1.05;margin:0 0 18px">${lesson.heading}</h2>${lesson.body}<p style="margin:26px 0"><a href="${site}${lesson.actionUrl}" style="display:inline-block;background:#2e2119;color:#fffaf2;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:700">${lesson.action}</a></p><p style="font-size:13px;color:#536b45">General self-care education only. No medical advice or guaranteed outcomes.</p></td></tr><tr><td style="padding:20px 32px;border-top:1px solid #e8d6bd;font-size:12px;color:#6d5a4b">You received this because you requested Kunta Naturals resources. <a href="${unsubscribeUrl}" style="color:#2e2119">Unsubscribe</a>.</td></tr></table></td></tr></table></body></html>`;
  return { ...lesson, html, unsubscribeUrl };
}

export async function sendLesson(email: string, day: number, leadId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is missing.');
  const configuredFrom = process.env.RESEND_FROM_EMAIL || 'Kunta Naturals <hello@send.kuntanaturals.com>';
  const from = configuredFrom.replace('@kuntanaturals.com', '@send.kuntanaturals.com');
  const lesson = renderLesson(day, email);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `ritual-course-day-${day}/${leadId}`
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: lesson.subject,
      html: lesson.html,
      headers: {
        'List-Unsubscribe': `<${lesson.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      tags: [{ name: 'sequence', value: 'five-day-ritual' }, { name: 'day', value: String(day) }]
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Resend rejected lesson ${day} with status ${response.status}.`);
  return { id: typeof payload.id === 'string' ? payload.id : null };
}
