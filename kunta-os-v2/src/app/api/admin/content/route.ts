import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

const contentSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(160),
  channel: z.enum(['Site', 'Email', 'Instagram', 'TikTok', 'YouTube Shorts', 'Blog']),
  body: z.string().min(10).max(12000),
  call_to_action: z.string().max(240).nullable().optional(),
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']),
  scheduled_for: z.string().datetime().nullable().optional()
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
  const payload = { ...parsed.data, call_to_action: parsed.data.call_to_action || null, scheduled_for: parsed.data.scheduled_for || null, updated_at: new Date().toISOString() };
  const query = parsed.data.id
    ? ctx.supabase.from('content_items').update(payload).eq('id', parsed.data.id).select().single()
    : ctx.supabase.from('content_items').insert(payload).select().single();
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Could not save content.' }, { status: 500 });
  await ctx.supabase.from('admin_audit_log').insert({ actor_email: ctx.admin.email, action: 'content_upsert', entity_type: 'content_item', entity_id: data.id });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
