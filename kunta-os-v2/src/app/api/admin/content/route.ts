import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';
import { reviewCopy } from '@/lib/compliance';

const contentSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(160),
  channel: z.enum(['Site', 'Email', 'Instagram', 'TikTok', 'YouTube Shorts', 'Pinterest', 'Facebook', 'Blog']),
  body: z.string().min(10).max(12000),
  call_to_action: z.string().max(240).nullable().optional(),
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']),
  scheduled_for: z.string().datetime().nullable().optional(),
  campaign: z.string().max(120).optional().default(''),
  content_format: z.enum(['Post', 'Carousel', 'Story', 'Reel', 'Short video', 'Long video', 'Article', 'Email']).default('Post'),
  media_url: z.string().max(1000).nullable().optional(),
  publication_url: z.string().url().max(1000).or(z.literal('')).nullable().optional(),
  publish_status: z.enum(['not_scheduled', 'scheduled', 'published', 'failed']).default('not_scheduled'),
  published_at: z.string().datetime().nullable().optional()
});

async function context() {
  const admin = await requireAdmin();
  return admin ? { admin, supabase: createSupabaseAdminClient() } : null;
}

export async function GET() {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { data, error } = await ctx.supabase.from('content_items').select('*').order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load content.' }, { status: 500 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Content fields are invalid.', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.publish_status === 'scheduled' && !parsed.data.scheduled_for) return NextResponse.json({ error: 'Choose a scheduled date and time before marking this Scheduled.' }, { status: 400 });
  if (parsed.data.publish_status === 'scheduled' && !['approved', 'published'].includes(parsed.data.status)) return NextResponse.json({ error: 'Content must be Approved before it can be scheduled.' }, { status: 409 });
  if (parsed.data.publish_status === 'published' && parsed.data.status !== 'published') return NextResponse.json({ error: 'Editorial status must also be Published.' }, { status: 400 });
  const socialChannels = ['Instagram', 'TikTok', 'YouTube Shorts', 'Pinterest', 'Facebook'];
  if (parsed.data.publish_status === 'published' && socialChannels.includes(parsed.data.channel) && !parsed.data.publication_url) return NextResponse.json({ error: 'Add the live social post URL before marking this Published.' }, { status: 400 });
  const copyReview = reviewCopy([parsed.data.title, parsed.data.body, parsed.data.call_to_action || ''].join(' '));
  if (!copyReview.approved) return NextResponse.json({ error: 'Remove unsupported claims before saving.', flags: copyReview.flags }, { status: 400 });
  if (parsed.data.status === 'published') {
    const previous = parsed.data.id
      ? await ctx.supabase.from('content_items').select('status').eq('id', parsed.data.id).maybeSingle()
      : { data: null };
    if (previous.data?.status !== 'approved') {
      return NextResponse.json({ error: 'Content must be saved as Approved before it can be marked Published.' }, { status: 409 });
    }
  }
  const payload = { ...parsed.data, call_to_action: parsed.data.call_to_action || null, scheduled_for: parsed.data.scheduled_for || null, media_url: parsed.data.media_url || null, publication_url: parsed.data.publication_url || null, published_at: parsed.data.publish_status === 'published' ? parsed.data.published_at || new Date().toISOString() : null, updated_at: new Date().toISOString() };
  const query = parsed.data.id
    ? ctx.supabase.from('content_items').update(payload).eq('id', parsed.data.id).select().single()
    : ctx.supabase.from('content_items').insert(payload).select().single();
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Could not save content.' }, { status: 500 });
  await ctx.supabase.from('admin_audit_log').insert({ actor_email: ctx.admin.email, action: 'content_upsert', entity_type: 'content_item', entity_id: data.id });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
